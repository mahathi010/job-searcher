# job_searcher

A backend service that ingests job postings from supported sources, normalizes them into consistent records, classifies them for AI/DS/ML relevance, and exposes them through a REST API for retrieval, filtering, and lifecycle management.

## Setup


### Local (without Docker)

1. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Set the database URL in `.env`:
   ```
   DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/job_searcher
   ```

4. Run migrations:
   ```bash
   cd backend && PYTHONPATH=. alembic upgrade head
   ```

5. Start the service:
   ```bash
   cd backend && uvicorn app.main:app --reload
   ```

The API is available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Docker

```bash
docker-compose up -d
```


This starts:
- `db` — PostgreSQL 16 on port `5440`
- `migrate` — runs `alembic upgrade head` once
- `backend` — FastAPI service on port `8000`

## Running Tests

```bash
cd backend && pytest tests/ -v
```

## API Overview

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v1/job-posts/ingest` | Ingest list of supported job posts |
| `GET` | `/v1/job-posts/` | List active relevant job posts |
| `GET` | `/v1/job-posts/{id}` | Retrieve single job post |
| `PUT` | `/v1/job-posts/{id}` | Update editable fields |
| `POST` | `/v1/job-posts/{id}/deactivate` | Deactivate a job post |
| `DELETE` | `/v1/job-posts/{id}` | Soft-delete a job post |

See `api_contract.json` at the project root for the full OpenAPI 3.0 contract.

## Frontend

The frontend is a React 18 + TypeScript + Vite app located in `frontend/`.

### Local development

The backend and frontend run independently. Start both:

```bash
# Terminal 1 — Backend (from repo root)
cd backend && uvicorn app.main:app --reload
# API available at http://localhost:8000

# Terminal 2 — Frontend (from repo root)
cd frontend && npm install && npm run dev
# UI available at http://localhost:5173
```

The Vite dev server proxies `/health` and `/v1/*` requests to `http://localhost:8000`, so no `VITE_API_URL` is needed locally.

### Environment variables

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `""` | Backend origin. Empty = use Vite proxy (local dev). Set to `http://localhost:8000` for production builds. |

### Troubleshooting

- **404 on `http://localhost:8000/`** — expected. The backend serves only the API (`/v1/*`, `/health`), not the UI. Open `http://localhost:5173` for the frontend.
- **Network errors in the UI** — confirm the backend is running on port 8000.

## Project Structure


- `backend/` — All backend code (app, tests, migrations)
- `backend/app/core/` — Database engine, session, exceptions
- `backend/app/job_posts/` — job_posts capability module
- `backend/migrations/` — Alembic migration scripts
- `docs/` — Architecture documentation
- `scripts/` — Utility scripts
- `api_contract.json` — OpenAPI 3.0 contract

See `CONVENTIONS.md` at the project root for the 6-file module pattern.

