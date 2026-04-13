from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .user import User


class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    is_anonymous: bool = Field(default=False)
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")

    author: Optional["User"] = Relationship(back_populates="posts")
    comments: List["PostComment"] = Relationship(back_populates="post")


class PostComment(SQLModel, table=True):
    __tablename__ = "post_comment"

    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    is_anonymous: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")
    post_id: int = Field(foreign_key="post.id")

    author: Optional["User"] = Relationship(back_populates="comments")
    post: Optional["Post"] = Relationship(back_populates="comments")
