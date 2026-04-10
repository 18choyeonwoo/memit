from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .meme import MemeResponse

class GalleryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class GalleryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    user_id: int
    memes: List[MemeResponse] = []

    class Config:
        from_attributes = True
