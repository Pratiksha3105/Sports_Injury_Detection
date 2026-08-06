"""
Athlete management endpoints for coaches and physiotherapists.

Additive feature: a coach or physio can add/edit/delete/search the athletes
they manage. Visibility is scoped to `managed_by_id == current_user.id`
(admins can see everyone's), matching the same ownership pattern already
used for admin/user routes. Nothing here touches the AI pipeline, the
video-analysis routes, or any existing table.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.athlete_schemas import AthleteCreateRequest, AthleteOut, AthleteUpdateRequest
from app.auth.dependencies import require_roles
from app.db.database import get_db
from app.db.models import Athlete, User, UserRole

router = APIRouter(prefix="/athletes", tags=["Athletes"])

# Coaches, physiotherapists, and admins can manage athletes. (Athletes
# themselves don't get an athlete-management view — that's out of scope
# for this feature.)
require_athlete_manager = require_roles(UserRole.ADMIN, UserRole.COACH, UserRole.PHYSIOTHERAPIST)


def _owned_query(db: Session, current_user: User):
    q = db.query(Athlete)
    if current_user.role != UserRole.ADMIN:
        q = q.filter(Athlete.managed_by_id == current_user.id)
    return q


def _get_owned_or_404(db: Session, current_user: User, athlete_id: str) -> Athlete:
    athlete = db.get(Athlete, athlete_id)
    if athlete is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Athlete not found")
    if current_user.role != UserRole.ADMIN and athlete.managed_by_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't manage this athlete")
    return athlete


@router.get("", response_model=list[AthleteOut])
def list_athletes(
    search: str | None = Query(default=None, description="Case-insensitive match on name, sport, or team"),
    current_user: User = Depends(require_athlete_manager),
    db: Session = Depends(get_db),
):
    q = _owned_query(db, current_user)
    if search:
        like = f"%{search.strip().lower()}%"
        q = q.filter(
            (Athlete.full_name.ilike(like)) | (Athlete.sport.ilike(like)) | (Athlete.team.ilike(like))
        )
    athletes = q.order_by(Athlete.full_name.asc()).all()
    return [AthleteOut.model_validate(a) for a in athletes]


@router.post("", response_model=AthleteOut, status_code=status.HTTP_201_CREATED)
def create_athlete(
    payload: AthleteCreateRequest,
    current_user: User = Depends(require_athlete_manager),
    db: Session = Depends(get_db),
):
    athlete = Athlete(managed_by_id=current_user.id, **payload.model_dump())
    db.add(athlete)
    db.commit()
    db.refresh(athlete)
    return AthleteOut.model_validate(athlete)


@router.get("/{athlete_id}", response_model=AthleteOut)
def get_athlete(
    athlete_id: str,
    current_user: User = Depends(require_athlete_manager),
    db: Session = Depends(get_db),
):
    athlete = _get_owned_or_404(db, current_user, athlete_id)
    return AthleteOut.model_validate(athlete)


@router.patch("/{athlete_id}", response_model=AthleteOut)
def update_athlete(
    athlete_id: str,
    payload: AthleteUpdateRequest,
    current_user: User = Depends(require_athlete_manager),
    db: Session = Depends(get_db),
):
    athlete = _get_owned_or_404(db, current_user, athlete_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(athlete, field, value)
    db.commit()
    db.refresh(athlete)
    return AthleteOut.model_validate(athlete)


@router.delete("/{athlete_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_athlete(
    athlete_id: str,
    current_user: User = Depends(require_athlete_manager),
    db: Session = Depends(get_db),
):
    athlete = _get_owned_or_404(db, current_user, athlete_id)
    db.delete(athlete)
    db.commit()
    return None
