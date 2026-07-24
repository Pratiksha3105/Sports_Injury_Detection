"""
Video routes — Milestone 1 provides the endpoint shape and DB records only.
Actual file storage / streaming / processing arrives in Milestone 2.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.video import Video
from app.models.user import User
from app.schemas.video import VideoCreate, VideoOut
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/videos", tags=["Videos"])


@router.post("/", response_model=VideoOut, status_code=201)
def register_video(payload: VideoCreate, db: Session = Depends(get_db)):
    """
    Milestone 1: registers video metadata only (no real upload handling yet).
    """
    video = Video(**payload.model_dump())
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.get("/", response_model=list[VideoOut])
def list_my_videos(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    athlete_id = current_user.athlete_profile.athlete_id if current_user.athlete_profile else None
    if not athlete_id:
        return []
    return db.query(Video).filter(Video.athlete_id == athlete_id).all()
