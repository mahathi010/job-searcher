"""SQLAlchemy model for JobPost with all enum types."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Date, DateTime, Enum as SAEnum, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.core.database import Base


class RemoteStatusEnum(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    onsite = "onsite"
    unknown = "unknown"


class ExperienceEnum(str, enum.Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"
    lead = "lead"
    unknown = "unknown"


class JobTypeEnum(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"
    unknown = "unknown"


class SponsorshipEnum(str, enum.Enum):
    yes = "yes"
    no = "no"
    unknown = "unknown"


class SourceAttributionEnum(str, enum.Enum):
    linkedin = "linkedin"
    indeed = "indeed"
    dice = "dice"
    company_site = "company_site"


class RelevanceOutcomeEnum(str, enum.Enum):
    ai = "ai"
    ds = "ds"
    ml = "ml"
    excluded = "excluded"


class LifecycleStatusEnum(str, enum.Enum):
    active = "active"
    deactivated = "deactivated"
    deleted = "deleted"


class JobPost(Base):
    __tablename__ = "job_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    remote_status = Column(
        SAEnum(
            RemoteStatusEnum,
            name="remote_status_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=RemoteStatusEnum.unknown,
    )
    experience = Column(
        SAEnum(
            ExperienceEnum,
            name="experience_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=ExperienceEnum.unknown,
    )
    job_type = Column(
        SAEnum(
            JobTypeEnum,
            name="job_type_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=JobTypeEnum.unknown,
    )
    main_skillset = Column(String(100), nullable=True)
    skills = Column(JSONB, nullable=False, default=list)
    sponsorship = Column(
        SAEnum(
            SponsorshipEnum,
            name="sponsorship_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=SponsorshipEnum.unknown,
    )
    posted_date = Column(Date, nullable=True)
    mandatory_requirements_summary = Column(Text, nullable=True)
    source_attribution = Column(
        SAEnum(
            SourceAttributionEnum,
            name="source_attribution_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    posting_link = Column(String(2000), nullable=True)
    relevance_outcome = Column(
        SAEnum(
            RelevanceOutcomeEnum,
            name="relevance_outcome_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    lifecycle_status = Column(
        SAEnum(
            LifecycleStatusEnum,
            name="lifecycle_status_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=LifecycleStatusEnum.active,
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index("ix_job_posts_lifecycle_relevance", "lifecycle_status", "relevance_outcome"),
        Index("ix_job_posts_source_attribution", "source_attribution"),
        Index("ix_job_posts_job_type", "job_type"),
        Index("ix_job_posts_experience", "experience"),
        Index("ix_job_posts_remote_status", "remote_status"),
        Index("ix_job_posts_sponsorship", "sponsorship"),
        Index("ix_job_posts_posted_date", "posted_date"),
    )
