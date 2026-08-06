from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.db.models import UserRole

# Roles a person can self-select at registration. Admin accounts are never
# created through the public /auth/register endpoint — only by an existing
# admin (via /admin/users) or the optional bootstrap env vars.
SELF_REGISTERABLE_ROLES = {UserRole.COACH, UserRole.ATHLETE, UserRole.PHYSIOTHERAPIST}


def _validate_password_strength(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not any(c.isalpha() for c in v):
        raise ValueError("Password must contain at least one letter")
    if not any(c.isdigit() for c in v):
        raise ValueError("Password must contain at least one number")
    return v


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str
    role: UserRole = UserRole.ATHLETE

    _check_password = field_validator("password")(_validate_password_strength)

    @field_validator("role")
    @classmethod
    def _restrict_role(cls, v: UserRole) -> UserRole:
        if v not in SELF_REGISTERABLE_ROLES:
            raise ValueError("This role cannot be selected at registration")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    _check_password = field_validator("new_password")(_validate_password_strength)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    _check_password = field_validator("new_password")(_validate_password_strength)


class VerifyEmailRequest(BaseModel):
    token: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    profile_image: str | None = None


class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    profile_image: str | None
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class MessageResponse(BaseModel):
    message: str


# --- Admin: user management ------------------------------------------------

class AdminUpdateUserRequest(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class AdminCreateUserRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str
    role: UserRole = UserRole.ATHLETE

    _check_password = field_validator("password")(_validate_password_strength)
