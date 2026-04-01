"""FastAPI router for /v1/job-posts endpoints."""

from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError, InvalidLifecycleTransitionError

from .repository import JobPostRepository
from .service import JobPostService
from .schema import (
    IngestJobPostsRequest,
    JobPostResponse,
    JobPostUpdateRequest,
    ListJobPostsResponse,
    JobTypeEnum,
    ExperienceEnum,
    RemoteStatusEnum,
    SponsorshipEnum,
)

router = APIRouter(prefix="/v1/job-posts", tags=["job-posts"])


def _get_service(db: AsyncSession = Depends(get_db)) -> JobPostService:
    return JobPostService(JobPostRepository(db))


@router.post("/ingest", response_model=list[JobPostResponse], status_code=status.HTTP_201_CREATED)
async def ingest_job_posts(
    body: IngestJobPostsRequest,
    service: JobPostService = Depends(_get_service),
):
    records = await service.ingest_job_posts(body.postings)
    return records


@router.get("/", response_model=ListJobPostsResponse)
async def list_active_job_posts(
    job_type: Optional[JobTypeEnum] = Query(None),
    experience: Optional[ExperienceEnum] = Query(None),
    remote_status: Optional[RemoteStatusEnum] = Query(None),
    location: Optional[str] = Query(None, max_length=255),
    main_skillset: Optional[str] = Query(None, max_length=100),
    sponsorship: Optional[SponsorshipEnum] = Query(None),
    posted_date_from: Optional[date] = Query(None),
    posted_date_to: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", pattern="^(created_at|posted_date|title|company)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    service: JobPostService = Depends(_get_service),
):
    items, total = await service.list_active_job_posts(
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
    return ListJobPostsResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{job_post_id}", response_model=JobPostResponse)
async def get_job_post(
    job_post_id: UUID,
    service: JobPostService = Depends(_get_service),
):
    try:
        return await service.get_job_post(job_post_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)


@router.put("/{job_post_id}", response_model=JobPostResponse)
async def update_job_post(
    job_post_id: UUID,
    body: JobPostUpdateRequest,
    service: JobPostService = Depends(_get_service),
):
    try:
        return await service.update_job_post(job_post_id, body)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)


@router.post("/{job_post_id}/deactivate", response_model=JobPostResponse)
async def deactivate_job_post(
    job_post_id: UUID,
    service: JobPostService = Depends(_get_service),
):
    try:
        return await service.deactivate_job_post(job_post_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
    except InvalidLifecycleTransitionError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.message)


@router.delete("/{job_post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_post(
    job_post_id: UUID,
    service: JobPostService = Depends(_get_service),
):
    try:
        await service.delete_job_post(job_post_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
