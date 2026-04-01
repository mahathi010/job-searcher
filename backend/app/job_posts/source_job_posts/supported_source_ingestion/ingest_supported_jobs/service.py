"""Business logic for ingest_supported_jobs. Owns all transaction boundaries."""

import structlog
from datetime import date
from typing import Optional
from uuid import UUID

from app.core.exceptions import (
    NotFoundError,
    InvalidLifecycleTransitionError,
)

from .models import (
    JobPost,
    LifecycleStatusEnum,
    RelevanceOutcomeEnum,
    SourceAttributionEnum,
)
from .repository import JobPostRepository
from .schema import (
    IngestJobPostRequest,
    JobPostUpdateRequest,
    JobTypeEnum,
    ExperienceEnum,
    RemoteStatusEnum,
    SponsorshipEnum,
)

logger = structlog.get_logger()

_RELEVANT_OUTCOMES = {
    RelevanceOutcomeEnum.ai,
    RelevanceOutcomeEnum.ds,
    RelevanceOutcomeEnum.ml,
}

_AI_KEYWORDS = {
    "artificial intelligence",
    "deep learning",
    "neural network",
    "nlp",
    "natural language processing",
    "computer vision",
    "generative ai",
    "large language model",
    "llm",
    "reinforcement learning",
}
_DS_KEYWORDS = {
    "data science",
    "data scientist",
    "data analyst",
    "data analysis",
    "analytics engineer",
    "business intelligence",
    "bi analyst",
    "statistician",
}
_ML_KEYWORDS = {
    "machine learning",
    "ml engineer",
    "mlops",
    "ml ops",
    "predictive modeling",
    "statistical modeling",
    "feature engineering",
    "model training",
}


def _classify_relevance(
    title: str,
    main_skillset: Optional[str],
    skills: list[str],
) -> RelevanceOutcomeEnum:
    if main_skillset:
        ms = main_skillset.lower().strip()
        if ms in {"ai", "artificial intelligence"}:
            return RelevanceOutcomeEnum.ai
        if ms in {"ds", "data science"}:
            return RelevanceOutcomeEnum.ds
        if ms in {"ml", "machine learning"}:
            return RelevanceOutcomeEnum.ml

    combined = " ".join(
        [title.lower()] + [s.lower() for s in skills]
    )

    for kw in _AI_KEYWORDS:
        if kw in combined:
            return RelevanceOutcomeEnum.ai
    for kw in _DS_KEYWORDS:
        if kw in combined:
            return RelevanceOutcomeEnum.ds
    for kw in _ML_KEYWORDS:
        if kw in combined:
            return RelevanceOutcomeEnum.ml

    return RelevanceOutcomeEnum.excluded


class JobPostService:
    def __init__(self, repository: JobPostRepository):
        self.repository = repository

    async def ingest_job_posts(
        self, postings: list[IngestJobPostRequest]
    ) -> list[JobPost]:
        created: list[JobPost] = []
        for posting in postings:
            relevance = _classify_relevance(
                posting.title,
                posting.main_skillset,
                posting.skills,
            )
            job_post = JobPost(
                title=posting.title,
                company=posting.company,
                location=posting.location,
                remote_status=posting.remote_status,
                experience=posting.experience,
                job_type=posting.job_type,
                main_skillset=posting.main_skillset,
                skills=posting.skills,
                sponsorship=posting.sponsorship,
                posted_date=posting.posted_date,
                mandatory_requirements_summary=posting.mandatory_requirements_summary,
                source_attribution=posting.source_attribution,
                posting_link=posting.posting_link,
                relevance_outcome=relevance,
                lifecycle_status=LifecycleStatusEnum.active,
            )
            record = await self.repository.create(job_post)
            created.append(record)
        await self.repository.db.commit()
        logger.info("ingested_job_posts", count=len(created))
        return created

    async def get_job_post(self, job_post_id: UUID) -> JobPost:
        record = await self.repository.get_by_id(job_post_id)
        if record is None:
            raise NotFoundError(f"JobPost {job_post_id} not found")
        return record

    async def update_job_post(
        self, job_post_id: UUID, update_data: JobPostUpdateRequest
    ) -> JobPost:
        record = await self.get_job_post(job_post_id)
        editable = update_data.model_dump(exclude_none=True)
        # source_attribution, posting_link, relevance_outcome are immutable
        for immutable in ("source_attribution", "posting_link", "relevance_outcome"):
            editable.pop(immutable, None)
        updated = await self.repository.update(record, editable)
        await self.repository.db.commit()
        logger.info("updated_job_post", job_post_id=str(job_post_id))
        return updated

    async def deactivate_job_post(self, job_post_id: UUID) -> JobPost:
        record = await self.get_job_post(job_post_id)
        if record.lifecycle_status != LifecycleStatusEnum.active:
            raise InvalidLifecycleTransitionError(
                f"Cannot deactivate job post in state '{record.lifecycle_status.value}'"
            )
        updated = await self.repository.update(
            record, {"lifecycle_status": LifecycleStatusEnum.deactivated}
        )
        await self.repository.db.commit()
        logger.info("deactivated_job_post", job_post_id=str(job_post_id))
        return updated

    async def delete_job_post(self, job_post_id: UUID) -> None:
        record = await self.get_job_post(job_post_id)
        await self.repository.update(
            record, {"lifecycle_status": LifecycleStatusEnum.deleted}
        )
        await self.repository.db.commit()
        logger.info("deleted_job_post", job_post_id=str(job_post_id))

    async def list_active_job_posts(
        self,
        job_type: Optional[JobTypeEnum] = None,
        experience: Optional[ExperienceEnum] = None,
        remote_status: Optional[RemoteStatusEnum] = None,
        location: Optional[str] = None,
        main_skillset: Optional[str] = None,
        sponsorship: Optional[SponsorshipEnum] = None,
        posted_date_from: Optional[date] = None,
        posted_date_to: Optional[date] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[list[JobPost], int]:
        return await self.repository.list_active(
            job_type=job_type,
            experience=experience,
            remote_status=remote_status,
            location=location,
            main_skillset=main_skillset,
            sponsorship=sponsorship,
            posted_date_from=posted_date_from,
            posted_date_to=posted_date_to,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )
