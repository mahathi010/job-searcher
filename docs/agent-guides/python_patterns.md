# Python Runtime Patterns & Pitfalls

> Source of truth for Python/FastAPI/SQLAlchemy/Pydantic patterns.

## 1. Async SQLAlchemy Session Configuration
- Use `create_async_engine()`, NOT `create_engine()`
- `expire_on_commit=False` on sessions (prevents MissingGreenlet crash)
- Session factory: `async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)`
- Always use `async with async_session() as session:` context manager
- SQLAlchemy 2.x syntax: `await session.execute(select(Model).where(...))` + `.scalars().all()`

## 2. Pydantic v2 Compatibility
- `model_config = {"from_attributes": True}` (NOT `class Config: orm_mode = True`)
- `Optional[X]` fields need `= None` default to be truly optional
- **NEVER** use `from __future__ import annotations` with Pydantic models
- Use `@field_validator` / `@model_validator` (NOT v1 `@validator` / `@root_validator`)

## 3. Alembic env.py Configuration
```python
import os
if os.environ.get("DATABASE_URL"):
    config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])
```
- `target_metadata` must import `Base.metadata` from app database module

## 4. Datetime Handling
- `datetime.now(timezone.utc)` — NOT `datetime.utcnow()` (deprecated 3.12+)
- SQLAlchemy defaults: `default=lambda: datetime.now(timezone.utc)`

## 5. Import Structure (Circular Import Prevention)
```
core/database.py -> models.py -> schema.py -> repository.py -> service.py -> api.py
```
- Use `TYPE_CHECKING` guard for cross-layer type hints

## 6. Testing
- `asyncio_mode = "auto"` in pytest config
- `httpx.AsyncClient` with `ASGITransport(app=app)` for async endpoint tests
- `AsyncMock` for mocking async functions

## 7. Docker Build Hygiene
- `backend/.dockerignore`: `.venv/`, `__pycache__/`, `.env`, `.git/`, `*.pyc`

## 8. Alembic Migration Enums
Use raw SQL + `postgresql.ENUM(create_type=False)`:
```python
op.execute("CREATE TYPE my_enum AS ENUM ('val_a', 'val_b')")
sa.Column("status", ENUM("val_a", "val_b", name="my_enum", create_type=False))
```

## 9. SQLAlchemy Enum Column Pitfall
Always use `values_callable=lambda x: [e.value for e in x]` on Enum() columns.

## 10. Entry Point
- Entry: `backend/app/main.py`
- Dockerfile CMD: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Use `psycopg[binary,asyncio]>=3.1.0`
- Use `lifespan` context manager, NOT `@app.on_event("startup")`
