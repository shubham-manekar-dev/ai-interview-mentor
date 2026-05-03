from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes_health import router as health_router
from app.api.routes_interview import router as interview_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI Interview Mentor powered by Gemini, FastAPI, and later RAG.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Interview Mentor API is running",
        "docs": "http://127.0.0.1:8001/docs",
        "health": "http://127.0.0.1:8001/health",
    }


app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(interview_router, prefix="/interview", tags=["Interview"])