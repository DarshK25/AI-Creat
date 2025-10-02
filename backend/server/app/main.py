from fastapi import FastAPI
from app.core.config import settings
from app.db.session import create_db_and_tables
from app.api.v1.api import api_router
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="AI CREAT - API",
    version="1.1.0",
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

app.include_router(api_router, prefix=settings.API_V1_STR)
