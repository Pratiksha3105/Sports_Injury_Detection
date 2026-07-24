from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: str  # "athlete" | "coach" | "admin"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    is_active: bool
    profile_image: Optional[str] = None
    created_at: datetime
