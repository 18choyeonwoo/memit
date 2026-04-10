from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from .like import MemeLike

if TYPE_CHECKING:
    from .meme import Meme
    from .gallery import Gallery

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    likes_received: str = "0"
    followers_count: int = 0
    following_count: int = 0
    status_message: Optional[str] = None

    # Relationships
    memes: List["Meme"] = Relationship(back_populates="author")
    liked_memes: List["Meme"] = Relationship(back_populates="likes", link_model=MemeLike)
    galleries: List["Gallery"] = Relationship(back_populates="owner")
