from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class AthleteCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    age: int | None = Field(default=None, ge=0, le=120)
    gender: str | None = None
    height_cm: float | None = Field(default=None, ge=0, le=300)
    weight_kg: float | None = Field(default=None, ge=0, le=400)
    sport: str | None = None
    position: str | None = None
    team: str | None = None
    contact_phone: str | None = None
    email: str | None = None
    injury_history: str | None = None
    medical_notes: str | None = None
    recovery_status: str | None = None
    treatment_plan: str | None = None


class AthleteUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    age: int | None = Field(default=None, ge=0, le=120)
    gender: str | None = None
    height_cm: float | None = Field(default=None, ge=0, le=300)
    weight_kg: float | None = Field(default=None, ge=0, le=400)
    sport: str | None = None
    position: str | None = None
    team: str | None = None
    contact_phone: str | None = None
    email: str | None = None
    injury_history: str | None = None
    medical_notes: str | None = None
    recovery_status: str | None = None
    treatment_plan: str | None = None


class AthleteOut(BaseModel):
    id: str
    managed_by_id: str
    full_name: str
    age: int | None
    gender: str | None
    height_cm: float | None
    weight_kg: float | None
    sport: str | None
    position: str | None
    team: str | None
    contact_phone: str | None
    email: str | None
    injury_history: str | None
    medical_notes: str | None
    recovery_status: str | None
    treatment_plan: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
