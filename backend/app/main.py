"""job_searcher service entry point."""

from fastapi import FastAPI

app = FastAPI(title="job_searcher")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "job_searcher"}
