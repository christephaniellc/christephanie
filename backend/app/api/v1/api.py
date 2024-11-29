from fastapi import APIRouter, FastAPI

from app.api.v1.tle.endpoints import tle_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(tle_router)
