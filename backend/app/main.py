"""
Sports Injury Risk Detection — FastAPI entrypoint (Milestone 1)

No AI/inference code lives here. This app only exposes:
  - JWT authentication (register/login/logout)
  - User, Athlete, Video, Prediction CRUD scaffolding
  - Auto-generated OpenAPI docs at /docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import engine
from app.db.base import Base
from app import models  # noqa: F401  (ensures all models are registered on Base)

from app.routers import auth, users, athletes, videos, predictions

# Uncomment once your MySQL DB + credentials are ready.
# In a real project, prefer Alembic migrations over create_all().
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Foundation API for AI-based sports injury risk detection from video.",
    version="0.1.0-milestone1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(athletes.router)
app.include_router(videos.router)
app.include_router(predictions.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "milestone": "1 — foundation only, no AI inference yet",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
