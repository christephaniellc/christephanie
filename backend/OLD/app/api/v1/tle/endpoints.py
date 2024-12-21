from fastapi import APIRouter

from app.services import orbit as orbit_service
from app.services.orbit import (
    plot_positions,
)

tle_router = APIRouter(prefix="/tle")


@tle_router.post("/plot_positions", tags=["tle"])
async def plot_tle_positions(tle_positions: dict[str, list[dict]]):
    return plot_positions(tle_positions)


@tle_router.get("", tags=["tle"])
async def get_tles_from_spacetrack():
    tles = await orbit_service.get_spacetrack_tles()
    return tles
