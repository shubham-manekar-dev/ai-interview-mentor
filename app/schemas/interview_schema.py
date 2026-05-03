from pydantic import BaseModel, Field


class QuestionRequest(BaseModel):
    role: str = Field(..., example="Python Backend Developer")
    topic: str = Field(..., example="FastAPI")
    difficulty: str = Field(..., example="L1")
    experience_years: int = Field(..., example=5)


class QuestionResponse(BaseModel):
    question: str
    expected_focus: list[str]


class EvaluateRequest(BaseModel):
    role: str = Field(..., example="Python Backend Developer")
    topic: str = Field(..., example="FastAPI")
    difficulty: str = Field(..., example="L1")
    experience_years: int = Field(..., example=5)
    question: str
    user_answer: str


class EvaluateResponse(BaseModel):
    score: int
    level: str
    strengths: list[str]
    missing_points: list[str]
    ideal_answer: str
    follow_up_question: str