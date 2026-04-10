from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .meme import Meme
    from .user import User

class MemeGalleryLink(SQLModel, table=True):
    gallery_id: Optional[int] = Field(default=None, foreign_key="gallery.id", primary_key=True)
    meme_id: Optional[int] = Field(default=None, foreign_key="meme.id", primary_key=True)

class Gallery(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: int = Field(foreign_key="user.id")

    memes: List["Meme"] = Relationship(link_model=MemeGalleryLink)
    owner: Optional["User"] = Relationship(back_populates="galleries")
