"""Create job_posts table with all enum types.

Revision ID: 001
Revises:
Create Date: 2026-04-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM, UUID, JSONB

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "CREATE TYPE remote_status_enum AS ENUM ('remote', 'hybrid', 'onsite', 'unknown')"
    )
    op.execute(
        "CREATE TYPE experience_enum AS ENUM ('junior', 'mid', 'senior', 'lead', 'unknown')"
    )
    op.execute(
        "CREATE TYPE job_type_enum AS ENUM "
        "('full_time', 'part_time', 'contract', 'internship', 'unknown')"
    )
    op.execute(
        "CREATE TYPE sponsorship_enum AS ENUM ('yes', 'no', 'unknown')"
    )
    op.execute(
        "CREATE TYPE source_attribution_enum AS ENUM "
        "('linkedin', 'indeed', 'dice', 'company_site')"
    )
    op.execute(
        "CREATE TYPE relevance_outcome_enum AS ENUM ('ai', 'ds', 'ml', 'excluded')"
    )
    op.execute(
        "CREATE TYPE lifecycle_status_enum AS ENUM ('active', 'deactivated', 'deleted')"
    )

    op.create_table(
        "job_posts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("company", sa.String(255), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column(
            "remote_status",
            PG_ENUM(
                "remote", "hybrid", "onsite", "unknown",
                name="remote_status_enum",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "experience",
            PG_ENUM(
                "junior", "mid", "senior", "lead", "unknown",
                name="experience_enum",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "job_type",
            PG_ENUM(
                "full_time", "part_time", "contract", "internship", "unknown",
                name="job_type_enum",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("main_skillset", sa.String(100), nullable=True),
        sa.Column("skills", JSONB, nullable=False, server_default="[]"),
        sa.Column(
            "sponsorship",
            PG_ENUM(
                "yes", "no", "unknown",
                name="sponsorship_enum",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("posted_date", sa.Date, nullable=True),
        sa.Column("mandatory_requirements_summary", sa.Text, nullable=True),
        sa.Column(
            "source_attribution",
            PG_ENUM(
                "linkedin", "indeed", "dice", "company_site",
                name="source_attribution_enum",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("posting_link", sa.String(2000), nullable=True),
        sa.Column(
            "relevance_outcome",
            PG_ENUM(
                "ai", "ds", "ml", "excluded",
                name="relevance_outcome_enum",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "lifecycle_status",
            PG_ENUM(
                "active", "deactivated", "deleted",
                name="lifecycle_status_enum",
                create_type=False,
            ),
            nullable=False,
            server_default="active",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_index(
        "ix_job_posts_lifecycle_relevance",
        "job_posts",
        ["lifecycle_status", "relevance_outcome"],
    )
    op.create_index(
        "ix_job_posts_source_attribution", "job_posts", ["source_attribution"]
    )
    op.create_index("ix_job_posts_job_type", "job_posts", ["job_type"])
    op.create_index("ix_job_posts_experience", "job_posts", ["experience"])
    op.create_index("ix_job_posts_remote_status", "job_posts", ["remote_status"])
    op.create_index("ix_job_posts_sponsorship", "job_posts", ["sponsorship"])
    op.create_index("ix_job_posts_posted_date", "job_posts", ["posted_date"])


def downgrade() -> None:
    op.drop_index("ix_job_posts_posted_date", table_name="job_posts")
    op.drop_index("ix_job_posts_sponsorship", table_name="job_posts")
    op.drop_index("ix_job_posts_remote_status", table_name="job_posts")
    op.drop_index("ix_job_posts_experience", table_name="job_posts")
    op.drop_index("ix_job_posts_job_type", table_name="job_posts")
    op.drop_index("ix_job_posts_source_attribution", table_name="job_posts")
    op.drop_index("ix_job_posts_lifecycle_relevance", table_name="job_posts")
    op.drop_table("job_posts")
    op.execute("DROP TYPE lifecycle_status_enum")
    op.execute("DROP TYPE relevance_outcome_enum")
    op.execute("DROP TYPE source_attribution_enum")
    op.execute("DROP TYPE sponsorship_enum")
    op.execute("DROP TYPE job_type_enum")
    op.execute("DROP TYPE experience_enum")
    op.execute("DROP TYPE remote_status_enum")
