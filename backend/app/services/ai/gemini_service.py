from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.analysis import ResumeAnalysisCreate
from app.services.ai.base import AIService


class GeminiAIService(AIService):
    def __init__(self) -> None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not configured"
            )

        self.model_name = settings.GEMINI_MODEL

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

    def analyze_resume(
        self,
        resume_text: str,
    ) -> ResumeAnalysisCreate:
        prompt = f"""
You are an expert technical recruiter and ATS resume analyzer.

Analyze the following resume carefully.

Return a structured evaluation covering:

1. Overall resume quality score from 0 to 100.
2. ATS compatibility score from 0 to 100.
3. Technical and professional skills explicitly found in the resume.
4. Strong points of the resume.
5. Weak points of the resume.
6. Important skills that appear to be missing or underrepresented.
7. Specific recommendations for improving the resume.
8. A concise overall summary.

Do not invent experience, skills, education, or achievements
that are not present in the resume.

Resume:

{resume_text}
"""

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeAnalysisCreate,
            ),
        )

        if not response.parsed:
            raise RuntimeError(
                "Gemini returned an empty analysis"
            )

        return ResumeAnalysisCreate.model_validate(
            response.parsed
        )