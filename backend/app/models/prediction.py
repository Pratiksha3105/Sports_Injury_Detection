from sqlalchemy import Column, Integer, String, Numeric, Text, TIMESTAMP, ForeignKey, Enum, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    prediction_id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.video_id"), nullable=False)
    athlete_id = Column(Integer, ForeignKey("athletes.athlete_id"), nullable=False)
    risk_level = Column(Enum("low", "moderate", "high", name="risk_level_enum"), nullable=True)
    risk_score = Column(Numeric(5, 2), nullable=True)
    body_part_flagged = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    status = Column(
        Enum("pending", "completed", "failed", name="prediction_status_enum"),
        default="pending",
        nullable=False,
    )
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    video = relationship("Video", back_populates="predictions")
    athlete = relationship("Athlete", back_populates="predictions")
