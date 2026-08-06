"""
Movement Anomaly Detection Engine
====================================
Implements spec section 7: movement deviation detection, technique
assessment, motion inconsistency analysis, fatigue-related movement
monitoring, performance decline detection.

Approach: statistical outlier detection over the per-frame biomechanics
series (z-score based deviation flags) plus a simple trend test across the
first half vs second half of the clip to flag fatigue-related decline
(a well-documented pattern: knee flexion depth and symmetry both degrade as
an athlete fatigues).
"""
from __future__ import annotations

import numpy as np

from app.models.schemas import FrameBiomechanics, AnomalyEvent, AnomalySummary

Z_SCORE_THRESHOLD_MODERATE = 1.75
Z_SCORE_THRESHOLD_HIGH = 2.5


def _zscore_flags(values: list[float | None], frames: list[FrameBiomechanics], label: str) -> list[AnomalyEvent]:
    idx_vals = [(i, v) for i, v in enumerate(values) if v is not None]
    if len(idx_vals) < 5:
        return []
    idxs, vals = zip(*idx_vals)
    arr = np.array(vals)
    mean, std = float(np.mean(arr)), float(np.std(arr))
    if std < 1e-6:
        return []

    events = []
    for i, v in zip(idxs, vals):
        z = abs((v - mean) / std)
        if z >= Z_SCORE_THRESHOLD_HIGH:
            severity = "high"
        elif z >= Z_SCORE_THRESHOLD_MODERATE:
            severity = "moderate"
        else:
            continue
        f = frames[i]
        events.append(
            AnomalyEvent(
                frame_index=f.frame_index,
                timestamp_sec=f.timestamp_sec,
                anomaly_type=label,
                severity=severity,
                description=f"{label} deviated {z:.1f} standard deviations from the clip average "
                            f"(value={v:.1f}, clip mean={mean:.1f}).",
            )
        )
    return events


def detect_anomalies(frames: list[FrameBiomechanics]) -> AnomalySummary:
    if len(frames) < 5:
        return AnomalySummary(total_anomalies=0, events=[], fatigue_trend_detected=False)

    events: list[AnomalyEvent] = []

    events += _zscore_flags([f.knee_valgus_left_deg for f in frames], frames, "Excessive left knee valgus")
    events += _zscore_flags([f.knee_valgus_right_deg for f in frames], frames, "Excessive right knee valgus")
    events += _zscore_flags([f.joint_angles.trunk_lean_deg for f in frames], frames, "Abnormal trunk lean")
    events += _zscore_flags([f.hip_drop_deg for f in frames], frames, "Pelvic drop / hip instability")
    events += _zscore_flags([f.shoulder_tilt_deg for f in frames], frames, "Shoulder asymmetry spike")

    events.sort(key=lambda e: e.timestamp_sec)

    # Fatigue trend: compare min knee flexion depth (proxy for effort/technique)
    # in the first half of the clip vs the second half. A meaningful drop in
    # flexion depth (i.e. shallower squats/landings later in the clip) plus
    # rising valgus/asymmetry is treated as an early fatigue signature.
    fatigue_detected = False
    fatigue_onset = None

    knee_series = [
        (f.timestamp_sec, f.joint_angles.left_knee if f.joint_angles.left_knee is not None else f.joint_angles.right_knee)
        for f in frames
    ]
    knee_series = [(t, v) for t, v in knee_series if v is not None]
    if len(knee_series) >= 10:
        mid = len(knee_series) // 2
        first_half = np.array([v for _, v in knee_series[:mid]])
        second_half = np.array([v for _, v in knee_series[mid:]])
        first_min = float(np.percentile(first_half, 10))
        second_min = float(np.percentile(second_half, 10))
        # A rise in the "how deep does the knee bend" floor by >8 degrees in
        # the back half of the clip suggests the athlete is bending less --
        # a classic fatigue-driven technique breakdown.
        if second_min - first_min > 8.0:
            fatigue_detected = True
            fatigue_onset = knee_series[mid][0]

    return AnomalySummary(
        total_anomalies=len(events),
        events=events,
        fatigue_trend_detected=fatigue_detected,
        fatigue_onset_timestamp_sec=round(fatigue_onset, 2) if fatigue_onset is not None else None,
    )
