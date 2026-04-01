"""Unit and integration tests for ingest_supported_jobs."""

import uuid
from datetime import date, datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.exceptions import (
    NotFoundError,
    InvalidLifecycleTransitionError,
)
from app.job_posts.source_job_posts.supported_source_ingestion.ingest_supported_jobs.models import (
    JobPost,
    LifecycleStatusEnum,
    RelevanceOutcomeEnum,
    SourceAttributionEnum,
    RemoteStatusEnum,
    ExperienceEnum,
    JobTypeEnum,
    SponsorshipEnum,
)
from app.job_posts.source_job_posts.supported_source_ingestion.ingest_supported_jobs.schema import (
    IngestJobPostRequest,
    JobPostUpdateRequest,
)
from app.job_posts.source_job_posts.supported_source_ingestion.ingest_supported_jobs.service import (
    JobPostService,
)
from app.job_posts.source_job_posts.supported_source_ingestion.ingest_supported_jobs.repository import (
    JobPostRepository,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_job_post(**overrides) -> JobPost:
    defaults = dict(
        id=uuid.uuid4(),
        title="ML Engineer",
        company="Acme",
        location="Remote",
        remote_status=RemoteStatusEnum.remote,
        experience=ExperienceEnum.mid,
        job_type=JobTypeEnum.full_time,
        main_skillset="ml",
        skills=["python", "tensorflow"],
        sponsorship=SponsorshipEnum.yes,
        posted_date=date(2026, 3, 1),
        mandatory_requirements_summary="5 years exp",
        source_attribution=SourceAttributionEnum.linkedin,
        posting_link="https://linkedin.com/jobs/1",
        relevance_outcome=RelevanceOutcomeEnum.ml,
        lifecycle_status=LifecycleStatusEnum.active,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    defaults.update(overrides)
    return JobPost(**defaults)


def _make_ingest_request(**overrides) -> IngestJobPostRequest:
    defaults = dict(
        title="ML Engineer",
        company="Acme",
        source_attribution=SourceAttributionEnum.linkedin,
        posting_link="https://linkedin.com/jobs/1",
        main_skillset="ml",
        skills=["python", "tensorflow"],
    )
    defaults.update(overrides)
    return IngestJobPostRequest(**defaults)


def _make_service(mock_repo) -> JobPostService:
    return JobPostService(mock_repo)


# ---------------------------------------------------------------------------
# Ingestion — happy path
# ---------------------------------------------------------------------------


async def test_ingest_creates_record_with_source_link_relevance():
    mock_repo = AsyncMock(spec=JobPostRepository)
    job_post = _make_job_post()
    mock_repo.create.return_value = job_post
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    result = await service.ingest_job_posts([_make_ingest_request()])

    assert len(result) == 1
    mock_repo.create.assert_called_once()
    created_arg = mock_repo.create.call_args[0][0]
    assert created_arg.source_attribution == SourceAttributionEnum.linkedin
    assert created_arg.posting_link == "https://linkedin.com/jobs/1"
    mock_repo.db.commit.assert_called_once()


async def test_ingest_classifies_ml_relevance_from_main_skillset():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.create.return_value = _make_job_post(relevance_outcome=RelevanceOutcomeEnum.ml)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.ingest_job_posts([_make_ingest_request(main_skillset="ml")])

    created_arg = mock_repo.create.call_args[0][0]
    assert created_arg.relevance_outcome == RelevanceOutcomeEnum.ml


async def test_ingest_classifies_ai_relevance_from_main_skillset():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.create.return_value = _make_job_post(relevance_outcome=RelevanceOutcomeEnum.ai)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.ingest_job_posts([_make_ingest_request(main_skillset="ai", skills=[])])

    created_arg = mock_repo.create.call_args[0][0]
    assert created_arg.relevance_outcome == RelevanceOutcomeEnum.ai


async def test_ingest_classifies_ds_relevance_from_main_skillset():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.create.return_value = _make_job_post(relevance_outcome=RelevanceOutcomeEnum.ds)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.ingest_job_posts([_make_ingest_request(main_skillset="data science", skills=[])])

    created_arg = mock_repo.create.call_args[0][0]
    assert created_arg.relevance_outcome == RelevanceOutcomeEnum.ds


async def test_ingest_classifies_excluded_for_non_technical():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.create.return_value = _make_job_post(relevance_outcome=RelevanceOutcomeEnum.excluded)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.ingest_job_posts(
        [_make_ingest_request(title="Office Manager", main_skillset=None, skills=[])]
    )

    created_arg = mock_repo.create.call_args[0][0]
    assert created_arg.relevance_outcome == RelevanceOutcomeEnum.excluded


async def test_ingest_classifies_ml_from_title_keyword():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.create.return_value = _make_job_post(relevance_outcome=RelevanceOutcomeEnum.ml)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.ingest_job_posts(
        [_make_ingest_request(title="Machine Learning Researcher", main_skillset=None, skills=[])]
    )

    created_arg = mock_repo.create.call_args[0][0]
    assert created_arg.relevance_outcome == RelevanceOutcomeEnum.ml


async def test_ingest_classifies_ds_from_skills():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.create.return_value = _make_job_post(relevance_outcome=RelevanceOutcomeEnum.ds)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.ingest_job_posts(
        [_make_ingest_request(title="Engineer", main_skillset=None, skills=["data science", "sql"])]
    )

    created_arg = mock_repo.create.call_args[0][0]
    assert created_arg.relevance_outcome == RelevanceOutcomeEnum.ds


# ---------------------------------------------------------------------------
# Partial posting — missing optional fields preserved
# ---------------------------------------------------------------------------


async def test_ingest_partial_posting_preserved_without_optional_fields():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.create.return_value = _make_job_post(
        location=None, posted_date=None, mandatory_requirements_summary=None
    )
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.ingest_job_posts(
        [
            _make_ingest_request(
                location=None,
                posted_date=None,
                mandatory_requirements_summary=None,
            )
        ]
    )

    created_arg = mock_repo.create.call_args[0][0]
    assert created_arg.location is None
    assert created_arg.posted_date is None
    assert created_arg.mandatory_requirements_summary is None


# ---------------------------------------------------------------------------
# Invariant: update preserves source/link/relevance
# ---------------------------------------------------------------------------


async def test_update_preserves_source_attribution():
    mock_repo = AsyncMock(spec=JobPostRepository)
    job_post = _make_job_post()
    mock_repo.get_by_id.return_value = job_post
    mock_repo.update.return_value = job_post
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    update = JobPostUpdateRequest(title="New Title")
    await service.update_job_post(job_post.id, update)

    update_call_data = mock_repo.update.call_args[0][1]
    assert "source_attribution" not in update_call_data
    assert "posting_link" not in update_call_data
    assert "relevance_outcome" not in update_call_data


async def test_update_applies_editable_fields():
    mock_repo = AsyncMock(spec=JobPostRepository)
    job_post = _make_job_post()
    mock_repo.get_by_id.return_value = job_post
    mock_repo.update.return_value = job_post
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    update = JobPostUpdateRequest(title="Updated Title", experience=ExperienceEnum.senior)
    await service.update_job_post(job_post.id, update)

    update_call_data = mock_repo.update.call_args[0][1]
    assert update_call_data["title"] == "Updated Title"
    assert update_call_data["experience"] == ExperienceEnum.senior


async def test_update_raises_not_found_for_missing_record():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.get_by_id.return_value = None
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    with pytest.raises(NotFoundError):
        await service.update_job_post(uuid.uuid4(), JobPostUpdateRequest(title="x"))


# ---------------------------------------------------------------------------
# Deactivation lifecycle
# ---------------------------------------------------------------------------


async def test_deactivate_active_job_post():
    mock_repo = AsyncMock(spec=JobPostRepository)
    job_post = _make_job_post(lifecycle_status=LifecycleStatusEnum.active)
    mock_repo.get_by_id.return_value = job_post
    deactivated = _make_job_post(lifecycle_status=LifecycleStatusEnum.deactivated)
    mock_repo.update.return_value = deactivated
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    result = await service.deactivate_job_post(job_post.id)

    assert result.lifecycle_status == LifecycleStatusEnum.deactivated
    update_data = mock_repo.update.call_args[0][1]
    assert update_data["lifecycle_status"] == LifecycleStatusEnum.deactivated


async def test_deactivate_already_deactivated_raises_invalid_transition():
    mock_repo = AsyncMock(spec=JobPostRepository)
    job_post = _make_job_post(lifecycle_status=LifecycleStatusEnum.deactivated)
    mock_repo.get_by_id.return_value = job_post
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    with pytest.raises(InvalidLifecycleTransitionError):
        await service.deactivate_job_post(job_post.id)


async def test_deactivate_deleted_raises_invalid_transition():
    mock_repo = AsyncMock(spec=JobPostRepository)
    job_post = _make_job_post(lifecycle_status=LifecycleStatusEnum.deleted)
    mock_repo.get_by_id.return_value = job_post
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    with pytest.raises(InvalidLifecycleTransitionError):
        await service.deactivate_job_post(job_post.id)


# ---------------------------------------------------------------------------
# Deletion
# ---------------------------------------------------------------------------


async def test_delete_soft_deletes_record():
    mock_repo = AsyncMock(spec=JobPostRepository)
    job_post = _make_job_post()
    mock_repo.get_by_id.return_value = job_post
    mock_repo.update.return_value = _make_job_post(lifecycle_status=LifecycleStatusEnum.deleted)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.delete_job_post(job_post.id)

    update_data = mock_repo.update.call_args[0][1]
    assert update_data["lifecycle_status"] == LifecycleStatusEnum.deleted


async def test_delete_raises_not_found_for_missing_record():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.get_by_id.return_value = None
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    with pytest.raises(NotFoundError):
        await service.delete_job_post(uuid.uuid4())


# ---------------------------------------------------------------------------
# Listing — active relevant records only
# ---------------------------------------------------------------------------


async def test_list_active_returns_only_active_relevant():
    mock_repo = AsyncMock(spec=JobPostRepository)
    active_posts = [_make_job_post(), _make_job_post()]
    mock_repo.list_active.return_value = (active_posts, 2)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    items, total = await service.list_active_job_posts()

    assert total == 2
    assert len(items) == 2
    call_kwargs = mock_repo.list_active.call_args.kwargs
    assert call_kwargs.get("page") == 1


async def test_list_active_passes_filters_to_repository():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.list_active.return_value = ([], 0)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    await service.list_active_job_posts(
        job_type=JobTypeEnum.full_time,
        experience=ExperienceEnum.senior,
        remote_status=RemoteStatusEnum.remote,
        location="New York",
        main_skillset="ml",
        sponsorship=SponsorshipEnum.yes,
        posted_date_from=date(2026, 1, 1),
        posted_date_to=date(2026, 3, 31),
        page=2,
        page_size=10,
    )

    call_kwargs = mock_repo.list_active.call_args.kwargs
    assert call_kwargs["job_type"] == JobTypeEnum.full_time
    assert call_kwargs["experience"] == ExperienceEnum.senior
    assert call_kwargs["remote_status"] == RemoteStatusEnum.remote
    assert call_kwargs["location"] == "New York"
    assert call_kwargs["main_skillset"] == "ml"
    assert call_kwargs["sponsorship"] == SponsorshipEnum.yes
    assert call_kwargs["posted_date_from"] == date(2026, 1, 1)
    assert call_kwargs["posted_date_to"] == date(2026, 3, 31)
    assert call_kwargs["page"] == 2
    assert call_kwargs["page_size"] == 10


async def test_list_active_no_filters_includes_unknown_values():
    mock_repo = AsyncMock(spec=JobPostRepository)
    unknown_posts = [
        _make_job_post(
            job_type=JobTypeEnum.unknown,
            experience=ExperienceEnum.unknown,
            sponsorship=SponsorshipEnum.unknown,
        )
    ]
    mock_repo.list_active.return_value = (unknown_posts, 1)
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    items, total = await service.list_active_job_posts()

    # Repository was called with no job_type filter — unknown values pass through
    call_kwargs = mock_repo.list_active.call_args.kwargs
    assert call_kwargs["job_type"] is None
    assert call_kwargs["experience"] is None
    assert call_kwargs["sponsorship"] is None
    assert total == 1


# ---------------------------------------------------------------------------
# get_job_post
# ---------------------------------------------------------------------------


async def test_get_job_post_returns_record():
    mock_repo = AsyncMock(spec=JobPostRepository)
    job_post = _make_job_post()
    mock_repo.get_by_id.return_value = job_post
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    result = await service.get_job_post(job_post.id)

    assert result.id == job_post.id


async def test_get_job_post_raises_not_found():
    mock_repo = AsyncMock(spec=JobPostRepository)
    mock_repo.get_by_id.return_value = None
    mock_repo.db = AsyncMock()

    service = _make_service(mock_repo)
    with pytest.raises(NotFoundError):
        await service.get_job_post(uuid.uuid4())


# ---------------------------------------------------------------------------
# API integration tests
# ---------------------------------------------------------------------------


async def test_api_ingest_returns_201(async_client):
    client, mock_repo = async_client
    job_post = _make_job_post()
    mock_repo.create.return_value = job_post
    mock_repo.db = AsyncMock()

    payload = {
        "postings": [
            {
                "title": "ML Engineer",
                "company": "Acme",
                "source_attribution": "linkedin",
                "posting_link": "https://linkedin.com/jobs/1",
                "main_skillset": "ml",
                "skills": ["python"],
            }
        ]
    }
    response = await client.post("/v1/job-posts/ingest", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


async def test_api_ingest_empty_postings_returns_422(async_client):
    client, _ = async_client
    response = await client.post("/v1/job-posts/ingest", json={"postings": []})
    assert response.status_code == 422


async def test_api_get_job_post_not_found_returns_404(async_client):
    client, mock_repo = async_client
    mock_repo.get_by_id.return_value = None

    job_post_id = uuid.uuid4()
    response = await client.get(f"/v1/job-posts/{job_post_id}")
    assert response.status_code == 404


async def test_api_get_job_post_returns_200(async_client):
    client, mock_repo = async_client
    job_post = _make_job_post()
    mock_repo.get_by_id.return_value = job_post

    response = await client.get(f"/v1/job-posts/{job_post.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(job_post.id)
    assert data["source_attribution"] == job_post.source_attribution.value


async def test_api_update_job_post_returns_200(async_client):
    client, mock_repo = async_client
    job_post = _make_job_post()
    updated = _make_job_post(title="New Title")
    mock_repo.get_by_id.return_value = job_post
    mock_repo.update.return_value = updated

    response = await client.put(
        f"/v1/job-posts/{job_post.id}", json={"title": "New Title"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "New Title"


async def test_api_update_job_post_not_found_returns_404(async_client):
    client, mock_repo = async_client
    mock_repo.get_by_id.return_value = None

    response = await client.put(
        f"/v1/job-posts/{uuid.uuid4()}", json={"title": "x"}
    )
    assert response.status_code == 404


async def test_api_deactivate_returns_200(async_client):
    client, mock_repo = async_client
    job_post = _make_job_post(lifecycle_status=LifecycleStatusEnum.active)
    deactivated = _make_job_post(lifecycle_status=LifecycleStatusEnum.deactivated)
    mock_repo.get_by_id.return_value = job_post
    mock_repo.update.return_value = deactivated

    response = await client.post(f"/v1/job-posts/{job_post.id}/deactivate")
    assert response.status_code == 200
    assert response.json()["lifecycle_status"] == "deactivated"


async def test_api_deactivate_invalid_transition_returns_409(async_client):
    client, mock_repo = async_client
    job_post = _make_job_post(lifecycle_status=LifecycleStatusEnum.deactivated)
    mock_repo.get_by_id.return_value = job_post

    response = await client.post(f"/v1/job-posts/{job_post.id}/deactivate")
    assert response.status_code == 409


async def test_api_delete_returns_204(async_client):
    client, mock_repo = async_client
    job_post = _make_job_post()
    mock_repo.get_by_id.return_value = job_post
    mock_repo.update.return_value = _make_job_post(lifecycle_status=LifecycleStatusEnum.deleted)

    response = await client.delete(f"/v1/job-posts/{job_post.id}")
    assert response.status_code == 204


async def test_api_delete_not_found_returns_404(async_client):
    client, mock_repo = async_client
    mock_repo.get_by_id.return_value = None

    response = await client.delete(f"/v1/job-posts/{uuid.uuid4()}")
    assert response.status_code == 404


async def test_api_list_returns_200_with_pagination(async_client):
    client, mock_repo = async_client
    posts = [_make_job_post(), _make_job_post()]
    mock_repo.list_active.return_value = (posts, 2)

    response = await client.get("/v1/job-posts/?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert len(data["items"]) == 2


async def test_api_list_filter_by_job_type(async_client):
    client, mock_repo = async_client
    mock_repo.list_active.return_value = ([], 0)

    response = await client.get("/v1/job-posts/?job_type=full_time")
    assert response.status_code == 200
    call_kwargs = mock_repo.list_active.call_args.kwargs
    assert call_kwargs["job_type"] == JobTypeEnum.full_time


async def test_api_list_filter_by_experience(async_client):
    client, mock_repo = async_client
    mock_repo.list_active.return_value = ([], 0)

    response = await client.get("/v1/job-posts/?experience=senior")
    assert response.status_code == 200
    call_kwargs = mock_repo.list_active.call_args.kwargs
    assert call_kwargs["experience"] == ExperienceEnum.senior


async def test_api_list_combined_filters(async_client):
    client, mock_repo = async_client
    mock_repo.list_active.return_value = ([], 0)

    response = await client.get(
        "/v1/job-posts/?job_type=full_time&experience=senior&remote_status=remote&sponsorship=yes"
    )
    assert response.status_code == 200
    call_kwargs = mock_repo.list_active.call_args.kwargs
    assert call_kwargs["job_type"] == JobTypeEnum.full_time
    assert call_kwargs["experience"] == ExperienceEnum.senior
    assert call_kwargs["remote_status"] == RemoteStatusEnum.remote
    assert call_kwargs["sponsorship"] == SponsorshipEnum.yes


async def test_api_list_invalid_page_size_returns_422(async_client):
    client, _ = async_client
    response = await client.get("/v1/job-posts/?page_size=0")
    assert response.status_code == 422


async def test_api_list_invalid_sort_by_returns_422(async_client):
    client, _ = async_client
    response = await client.get("/v1/job-posts/?sort_by=invalid_field")
    assert response.status_code == 422
