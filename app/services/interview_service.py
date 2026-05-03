from app.prompts.interview_prompts import (
    build_question_prompt,
    build_evaluation_prompt,
)
from app.services.gemini_service import gemini_service
from app.utils.json_parser import extract_json


class InterviewService:
    def generate_question(
        self,
        role: str,
        topic: str,
        difficulty: str,
        experience_years: int,
    ) -> dict:
        prompt = build_question_prompt(
            role=role,
            topic=topic,
            difficulty=difficulty,
            experience_years=experience_years,
        )

        llm_response = gemini_service.generate_text(prompt)
        return extract_json(llm_response)

    def evaluate_answer(
        self,
        role: str,
        topic: str,
        difficulty: str,
        experience_years: int,
        question: str,
        user_answer: str,
    ) -> dict:
        prompt = build_evaluation_prompt(
            role=role,
            topic=topic,
            difficulty=difficulty,
            experience_years=experience_years,
            question=question,
            user_answer=user_answer,
        )

        llm_response = gemini_service.generate_text(prompt)
        return extract_json(llm_response)


interview_service = InterviewService()