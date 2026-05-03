from fastapi import APIRouter, HTTPException

from app.schemas.interview_schema import (
    QuestionRequest,
    QuestionResponse,
    EvaluateRequest,
    EvaluateResponse,
)
from app.services.interview_service import interview_service


router = APIRouter()


@router.post("/question", response_model=QuestionResponse)
def generate_question(request: QuestionRequest):
    try:
        result = interview_service.generate_question(
            role=request.role,
            topic=request.topic,
            difficulty=request.difficulty,
            experience_years=request.experience_years,
        )

        return result

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate interview question: {str(exc)}",
        ) from exc


@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate_answer(request: EvaluateRequest):
    try:
        result = interview_service.evaluate_answer(
            role=request.role,
            topic=request.topic,
            difficulty=request.difficulty,
            experience_years=request.experience_years,
            question=request.question,
            user_answer=request.user_answer,
        )

        return result

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate answer: {str(exc)}",
        ) from exc