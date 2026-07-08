"""
main.py — FastAPI application entry point.

Run with:
    uvicorn main:app --reload --port 8000
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load .env before anything else
load_dotenv()

from routers import chat_router
from utils.logger import logger

# ── Allowed origins ───────────────────────────────────────────────────────────
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]


# ── Lifespan (startup / shutdown hooks) ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("═══════════════════════════════════════")
    logger.info("  Gemini Chatbot API  — starting up")
    logger.info(f"  Allowed origins : {ALLOWED_ORIGINS}")
    logger.info("═══════════════════════════════════════")

    # Eagerly validate Gemini config so misconfiguration surfaces at boot
    try:
        from services.gemini_service import get_gemini_service
        get_gemini_service()
        logger.info("  Gemini service  — OK")
    except Exception as exc:
        logger.critical(f"  Gemini service  — FAILED: {exc}")
        # Don't crash the server — let the /health endpoint report the issue

    yield

    logger.info("Gemini Chatbot API — shutting down")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Gemini Chatbot API",
    description="Production-ready FastAPI backend for the AI Chatbot powered by Google Gemini.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(chat_router)


# ── Root ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Gemini Chatbot API is running 🚀",
        "docs": "/docs",
        "health": "/api/health",
    }
