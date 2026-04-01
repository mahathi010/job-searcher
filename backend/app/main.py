"""job_searcher service entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.database import engine
from app.job_posts.source_job_posts.supported_source_ingestion.ingest_supported_jobs.api import router as job_posts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(title="job_searcher", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(job_posts_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "job_searcher"}
