from abc import ABC, abstractmethod

from app.schemas.analysis import ResumeAnalysisCreate


class AIService(ABC):
    @abstractmethod
    def analyze_resume(
        self,
        resume_text: str,
    ) -> ResumeAnalysisCreate:
        """Analyze resume text and return structured analysis."""
        raise NotImplementedError