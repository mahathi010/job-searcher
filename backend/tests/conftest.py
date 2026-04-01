"""Pytest fixtures for the job_searcher test suite."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import get_db
from app.job_posts.source_job_posts.supported_source_ingestion.ingest_supported_jobs.repository import (
    JobPostRepository,
)


@pytest.fixture
def mock_db():
    session = AsyncMock()
    session.commit = AsyncMock()
    session.flush = AsyncMock()
    session.refresh = AsyncMock()
    session.rollback = AsyncMock()
    return session


@pytest.fixture
def mock_repo():
    repo = AsyncMock(spec=JobPostRepository)
    # db is an instance attribute set in __init__; provide it explicitly
    repo.db = AsyncMock()
    repo.db.commit = AsyncMock()
    return repo


@pytest.fixture
async def async_client(mock_repo, mock_db):
    """HTTP test client with get_db and JobPostRepository overridden."""

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db

    # Patch JobPostRepository so API endpoints use mock_repo
    import app.job_posts.source_job_posts.supported_source_ingestion.ingest_supported_jobs.api as api_module
    original_repo_cls = api_module.JobPostRepository
    api_module.JobPostRepository = MagicMock(return_value=mock_repo)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client, mock_repo

    api_module.JobPostRepository = original_repo_cls
    app.dependency_overrides.clear()
