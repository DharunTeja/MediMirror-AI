"""
MediMirror AI - Configuration Module
Manages environment variables and application settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    TESSERACT_CMD: str = os.getenv(
        "TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

    # CORS: allow configuring additional origins via env var (comma-separated)
    _extra_origins = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ] + [o.strip() for o in _extra_origins.split(",") if o.strip()]


settings = Settings()
