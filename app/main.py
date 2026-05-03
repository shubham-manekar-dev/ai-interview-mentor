from fastapi import FastAPI

from app.config import settings
from app.api.routes_health import router as health_router
from app.api.routes_interview import router as interview_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI Interview Mentor powered by Gemini, FastAPI, and later RAG.",
)

app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(interview_router, prefix="/interview", tags=["Interview"])