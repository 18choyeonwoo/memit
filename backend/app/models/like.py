from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class MemeLike(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", primary_key=True)
    meme_id: Optional[int] = Field(default=None, foreign_key="meme.id", primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
