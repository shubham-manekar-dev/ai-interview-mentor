from google import genai

from app.config import settings


class GeminiService:
    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = settings.gemini_chat_model

    def generate_text(self, prompt: str) -> str:
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty response")

        return response.text


gemini_service = GeminiService()