import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.resume import Resume


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    resume_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    target_role: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    years_of_experience: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    overall_score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    ats_score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    dimension_scores: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    skills: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    strengths: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    weaknesses: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    missing_skills: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    recommendations: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    top_3_fixes: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    model_name: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="analyses",
    )