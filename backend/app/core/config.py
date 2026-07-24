"""
Application configuration, loaded from environment variables (.env).
Uses pydantic-settings so values are validated and typed.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "Sports Injury Risk Detection API"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # --- Database ---
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/sports_injury_db"

    # --- JWT ---
    SECRET_KEY: str = "change-this-to-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Uploads (used from Milestone 2 onwards) ---
    UPLOAD_DIR: str = "uploads/videos"
    MAX_UPLOAD_SIZE_MB: int = 200

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
