"""
SQLAlchemy engine/session bootstrap for the auth + RBAC layer.

This is additive: the AI pipeline (pose estimation, biomechanics, risk
scoring, video processing) has no database dependency and is untouched.
Only auth-related tables live here.
"""
from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
STORAGE_DIR = BASE_DIR / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yields a request-scoped DB session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create auth tables if they don't exist yet. Safe to call every startup."""
    # Import models so they're registered on Base.metadata before create_all.
    from app.db import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
