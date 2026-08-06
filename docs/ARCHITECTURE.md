# Architecture

## Repository layout

```
Sports-Injury-Risk-Detection/
├── frontend/                  React 19 + Vite + TypeScript SPA
├── backend/                   FastAPI service — API layer + AI/CV pipeline
│   ├── app/
│   │   ├── api/routes.py      HTTP endpoints (upload, fetch result, fetch annotated video)
│   │   ├── core/               AI/CV pipeline modules (see below)
│   │   ├── models/schemas.py  Pydantic request/response models
│   │   └── main.py             FastAPI app, CORS, router mounting
│   ├── storage/                 Runtime data: uploads / results / annotated videos
│   ├── sample_data/
│   ├── tests/
│   └── requirements.txt
├── models/                    Placeholder for trained ML model artifacts (see models/README.md)
├── outputs/                   Static reference copies of a sample analysis (JSON + annotated video)
│   ├── annotated_videos/
│   └── analysis_results/
├── docs/
├── README.md
├── docker-compose.yml
├── .env.example
├── start_project.sh
└── start_project.bat
```

## Why there's no separate top-level `ai/` folder

The AI/CV pipeline (pose estimation → biomechanics → anomaly detection →
risk scoring → recommendations) is not a standalone service — it's a set of
Python modules called directly, in-process, by the FastAPI backend
(`backend/app/core/pipeline.py`, invoked from `backend/app/api/routes.py`).
There's no network boundary, message queue, or separate deployment between
"the API" and "the AI": one process, one set of dependencies
(`backend/requirements.txt`), one `uvicorn` command.

Splitting `app/core/` out into a sibling top-level `ai/` package would mean:

- Turning simple in-process function calls into a cross-package import or a
  fake internal API, adding latency and failure modes for no real benefit.
- Duplicating or awkwardly sharing the Pydantic schemas that both the API
  layer and the pipeline modules use interchangeably.
- Risking breakage of the pipeline's existing test suite
  (`backend/tests/`, 18 unit tests + a smoke test per `backend/README.md`)
  for a cosmetic folder-structure change.

So the AI core lives at `backend/app/core/` — still clearly separated from
the HTTP layer (`backend/app/api/`) and the data models
(`backend/app/models/`), just inside the one service that actually runs it.
If the AI pipeline ever needs to scale independently (e.g. behind a job
queue for long videos), extracting `backend/app/core/` into its own service
is a clean, incremental next step — the module boundary is already there.

## Request flow

1. **Frontend** (`frontend/src/pages/Dashboard.tsx` → `frontend/src/api/client.ts`)
   posts a video as `multipart/form-data` to
   `POST {VITE_API_BASE_URL}/api/v1/videos/analyze`.
2. **Backend** (`backend/app/api/routes.py`) saves the upload to
   `backend/storage/uploads/`, then calls `run_analysis()`
   (`backend/app/core/pipeline.py`), which runs, in order:
   `video_processor` (validate + sample frames) →
   `pose_estimator` (MediaPipe Pose) →
   `biomechanics` (joint angles, valgus, symmetry, etc.) →
   `anomaly_detector` (z-score deviation + fatigue trend) →
   `risk_engine` (weighted 35/20/20/15/10 formula) →
   `recommendation_engine` (exercises, mobility, recovery plan).
3. The result is validated against `AnalysisResult`
   (`backend/app/models/schemas.py`), written to
   `backend/storage/results/{analysis_id}.json`, and returned to the
   frontend, which renders it across `RiskGauge`, `JointAngleChart`,
   `InjuryRiskBreakdown`, `AnomalyTimeline`, and `RecommendationsPanel`.
4. If `export_annotated_video=true` was sent, a skeleton-overlaid MP4 is
   also written to `backend/storage/annotated/{analysis_id}.mp4` and served
   back via `GET /api/v1/videos/analyze/{analysis_id}/annotated`.

## Type safety across the boundary

`frontend/src/types/schema.ts` is a hand-maintained, field-for-field mirror
of `backend/app/models/schemas.py`. There's no shared codegen step yet —
if you change one, update the other. This is a good candidate for an
`openapi-typescript` codegen step in a follow-up (FastAPI already exposes
the schema at `/openapi.json`).
