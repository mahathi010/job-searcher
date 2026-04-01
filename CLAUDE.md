# CLAUDE.md

## Project: job_searcher

**Tech Stack:** Python 3.11
**Scaffold Type:** Backend service

## Scaffold Structure

```
  backend/
  backend/app/
  backend/app/core/
  backend/tests/
  backend/tests/unit/
  backend/migrations/
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

# Docker
docker-compose up -d
```
