# CLAUDE.md

## Project: job_searcher

**Tech Stack:** Python 3.11
**Scaffold Type:** Backend service

## Scaffold Structure

```
  backend/
  backend/app/
  backend/app/core/
  backend/app/job_posts/source_job_posts/supported_source_ingestion/ingest_supported_jobs/
  backend/tests/
  backend/tests/unit/
  backend/migrations/
  backend/migrations/versions/
  scripts/
  docs/
  docs/agent-guides/
```

## Module Pattern

Each feature gets its own subdirectory under the capability folder:

| File | Location |
|------|----------|
| `models.py` | `backend/app/job_searcher/<feature>/` |
| `schema.py` | `backend/app/job_searcher/<feature>/` |
| `repository.py` | `backend/app/job_searcher/<feature>/` |
| `service.py` | `backend/app/job_searcher/<feature>/` |
| `api.py` | `backend/app/job_searcher/<feature>/` |
| `__init__.py` | `backend/app/job_searcher/<feature>/` |
| `test_*_service.py` | `backend/tests/unit/` |

Each feature folder has short file names (`models.py`, not `feature_models.py`).

## Conventions

- **Naming Style:** `snake_case for all files and folders`
- **Layout:** `feature subdirectories under backend/app/ capability folder (backend/app/{cap}/feature_name/models.py)`
- **Test Pattern:** `test_*.py`
- **Model Pattern:** `<feature>/models.py`
- **Schema Pattern:** `<feature>/schema.py`
- **Api Pattern:** `<feature>/api.py`
- **Service Pattern:** `<feature>/service.py`
- **Repository Pattern:** `<feature>/repository.py`
- **Reference Doc:** `CONVENTIONS.md at project root`

## API Reference — /v1/job-posts

| Method | Path | Status | Purpose |
|--------|------|--------|---------|
| `POST` | `/v1/job-posts/ingest` | 201 | Ingest list of supported job posts |
| `GET` | `/v1/job-posts/` | 200 | List active relevant job posts (filtered + paginated) |
| `GET` | `/v1/job-posts/{id}` | 200 | Retrieve single normalized job post |
| `PUT` | `/v1/job-posts/{id}` | 200 | Update editable normalized fields |
| `POST` | `/v1/job-posts/{id}/deactivate` | 200 | Deactivate a job post |
| `DELETE` | `/v1/job-posts/{id}` | 204 | Soft-delete a job post |

## Data Model — JobPost

| Field | Type | Mutable | Notes |
|-------|------|---------|-------|
| `id` | UUID | — | PK |
| `title` | String(500) | yes | |
| `company` | String(255) | yes | |
| `location` | String(255)? | yes | |
| `remote_status` | Enum | yes | remote/hybrid/onsite/unknown |
| `experience` | Enum | yes | junior/mid/senior/lead/unknown |
| `job_type` | Enum | yes | full_time/part_time/contract/internship/unknown |
| `main_skillset` | String(100)? | yes | |
| `skills` | JSONB | yes | list of strings |
| `sponsorship` | Enum | yes | yes/no/unknown |
| `posted_date` | Date? | yes | |
| `mandatory_requirements_summary` | Text? | yes | |
| `source_attribution` | Enum | **NO** | linkedin/indeed/dice/company_site |
| `posting_link` | String(2000)? | **NO** | |
| `relevance_outcome` | Enum | **NO** | ai/ds/ml/excluded |
| `lifecycle_status` | Enum | via actions | active/deactivated/deleted |
| `created_at` | DateTime TZ | — | auto |
| `updated_at` | DateTime TZ | — | auto |

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql+psycopg://postgres:postgres@localhost:5432/job_searcher` | Async PostgreSQL DSN |
| `APP_NAME` | `job_searcher` | Application name |
| `APP_ENV` | `development` | Environment |
| `APP_PORT` | `8000` | Listen port |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |

## Reference

See `CONVENTIONS.md` at the project root for the full 6-file module
pattern, naming conventions, import patterns, and code snippets.

## Reference Guides

The `docs/agent-guides/` directory contains critical implementation references:

| File | Contents |
|------|----------|
| `python_patterns.md` | Async SQLAlchemy, Pydantic v2, Alembic pitfalls |
| `docker_compose_reference.md` | Docker Compose template and networking rules |
| `validation_checklist.md` | Post-implementation verification checklist |
| `api_contract_spec.md` | OpenAPI 3.0 contract format specification |
| `claude_md_template.md` | CLAUDE.md required sections and format |

**Read these files before implementing.** They contain fixes for common
runtime failures (MissingGreenlet, PydanticSchemaGenerationError, etc.).

## Commands

```bash
# Run service (from backend/ directory)
cd backend && uvicorn app.main:app --reload

# Run tests (from backend/ directory)
cd backend && pytest tests/ -v

# Run migrations (from backend/ directory)
cd backend && PYTHONPATH=. alembic upgrade head

# Docker
docker-compose up -d
```
