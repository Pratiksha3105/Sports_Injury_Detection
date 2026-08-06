"""
Admin-only endpoints: user management (list/view/edit/activate/deactivate/
delete/change role). Gated by require_admin (role == ADMIN).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin
from app.auth.schemas import AdminCreateUserRequest, AdminUpdateUserRequest, MessageResponse, UserOut
from app.auth.security import hash_password
from app.db.database import get_db
from app.db.models import RefreshToken, User

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return [UserOut.model_validate(u) for u in db.query(User).order_by(User.created_at.desc()).all()]


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: AdminCreateUserRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")
    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    payload: AdminUpdateUserRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.role is not None:
        if user.id == admin.id and payload.role != user.role:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot change your own role")
        user.role = payload.role
    if payload.is_active is not None:
        if user.id == admin.id and payload.is_active is False:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot deactivate your own account")
        user.is_active = payload.is_active
        if not payload.is_active:
            # Kick the user out of every active session immediately.
            db.query(RefreshToken).filter(
                RefreshToken.user_id == user.id, RefreshToken.revoked.is_(False)
            ).update({"revoked": True})

    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(user_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own account")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return MessageResponse(message="User deleted")
