# Sports Injury Risk Detection — AI/CV Core

This is the **AI/CV core service** of the Sports Injury Risk Detection
platform: the part that actually takes a video and produces pose data,
biomechanics, an injury risk score, and recommendations. It's the first
increment of the larger platform described in the project brief — see
"Scope & honesty" below for what this does and doesn't include yet.

## What's implemented (and verified working)

| Spec module | Status |
|---|---|
| 3. Video Upload & Processing Engine | ✅ format/size/duration/resolution validation, frame extraction, CLAHE-based motion/contrast enhancement |
| 4. Pose Estimation Engine | ✅ MediaPipe Pose (33 keypoints), skeleton generation, annotated video export |
| 5. Biomechanical Analysis Engine | ✅ joint angles, knee valgus, trunk lean, hip drop, symmetry, balance, landing softness |
| 6. Injury Risk Prediction Engine | ✅ per-category risk (ACL, hamstring, ankle, shoulder, lower back, overuse) |
| 7. Movement Anomaly Detection Engine | ✅ z-score based deviation flags, fatigue-trend detection |
| 8. Risk Scoring Engine | ✅ exact weighted formula from the spec (35/20/20/15/10) |
| 9. Corrective Recommendation Engine | ✅ exercises, mobility, strengthening, recovery plan, training mods |

This was tested against a real video (people walking, OpenCV's public
`vtest.avi` sample) through the actual HTTP API, not just unit tests —
pose detection, skeleton overlay, and the full JSON response were all
verified by hand. See `tests/smoke_test.py` and `tests/test_core_logic.py`
(18 passing unit tests).

## Scope & honesty — please read before assuming more than this does

The full platform brief describes ~40 pages of scope: 5 role-based
dashboards, auth, athlete profile management, PostgreSQL/MongoDB/Redis/
Celery infra, PDF/Excel report generation, notifications, admin panels,
wearable integrations, and more. **None of that is in this increment** —
this is deliberately just the AI core, built properly, so it's something
real to build the rest on top of. Two things worth knowing as you extend it:

1. **The injury-risk score is a transparent, rule-based index — not a
   clinically validated ML prediction.** There is no public, pretrained
   model that maps pose video to a calibrated "23% ACL injury probability."
   Real models like that are built by sports-science labs on proprietary
   cohorts with confirmed injury outcomes and force-plate data — that's a
   multi-year research effort, not something available to `pip install`.
   What's here implements the **exact weighted formula given in the
   brief** (Biomechanical Deviations 35% + Historical Factors 20% +
   Asymmetry 20% + Training Load 15% + Fatigue 10%) using real measured
   biomechanics (knee valgus, symmetry, trunk lean, etc.), grounded in
   published sports-medicine risk indicators. It's genuinely useful as a
   biomechanics-based screening signal — just don't present it to end
   users as a clinical diagnosis.

2. **`mediapipe` is deliberately pinned to `0.10.14`.** Versions 0.10.30+
   removed the legacy `mp.solutions.pose` API (which ships its model
   weights inside the pip wheel) in favor of a Tasks API that requires
   downloading a separate `.task` model bundle from Google Cloud Storage
   the first time it runs. That download silently fails in offline,
   air-gapped, or network-restricted environments — including the sandbox
   this was built in, which is how this was caught. If you ever upgrade
   mediapipe, switch `app/core/pose_estimator.py` to the Tasks API and
   vendor the model file into your Docker image; don't assume it'll "just
   work" the way `mp.solutions.pose` did.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

Swagger UI: `http://localhost:8000/docs`

## Try it

```bash
curl -X POST http://localhost:8000/api/v1/videos/analyze \
  -F "file=@your_video.mp4" \
  -F "activity_type=running" \
  -F "injury_history=Hamstring strain" \
  -F "months_since_last_injury=4" \
  -F "export_annotated_video=true"
```

Returns a full `AnalysisResult` JSON (pose detection rate, biomechanics
summary, anomalies, risk breakdown, per-injury-type risk, recommendations).
Fetch the skeleton-overlay annotated video with:

```
GET /api/v1/videos/analyze/{analysis_id}/annotated
```

## Tests

```bash
pytest tests/test_core_logic.py -v      # 18 unit tests, no video needed
python tests/smoke_test.py your_video.mp4   # full pipeline smoke test
```

## Project layout

```
app/
  core/
    video_processor.py       # validation, frame extraction, enhancement
    pose_estimator.py        # MediaPipe wrapper, skeleton drawing
    biomechanics.py          # joint angles, valgus, symmetry, balance
    anomaly_detector.py      # z-score deviation + fatigue trend detection
    risk_engine.py           # weighted risk scoring (spec formula)
    recommendation_engine.py # exercise/mobility/recovery recommendations
    pipeline.py               # orchestrates the full flow
  models/schemas.py           # all Pydantic response models
  api/routes.py                # FastAPI endpoints
  main.py                       # FastAPI app
tests/
  test_core_logic.py           # pytest unit tests (pure logic, fast)
  smoke_test.py                 # manual end-to-end pipeline test
```

## What's been added since the roadmap below

The four "next increment" items below are now mostly built:

1. **Auth + athlete profile management** ✅ — JWT auth (`app/auth/`), RBAC
   via `app/auth/dependencies.py`, and an `Athlete` roster table
   (`app/db/models.py`) managed by coaches/physios (`app/api/athlete_routes.py`).
2. **One polished dashboard** ✅ — React + Vite + Tailwind frontend calling
   this API, rendering the full risk breakdown, charts, and annotated video.
3. **PDF report export** ✅ — `app/core/report_generator.py` (summary +
   detailed variants), served from `/videos/analyze/{id}/report/*.pdf`.
4. **Async processing via Celery + Redis** — not done. Analysis still runs
   synchronously inside the request; a long clip will hold the HTTP
   connection open for the duration of the pipeline. This is the most
   important remaining gap if you expect longer videos or concurrent load.

New modules added on top of the original pipeline:

```
app/
  db/models.py            # + Athlete, AnalysisHistory, ChatMessage tables
  api/
    athlete_routes.py      # coach/physio athlete CRUD (RBAC + ownership-scoped)
    history_routes.py      # role-scoped analysis history, search/filter/paginate,
                            # + /history/dashboard/stats
    chat_routes.py          # per-report "Ask AI" conversation (Anthropic-backed)
  core/
    report_generator.py    # PDF report rendering (reportlab)
    ai_assistant.py         # builds the report-grounded system prompt + calls
                             # the Anthropic Messages API
```

Two honest scope notes on the history/chat features:
- Every upload writes a permanent `analysis_history` row automatically, but
  it's a queryable *summary* of the analysis (risk scores, paths, etc) —
  the full nested result (per-frame biomechanics, all joint angles) still
  lives in `storage/results/{id}.json`, unchanged. `keypoints_json_path`
  points there.
- "Ask AI" requires `ANTHROPIC_API_KEY` in the environment (see
  `.env.example`). Without it, the chat endpoints return a clear 503
  rather than failing silently or faking a response.

## What a sensible next increment looked like

Rather than trying to bolt on all 40 pages of the brief at once (which
produces shallow, buggy code everywhere), the natural next steps in order:

1. **Auth + athlete profile management** (FastAPI + PostgreSQL + JWT) so
   analyses can be tied to a real athlete record and injury history feeds
   in automatically instead of being passed as form fields.
2. **One polished dashboard** (React + Vite + Tailwind) that calls this
   API and renders the risk breakdown, charts, and annotated video —
   proving the frontend/backend contract before building 4 more dashboards.
3. **PDF/Excel report export** from the `AnalysisResult` JSON.
4. **Async processing via Celery + Redis** so video analysis doesn't block
   the HTTP request for longer clips.

Happy to build any of these next.
