"""
Pydantic data models shared across the pose estimation, biomechanics,
and risk-scoring pipeline.

These mirror the "Modules to be Implemented" section of the project spec:
  4. Pose Estimation Engine
  5. Biomechanical Analysis Engine
  6. Injury Risk Prediction Engine
  7. Movement Anomaly Detection Engine
  8. Risk Scoring Engine
  9. Corrective Recommendation Engine
"""
from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Pose Estimation
# ---------------------------------------------------------------------------

class Landmark(BaseModel):
    name: str
    x: float
    y: float
    z: float
    visibility: float


class FramePose(BaseModel):
    frame_index: int
    timestamp_sec: float
    detected: bool
    landmarks: list[Landmark] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Biomechanics
# ---------------------------------------------------------------------------

class JointAngles(BaseModel):
    left_knee: Optional[float] = None
    right_knee: Optional[float] = None
    left_hip: Optional[float] = None
    right_hip: Optional[float] = None
    left_elbow: Optional[float] = None
    right_elbow: Optional[float] = None
    left_ankle: Optional[float] = None
    right_ankle: Optional[float] = None
    trunk_lean_deg: Optional[float] = None


class FrameBiomechanics(BaseModel):
    frame_index: int
    timestamp_sec: float
    joint_angles: JointAngles
    knee_valgus_left_deg: Optional[float] = None
    knee_valgus_right_deg: Optional[float] = None
    hip_drop_deg: Optional[float] = None
    shoulder_tilt_deg: Optional[float] = None
    center_of_mass_x: Optional[float] = None
    center_of_mass_y: Optional[float] = None


class BiomechanicsSummary(BaseModel):
    """Aggregated metrics across the whole clip -- what the spec calls the
    "Biomechanical Metrics": Knee Valgus, Hip Stability, Trunk Lean,
    Landing Mechanics, Stride Length, Joint Alignment, Balance Metrics."""
    avg_left_knee_angle: Optional[float] = None
    avg_right_knee_angle: Optional[float] = None
    min_left_knee_angle: Optional[float] = None
    min_right_knee_angle: Optional[float] = None
    max_knee_valgus_left_deg: Optional[float] = None
    max_knee_valgus_right_deg: Optional[float] = None
    avg_trunk_lean_deg: Optional[float] = None
    max_trunk_lean_deg: Optional[float] = None
    hip_stability_score: Optional[float] = None       # 0-100, higher = more stable
    movement_symmetry_score: Optional[float] = None   # 0-100, higher = more symmetric
    balance_score: Optional[float] = None              # 0-100
    stride_length_estimate: Optional[float] = None     # normalized units (hip-height=1.0)
    landing_softness_score: Optional[float] = None     # 0-100, higher = softer landing
    frames_analyzed: int = 0
    frames_with_detection: int = 0
    detection_rate: float = 0.0


# ---------------------------------------------------------------------------
# Movement Anomaly Detection
# ---------------------------------------------------------------------------

class AnomalyEvent(BaseModel):
    frame_index: int
    timestamp_sec: float
    anomaly_type: str
    severity: str  # low / moderate / high
    description: str


class AnomalySummary(BaseModel):
    total_anomalies: int
    events: list[AnomalyEvent] = Field(default_factory=list)
    fatigue_trend_detected: bool = False
    fatigue_onset_timestamp_sec: Optional[float] = None


# ---------------------------------------------------------------------------
# Injury Risk Prediction / Scoring
# ---------------------------------------------------------------------------

class RiskCategory(str, Enum):
    LOW = "Low Risk"
    MODERATE = "Moderate Risk"
    HIGH = "High Risk"
    CRITICAL = "Critical Risk"


class InjuryTypeRisk(BaseModel):
    injury_type: str
    probability_pct: float
    contributing_factors: list[str] = Field(default_factory=list)


class RiskScoreBreakdown(BaseModel):
    """Implements the weighted scoring model from the spec:
    Injury Risk Score = Biomechanical Deviations (35%) +
    Historical Injury Factors (20%) + Movement Asymmetry (20%) +
    Training Load Indicators (15%) + Fatigue Indicators (10%)"""
    biomechanical_deviations_score: float
    historical_injury_factors_score: float
    movement_asymmetry_score: float
    training_load_score: float
    fatigue_score: float

    biomechanical_deviations_weight: float = 0.35
    historical_injury_factors_weight: float = 0.20
    movement_asymmetry_weight: float = 0.20
    training_load_weight: float = 0.15
    fatigue_weight: float = 0.10

    weighted_total: float = 0.0


class RiskAssessment(BaseModel):
    overall_injury_risk_score: float          # 0-100 (higher = riskier)
    risk_category: RiskCategory
    movement_quality_score: float              # 0-100
    biomechanical_efficiency_score: float       # 0-100
    fatigue_risk_score: float                   # 0-100
    athlete_health_score: float                 # 0-100 (higher = healthier)
    confidence_level: float                     # 0-100, based on detection rate & frame count
    breakdown: RiskScoreBreakdown
    injury_type_risks: list[InjuryTypeRisk] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

class Recommendation(BaseModel):
    category: str    # exercise / mobility / strengthening / recovery / training_modification
    title: str
    description: str
    priority: str    # low / medium / high


class RecommendationSet(BaseModel):
    exercises: list[Recommendation] = Field(default_factory=list)
    mobility: list[Recommendation] = Field(default_factory=list)
    strengthening: list[Recommendation] = Field(default_factory=list)
    recovery_plan: list[Recommendation] = Field(default_factory=list)
    training_modifications: list[Recommendation] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Top level analysis result
# ---------------------------------------------------------------------------

class VideoMeta(BaseModel):
    filename: str
    duration_sec: float
    fps: float
    width: int
    height: int
    total_frames: int
    frames_sampled: int


class AnalysisResult(BaseModel):
    analysis_id: str
    activity_type: Optional[str] = None
    video_meta: VideoMeta
    biomechanics_summary: BiomechanicsSummary
    anomaly_summary: AnomalySummary
    risk_assessment: RiskAssessment
    recommendations: RecommendationSet
    per_frame_biomechanics: list[FrameBiomechanics] = Field(default_factory=list)
