"""
MediMirror AI — Backend API Server
FastAPI application with prescription processing, OCR, reminders, and QR features.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, prescriptions, reminders, qr

app = FastAPI(
    title="MediMirror AI API",
    description=(
        "AI-powered prescription assistant that helps patients understand "
        "and follow medical prescriptions. Features include OCR extraction, "
        "voice processing, smart parsing, medication reminders, and QR-based "
        "medical profile sharing."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(reminders.router, prefix="/api")
app.include_router(qr.router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "name": "MediMirror AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    """API health check."""
    return {"status": "healthy", "service": "MediMirror AI Backend"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
