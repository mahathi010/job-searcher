"""Data access layer for JobPost. Never calls session.commit()."""

from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .models import (
    JobPost,
    JobTypeEnum,
    ExperienceEnum,
    RemoteStatusEnum,
    SponsorshipEnum,
    LifecycleStatusEnum,
    RelevanceOutcomeEnum,
)

_RELEVANT_OUTCOMES = [
    RelevanceOutcomeEnum.ai,
    RelevanceOutcomeEnum.ds,
    RelevanceOutcomeEnum.ml,
]


class JobPostRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, job_post: JobPost) -> JobPost:
        self.db.add(job_post)
        await self.db.flush()
        await self.db.refresh(job_post)
        return job_post

    async def get_by_id(self, job_post_id: UUID) -> Optional[JobPost]:
        result = await self.db.execute(
            select(JobPost).where(JobPost.id == job_post_id)
        )
        return result.scalars().first()

    async def update(self, job_post: JobPost, data: dict) -> JobPost:
        for key, value in data.items():
            setattr(job_post, key, value)
        await self.db.flush()
        await self.db.refresh(job_post)
        return job_post

    async def list_active(
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
        base_q = (
            select(JobPost)
            .where(JobPost.lifecycle_status == LifecycleStatusEnum.active)
            .where(JobPost.relevance_outcome.in_(_RELEVANT_OUTCOMES))
        )

        if job_type is not None:
            base_q = base_q.where(JobPost.job_type == job_type)
        if experience is not None:
            base_q = base_q.where(JobPost.experience == experience)
        if remote_status is not None:
            base_q = base_q.where(JobPost.remote_status == remote_status)
        if location is not None:
            base_q = base_q.where(JobPost.location.ilike(f"%{location}%"))
        if main_skillset is not None:
            base_q = base_q.where(JobPost.main_skillset.ilike(f"%{main_skillset}%"))
        if sponsorship is not None:
            base_q = base_q.where(JobPost.sponsorship == sponsorship)
        if posted_date_from is not None:
            base_q = base_q.where(JobPost.posted_date >= posted_date_from)
        if posted_date_to is not None:
            base_q = base_q.where(JobPost.posted_date <= posted_date_to)

        count_q = select(func.count()).select_from(base_q.subquery())
        count_result = await self.db.execute(count_q)
        total = count_result.scalar_one()

        sort_col = getattr(JobPost, sort_by, JobPost.created_at)
        if sort_order == "asc":
            base_q = base_q.order_by(sort_col.asc())
        else:
            base_q = base_q.order_by(sort_col.desc())

        offset = (page - 1) * page_size
        paginated_q = base_q.offset(offset).limit(page_size)
        result = await self.db.execute(paginated_q)
        items = list(result.scalars().all())

        return items, total
