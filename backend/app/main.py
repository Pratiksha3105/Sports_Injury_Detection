"""
Sports Injury Risk Detection — AI/CV Core Service
====================================================
FastAPI entrypoint for the pose estimation -> biomechanics -> injury risk
scoring pipeline (spec sections 3-9).

Run with:
    uvicorn app.main:app --reload --port 8000

Swagger docs: http://localhost:8000/docs
"""
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin_routes import router as admin_router
from app.api.athlete_routes import router as athlete_router
from app.api.auth_routes import router as auth_router
from app.api.chat_routes import router as chat_router
from app.api.history_routes import router as history_router
from app.api.routes import router as analysis_router
from app.auth.security import hash_password
from app.core.config import settings
from app.db.database import SessionLocal, init_db
from app.db.models import User, UserRole

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sports Injury Risk Detection — AI Core",
    description=(
        "Pose estimation, biomechanical analysis, movement anomaly detection, "
        "and injury risk scoring for athlete movement videos."
    ),
    version="0.1.0",
)

# CORS origins are configurable via the ALLOWED_ORIGINS env var (comma-separated).
# Defaults to the Vite dev server origins if unset. Set to your deployed
# frontend origin(s) in production instead of using "*".
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(athlete_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")


@app.on_event("startup")
def _on_startup() -> None:
    """Create auth tables and (optionally) bootstrap an admin account."""
    init_db()

    if settings.ADMIN_BOOTSTRAP_EMAIL and settings.ADMIN_BOOTSTRAP_PASSWORD:
        db = SessionLocal()
        try:
            existing = db.query(User).filter(User.email == settings.ADMIN_BOOTSTRAP_EMAIL.lower()).first()
            if existing is None:
                db.add(
                    User(
                        full_name="System Administrator",
                        email=settings.ADMIN_BOOTSTRAP_EMAIL.lower(),
                        password_hash=hash_password(settings.ADMIN_BOOTSTRAP_PASSWORD),
                        role=UserRole.ADMIN,
                        is_active=True,
                        is_email_verified=True,
                    )
                )
                db.commit()
                logger.info("Bootstrapped admin account for %s", settings.ADMIN_BOOTSTRAP_EMAIL)
        finally:
            db.close()


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok"}
