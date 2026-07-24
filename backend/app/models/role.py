from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)  # athlete | coach | admin
    description = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    users = relationship("User", back_populates="role")
