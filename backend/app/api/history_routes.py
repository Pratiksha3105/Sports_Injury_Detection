"""
Role-scoped history + dashboard endpoints.

Visibility rules (matches the feature spec):
  - Admin: everything.
  - Coach / Physiotherapist: their own uploads, plus any upload linked to
    an athlete they manage (`Athlete.managed_by_id == current_user.id`).
  - Athlete (a login account, not an `Athlete` roster row): only their own
    uploads.

Deletion is intentionally narrower than "manage": only the original
uploader or an admin can delete a history row, matching what the spec
explicitly grants ("Admin: delete any history" / "Athlete: delete personal
history") — coaches/physios were not explicitly given delete rights over
an athlete's history, so this doesn't invent that permission.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.history_schemas import DashboardStats, HistoryItemOut, HistoryListResponse, TrendPoint
from app.auth.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import AnalysisHistory, Athlete, User, UserRole

router = APIRouter(prefix="/history", tags=["History"])


def _scoped_query(db: Session, current_user: User):
    q = db.query(AnalysisHistory)
    if current_user.role == UserRole.ADMIN:
        return q
    if current_user.role == UserRole.ATHLETE:
        return q.filter(AnalysisHistory.user_id == current_user.id)
    # Coach / Physiotherapist
    managed_ids = [row[0] for row in db.query(Athlete.id).filter(Athlete.managed_by_id == current_user.id)]
    return q.filter(or_(AnalysisHistory.user_id == current_user.id, AnalysisHistory.athlete_id.in_(managed_ids)))


def _to_out(row: AnalysisHistory) -> HistoryItemOut:
    out = HistoryItemOut.model_validate(row)
    out.uploader_name = row.user.full_name if row.user else None
    return out


@router.get("", response_model=HistoryListResponse)
def list_history(
    athlete: str | None = Query(default=None, description="Filter/search by athlete name"),
    athlete_id: str | None = Query(default=None, description="Exact athlete id match"),
    uploader: str | None = Query(default=None, description="Admin: search by coach/physio/uploader name"),
    sport: str | None = Query(default=None),
    risk_level: str | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    search: str | None = Query(default=None, description="Free-text match on athlete or video name"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = _scoped_query(db, current_user)

    if athlete:
        q = q.filter(AnalysisHistory.athlete_name.ilike(f"%{athlete}%"))
    if athlete_id:
        q = q.filter(AnalysisHistory.athlete_id == athlete_id)
    if uploader:
        q = q.join(User, AnalysisHistory.user_id == User.id).filter(User.full_name.ilike(f"%{uploader}%"))
    if sport:
        q = q.filter(AnalysisHistory.sport_type.ilike(f"%{sport}%"))
    if risk_level:
        q = q.filter(AnalysisHistory.risk_level == risk_level)
    if date_from:
        q = q.filter(AnalysisHistory.analysis_timestamp >= date_from)
    if date_to:
        q = q.filter(AnalysisHistory.analysis_timestamp <= date_to)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(AnalysisHistory.athlete_name.ilike(like), AnalysisHistory.video_name.ilike(like)))

    total = q.count()
    rows = (
        q.order_by(AnalysisHistory.analysis_timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return HistoryListResponse(items=[_to_out(r) for r in rows], total=total, page=page, page_size=page_size)


@router.get("/{analysis_id}", response_model=HistoryItemOut)
def get_history_item(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _scoped_query(db, current_user).filter(AnalysisHistory.id == analysis_id).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History entry not found")
    return _to_out(row)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_item(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(AnalysisHistory, analysis_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History entry not found")
    if current_user.role != UserRole.ADMIN and row.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own uploads")
    db.delete(row)
    db.commit()
    return None


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = _scoped_query(db, current_user)
    total = q.count()

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_count = q.filter(AnalysisHistory.analysis_timestamp >= week_ago).count()

    dist_rows = (
        _scoped_query(db, current_user)
        .with_entities(AnalysisHistory.risk_level, func.count(AnalysisHistory.id))
        .group_by(AnalysisHistory.risk_level)
        .all()
    )
    risk_distribution = {level: count for level, count in dist_rows}

    highest_risk_row = (
        _scoped_query(db, current_user).order_by(AnalysisHistory.injury_probability.desc()).first()
    )
    recent_rows = _scoped_query(db, current_user).order_by(AnalysisHistory.analysis_timestamp.desc()).limit(5).all()

    trend_rows = (
        _scoped_query(db, current_user)
        .filter(AnalysisHistory.athlete_id.isnot(None))
        .order_by(AnalysisHistory.analysis_timestamp.asc())
        .limit(200)
        .all()
    )

    return DashboardStats(
        total_analyses=total,
        weekly_upload_count=weekly_count,
        risk_distribution=risk_distribution,
        highest_risk=_to_out(highest_risk_row) if highest_risk_row else None,
        recent_uploads=[_to_out(r) for r in recent_rows],
        improvement_trend=[
            TrendPoint(
                date=r.analysis_timestamp,
                injury_probability=r.injury_probability,
                athlete_name=r.athlete_name,
                analysis_id=r.id,
            )
            for r in trend_rows
        ],
    )
