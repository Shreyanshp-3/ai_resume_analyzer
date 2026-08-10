import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resume_analysis import ResumeAnalysis


class AnalysisRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        resume_id: uuid.UUID,
        overall_score: int | None,
        ats_score: int | None,
        skills: list[str],
        strengths: list[str],
        weaknesses: list[str],
        missing_skills: list[str],
        recommendations: list[str],
        summary: str | None,
        model_name: str | None,
    ) -> ResumeAnalysis:
        analysis = ResumeAnalysis(
            resume_id=resume_id,
            overall_score=overall_score,
            ats_score=ats_score,
            skills=skills,
            strengths=strengths,
            weaknesses=weaknesses,
            missing_skills=missing_skills,
            recommendations=recommendations,
            summary=summary,
            model_name=model_name,
        )

        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)

        return analysis

    def get_by_id(
        self,
        analysis_id: uuid.UUID,
    ) -> ResumeAnalysis | None:
        statement = select(ResumeAnalysis).where(
            ResumeAnalysis.id == analysis_id
        )

        return self.db.scalar(statement)

    def get_by_resume_id(
        self,
        resume_id: uuid.UUID,
    ) -> list[ResumeAnalysis]:
        statement = (
            select(ResumeAnalysis)
            .where(
                ResumeAnalysis.resume_id == resume_id
            )
            .order_by(
                ResumeAnalysis.created_at.desc()
            )
        )

        return list(self.db.scalars(statement).all())

    def delete(
        self,
        analysis: ResumeAnalysis,
    ) -> None:
        self.db.delete(analysis)
        self.db.commit()