from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ChatMessageOut(BaseModel):
    id: str
    analysis_id: str
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSendRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
