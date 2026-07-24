# Future Milestones

This repository intentionally stops short of any AI/video-processing logic.
Below is the planned roadmap for subsequent milestones.

## Milestone 2 — Video Processing Pipeline
- Real multipart video upload to disk/object storage
- OpenCV-based frame extraction at a fixed sampling rate
- Video metadata extraction (duration, resolution, fps)
- Background job queue (e.g. Celery + Redis) for async processing

## Milestone 3 — Pose Estimation
- MediaPipe Pose integration on extracted frames
- Landmark sequence storage (33 keypoints × x, y, z, visibility)
- Joint angle calculation utilities (knee flexion, hip rotation, etc.)

## Milestone 4 — Risk Classification Model
- Dataset labeling strategy for "risky" vs "safe" movement sequences
- LSTM (or Temporal CNN) trained on landmark sequences
- Model versioning and the `/predictions` endpoint wired to real inference
- Risk score + flagged body part returned to the frontend

## Milestone 5 — Deployment & Analytics
- Containerization (Docker) for frontend, backend, and MySQL
- CI/CD pipeline (GitHub Actions)
- Coach/Admin analytics dashboards across multiple athletes
- Monitoring, logging, and basic rate limiting
- Optional: mobile-friendly PWA packaging
