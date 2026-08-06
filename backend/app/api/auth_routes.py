"""
Authentication API.

Access tokens are short-lived JWTs returned in the JSON body (the frontend
keeps them in memory, not localStorage). Refresh tokens are longer-lived
JWTs stored in an httpOnly cookie *and* persisted (hashed) in the database
so they can be revoked on logout / password change / rotation.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserOut,
    VerifyEmailRequest,
)
from app.auth.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_opaque_token,
    hash_opaque_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.db.database import get_db
from app.db.models import EmailVerification, PasswordReset, RefreshToken, User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# Cookie helpers
# ---------------------------------------------------------------------------

def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=settings.REFRESH_COOKIE_NAME, path="/")


def _issue_tokens(db: Session, user: User, response: Response, request: Request) -> TokenResponse:
    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id, user.role.value)

    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_opaque_token(refresh_token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=request.headers.get("user-agent"),
        )
    )
    db.commit()

    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserOut.model_validate(user),
    )


# ---------------------------------------------------------------------------
# Register / Login / Logout / Refresh
# ---------------------------------------------------------------------------

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Issue an email verification token. In this deployment there's no SMTP
    # integration wired up, so we log it instead of emailing it — swap this
    # for a real mail send in production without changing the flow.
    raw_token = generate_opaque_token()
    db.add(
        EmailVerification(
            user_id=user.id,
            token_hash=hash_opaque_token(raw_token),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS),
        )
    )
    db.commit()
    logger.info("Email verification token for %s: %s", user.email, raw_token)

    return _issue_tokens(db, user, response, request)


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account has been deactivated")

    return _issue_tokens(db, user, response, request)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    raw_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token provided")

    try:
        payload = decode_token(raw_token)
    except jwt.ExpiredSignatureError:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired, please log in again")
    except jwt.PyJWTError:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    token_hash = hash_opaque_token(raw_token)
    stored = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.user_id == payload.get("sub"))
        .first()
    )
    now = datetime.now(timezone.utc)
    if stored is None or stored.revoked or stored.expires_at.replace(tzinfo=timezone.utc) < now:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is no longer valid")

    user = db.get(User, payload.get("sub"))
    if user is None or not user.is_active:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account no longer available")

    # Rotate: revoke the used refresh token, issue a brand new pair.
    stored.revoked = True
    db.commit()

    return _issue_tokens(db, user, response, request)


@router.post("/logout", response_model=MessageResponse)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if raw_token:
        token_hash = hash_opaque_token(raw_token)
        stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if stored:
            stored.revoked = True
            db.commit()
    _clear_refresh_cookie(response)
    return MessageResponse(message="Logged out successfully")


# ---------------------------------------------------------------------------
# Profile / password / email verification
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.patch("/me", response_model=UserOut)
def update_profile(
    payload: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.profile_image is not None:
        user.profile_image = payload.profile_image
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")

    user.password_hash = hash_password(payload.new_password)
    # Revoke every outstanding refresh token — a password change should log
    # out all other sessions/devices.
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id, RefreshToken.revoked.is_(False)).update(
        {"revoked": True}
    )
    db.commit()
    return MessageResponse(message="Password changed successfully. Please log in again on other devices.")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    # Always return the same generic message — do not reveal whether an
    # account exists for this email.
    generic = MessageResponse(message="If an account exists for that email, a reset link has been sent.")
    if user is None:
        return generic

    raw_token = generate_opaque_token()
    db.add(
        PasswordReset(
            user_id=user.id,
            token_hash=hash_opaque_token(raw_token),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
        )
    )
    db.commit()
    # No SMTP configured in this environment — log the token so it can be
    # wired to a real email provider later without changing the API shape.
    logger.info("Password reset token for %s: %s", user.email, raw_token)
    return generic


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hash_opaque_token(payload.token)
    record = db.query(PasswordReset).filter(PasswordReset.token_hash == token_hash).first()
    now = datetime.now(timezone.utc)
    if record is None or record.used or record.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset link is invalid or has expired")

    user = db.get(User, record.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset link is invalid or has expired")

    user.password_hash = hash_password(payload.new_password)
    record.used = True
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id, RefreshToken.revoked.is_(False)).update(
        {"revoked": True}
    )
    db.commit()
    return MessageResponse(message="Password reset successfully. Please log in with your new password.")


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    token_hash = hash_opaque_token(payload.token)
    record = db.query(EmailVerification).filter(EmailVerification.token_hash == token_hash).first()
    now = datetime.now(timezone.utc)
    if record is None or record.used or record.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification link is invalid or has expired")

    user = db.get(User, record.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification link is invalid or has expired")

    user.is_email_verified = True
    record.used = True
    db.commit()
    return MessageResponse(message="Email verified successfully.")
