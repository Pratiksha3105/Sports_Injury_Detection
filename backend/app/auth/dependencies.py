from __future__ import annotations

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.security import decode_token
from app.db.database import get_db
from app.db.models import User, UserRole

# auto_error=False so we can return a clean 401 JSON body instead of FastAPI's
# default "Not authenticated" on a missing header.
_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Validates the `Authorization: Bearer <access_token>` header and loads the
    corresponding user. Used as a dependency on every protected route.
    """
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    try:
        payload = decode_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired")
    except jwt.PyJWTError:
        raise unauthorized

    if payload.get("type") != "access":
        raise unauthorized

    user = db.get(User, payload.get("sub"))
    if user is None:
        raise unauthorized
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    return user


def get_current_active_user(user: User = Depends(get_current_user)) -> User:
    return user


def require_roles(*allowed_roles: UserRole):
    """
    Dependency factory for RBAC. Usage:

        @router.get("/admin/x")
        def handler(user: User = Depends(require_roles(UserRole.ADMIN))): ...
    """

    def _dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return user

    return _dependency


require_admin = require_roles(UserRole.ADMIN)
require_coach = require_roles(UserRole.ADMIN, UserRole.COACH)
require_physio = require_roles(UserRole.ADMIN, UserRole.PHYSIOTHERAPIST)
