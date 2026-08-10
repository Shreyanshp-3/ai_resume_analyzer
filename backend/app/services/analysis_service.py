import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.resume_analysis import ResumeAnalysis
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.resume_repository import ResumeRepository
from app.schemas.analysis import ResumeAnalysisCreate
from app.services.ai.gemini_service import GeminiAIService


class AnalysisService:
    def __init__(self, db: Session):
        self.analysis_repository = AnalysisRepository(db)
        self.resume_repository = ResumeRepository(db)
        self.ai_service = GeminiAIService()

    def analyze_resume(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ResumeAnalysis:
        resume = self.resume_repository.get_by_id(
            resume_id
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found",
            )

        if resume.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this resume",
            )

        if not resume.extracted_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Resume text has not been extracted",
            )

        try:
            analysis_data = self.ai_service.analyze_resume(
                resume.extracted_text
            )
        except Exception as exc:
            print(
                f"AI ANALYSIS ERROR: "
                f"{type(exc).__name__}: {exc}"
            )

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI analysis service is currently unavailable",
            ) from exc

        analysis_data.model_name = self.ai_service.model_name

        return self.analysis_repository.create(
            resume_id=resume_id,
            overall_score=analysis_data.overall_score,
            ats_score=analysis_data.ats_score,
            skills=analysis_data.skills,
            strengths=analysis_data.strengths,
            weaknesses=analysis_data.weaknesses,
            missing_skills=analysis_data.missing_skills,
            recommendations=analysis_data.recommendations,
            summary=analysis_data.summary,
            model_name=analysis_data.model_name,
        )

    def create_analysis(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
        data: ResumeAnalysisCreate,
    ) -> ResumeAnalysis:
        resume = self.resume_repository.get_by_id(
            resume_id
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found",
            )

        if resume.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this resume",
            )

        if not resume.extracted_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Resume text has not been extracted",
            )

        return self.analysis_repository.create(
            resume_id=resume_id,
            overall_score=data.overall_score,
            ats_score=data.ats_score,
            skills=data.skills,
            strengths=data.strengths,
            weaknesses=data.weaknesses,
            missing_skills=data.missing_skills,
            recommendations=data.recommendations,
            summary=data.summary,
            model_name=data.model_name,
        )

    def get_analysis(
        self,
        analysis_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ResumeAnalysis:
        analysis = self.analysis_repository.get_by_id(
            analysis_id
        )

        if analysis is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found",
            )

        resume = self.resume_repository.get_by_id(
            analysis.resume_id
        )

        if resume is None or resume.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this analysis",
            )

        return analysis

    def get_resume_analyses(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> list[ResumeAnalysis]:
        resume = self.resume_repository.get_by_id(
            resume_id
        )

        if resume is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found",
            )

        if resume.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this resume",
            )

        return self.analysis_repository.get_by_resume_id(
            resume_id
        )