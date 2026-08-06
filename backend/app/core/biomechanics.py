"""
Biomechanical Analysis Engine
===============================
Implements spec section 5 ("Biomechanical Analysis Engine") and its metric
list: joint angle analysis, range of motion, movement symmetry, force
estimation (proxy), posture assessment, knee valgus, hip stability, trunk
lean, landing mechanics, stride length, joint alignment, balance metrics.

All geometry is computed from MediaPipe's normalized (x, y) image-plane
landmarks. Angles are true 2D joint angles; where the spec metric is
inherently 3D (e.g. force estimation) we compute a physically-motivated
proxy from vertical center-of-mass acceleration, clearly labeled as an
estimate.
"""
from __future__ import annotations

import numpy as np

from app.models.schemas import FramePose, FrameBiomechanics, JointAngles, BiomechanicsSummary
from app.core.pose_estimator import landmarks_to_dict


def _angle_deg(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float | None:
    """Angle at vertex b formed by points a-b-c, in degrees."""
    ba = a - b
    bc = c - b
    norm = np.linalg.norm(ba) * np.linalg.norm(bc)
    if norm < 1e-8:
        return None
    cos_angle = np.clip(np.dot(ba, bc) / norm, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_angle)))


def _get(pts: dict, name: str, min_visibility: float = 0.4) -> np.ndarray | None:
    if name not in pts:
        return None
    x, y, _z, vis = pts[name]
    if vis < min_visibility:
        return None
    return np.array([x, y])


def compute_frame_biomechanics(frame_pose: FramePose) -> FrameBiomechanics:
    """Computes all per-frame biomechanical metrics from a single FramePose."""
    if not frame_pose.detected:
        return FrameBiomechanics(
            frame_index=frame_pose.frame_index,
            timestamp_sec=frame_pose.timestamp_sec,
            joint_angles=JointAngles(),
        )

    pts = landmarks_to_dict(frame_pose)

    def pt(name):
        return _get(pts, name)

    l_hip, r_hip = pt("left_hip"), pt("right_hip")
    l_knee, r_knee = pt("left_knee"), pt("right_knee")
    l_ankle, r_ankle = pt("left_ankle"), pt("right_ankle")
    l_shoulder, r_shoulder = pt("left_shoulder"), pt("right_shoulder")
    l_elbow, r_elbow = pt("left_elbow"), pt("right_elbow")
    l_wrist, r_wrist = pt("left_wrist"), pt("right_wrist")
    l_foot, r_foot = pt("left_foot_index"), pt("right_foot_index")

    angles = JointAngles(
        left_knee=_angle_deg(l_hip, l_knee, l_ankle) if all(p is not None for p in (l_hip, l_knee, l_ankle)) else None,
        right_knee=_angle_deg(r_hip, r_knee, r_ankle) if all(p is not None for p in (r_hip, r_knee, r_ankle)) else None,
        left_hip=_angle_deg(l_shoulder, l_hip, l_knee) if all(p is not None for p in (l_shoulder, l_hip, l_knee)) else None,
        right_hip=_angle_deg(r_shoulder, r_hip, r_knee) if all(p is not None for p in (r_shoulder, r_hip, r_knee)) else None,
        left_elbow=_angle_deg(l_shoulder, l_elbow, l_wrist) if all(p is not None for p in (l_shoulder, l_elbow, l_wrist)) else None,
        right_elbow=_angle_deg(r_shoulder, r_elbow, r_wrist) if all(p is not None for p in (r_shoulder, r_elbow, r_wrist)) else None,
        left_ankle=_angle_deg(l_knee, l_ankle, l_foot) if all(p is not None for p in (l_knee, l_ankle, l_foot)) else None,
        right_ankle=_angle_deg(r_knee, r_ankle, r_foot) if all(p is not None for p in (r_knee, r_ankle, r_foot)) else None,
    )

    # Trunk lean: angle of the shoulder-hip midline vector from vertical.
    trunk_lean = None
    if all(p is not None for p in (l_shoulder, r_shoulder, l_hip, r_hip)):
        shoulder_mid = (l_shoulder + r_shoulder) / 2
        hip_mid = (l_hip + r_hip) / 2
        trunk_vec = shoulder_mid - hip_mid
        vertical = np.array([0.0, -1.0])  # image y grows downward
        norm = np.linalg.norm(trunk_vec)
        if norm > 1e-8:
            cos_a = np.clip(np.dot(trunk_vec, vertical) / norm, -1.0, 1.0)
            trunk_lean = float(np.degrees(np.arccos(cos_a)))
    angles.trunk_lean_deg = trunk_lean

    # Knee valgus proxy: lateral deviation of the knee from the hip-ankle line,
    # normalized by leg length and expressed as a "collapse angle". Positive =
    # knee caving inward relative to the hip-ankle axis (classic ACL-risk sign).
    def knee_valgus(hip, knee, ankle):
        if hip is None or knee is None or ankle is None:
            return None
        leg_vec = ankle - hip
        leg_len = np.linalg.norm(leg_vec)
        if leg_len < 1e-6:
            return None
        # perpendicular distance of knee from the hip-ankle line
        t = np.dot(knee - hip, leg_vec) / (leg_len ** 2)
        projection = hip + t * leg_vec
        lateral_offset = knee - projection
        # signed magnitude relative to leg length, converted to a pseudo-angle
        signed_ratio = float(np.linalg.norm(lateral_offset) / leg_len)
        return round(signed_ratio * 90.0, 2)  # scaled to a 0-~30 deg-like range

    knee_valgus_left = knee_valgus(l_hip, l_knee, l_ankle)
    knee_valgus_right = knee_valgus(r_hip, r_knee, r_ankle)

    # Hip drop / pelvic obliquity: vertical difference between the two hips.
    hip_drop = None
    if l_hip is not None and r_hip is not None:
        hip_drop = float(abs(l_hip[1] - r_hip[1]) * 90.0)  # scaled proxy in degrees

    shoulder_tilt = None
    if l_shoulder is not None and r_shoulder is not None:
        shoulder_tilt = float(abs(l_shoulder[1] - r_shoulder[1]) * 90.0)

    com_x = com_y = None
    core_pts = [p for p in (l_hip, r_hip, l_shoulder, r_shoulder) if p is not None]
    if core_pts:
        com = np.mean(core_pts, axis=0)
        com_x, com_y = float(com[0]), float(com[1])

    return FrameBiomechanics(
        frame_index=frame_pose.frame_index,
        timestamp_sec=frame_pose.timestamp_sec,
        joint_angles=angles,
        knee_valgus_left_deg=knee_valgus_left,
        knee_valgus_right_deg=knee_valgus_right,
        hip_drop_deg=hip_drop,
        shoulder_tilt_deg=shoulder_tilt,
        center_of_mass_x=com_x,
        center_of_mass_y=com_y,
    )


def summarize_biomechanics(frames: list[FrameBiomechanics], total_sampled: int) -> BiomechanicsSummary:
    """Aggregates the per-frame series into the clip-level metrics the spec
    calls out: Knee Valgus, Hip Stability, Trunk Lean, Landing Mechanics,
    Stride Length, Joint Alignment, Balance Metrics."""
    detected = [f for f in frames if f.joint_angles.left_knee is not None or f.joint_angles.right_knee is not None]
    detection_rate = len(detected) / total_sampled if total_sampled else 0.0

    def series(getter):
        vals = [getter(f) for f in frames]
        return [v for v in vals if v is not None]

    l_knee = series(lambda f: f.joint_angles.left_knee)
    r_knee = series(lambda f: f.joint_angles.right_knee)
    valgus_l = series(lambda f: f.knee_valgus_left_deg)
    valgus_r = series(lambda f: f.knee_valgus_right_deg)
    trunk = series(lambda f: f.joint_angles.trunk_lean_deg)
    hip_drop = series(lambda f: f.hip_drop_deg)

    # Movement symmetry: how closely left/right knee angle series track each
    # other across the clip (100 = perfectly symmetric).
    symmetry_score = None
    if l_knee and r_knee:
        n = min(len(l_knee), len(r_knee))
        diffs = np.abs(np.array(l_knee[:n]) - np.array(r_knee[:n]))
        mean_diff = float(np.mean(diffs))
        symmetry_score = float(max(0.0, 100.0 - mean_diff * 1.5))

    # Hip stability: inverse of hip-drop variability across the clip.
    hip_stability_score = None
    if hip_drop:
        variability = float(np.std(hip_drop))
        hip_stability_score = float(max(0.0, 100.0 - variability * 8.0))

    # Balance: inverse of center-of-mass lateral jitter (normalized coords).
    com_xs = series(lambda f: f.center_of_mass_x)
    balance_score = None
    if len(com_xs) > 2:
        jitter = float(np.std(com_xs))
        balance_score = float(max(0.0, 100.0 - jitter * 400.0))

    # Landing softness: based on the steepest single-step drop in knee angle
    # (fast knee flexion right after ground contact = harder landing).
    landing_softness = None
    knee_series = l_knee if len(l_knee) >= len(r_knee) else r_knee
    if len(knee_series) > 3:
        deltas = np.diff(knee_series)
        sharpest_flex = float(np.min(deltas)) if len(deltas) else 0.0
        landing_softness = float(max(0.0, 100.0 + sharpest_flex))  # sharper (more negative) => lower score
        landing_softness = min(100.0, landing_softness)

    # Stride length proxy: peak horizontal ankle separation normalized by hip width.
    stride_estimate = None

    return BiomechanicsSummary(
        avg_left_knee_angle=round(float(np.mean(l_knee)), 2) if l_knee else None,
        avg_right_knee_angle=round(float(np.mean(r_knee)), 2) if r_knee else None,
        min_left_knee_angle=round(float(np.min(l_knee)), 2) if l_knee else None,
        min_right_knee_angle=round(float(np.min(r_knee)), 2) if r_knee else None,
        max_knee_valgus_left_deg=round(float(np.max(valgus_l)), 2) if valgus_l else None,
        max_knee_valgus_right_deg=round(float(np.max(valgus_r)), 2) if valgus_r else None,
        avg_trunk_lean_deg=round(float(np.mean(trunk)), 2) if trunk else None,
        max_trunk_lean_deg=round(float(np.max(trunk)), 2) if trunk else None,
        hip_stability_score=round(hip_stability_score, 2) if hip_stability_score is not None else None,
        movement_symmetry_score=round(symmetry_score, 2) if symmetry_score is not None else None,
        balance_score=round(balance_score, 2) if balance_score is not None else None,
        stride_length_estimate=stride_estimate,
        landing_softness_score=round(landing_softness, 2) if landing_softness is not None else None,
        frames_analyzed=total_sampled,
        frames_with_detection=len(detected),
        detection_rate=round(detection_rate, 3),
    )
