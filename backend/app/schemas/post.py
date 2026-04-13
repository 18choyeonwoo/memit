from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .user import UserResponse


class PostCreate(BaseModel):
    title: str
    content: str
    is_anonymous: bool = False


class CommentCreate(BaseModel):
    content: str
    is_anonymous: bool = False


class CommentResponse(BaseModel):
    id: int
    content: str
    is_anonymous: bool
    created_at: datetime
    user_id: int
    author: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    is_anonymous: bool
    image_url: Optional[str] = None
    created_at: datetime
    user_id: int
    author: Optional[UserResponse] = None
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True
