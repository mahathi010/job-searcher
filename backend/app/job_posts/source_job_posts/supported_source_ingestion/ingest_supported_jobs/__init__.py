"""ingest_supported_jobs feature package."""

from .models import JobPost
from .schema import (
    IngestJobPostRequest,
    IngestJobPostsRequest,
    JobPostResponse,
    JobPostUpdateRequest,
    ListJobPostsResponse,
    RemoteStatusEnum,
    ExperienceEnum,
    JobTypeEnum,
    SponsorshipEnum,
    SourceAttributionEnum,
    RelevanceOutcomeEnum,
    LifecycleStatusEnum,
)
from .repository import JobPostRepository
from .service import JobPostService

__all__ = [
    "JobPost",
    "IngestJobPostRequest",
    "IngestJobPostsRequest",
    "JobPostResponse",
    "JobPostUpdateRequest",
    "ListJobPostsResponse",
    "RemoteStatusEnum",
    "ExperienceEnum",
    "JobTypeEnum",
    "SponsorshipEnum",
    "SourceAttributionEnum",
    "RelevanceOutcomeEnum",
    "LifecycleStatusEnum",
    "JobPostRepository",
    "JobPostService",
]
