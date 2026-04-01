"""Pydantic schemas for ingest_supported_jobs."""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from .models import (
    RemoteStatusEnum,
    ExperienceEnum,
    JobTypeEnum,
    SponsorshipEnum,
    SourceAttributionEnum,
    RelevanceOutcomeEnum,
    LifecycleStatusEnum,
)

__all__ = [
    "RemoteStatusEnum",
    "ExperienceEnum",
    "JobTypeEnum",
    "SponsorshipEnum",
    "SourceAttributionEnum",
    "RelevanceOutcomeEnum",
    "LifecycleStatusEnum",
    "IngestJobPostRequest",
    "IngestJobPostsRequest",
    "JobPostResponse",
    "JobPostUpdateRequest",
    "ListJobPostsResponse",
]


class IngestJobPostRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    company: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    remote_status: RemoteStatusEnum = RemoteStatusEnum.unknown
    experience: ExperienceEnum = ExperienceEnum.unknown
    job_type: JobTypeEnum = JobTypeEnum.unknown
    main_skillset: Optional[str] = Field(None, max_length=100)
    skills: list[str] = Field(default_factory=list)
    sponsorship: SponsorshipEnum = SponsorshipEnum.unknown
    posted_date: Optional[date] = None
    mandatory_requirements_summary: Optional[str] = None
    source_attribution: SourceAttributionEnum
    posting_link: Optional[str] = Field(None, max_length=2000)


class IngestJobPostsRequest(BaseModel):
    postings: list[IngestJobPostRequest] = Field(..., min_length=1)


class JobPostResponse(BaseModel):
    id: UUID
    title: str
    company: str
    location: Optional[str] = None
    remote_status: RemoteStatusEnum
    experience: ExperienceEnum
    job_type: JobTypeEnum
    main_skillset: Optional[str] = None
    skills: list[str]
    sponsorship: SponsorshipEnum
    posted_date: Optional[date] = None
    mandatory_requirements_summary: Optional[str] = None
    source_attribution: SourceAttributionEnum
    posting_link: Optional[str] = None
    relevance_outcome: RelevanceOutcomeEnum
    lifecycle_status: LifecycleStatusEnum
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobPostUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    company: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    remote_status: Optional[RemoteStatusEnum] = None
    experience: Optional[ExperienceEnum] = None
    job_type: Optional[JobTypeEnum] = None
    main_skillset: Optional[str] = Field(None, max_length=100)
    skills: Optional[list[str]] = None
    sponsorship: Optional[SponsorshipEnum] = None
    posted_date: Optional[date] = None
    mandatory_requirements_summary: Optional[str] = None


class ListJobPostsResponse(BaseModel):
    items: list[JobPostResponse]
    total: int
    page: int
    page_size: int
