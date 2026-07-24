from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.athlete import Athlete
from app.models.user import User
from app.schemas.athlete import AthleteCreate, AthleteUpdate, AthleteOut
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/athletes", tags=["Athletes"])


@router.get("/me", response_model=AthleteOut)
def get_my_athlete_profile(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    profile = db.query(Athlete).filter(Athlete.user_id == current_user.user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
    return profile


@router.post("/", response_model=AthleteOut, status_code=201)
def create_athlete_profile(payload: AthleteCreate, db: Session = Depends(get_db)):
    profile = Athlete(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/me", response_model=AthleteOut)
def update_my_athlete_profile(
    payload: AthleteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(Athlete).filter(Athlete.user_id == current_user.user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
