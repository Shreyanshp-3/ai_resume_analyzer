"""add analysis context and dimension scores

Revision ID: 425500b27cae
Revises: fb04872e4275
Create Date: 2026-08-11 23:00:39.068306

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "425500b27cae"
down_revision: Union[str, Sequence[str], None] = "fb04872e4275"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "resume_analyses",
        sa.Column(
            "target_role",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "resume_analyses",
        sa.Column(
            "years_of_experience",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "resume_analyses",
        sa.Column(
            "dimension_scores",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
    )

    op.add_column(
        "resume_analyses",
        sa.Column(
            "top_3_fixes",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
    )

    # Existing MVP analyses do not have analysis context.
    # Give them explicit legacy values before enforcing NOT NULL.
    op.execute(
        """
        UPDATE resume_analyses
        SET target_role = 'Legacy Analysis',
            years_of_experience = 0
        WHERE target_role IS NULL
        """
    )

    op.alter_column(
        "resume_analyses",
        "target_role",
        existing_type=sa.Text(),
        nullable=False,
    )

    op.alter_column(
        "resume_analyses",
        "years_of_experience",
        existing_type=sa.Float(),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "resume_analyses",
        "top_3_fixes",
    )

    op.drop_column(
        "resume_analyses",
        "dimension_scores",
    )

    op.drop_column(
        "resume_analyses",
        "years_of_experience",
    )

    op.drop_column(
        "resume_analyses",
        "target_role",
    )
