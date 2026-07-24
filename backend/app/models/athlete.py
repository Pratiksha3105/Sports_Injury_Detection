from sqlalchemy import Column, Integer, String, Numeric, Text, TIMESTAMP, ForeignKey, Enum, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Athlete(Base):
    __tablename__ = "athletes"

    athlete_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    height_cm = Column(Numeric(5, 2), nullable=True)
    weight_kg = Column(Numeric(5, 2), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(Enum("male", "female", "other", name="gender_enum"), nullable=True)
    sport = Column(String(100), nullable=True)
    experience_years = Column(Numeric(4, 1), nullable=True)
    medical_history = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="athlete_profile")
    videos = relationship("Video", back_populates="athlete", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="athlete", cascade="all, delete-orphan")
