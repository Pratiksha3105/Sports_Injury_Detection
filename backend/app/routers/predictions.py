"""
Prediction routes — Milestone 1 exposes read-only, dummy-data-friendly
endpoints. The actual LSTM/MediaPipe inference pipeline is Milestone 3+.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionOut
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/predictions", tags=["Predictions"])


@router.get("/", response_model=list[PredictionOut])
def list_my_predictions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    athlete_id = current_user.athlete_profile.athlete_id if current_user.athlete_profile else None
    if not athlete_id:
        return []
    return db.query(Prediction).filter(Prediction.athlete_id == athlete_id).all()
