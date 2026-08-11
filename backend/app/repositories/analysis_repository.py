import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resume_analysis import ResumeAnalysis
from app.schemas.analysis import ResumeAnalysisCreate


class AnalysisRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        resume_id: uuid.UUID,
        data: ResumeAnalysisCreate,
    ) -> ResumeAnalysis:
        analysis = ResumeAnalysis(
            resume_id=resume_id,
            target_role=data.target_role,
            years_of_experience=data.years_of_experience,
            overall_score=data.overall_score,
            ats_score=data.ats_score,
            dimension_scores=data.dimension_scores.model_dump(),
            skills=data.skills,
            strengths=data.strengths,
            weaknesses=data.weaknesses,
            missing_skills=data.missing_skills,
            recommendations=data.recommendations,
            top_3_fixes=data.top_3_fixes,
            summary=data.summary,
            model_name=data.model_name,
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
