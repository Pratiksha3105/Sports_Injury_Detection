from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AthleteBase(BaseModel):
    height_cm: Optional[float] = Field(None, gt=0, le=300)
    weight_kg: Optional[float] = Field(None, gt=0, le=400)
    age: Optional[int] = Field(None, gt=0, le=120)
    gender: Optional[str] = None
    sport: Optional[str] = None
    experience_years: Optional[float] = Field(None, ge=0, le=80)
    medical_history: Optional[str] = None


class AthleteCreate(AthleteBase):
    user_id: int


class AthleteUpdate(AthleteBase):
    pass


class AthleteOut(AthleteBase):
    model_config = ConfigDict(from_attributes=True)

    athlete_id: int
    user_id: int
    created_at: datetime
