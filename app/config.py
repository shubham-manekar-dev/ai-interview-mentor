from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    gemini_chat_model: str = "gemini-3.1-pro-preview"

    app_name: str = "AI Interview Mentor"
    app_version: str = "1.0.0"

    class Config:
        env_file = ".env"


settings = Settings()