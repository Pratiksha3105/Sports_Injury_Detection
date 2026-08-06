# Sports Injury Risk Detection

An end-to-end platform that takes a video of an athlete's movement (running,
jumping, landing, cutting, etc.), runs it through a pose-estimation and
biomechanics pipeline, and returns a structured injury-risk assessment with
corrective recommendations — visualized in a live dashboard.

**Kinetic** (the frontend's working name) uploads a clip, the **AI core**
backend runs pose estimation → biomechanical analysis → anomaly detection →
weighted risk scoring → recommendations, and the dashboard renders a risk
gauge, per-joint readouts, an injury-type breakdown, an anomaly/fatigue
timeline, and a skeleton-overlaid annotated video.

> **Honest scope note:** the injury-risk score is a transparent, weighted
> rule-based formula (Biomechanical Deviations 35% + Historical Factors 20%
> + Movement Asymmetry 20% + Training Load 15% + Fatigue 10%) built on real
> measured biomechanics (knee valgus, symmetry, trunk lean, etc.), grounded
> in published sports-medicine risk indicators — **not** a clinically
> validated ML prediction. See `backend/README.md` for the full detail on
> what's implemented vs. out of scope.

---

## Repository structure

```
Sports-Injury-Risk-Detection/
│
├── frontend/                 React 19 + TypeScript + Vite dashboard
├── backend/                  FastAPI service: HTTP API + AI/CV pipeline
│   ├── app/
│   │   ├── api/               Routes (upload, fetch result, fetch annotated video)
│   │   ├── core/               Pose estimation, biomechanics, anomaly detection,
│   │   │                       risk scoring, recommendations, video processing
│   │   ├── models/             Pydantic schemas (shared contract with the frontend)
│   │   └── main.py             FastAPI app entrypoint
│   ├── storage/                 Runtime uploads / results / annotated videos
│   ├── tests/                    18 unit tests + a smoke test
│   └── requirements.txt
├── models/                    Placeholder for future trained model artifacts
├── outputs/                   Static sample AI output (JSON + annotated video)
│   ├── annotated_videos/
│   └── analysis_results/
├── docs/
│   └── ARCHITECTURE.md         Request flow + structural decisions
├── docker-compose.yml
├── .env.example
├── start_project.sh            One-command local startup (Linux/macOS)
└── start_project.bat            One-command local startup (Windows)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the request flow and
why the AI pipeline lives inside `backend/app/core/` rather than a separate
top-level service (short version: it's called in-process by the API, not
deployed separately — see that doc for the full reasoning).

---

## Prerequisites

- **Python 3.11+** (backend uses `mediapipe==0.10.14`, which supports
  Python 3.9–3.12; the pinned version matters — see
  `backend/requirements.txt` for why)
- **Node.js 20+** and npm (frontend uses Vite 8 / React 19)
- **Docker + Docker Compose** (optional — only if you want containerized
  startup instead of running both services natively)

---

## Quick start

### Option A — one-command scripts (recommended for local dev)

These create Python/Node environments, install dependencies, copy `.env`
files, and start both services.

**Linux / macOS:**
```bash
./start_project.sh
```

**Windows:**
```bat
start_project.bat
```

This starts:
- Backend on **http://localhost:8000** (interactive API docs at `/docs`)
- Frontend on **http://localhost:5173**

Stop with `Ctrl+C` (the `.sh` script) or by closing the two opened terminal
windows (the `.bat` script).

### Option B — Docker Compose

```bash
docker compose up --build
```

This starts:
- Backend on **http://localhost:8000**
- Frontend (built + served via nginx) on **http://localhost:5173**

Uploaded videos, analysis results, and annotated videos persist across
restarts in named Docker volumes (`backend_uploads`, `backend_results`,
`backend_annotated`).

To point the frontend at a different backend URL when building the image:
```bash
VITE_API_BASE_URL=https://your-api.example.com docker compose up --build
```

### Option C — manual setup

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend** (in a second terminal):
```bash
cd frontend
npm install
cp .env.example .env            # set VITE_API_BASE_URL if backend isn't on :8000
npm run dev
```

Then open **http://localhost:5173**.

---

## Verifying it works out of the box

A sample analysis (`analysis_id = 97ca45e8-9e5f-435a-a237-d3ffdac9271b`) is
pre-seeded into `backend/storage/results/` and `backend/storage/annotated/`,
so you can confirm the backend is serving real data immediately, without
uploading a video or waiting on `mediapipe` inference:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/videos/analyze/97ca45e8-9e5f-435a-a237-d3ffdac9271b
```

Static reference copies of the same two files also live at
`outputs/analysis_results/sample_analysis_result.json` and
`outputs/annotated_videos/sample_annotated_video.mp4` — see
`outputs/README.md`.

To exercise the full pipeline end to end, use the dashboard at
`http://localhost:5173` to upload a real video (mp4/mov/avi/mkv/webm,
0.5s–5min, min resolution 128×128, max 500MB), or POST directly to
`/api/v1/videos/analyze` (see the interactive docs at
`http://localhost:8000/docs`).

---

## Environment variables

See `.env.example` at the repo root (and `backend/.env.example`,
`frontend/.env.example` for per-service copies).

| Variable | Where used | Default | Purpose |
|---|---|---|---|
| `HOST` | backend | `0.0.0.0` | Interface the FastAPI server binds to |
| `PORT` | backend | `8000` | Port the FastAPI server binds to |
| `ALLOWED_ORIGINS` | backend | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated CORS allow-list. **Set this to your real frontend origin(s) in production** — don't leave it wide open. |
| `VITE_API_BASE_URL` | frontend | `http://localhost:8000` | Base URL the frontend uses to call the backend API. Baked in at build time for Vite, so rebuild after changing it in production. |

---

## API reference

Full interactive docs (Swagger UI) are auto-generated by FastAPI at
`http://localhost:8000/docs` once the backend is running. Summary:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `POST` | `/api/v1/videos/analyze` | Upload a video (+ optional athlete context) and run the full pipeline synchronously |
| `GET` | `/api/v1/videos/analyze/{analysis_id}` | Fetch a previously computed result by id |
| `GET` | `/api/v1/videos/analyze/{analysis_id}/annotated` | Fetch the skeleton-annotated MP4 for a result (only present if `export_annotated_video=true` was sent) |

---

## Testing

```bash
cd backend
source venv/bin/activate
pip install pytest
pytest tests/
```

18 unit tests cover the biomechanics, anomaly detection, and risk-scoring
logic directly; `tests/smoke_test.py` exercises the pipeline against a
real sample video end to end.

---

## Production deployment notes

- **CORS**: set `ALLOWED_ORIGINS` to your actual frontend domain(s) — the
  default is scoped to local dev ports only.
- **Storage**: `backend/storage/{uploads,results,annotated}/` is local
  disk by default. For multi-instance deployments, point these at shared
  object storage (S3-compatible) instead — the write paths are centralized
  in `backend/app/api/routes.py`.
- **Long videos**: the pipeline currently runs synchronously inside the
  HTTP request (`POST /api/v1/videos/analyze`), capped at 5 minutes of
  video (`MAX_DURATION_SEC` in `backend/app/core/video_processor.py`). For
  longer clips or higher throughput, move `run_analysis()` behind a job
  queue (Celery/RQ) and poll `GET /api/v1/videos/analyze/{id}` for
  completion — the schema already supports this pattern.
- **`mediapipe` version pin**: deliberately pinned to `0.10.14` in
  `backend/requirements.txt` — do not upgrade without reading the comment
  above it (later versions require downloading model weights from GCS at
  first run, which breaks offline/air-gapped deployments).
- **Frontend env vars**: Vite bakes `VITE_API_BASE_URL` in at build time,
  not runtime — rebuild the frontend image/bundle if the backend URL
  changes.

---

## What's implemented vs. what's next

This is a complete, working increment: video upload/validation, pose
estimation (MediaPipe, 33 keypoints), biomechanical analysis, anomaly/fatigue
detection, weighted risk scoring, corrective recommendations, and a full
dashboard UI — verified against a real video through the actual HTTP API,
not just unit tests.

Not yet included (see `backend/README.md` and `frontend/README.md` for the
full detail): background job processing for long videos, and wearable-device
integrations. The module boundaries here (`api/` / `core/` / `models/` on the
backend, `components/` / `pages/` / `api/` on the frontend) are structured so
each of those can be added incrementally without a rewrite.

---

## Authentication & Role-Based Access Control

Auth is layered on top of the existing app without touching the AI pipeline.

- **Backend**: JWT access tokens (15 min, sent in the response body) +
  refresh tokens (7 days, httpOnly cookie, rotated and revocable via a
  `refresh_tokens` DB table). Passwords are bcrypt-hashed. New tables live in
  `backend/app/db/models.py`; auth endpoints in `backend/app/api/auth_routes.py`
  and `backend/app/api/admin_routes.py`. Every existing `/api/v1/videos/*`
  endpoint now requires a logged-in user (`Depends(get_current_user)`), but
  the pipeline code itself is unchanged.
- **Roles**: `admin`, `coach`, `athlete`, `physiotherapist`. Enforced via
  `require_roles(...)` dependencies on the backend and `<RoleRoute>` guards
  on the frontend. Only `admin` can change roles / deactivate / delete
  accounts (via `/admin/users`, or the User Management page at
  `/admin/users` in the UI).
- **Getting an admin account**: set `ADMIN_BOOTSTRAP_EMAIL` /
  `ADMIN_BOOTSTRAP_PASSWORD` in `backend/.env` before first run — an admin
  account is created automatically on startup if it doesn't already exist.
  (Public registration only allows `coach` / `athlete` / `physiotherapist`.)
- **Database**: SQLite by default at `backend/storage/app.db` (zero setup);
  point `DATABASE_URL` at Postgres/MySQL for production.
- **No email provider wired up**: password-reset and email-verification
  tokens are generated and logged to the backend console instead of being
  emailed (search the logs for "Password reset token for" /
  "Email verification token for"). Swap in a real SMTP/API call in
  `auth_routes.py` without changing the endpoint contracts.
- **Frontend**: `src/auth/` (context, token store, API calls),
  `src/routes/` (route guards), `src/layout/` (role-aware sidebar/navbar),
  `src/pages/auth/` and `src/pages/admin/` for the new screens. The access
  token is kept in memory only (never localStorage), with silent
  refresh-on-401 via the httpOnly cookie so a page reload doesn't force a
  re-login.
