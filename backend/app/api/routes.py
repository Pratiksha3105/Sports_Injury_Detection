"""
API layer: video upload endpoint + analysis retrieval.
"""
from __future__ import annotations

import json
import logging
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.pipeline import run_analysis
from app.core.report_generator import build_detailed_pdf, build_summary_pdf
from app.core.video_processor import VideoValidationError
from app.db.database import get_db
from app.db.models import AnalysisHistory, Athlete, User, UserRole
from app.models.schemas import AnalysisResult

logger = logging.getLogger(__name__)
router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "storage" / "uploads"
RESULTS_DIR = BASE_DIR / "storage" / "results"
ANNOTATED_DIR = BASE_DIR / "storage" / "annotated"
for d in (UPLOAD_DIR, RESULTS_DIR, ANNOTATED_DIR):
    d.mkdir(parents=True, exist_ok=True)


@router.post("/videos/analyze", response_model=AnalysisResult, tags=["Analysis"])
async def analyze_video(
    file: UploadFile = File(..., description="Sports movement video (mp4/mov/avi/mkv/webm)"),
    activity_type: Optional[str] = Form(None, description="running, sprinting, jumping, squatting, landing, throwing, cutting, sport_specific"),
    injury_history: Optional[str] = Form(None, description="Comma-separated list, e.g. 'ACL tear,ankle sprain'"),
    months_since_last_injury: Optional[int] = Form(None),
    weekly_training_hours: Optional[float] = Form(None),
    acute_chronic_ratio: Optional[float] = Form(None),
    export_annotated_video: bool = Form(False),
    athlete_id: Optional[str] = Form(None, description="Link this analysis to an athlete you manage (optional)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Runs the full AI pipeline on an uploaded video:
    frame extraction -> pose estimation -> biomechanical analysis ->
    anomaly detection -> injury risk scoring -> corrective recommendations.

    A permanent row is also written to `analysis_history` so every upload
    shows up in the role-scoped history/dashboard views, regardless of
    whether the caller ever revisits this specific response.
    """
    athlete: Athlete | None = None
    if athlete_id:
        athlete = db.get(Athlete, athlete_id)
        if athlete is None:
            raise HTTPException(status_code=404, detail="Athlete not found")
        if current_user.role != UserRole.ADMIN and athlete.managed_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="You don't manage this athlete")

    analysis_id = str(uuid.uuid4())
    suffix = Path(file.filename or "upload.mp4").suffix or ".mp4"
    saved_path = UPLOAD_DIR / f"{analysis_id}{suffix}"

    with saved_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    annotated_path = ANNOTATED_DIR / f"{analysis_id}.mp4" if export_annotated_video else None

    history_list = [h.strip() for h in injury_history.split(",") if h.strip()] if injury_history else None
    # An athlete's on-file injury history is a stronger signal than a
    # per-upload text field, if one wasn't explicitly provided this time.
    if history_list is None and athlete is not None and athlete.injury_history:
        history_list = [h.strip() for h in athlete.injury_history.split(",") if h.strip()]

    try:
        result = run_analysis(
            saved_path,
            activity_type=activity_type,
            injury_history=history_list,
            months_since_last_injury=months_since_last_injury,
            weekly_training_hours=weekly_training_hours,
            acute_chronic_ratio=acute_chronic_ratio,
            export_annotated_video=export_annotated_video,
            annotated_output_path=annotated_path,
        )
    except VideoValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Analysis pipeline failed")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    result.analysis_id = analysis_id
    result_path = RESULTS_DIR / f"{analysis_id}.json"
    result_path.write_text(result.model_dump_json(indent=2))

    annotated_str = str(annotated_path) if annotated_path and annotated_path.exists() else None
    history_row = AnalysisHistory(
        id=analysis_id,
        user_id=current_user.id,
        user_role=current_user.role.value,
        athlete_id=athlete.id if athlete else None,
        athlete_name=athlete.full_name if athlete else None,
        video_name=file.filename or saved_path.name,
        video_path=str(saved_path),
        sport_type=(athlete.sport if athlete else None),
        movement_type=result.activity_type,
        risk_level=result.risk_assessment.risk_category.value,
        injury_probability=result.risk_assessment.overall_injury_risk_score,
        ai_prediction=result.risk_assessment.risk_category.value,
        confidence_score=result.risk_assessment.confidence_level,
        report_pdf_path=f"/api/v1/videos/analyze/{analysis_id}/report/detailed.pdf",
        processed_video_path=annotated_str,
        skeleton_overlay_video_path=annotated_str,
        keypoints_json_path=str(result_path),
        recommendation_summary=_summarize_recommendations(result),
    )
    db.add(history_row)
    db.commit()

    return result


def _summarize_recommendations(result: AnalysisResult) -> str | None:
    rec = result.recommendations
    for group in (rec.training_modifications, rec.recovery_plan, rec.strengthening, rec.mobility, rec.exercises):
        if group:
            top = group[0]
            return f"{top.title}: {top.description}"
    return None


@router.get("/videos/analyze/{analysis_id}", response_model=AnalysisResult, tags=["Analysis"])
async def get_analysis(analysis_id: str, current_user: User = Depends(get_current_user)):
    result_path = RESULTS_DIR / f"{analysis_id}.json"
    if not result_path.exists():
        raise HTTPException(status_code=404, detail="Analysis not found")
    return json.loads(result_path.read_text())


@router.get("/videos/analyze/{analysis_id}/annotated", tags=["Analysis"])
async def get_annotated_video(analysis_id: str, current_user: User = Depends(get_current_user)):
    path = ANNOTATED_DIR / f"{analysis_id}.mp4"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Annotated video not found (was export_annotated_video=true?)")
    return FileResponse(path, media_type="video/mp4", filename=f"{analysis_id}_annotated.mp4")


def _load_result(analysis_id: str) -> AnalysisResult:
    result_path = RESULTS_DIR / f"{analysis_id}.json"
    if not result_path.exists():
        raise HTTPException(status_code=404, detail="Analysis not found")
    return AnalysisResult.model_validate_json(result_path.read_text())


@router.get("/videos/analyze/{analysis_id}/report/summary.pdf", tags=["Analysis"])
async def get_summary_report_pdf(analysis_id: str, current_user: User = Depends(get_current_user)):
    """A concise 1-2 page PDF: risk gauge, headline scores, and top recommendations."""
    result = _load_result(analysis_id)
    pdf_bytes = build_summary_pdf(result, requested_by=current_user.full_name)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="kinetic_summary_{analysis_id}.pdf"'},
    )


@router.get("/videos/analyze/{analysis_id}/report/detailed.pdf", tags=["Analysis"])
async def get_detailed_report_pdf(analysis_id: str, current_user: User = Depends(get_current_user)):
    """The full PDF report: biomechanics table, anomaly timeline, and complete recommendation set."""
    result = _load_result(analysis_id)
    pdf_bytes = build_detailed_pdf(result, requested_by=current_user.full_name)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="kinetic_detailed_{analysis_id}.pdf"'},
    )
