"""
API Router: Weather
GET /api/weather/current?lat=&lon=  — current weather from Open-Meteo
GET /api/weather?lat=&lon=          — frontend shortcut
"""

import logging

from fastapi import APIRouter, Query
from app.schemas import WeatherResponse
from app.cache import cache_get, cache_set, weather_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/weather", tags=["Weather"])
shortcut_router = APIRouter(tags=["Weather Shortcuts"])


async def _fetch_weather(lat: float, lon: float) -> WeatherResponse:
    """Internal helper that caches and fetches weather."""
    cache_key = f"weather_{lat:.2f}_{lon:.2f}"
    cached = cache_get(weather_cache, cache_key)
    if cached:
        return cached

    try:
        from app.services.open_meteo_service import get_current_weather
        result = await get_current_weather(lat, lon)
    except Exception as exc:
        logger.warning("Open-Meteo call failed: %s", exc)
        result = WeatherResponse(
            temperature=28.0, humidity=55.0,
            condition="Clear", windSpeed=12.0, visibility=10.0,
        )

    cache_set(weather_cache, cache_key, result)
    return result


@router.get("/current", response_model=WeatherResponse)
async def weather_current(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Get current weather for given lat/lon using Open-Meteo API."""
    return await _fetch_weather(lat, lon)


@shortcut_router.get("/api/weather", response_model=WeatherResponse)
async def weather_shortcut(
    lat: float = Query(...),
    lon: float = Query(...),
):
    return await _fetch_weather(lat, lon)
