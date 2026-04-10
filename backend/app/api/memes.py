import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List, Optional
from ..database import get_session
from ..models.meme import Meme, Tag, MemeTagLink
from ..models.user import User
from ..schemas.meme import MemeResponse
from ..core.deps import get_current_user

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

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    contents = await file.read()
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

    file_path = meme.image_url.lstrip("/")
    if os.path.exists(file_path):
        os.remove(file_path)

    session.delete(meme)
    session.commit()
