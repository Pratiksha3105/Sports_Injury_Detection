"""
Auth/RBAC configuration.

All values are overridable via environment variables (see backend/.env.example).
Nothing here touches the AI pipeline configuration.
"""
from __future__ import annotations

import os


class Settings:
    # --- JWT ---------------------------------------------------------------
    # IMPORTANT: set a strong random SECRET_KEY via env var in production.
    # `openssl rand -hex 32` is a good way to generate one.
    SECRET_KEY: str = os.getenv("AUTH_SECRET_KEY", "dev-insecure-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    RESET_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30"))
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = int(os.getenv("EMAIL_VERIFICATION_EXPIRE_HOURS", "48"))

    # --- Cookies -------------------------------------------------------------
    REFRESH_COOKIE_NAME: str = "refresh_token"
    # Set AUTH_COOKIE_SECURE=true in production (HTTPS). False is required for
    # plain-http local dev, otherwise browsers silently drop the cookie.
    COOKIE_SECURE: bool = os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true"
    COOKIE_SAMESITE: str = os.getenv("AUTH_COOKIE_SAMESITE", "lax")

    # --- Database ------------------------------------------------------------
    # Defaults to a local SQLite file under backend/storage/ so the app runs
    # with zero external setup. Point DATABASE_URL at Postgres/MySQL in prod.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./storage/app.db")

    # --- Bootstrap admin -------------------------------------------------
    # Optional: auto-create an admin account on first startup so there's
    # always a way into /admin. Leave unset to skip.
    ADMIN_BOOTSTRAP_EMAIL: str | None = os.getenv("ADMIN_BOOTSTRAP_EMAIL")
    ADMIN_BOOTSTRAP_PASSWORD: str | None = os.getenv("ADMIN_BOOTSTRAP_PASSWORD")

    # --- AI assistant ("Ask AI") ---------------------------------------------
    # Not set by default -- the chat endpoints return a clear 503 until you
    # provide a key. Get one at https://console.anthropic.com/.
    ANTHROPIC_API_KEY: str | None = os.getenv("ANTHROPIC_API_KEY")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")


settings = Settings()
