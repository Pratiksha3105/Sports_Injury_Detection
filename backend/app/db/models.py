"""
Auth + RBAC database models.

These are new tables, additive to the existing project. Nothing in the AI
pipeline (pose estimation / biomechanics / risk scoring / video processing)
reads from or writes to the database.
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    COACH = "coach"
    ATHLETE = "athlete"
    PHYSIOTHERAPIST = "physiotherapist"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.ATHLETE, nullable=False)
    profile_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class RefreshToken(Base):
    """
    One row per issued refresh token (hashed, never stored raw). Enables
    logout / revocation / rotation instead of trusting JWTs blindly for
    7 days.
    """

    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user: Mapped["User"] = relationship(back_populates="refresh_tokens")


class Session(Base):
    """Lightweight login-session record, mainly for admin visibility/audit."""

    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Athlete(Base):
    """
    An athlete record managed by a coach or physiotherapist. Additive table —
    nothing in the AI pipeline (pose estimation / biomechanics / risk
    scoring) reads from or depends on this. `managed_by_id` scopes visibility:
    a coach or physio only sees/edits the athletes they created; an admin
    sees all of them (same pattern as the rest of the RBAC in this app).

    The `recovery_status` / `treatment_plan` fields are physiotherapist-
    oriented but kept on the same table rather than a second one, since a
    coach may also want visibility into recovery status for their athletes.
    """

    __tablename__ = "athletes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    managed_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(30), nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    sport: Mapped[str | None] = mapped_column(String(80), nullable=True)
    position: Mapped[str | None] = mapped_column(String(80), nullable=True)
    team: Mapped[str | None] = mapped_column(String(120), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    injury_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    medical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Physiotherapist-oriented rehab fields
    recovery_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    treatment_plan: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    managed_by: Mapped["User"] = relationship()


class AnalysisHistory(Base):
    """
    A permanent record of one video analysis run. Created automatically by
    the /videos/analyze endpoint right after a pipeline run succeeds; the
    primary key is the same `analysis_id` the pipeline already generates,
    so this table and storage/results/{id}.json describe the same analysis
    from two angles (this is the queryable/relational view; the JSON file
    remains the full nested result, unchanged).

    Two honest notes on field mapping vs. the original feature spec:
      - `report_pdf_path`: PDFs are generated on demand (see
        report_generator.py) rather than pre-rendered to disk, so this
        stores the download URL, not a file path.
      - `skeleton_overlay_video_path`: the pipeline produces a single
        annotated/overlay video, not two separate artifacts, so this
        currently mirrors `processed_video_path`.
    """

    __tablename__ = "analysis_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # == pipeline analysis_id
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user_role: Mapped[str] = mapped_column(String(30), nullable=False)

    athlete_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("athletes.id", ondelete="SET NULL"), nullable=True, index=True)
    athlete_name: Mapped[str | None] = mapped_column(String(120), nullable=True)

    video_name: Mapped[str] = mapped_column(String(255), nullable=False)
    video_path: Mapped[str] = mapped_column(String(500), nullable=False)

    upload_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    analysis_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    sport_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    movement_type: Mapped[str | None] = mapped_column(String(60), nullable=True)

    risk_level: Mapped[str] = mapped_column(String(30), nullable=False)
    injury_probability: Mapped[float] = mapped_column(Float, nullable=False)
    ai_prediction: Mapped[str] = mapped_column(String(120), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)

    report_pdf_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    processed_video_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    skeleton_overlay_video_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    keypoints_json_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    recommendation_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    user: Mapped["User"] = relationship()
    athlete: Mapped["Athlete | None"] = relationship()
    chat_messages: Mapped[list["ChatMessage"]] = relationship(back_populates="analysis", cascade="all, delete-orphan")


class ChatMessage(Base):
    """
    One message in the per-report "Ask AI" conversation. Scoped to a single
    `analysis_id` (FK to AnalysisHistory) so each report has its own,
    separate thread — matches Feature 6 exactly.
    """

    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analysis_history.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # "user" | "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)

    analysis: Mapped["AnalysisHistory"] = relationship(back_populates="chat_messages")
