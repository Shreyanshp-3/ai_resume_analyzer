import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.analysis import (
    ResumeAnalysisListResponse,
    ResumeAnalysisResponse,
)
from app.services.analysis_service import AnalysisService


router = APIRouter(
    tags=["Resume Analysis"],
)


@router.post(
    "/resumes/{resume_id}/analyze",
    response_model=ResumeAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def analyze_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis_service = AnalysisService(db)

    return analysis_service.analyze_resume(
        resume_id=resume_id,
        user_id=current_user.id,
    )


@router.get(
    "/resumes/{resume_id}/analyses",
    response_model=ResumeAnalysisListResponse,
)
def get_resume_analyses(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis_service = AnalysisService(db)

    analyses = analysis_service.get_resume_analyses(
        resume_id=resume_id,
        user_id=current_user.id,
    )

    return {
        "analyses": analyses,
    }


@router.get(
    "/analyses/{analysis_id}",
    response_model=ResumeAnalysisResponse,
)
def get_analysis(
    analysis_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis_service = AnalysisService(db)

    return analysis_service.get_analysis(
        analysis_id=analysis_id,
        user_id=current_user.id,
    )