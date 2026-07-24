# Backend — FastAPI Foundation (Milestone 1)

This is the **project foundation only**. No AI/video-processing logic is implemented
here yet (that is Milestone 2+: MediaPipe pose estimation, LSTM risk classification,
OpenCV frame extraction).

## What's included
- FastAPI app factory with CORS, routers, and a health check
- JWT-based authentication (access tokens, password hashing with bcrypt)
- SQLAlchemy models for Users, Roles, Athletes, Videos, Predictions
- Pydantic v2 schemas for request/response validation
- Placeholder CRUD-style endpoints for auth, users, athletes, videos, predictions

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then edit .env with your MySQL credentials
```

Create the database using the schema in `../database/schema.sql`:

```bash
mysql -u root -p < ../database/schema.sql
```

Run the API:

```bash
uvicorn app.main:app --reload
```

- API root: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Folder structure

```
backend/
  app/
    core/          # settings, JWT/security helpers
    db/             # SQLAlchemy engine, session, declarative base
    models/         # ORM models (one file per table)
    schemas/        # Pydantic request/response models
    routers/        # API route modules, grouped by resource
    utils/          # shared dependencies (get_current_user, role guards)
    main.py         # FastAPI app entrypoint
  requirements.txt
  .env.example
```

## Milestone roadmap for this backend
- **Milestone 1 (this):** project structure, auth scaffolding, schemas, dummy endpoints
- **Milestone 2:** real video upload + storage pipeline, OpenCV frame extraction
- **Milestone 3:** MediaPipe pose landmark extraction
- **Milestone 4:** LSTM-based risk classification model + inference endpoint
- **Milestone 5:** deployment, monitoring, coach/admin analytics dashboards
