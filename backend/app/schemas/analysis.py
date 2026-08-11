from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DimensionScore(BaseModel):
    score: int
    max: int
    notes: list[str] = []


class KeywordMatchDimension(DimensionScore):
    missing_keywords: list[str] = []
    matched_keywords: list[str] = []


class RedFlagsDimension(DimensionScore):
    flags_found: list[str] = []


class DimensionScores(BaseModel):
    parseability: DimensionScore
    keyword_match: KeywordMatchDimension
    experience_alignment: DimensionScore
    impact_quantification: DimensionScore
    formatting_length: DimensionScore
    red_flags: RedFlagsDimension


class ResumeAnalysisCreate(BaseModel):
    target_role: str
    years_of_experience: float

    overall_score: int | None = None
    ats_score: int | None = None

    dimension_scores: DimensionScores

    skills: list[str] = []
    strengths: list[str] = []
    weaknesses: list[str] = []
    missing_skills: list[str] = []
    recommendations: list[str] = []
    top_3_fixes: list[str] = []

    summary: str | None = None
    model_name: str | None = None


class ResumeAnalysisResponse(BaseModel):
    id: UUID
    resume_id: UUID

    target_role: str
    years_of_experience: float

    overall_score: int | None
    ats_score: int | None

    dimension_scores: DimensionScores

    skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    recommendations: list[str]
    top_3_fixes: list[str]

    summary: str | None
    model_name: str | None

    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ResumeAnalysisListResponse(BaseModel):
    analyses: list[ResumeAnalysisResponse]
