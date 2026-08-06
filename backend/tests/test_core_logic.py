"""
Unit tests for the pure-logic modules (biomechanics math, risk scoring,
anomaly detection) using synthetic FramePose/FrameBiomechanics fixtures --
no video or mediapipe model required, so these run fast in any CI.

Run with:
    pytest tests/test_core_logic.py -v
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest

from app.models.schemas import FramePose, Landmark, JointAngles, FrameBiomechanics
from app.core.biomechanics import compute_frame_biomechanics, summarize_biomechanics, _angle_deg
from app.core.anomaly_detector import detect_anomalies
from app.core.risk_engine import compute_risk_assessment
from app.core.recommendation_engine import build_recommendations
import numpy as np


def make_landmark(name, x, y, z=0.0, visibility=0.9):
    return Landmark(name=name, x=x, y=y, z=z, visibility=visibility)


def make_standing_pose(frame_index=0, timestamp=0.0):
    """A roughly upright standing figure, landmarks in normalized [0,1] coords."""
    lms = [
        make_landmark("left_shoulder", 0.45, 0.30),
        make_landmark("right_shoulder", 0.55, 0.30),
        make_landmark("left_hip", 0.46, 0.55),
        make_landmark("right_hip", 0.54, 0.55),
        make_landmark("left_knee", 0.46, 0.75),
        make_landmark("right_knee", 0.54, 0.75),
        make_landmark("left_ankle", 0.46, 0.95),
        make_landmark("right_ankle", 0.54, 0.95),
        make_landmark("left_elbow", 0.40, 0.42),
        make_landmark("right_elbow", 0.60, 0.42),
        make_landmark("left_wrist", 0.38, 0.55),
        make_landmark("right_wrist", 0.62, 0.55),
        make_landmark("left_foot_index", 0.46, 0.98),
        make_landmark("right_foot_index", 0.54, 0.98),
    ]
    return FramePose(frame_index=frame_index, timestamp_sec=timestamp, detected=True, landmarks=lms)


def make_undetected_pose(frame_index=0, timestamp=0.0):
    return FramePose(frame_index=frame_index, timestamp_sec=timestamp, detected=False, landmarks=[])


class TestAngleGeometry:
    def test_straight_line_is_180_degrees(self):
        a = np.array([0.0, 0.0])
        b = np.array([1.0, 0.0])
        c = np.array([2.0, 0.0])
        assert _angle_deg(a, b, c) == pytest.approx(180.0, abs=0.1)

    def test_right_angle_is_90_degrees(self):
        a = np.array([0.0, 0.0])
        b = np.array([0.0, 1.0])
        c = np.array([1.0, 1.0])
        assert _angle_deg(a, b, c) == pytest.approx(90.0, abs=0.1)

    def test_degenerate_points_returns_none(self):
        a = np.array([0.0, 0.0])
        b = np.array([0.0, 0.0])
        c = np.array([1.0, 1.0])
        assert _angle_deg(a, b, c) is None


class TestFrameBiomechanics:
    def test_undetected_frame_returns_empty_angles(self):
        fb = compute_frame_biomechanics(make_undetected_pose())
        assert fb.joint_angles.left_knee is None
        assert fb.joint_angles.right_knee is None

    def test_standing_pose_knee_near_straight(self):
        fb = compute_frame_biomechanics(make_standing_pose())
        # hip-knee-ankle roughly collinear in our synthetic standing pose
        assert fb.joint_angles.left_knee > 150
        assert fb.joint_angles.right_knee > 150

    def test_standing_pose_low_trunk_lean(self):
        fb = compute_frame_biomechanics(make_standing_pose())
        assert fb.joint_angles.trunk_lean_deg is not None
        assert fb.joint_angles.trunk_lean_deg < 15

    def test_knee_valgus_is_zero_when_perfectly_aligned(self):
        fb = compute_frame_biomechanics(make_standing_pose())
        assert fb.knee_valgus_left_deg == pytest.approx(0.0, abs=0.5)
        assert fb.knee_valgus_right_deg == pytest.approx(0.0, abs=0.5)


class TestBiomechanicsSummary:
    def test_summary_handles_all_undetected(self):
        frames = [compute_frame_biomechanics(make_undetected_pose(i, i * 0.1)) for i in range(10)]
        summary = summarize_biomechanics(frames, total_sampled=10)
        assert summary.frames_with_detection == 0
        assert summary.detection_rate == 0.0
        assert summary.avg_left_knee_angle is None

    def test_summary_computes_averages(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(10)]
        summary = summarize_biomechanics(frames, total_sampled=10)
        assert summary.frames_with_detection == 10
        assert summary.detection_rate == 1.0
        assert summary.avg_left_knee_angle > 150


class TestAnomalyDetection:
    def test_no_anomalies_on_stable_series(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(20)]
        result = detect_anomalies(frames)
        assert result.total_anomalies == 0
        assert result.fatigue_trend_detected is False

    def test_detects_outlier_frame(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(20)]
        # inject one wildly deviated trunk lean frame
        frames[10].joint_angles.trunk_lean_deg = 80.0
        result = detect_anomalies(frames)
        assert result.total_anomalies >= 1

    def test_too_few_frames_returns_no_anomalies(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(3)]
        result = detect_anomalies(frames)
        assert result.total_anomalies == 0


class TestRiskEngine:
    def test_low_risk_for_clean_movement(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(30)]
        bio = summarize_biomechanics(frames, total_sampled=30)
        anomalies = detect_anomalies(frames)
        risk = compute_risk_assessment(bio, anomalies)
        assert risk.overall_injury_risk_score < 50
        assert risk.breakdown.weighted_total == pytest.approx(risk.overall_injury_risk_score, abs=0.1)

    def test_weighted_formula_matches_spec(self):
        """Verifies the weights are exactly 35/20/20/15/10 as specified in
        the project brief's Weighted Scoring Model."""
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(30)]
        bio = summarize_biomechanics(frames, total_sampled=30)
        anomalies = detect_anomalies(frames)
        risk = compute_risk_assessment(bio, anomalies)
        b = risk.breakdown
        assert b.biomechanical_deviations_weight == 0.35
        assert b.historical_injury_factors_weight == 0.20
        assert b.movement_asymmetry_weight == 0.20
        assert b.training_load_weight == 0.15
        assert b.fatigue_weight == 0.10
        expected = (
            b.biomechanical_deviations_score * 0.35
            + b.historical_injury_factors_score * 0.20
            + b.movement_asymmetry_score * 0.20
            + b.training_load_score * 0.15
            + b.fatigue_score * 0.10
        )
        assert b.weighted_total == pytest.approx(round(expected, 1), abs=0.15)

    def test_injury_history_raises_risk(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(30)]
        bio = summarize_biomechanics(frames, total_sampled=30)
        anomalies = detect_anomalies(frames)
        risk_no_history = compute_risk_assessment(bio, anomalies)
        risk_with_history = compute_risk_assessment(
            bio, anomalies, injury_history=["ACL tear"], months_since_last_injury=2
        )
        assert risk_with_history.breakdown.historical_injury_factors_score > risk_no_history.breakdown.historical_injury_factors_score

    def test_six_injury_categories_present(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(30)]
        bio = summarize_biomechanics(frames, total_sampled=30)
        anomalies = detect_anomalies(frames)
        risk = compute_risk_assessment(bio, anomalies)
        names = {t.injury_type for t in risk.injury_type_risks}
        assert names == {
            "ACL Injury Risk", "Hamstring Injury Risk", "Ankle Sprain Risk",
            "Shoulder Injury Risk", "Lower Back Injury Risk", "Overuse Injury Risk",
        }


class TestRecommendationEngine:
    def test_recommendations_never_empty(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(30)]
        bio = summarize_biomechanics(frames, total_sampled=30)
        anomalies = detect_anomalies(frames)
        risk = compute_risk_assessment(bio, anomalies)
        recs = build_recommendations(bio, risk, anomalies)
        assert len(recs.exercises) >= 1
        assert len(recs.recovery_plan) >= 1

    def test_high_risk_triggers_physio_referral(self):
        frames = [compute_frame_biomechanics(make_standing_pose(i, i * 0.1)) for i in range(30)]
        bio = summarize_biomechanics(frames, total_sampled=30)
        anomalies = detect_anomalies(frames)
        risk = compute_risk_assessment(
            bio, anomalies, injury_history=["ACL tear", "Hamstring strain"],
            months_since_last_injury=1, acute_chronic_ratio=2.0,
        )
        recs = build_recommendations(bio, risk, anomalies)
        if risk.risk_category.value in ("High Risk", "Critical Risk"):
            titles = [r.title for r in recs.recovery_plan]
            assert any("physiotherapist" in t.lower() or "sports medicine" in t.lower() for t in titles)


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
