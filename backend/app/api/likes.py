from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..models.meme import Meme
from ..models.like import MemeLike
from ..models.user import User
from ..core.deps import get_current_user

router = APIRouter(prefix="/memes", tags=["likes"])

@router.post("/{meme_id}/like")
def toggle_like(
    meme_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    meme = session.get(Meme, meme_id)
    if not meme:
        raise HTTPException(status_code=404, detail="Meme not found")

    existing = session.exec(
        select(MemeLike).where(
            MemeLike.user_id == current_user.id,
            MemeLike.meme_id == meme_id,
        )
    ).first()

    if existing:
        session.delete(existing)
        meme.likes_count = max(0, meme.likes_count - 1)
        liked = False
    else:
        session.add(MemeLike(user_id=current_user.id, meme_id=meme_id))
        meme.likes_count += 1
        liked = True

    session.add(meme)
    session.commit()

    return {"liked": liked, "likes_count": meme.likes_count}
