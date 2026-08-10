from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ResumeAnalysisCreate(BaseModel):
    overall_score: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    ats_score: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    skills: list[str] = Field(default_factory=list)

    strengths: list[str] = Field(default_factory=list)

    weaknesses: list[str] = Field(default_factory=list)

    missing_skills: list[str] = Field(
        default_factory=list,
    )

    recommendations: list[str] = Field(
        default_factory=list,
    )

    summary: str | None = None

    model_name: str | None = None


class ResumeAnalysisResponse(BaseModel):
    id: UUID
    resume_id: UUID

    overall_score: int | None
    ats_score: int | None

    skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    recommendations: list[str]

    summary: str | None
    model_name: str | None

    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ResumeAnalysisListResponse(BaseModel):
    analyses: list[ResumeAnalysisResponse]