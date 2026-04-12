from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models.gallery import Gallery, MemeGalleryLink
from ..models.meme import Meme
from ..models.user import User
from ..schemas.gallery import GalleryCreate, GalleryResponse
from ..core.deps import get_current_user

router = APIRouter(prefix="/galleries", tags=["galleries"])

@router.post("/", response_model=GalleryResponse)
def create_gallery(
    gallery_in: GalleryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    gallery = Gallery(
        name=gallery_in.name,
        description=gallery_in.description,
        user_id=current_user.id,
    )
    session.add(gallery)
    session.commit()
    session.refresh(gallery)
    return gallery

@router.get("/my", response_model=List[GalleryResponse])
def my_galleries(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    galleries = session.exec(
        select(Gallery).where(Gallery.user_id == current_user.id)
    ).all()
    return galleries

@router.get("/{gallery_id}", response_model=GalleryResponse)
def get_gallery(gallery_id: int, session: Session = Depends(get_session)):
    gallery = session.get(Gallery, gallery_id)
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    return gallery

@router.delete("/{gallery_id}/memes/{meme_id}", status_code=204)
def remove_meme_from_gallery(
    gallery_id: int,
    meme_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    gallery = session.get(Gallery, gallery_id)
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    if gallery.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your gallery")

    link = session.exec(
        select(MemeGalleryLink).where(
            MemeGalleryLink.gallery_id == gallery_id,
            MemeGalleryLink.meme_id == meme_id,
        )
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Meme not in gallery")

    session.delete(link)
    session.commit()


@router.post("/{gallery_id}/memes/{meme_id}")
def add_meme_to_gallery(
    gallery_id: int,
    meme_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    gallery = session.get(Gallery, gallery_id)
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    if gallery.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your gallery")

    if not session.get(Meme, meme_id):
        raise HTTPException(status_code=404, detail="Meme not found")

    existing = session.exec(
        select(MemeGalleryLink).where(
            MemeGalleryLink.gallery_id == gallery_id,
            MemeGalleryLink.meme_id == meme_id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Meme already in gallery")

    session.add(MemeGalleryLink(gallery_id=gallery_id, meme_id=meme_id))
    session.commit()
    return {"detail": "Meme added to gallery"}
