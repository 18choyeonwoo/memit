from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user import UserResponse

class TagResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class MemeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None  # comma-separated

class MemeResponse(BaseModel):
    id: int
    title: str
    image_url: str
    description: Optional[str] = None
    likes_count: int = 0
    liked: bool = False
    created_at: datetime
    tags: List[TagResponse] = []
    author: Optional[UserResponse] = None

    class Config:
        from_attributes = True
