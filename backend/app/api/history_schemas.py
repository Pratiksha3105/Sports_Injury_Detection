from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class HistoryItemOut(BaseModel):
    id: str
    user_id: str
    user_role: str
    athlete_id: str | None
    athlete_name: str | None
    video_name: str
    video_path: str
    upload_timestamp: datetime
    analysis_timestamp: datetime
    sport_type: str | None
    movement_type: str | None
    risk_level: str
    injury_probability: float
    ai_prediction: str
    confidence_score: float
    report_pdf_path: str | None
    processed_video_path: str | None
    skeleton_overlay_video_path: str | None
    keypoints_json_path: str | None
    recommendation_summary: str | None
    created_at: datetime

    # Denormalized for display convenience — avoids an extra request per row.
    uploader_name: str | None = None

    model_config = {"from_attributes": True}


class HistoryListResponse(BaseModel):
    items: list[HistoryItemOut]
    total: int
    page: int
    page_size: int


class TrendPoint(BaseModel):
    date: datetime
    injury_probability: float
    athlete_name: str | None
    analysis_id: str


class DashboardStats(BaseModel):
    total_analyses: int
    weekly_upload_count: int
    risk_distribution: dict[str, int]
    highest_risk: HistoryItemOut | None
    recent_uploads: list[HistoryItemOut]
    improvement_trend: list[TrendPoint]
