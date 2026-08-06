// Mirrors app/models/schemas.py on the AI core backend exactly, field for
// field, so the frontend never has to guess at shapes.

export interface JointAngles {
  left_knee: number | null;
  right_knee: number | null;
  left_hip: number | null;
  right_hip: number | null;
  left_elbow: number | null;
  right_elbow: number | null;
  left_ankle: number | null;
  right_ankle: number | null;
  trunk_lean_deg: number | null;
}

export interface FrameBiomechanics {
  frame_index: number;
  timestamp_sec: number;
  joint_angles: JointAngles;
  knee_valgus_left_deg: number | null;
  knee_valgus_right_deg: number | null;
  hip_drop_deg: number | null;
  shoulder_tilt_deg: number | null;
  center_of_mass_x: number | null;
  center_of_mass_y: number | null;
}

export interface BiomechanicsSummary {
  avg_left_knee_angle: number | null;
  avg_right_knee_angle: number | null;
  min_left_knee_angle: number | null;
  min_right_knee_angle: number | null;
  max_knee_valgus_left_deg: number | null;
  max_knee_valgus_right_deg: number | null;
  avg_trunk_lean_deg: number | null;
  max_trunk_lean_deg: number | null;
  hip_stability_score: number | null;
  movement_symmetry_score: number | null;
  balance_score: number | null;
  stride_length_estimate: number | null;
  landing_softness_score: number | null;
  frames_analyzed: number;
  frames_with_detection: number;
  detection_rate: number;
}

export interface AnomalyEvent {
  frame_index: number;
  timestamp_sec: number;
  anomaly_type: string;
  severity: "low" | "moderate" | "high";
  description: string;
}

export interface AnomalySummary {
  total_anomalies: number;
  events: AnomalyEvent[];
  fatigue_trend_detected: boolean;
  fatigue_onset_timestamp_sec: number | null;
}

export type RiskCategory = "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk";

export interface InjuryTypeRisk {
  injury_type: string;
  probability_pct: number;
  contributing_factors: string[];
}

export interface RiskScoreBreakdown {
  biomechanical_deviations_score: number;
  historical_injury_factors_score: number;
  movement_asymmetry_score: number;
  training_load_score: number;
  fatigue_score: number;
  biomechanical_deviations_weight: number;
  historical_injury_factors_weight: number;
  movement_asymmetry_weight: number;
  training_load_weight: number;
  fatigue_weight: number;
  weighted_total: number;
}

export interface RiskAssessment {
  overall_injury_risk_score: number;
  risk_category: RiskCategory;
  movement_quality_score: number;
  biomechanical_efficiency_score: number;
  fatigue_risk_score: number;
  athlete_health_score: number;
  confidence_level: number;
  breakdown: RiskScoreBreakdown;
  injury_type_risks: InjuryTypeRisk[];
}

export interface Recommendation {
  category: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export interface RecommendationSet {
  exercises: Recommendation[];
  mobility: Recommendation[];
  strengthening: Recommendation[];
  recovery_plan: Recommendation[];
  training_modifications: Recommendation[];
}

export interface VideoMeta {
  filename: string;
  duration_sec: number;
  fps: number;
  width: number;
  height: number;
  total_frames: number;
  frames_sampled: number;
}

export interface AnalysisResult {
  analysis_id: string;
  activity_type: string | null;
  video_meta: VideoMeta;
  biomechanics_summary: BiomechanicsSummary;
  anomaly_summary: AnomalySummary;
  risk_assessment: RiskAssessment;
  recommendations: RecommendationSet;
  per_frame_biomechanics: FrameBiomechanics[];
}

export interface UploadFormValues {
  activityType: string;
  injuryHistory: string;
  monthsSinceLastInjury: string;
  weeklyTrainingHours: string;
  acuteChronicRatio: string;
  exportAnnotatedVideo: boolean;
  athleteId: string;
}
