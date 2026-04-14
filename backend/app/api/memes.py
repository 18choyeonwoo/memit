import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select, or_
from typing import List, Optional
from ..database import get_session
from ..models.meme import Meme, Tag, MemeTagLink
from ..models.like import MemeLike
from ..models.gallery import MemeGalleryLink
from ..models.user import User
from ..schemas.meme import MemeResponse, MemeUpdate
from ..core.deps import get_current_user
from ..core.storage import upload_to_gcs
from ..config import settings

router = APIRouter(prefix="/memes", tags=["memes"])

UPLOAD_DIR = "static/uploads"

def _get_or_create_tags(tag_names: List[str], session: Session) -> List[Tag]:
    tags = []
    for name in tag_names:
        name = name.strip().lower()
        if not name:
            continue
        tag = session.exec(select(Tag).where(Tag.name == name)).first()
        if not tag:
            tag = Tag(name=name)
            session.add(tag)
            session.flush()
        tags.append(tag)
    return tags

@router.post("/upload", response_model=MemeResponse)
async def upload_meme(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    tags: str = Form(""),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    if settings.GCS_BUCKET_NAME:
        # 배포 환경: GCS에 업로드
        image_url = upload_to_gcs(contents, file.filename)
    else:
        # 로컬 환경: 기존 방식 유지
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(contents)
        image_url = f"/static/uploads/{filename}"

    meme = Meme(
        title=title,
        description=description,
        image_url=image_url,
        user_id=current_user.id,
    )
    session.add(meme)
    session.flush()

    tag_names = [t for t in tags.split(",") if t.strip()]
    meme_tags = _get_or_create_tags(tag_names, session)
    for tag in meme_tags:
        session.add(MemeTagLink(meme_id=meme.id, tag_id=tag.id))

    session.commit()
    session.refresh(meme)
    return meme

@router.get("/", response_model=List[MemeResponse])
def list_memes(
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session),
):
    memes = session.exec(
        select(Meme).order_by(Meme.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return memes

@router.get("/search", response_model=List[MemeResponse])
def search_memes(
    q: str,
    session: Session = Depends(get_session),
):
    query = q.strip()
    if not query:
        return []

    # 태그 검색 시 앞의 # 제거
    tag_query = query.lstrip("#")
    pattern = f"%{query}%"
    tag_pattern = f"%{tag_query}%"

    # 검색어와 일치하는 태그를 가진 밈 ID 목록
    tag_meme_ids = session.exec(
        select(MemeTagLink.meme_id)
        .join(Tag, MemeTagLink.tag_id == Tag.id)
        .where(Tag.name.ilike(tag_pattern))
    ).all()

    memes = session.exec(
        select(Meme)
        .where(
            or_(
                Meme.title.ilike(pattern),
                Meme.description.ilike(pattern),
                Meme.id.in_(tag_meme_ids),
            )
        )
        .order_by(Meme.created_at.desc())
    ).all()

    return memes


@router.get("/recommended", response_model=List[MemeResponse])
def recommended_memes(
    limit: int = 10,
    session: Session = Depends(get_session),
):
    memes = session.exec(
        select(Meme).order_by(Meme.likes_count.desc()).limit(limit)
    ).all()
    return memes

@router.get("/{meme_id}", response_model=MemeResponse)
def get_meme(meme_id: int, session: Session = Depends(get_session)):
    meme = session.get(Meme, meme_id)
    if not meme:
        raise HTTPException(status_code=404, detail="Meme not found")
    return meme

@router.put("/{meme_id}", response_model=MemeResponse)
def update_meme(
    meme_id: int,
    meme_in: MemeUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    meme = session.get(Meme, meme_id)
    if not meme:
        raise HTTPException(status_code=404, detail="Meme not found")
    if meme.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your meme")

    if meme_in.title is not None:
        meme.title = meme_in.title
    if meme_in.description is not None:
        meme.description = meme_in.description
    if meme_in.tags is not None:
        # 기존 태그 링크 삭제
        existing_links = session.exec(
            select(MemeTagLink).where(MemeTagLink.meme_id == meme_id)
        ).all()
        for link in existing_links:
            session.delete(link)
        session.flush()
        # 새 태그 연결
        tag_names = [t for t in meme_in.tags.split(",") if t.strip()]
        new_tags = _get_or_create_tags(tag_names, session)
        for tag in new_tags:
            session.add(MemeTagLink(meme_id=meme.id, tag_id=tag.id))

    session.add(meme)
    session.commit()
    session.refresh(meme)
    return meme

@router.delete("/{meme_id}", status_code=204)
def delete_meme(
    meme_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    meme = session.get(Meme, meme_id)
    if not meme:
        raise HTTPException(status_code=404, detail="Meme not found")
    if meme.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your meme")

    # FK 제약 위반 방지: 연관 레코드 먼저 삭제
    for link in session.exec(select(MemeTagLink).where(MemeTagLink.meme_id == meme_id)).all():
        session.delete(link)
    for link in session.exec(select(MemeLike).where(MemeLike.meme_id == meme_id)).all():
        session.delete(link)
    for link in session.exec(select(MemeGalleryLink).where(MemeGalleryLink.meme_id == meme_id)).all():
        session.delete(link)
    session.flush()

    file_path = meme.image_url.lstrip("/")
    if os.path.exists(file_path):
        os.remove(file_path)

    session.delete(meme)
    session.commit()
