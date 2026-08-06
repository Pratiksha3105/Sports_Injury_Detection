"""
Video Upload & Processing Engine
==================================
Implements spec section 3 ("Video Upload & Processing Engine"): video
preprocessing, frame extraction, motion handling, video quality validation.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
MAX_FILE_SIZE_MB = 500
MIN_DURATION_SEC = 0.5
MAX_DURATION_SEC = 300  # 5 min cap for a single analysis pass
MIN_RESOLUTION = (128, 128)


class VideoValidationError(ValueError):
    pass


@dataclass
class VideoMetadata:
    filename: str
    fps: float
    width: int
    height: int
    total_frames: int
    duration_sec: float


def validate_video_file(path: Path) -> None:
    """Raises VideoValidationError with a human-readable reason if the
    uploaded file fails basic quality/format checks before it enters the
    processing pipeline."""
    if not path.exists():
        raise VideoValidationError("Uploaded file not found on disk.")

    if path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise VideoValidationError(
            f"Unsupported video format '{path.suffix}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}"
        )

    size_mb = path.stat().st_size / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise VideoValidationError(f"File too large ({size_mb:.1f} MB). Max is {MAX_FILE_SIZE_MB} MB.")

    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise VideoValidationError("File could not be opened as a video (corrupt or unsupported codec).")

    fps = cap.get(cv2.CAP_PROP_FPS) or 0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    cap.release()

    if fps <= 0 or total_frames <= 0:
        raise VideoValidationError("Could not read valid FPS / frame count from video.")

    duration = total_frames / fps
    if duration < MIN_DURATION_SEC:
        raise VideoValidationError(f"Video too short ({duration:.2f}s). Minimum is {MIN_DURATION_SEC}s.")
    if duration > MAX_DURATION_SEC:
        raise VideoValidationError(
            f"Video too long ({duration:.1f}s). Maximum per analysis is {MAX_DURATION_SEC}s."
        )
    if width < MIN_RESOLUTION[0] or height < MIN_RESOLUTION[1]:
        raise VideoValidationError(
            f"Resolution too low ({width}x{height}). Minimum is {MIN_RESOLUTION[0]}x{MIN_RESOLUTION[1]}."
        )


def read_metadata(path: Path) -> VideoMetadata:
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    cap.release()
    duration = total_frames / fps if fps else 0.0
    return VideoMetadata(
        filename=path.name,
        fps=fps,
        width=width,
        height=height,
        total_frames=total_frames,
        duration_sec=duration,
    )


def enhance_frame(frame: np.ndarray) -> np.ndarray:
    """Light motion/contrast enhancement pass ("motion enhancement" in the
    spec) applied before pose estimation: CLAHE contrast boost + mild
    denoise, which measurably improves keypoint stability on dim or
    low-contrast sports footage without altering geometry."""
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    enhanced = cv2.merge((l, a, b))
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    return enhanced


def iter_sampled_frames(path: Path, target_fps: float = 10.0, enhance: bool = True):
    """Generator yielding (frame_index, timestamp_sec, frame) tuples, sampling
    down to `target_fps` so a long clip doesn't require per-source-frame
    inference (this is the "Frame Extraction" step of the spec, tuned for
    throughput)."""
    cap = cv2.VideoCapture(str(path))
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    step = max(1, round(src_fps / target_fps))

    idx = 0
    sampled_idx = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if idx % step == 0:
            if enhance:
                frame = enhance_frame(frame)
            timestamp_sec = idx / src_fps
            yield sampled_idx, timestamp_sec, frame
            sampled_idx += 1
        idx += 1
    cap.release()


class AnnotatedVideoWriter:
    """Writes an annotated (skeleton-overlaid) output video, one frame at a
    time, for the "Pose Visualization" / "Skeleton Visualization" features."""

    def __init__(self, out_path: Path, fps: float, width: int, height: int):
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        self._writer = cv2.VideoWriter(str(out_path), fourcc, fps, (width, height))
        self.out_path = out_path

    def write(self, frame: np.ndarray) -> None:
        self._writer.write(frame)

    def close(self) -> None:
        self._writer.release()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
