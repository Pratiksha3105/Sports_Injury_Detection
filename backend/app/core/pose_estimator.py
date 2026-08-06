"""
Pose Estimation Engine
=======================
Implements spec section 4 ("Pose Estimation Engine"): human pose detection,
joint tracking, skeleton generation, keypoint extraction.

Uses MediaPipe Pose (BlazePose GHUM, 33 landmarks). We deliberately pin
mediapipe==0.10.14, the last release line that ships the legacy
`mp.solutions.pose` API with model weights bundled directly inside the pip
wheel. Newer mediapipe releases (0.10.30+) removed that API in favor of the
Tasks API, which requires downloading a separate *.task model bundle from
Google Cloud Storage at runtime -- that download will silently fail in any
network-restricted environment (offline server, locked-down CI, air-gapped
deployment, etc). Pinning to 0.10.14 keeps pose estimation fully self
contained: `pip install` is the only setup step, ever.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import cv2
import numpy as np

import mediapipe as mp

from app.models.schemas import FramePose, Landmark

logger = logging.getLogger(__name__)

_mp_pose = mp.solutions.pose

# MediaPipe BlazePose 33-landmark topology, in index order.
POSE_LANDMARK_NAMES = [lm.name.lower() for lm in _mp_pose.PoseLandmark]

# Convenience index lookup, e.g. LMK["left_knee"] -> 25
LMK = {name: idx for idx, name in enumerate(POSE_LANDMARK_NAMES)}


@dataclass
class PoseEstimatorConfig:
    static_image_mode: bool = False
    model_complexity: int = 1          # 0=lite, 1=full (both bundled offline). 2=heavy requires download.
    min_detection_confidence: float = 0.5
    min_tracking_confidence: float = 0.5
    smooth_landmarks: bool = True


class PoseEstimator:
    """Thin, resource-managed wrapper around mediapipe.solutions.pose.

    Usage:
        with PoseEstimator() as estimator:
            frame_pose = estimator.process_frame(bgr_frame, frame_index, timestamp_sec)
    """

    def __init__(self, config: PoseEstimatorConfig | None = None):
        self.config = config or PoseEstimatorConfig()
        self._pose = _mp_pose.Pose(
            static_image_mode=self.config.static_image_mode,
            model_complexity=self.config.model_complexity,
            min_detection_confidence=self.config.min_detection_confidence,
            min_tracking_confidence=self.config.min_tracking_confidence,
            smooth_landmarks=self.config.smooth_landmarks,
        )

    def __enter__(self) -> "PoseEstimator":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def close(self) -> None:
        self._pose.close()

    def process_frame(self, bgr_frame: np.ndarray, frame_index: int, timestamp_sec: float) -> FramePose:
        """Runs pose detection on a single BGR frame (as read by cv2.VideoCapture)."""
        rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
        rgb.flags.writeable = False
        results = self._pose.process(rgb)

        if not results.pose_landmarks:
            return FramePose(
                frame_index=frame_index,
                timestamp_sec=timestamp_sec,
                detected=False,
                landmarks=[],
            )

        landmarks = [
            Landmark(
                name=POSE_LANDMARK_NAMES[i],
                x=lm.x,
                y=lm.y,
                z=lm.z,
                visibility=lm.visibility,
            )
            for i, lm in enumerate(results.pose_landmarks.landmark)
        ]
        return FramePose(
            frame_index=frame_index,
            timestamp_sec=timestamp_sec,
            detected=True,
            landmarks=landmarks,
        )

    @staticmethod
    def draw_skeleton(bgr_frame: np.ndarray, frame_pose: FramePose) -> np.ndarray:
        """Renders skeleton overlay onto a copy of the frame for visualization /
        annotated video export ("Pose Visualization", "Skeleton Visualization")."""
        annotated = bgr_frame.copy()
        if not frame_pose.detected:
            return annotated

        h, w = annotated.shape[:2]
        pts = {lm.name: (int(lm.x * w), int(lm.y * h)) for lm in frame_pose.landmarks}

        connections = _mp_pose.POSE_CONNECTIONS
        for a_idx, b_idx in connections:
            a_name = POSE_LANDMARK_NAMES[a_idx]
            b_name = POSE_LANDMARK_NAMES[b_idx]
            if a_name in pts and b_name in pts:
                cv2.line(annotated, pts[a_name], pts[b_name], (0, 220, 130), 2, cv2.LINE_AA)

        for name, (x, y) in pts.items():
            cv2.circle(annotated, (x, y), 3, (30, 130, 255), -1, cv2.LINE_AA)

        return annotated


def landmarks_to_dict(frame_pose: FramePose) -> dict[str, tuple[float, float, float, float]]:
    """Convenience: {landmark_name: (x, y, z, visibility)} for the biomechanics engine."""
    return {lm.name: (lm.x, lm.y, lm.z, lm.visibility) for lm in frame_pose.landmarks}
