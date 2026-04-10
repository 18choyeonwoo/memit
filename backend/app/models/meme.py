from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from .like import MemeLike

if TYPE_CHECKING:
    from .user import User
    from .gallery import Gallery

class MemeTagLink(SQLModel, table=True):
    meme_id: Optional[int] = Field(default=None, foreign_key="meme.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

    memes: List["Meme"] = Relationship(back_populates="tags", link_model=MemeTagLink)

class Meme(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    image_url: str
    description: Optional[str] = None
    likes_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: int = Field(foreign_key="user.id")

    tags: List[Tag] = Relationship(back_populates="memes", link_model=MemeTagLink)
    likes: List["User"] = Relationship(back_populates="liked_memes", link_model=MemeLike)
    author: Optional["User"] = Relationship(back_populates="memes")
