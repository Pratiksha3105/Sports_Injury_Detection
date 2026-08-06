"""
Pipeline Orchestrator
=======================
Wires together, in order: video validation -> frame extraction -> pose
estimation -> biomechanical analysis -> anomaly detection -> risk scoring
-> recommendations -> (optional) annotated video export.

This is the single entry point the API layer calls.
"""
from __future__ import annotations

import logging
import time
import uuid
from pathlib import Path
from typing import Optional

from app.core.video_processor import (
    validate_video_file,
    read_metadata,
    iter_sampled_frames,
    AnnotatedVideoWriter,
    VideoValidationError,
)
from app.core.pose_estimator import PoseEstimator, PoseEstimatorConfig
from app.core.biomechanics import compute_frame_biomechanics, summarize_biomechanics
from app.core.anomaly_detector import detect_anomalies
from app.core.risk_engine import compute_risk_assessment
from app.core.recommendation_engine import build_recommendations
from app.models.schemas import AnalysisResult, VideoMeta

logger = logging.getLogger(__name__)


def run_analysis(
    video_path: Path,
    activity_type: Optional[str] = None,
    injury_history: Optional[list[str]] = None,
    months_since_last_injury: Optional[int] = None,
    weekly_training_hours: Optional[float] = None,
    acute_chronic_ratio: Optional[float] = None,
    target_sample_fps: float = 10.0,
    export_annotated_video: bool = False,
    annotated_output_path: Optional[Path] = None,
) -> AnalysisResult:
    """Runs the full AI pipeline on a video file and returns a structured
    AnalysisResult. Raises VideoValidationError if the input fails
    validation (spec: "Video Validation")."""
    t_start = time.time()

    validate_video_file(video_path)
    meta = read_metadata(video_path)

    frame_biomechanics = []
    frames_sampled = 0

    writer = None
    if export_annotated_video and annotated_output_path is not None:
        writer = AnnotatedVideoWriter(
            annotated_output_path, fps=target_sample_fps, width=meta.width, height=meta.height
        )

    with PoseEstimator(PoseEstimatorConfig()) as estimator:
        for idx, ts, frame in iter_sampled_frames(video_path, target_fps=target_sample_fps, enhance=True):
            frame_pose = estimator.process_frame(frame, idx, ts)
            fb = compute_frame_biomechanics(frame_pose)
            frame_biomechanics.append(fb)
            frames_sampled += 1

            if writer is not None:
                annotated = estimator.draw_skeleton(frame, frame_pose)
                writer.write(annotated)

    if writer is not None:
        writer.close()

    bio_summary = summarize_biomechanics(frame_biomechanics, frames_sampled)
    anomaly_summary = detect_anomalies(frame_biomechanics)
    risk_assessment = compute_risk_assessment(
        bio_summary,
        anomaly_summary,
        injury_history=injury_history,
        months_since_last_injury=months_since_last_injury,
        weekly_training_hours=weekly_training_hours,
        acute_chronic_ratio=acute_chronic_ratio,
    )
    recommendations = build_recommendations(bio_summary, risk_assessment, anomaly_summary)

    elapsed = time.time() - t_start
    logger.info(
        "Analysis complete: %d frames sampled (%.1f%% detection rate) in %.2fs",
        frames_sampled, bio_summary.detection_rate * 100, elapsed,
    )

    return AnalysisResult(
        analysis_id=str(uuid.uuid4()),
        activity_type=activity_type,
        video_meta=VideoMeta(
            filename=meta.filename,
            duration_sec=round(meta.duration_sec, 2),
            fps=meta.fps,
            width=meta.width,
            height=meta.height,
            total_frames=meta.total_frames,
            frames_sampled=frames_sampled,
        ),
        biomechanics_summary=bio_summary,
        anomaly_summary=anomaly_summary,
        risk_assessment=risk_assessment,
        recommendations=recommendations,
        per_frame_biomechanics=frame_biomechanics,
    )
