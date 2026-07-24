from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, ForeignKey, Enum, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Video(Base):
    __tablename__ = "videos"

    video_id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.athlete_id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_mb = Column(Numeric(8, 2), nullable=True)
    duration_secs = Column(Integer, nullable=True)
    sport_activity = Column(String(100), nullable=True)
    upload_status = Column(
        Enum("uploaded", "processing", "processed", "failed", name="upload_status_enum"),
        default="uploaded",
        nullable=False,
    )
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    athlete = relationship("Athlete", back_populates="videos")
    predictions = relationship("Prediction", back_populates="video", cascade="all, delete-orphan")
