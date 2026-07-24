from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    prediction_id: int
    video_id: int
    athlete_id: int
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    body_part_flagged: Optional[str] = None
    model_version: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
