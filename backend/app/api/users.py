import os
import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models.user import User
from ..models.like import MemeLike
from ..schemas.user import UserResponse, UserUpdate
from ..core.deps import get_current_user
from ..core.storage import upload_to_gcs
from ..config import settings

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR = "static/uploads"

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/likes", response_model=List[int])
def get_my_liked_meme_ids(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """현재 유저가 좋아요한 meme_id 목록 반환"""
    rows = session.exec(
        select(MemeLike.meme_id).where(MemeLike.user_id == current_user.id)
    ).all()
    return rows

@router.put("/me", response_model=UserResponse)
def update_me(
    user_in: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if user_in.bio is not None:
        current_user.bio = user_in.bio
    if user_in.status_message is not None:
        current_user.status_message = user_in.status_message
    if user_in.avatar_url is not None:
        current_user.avatar_url = user_in.avatar_url
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    if settings.GCS_BUCKET_NAME:
        # 배포 환경: GCS에 업로드
        image_url = upload_to_gcs(contents, file.filename, folder="avatars")
    else:
        # 로컬 환경: 기존 방식 유지
        ext = os.path.splitext(file.filename)[1]
        filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(contents)
        image_url = f"/static/uploads/{filename}"
    current_user.avatar_url = image_url
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user
