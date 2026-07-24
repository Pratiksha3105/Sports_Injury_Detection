from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class VideoBase(BaseModel):
    file_name: str
    sport_activity: Optional[str] = None


class VideoCreate(VideoBase):
    athlete_id: int
    file_path: str
    file_size_mb: Optional[float] = None
    duration_secs: Optional[int] = None


class VideoOut(VideoBase):
    model_config = ConfigDict(from_attributes=True)

    video_id: int
    athlete_id: int
    upload_status: str
    uploaded_at: datetime
