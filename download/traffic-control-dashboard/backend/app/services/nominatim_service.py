"""
Nominatim Geocoding Service
Async function to call OpenStreetMap Nominatim API for city geocoding.
Respects Nominatim rate-limit policy (1 request/second).
"""

import os
import logging
import asyncio
from typing import Optional, Dict, List

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

NOMINATIM_URL = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org/search")

# Simple in-memory cache for geocoded cities
_geocode_cache: Dict[str, dict] = {}

# Rate-limit lock
_last_request_time: float = 0.0
_rate_lock = asyncio.Lock()


async def geocode_city(city_name: str) -> Optional[dict]:
    """
    Geocode a city name using Nominatim.
    Returns dict with lat, lon, bounding_box or None.
    Respects Nominatim's 1-request-per-second policy.
    """
    # Check cache first
    cache_key = city_name.lower().strip()
    if cache_key in _geocode_cache:
        return _geocode_cache[cache_key]

    # Rate limit: ensure at least 1 second between requests
    async with _rate_lock:
        import time
        global _last_request_time
        now = time.monotonic()
        wait = max(0, 1.0 - (now - _last_request_time))
        if wait > 0:
            await asyncio.sleep(wait)
        _last_request_time = time.monotonic()

    params = {
        "q": f"{city_name}, India",
        "format": "json",
        "limit": 1,
        "countrycodes": "in",
    }

    headers = {
        "User-Agent": "TrafficControlDashboard/1.0 (educational project)",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(NOMINATIM_URL, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        if data and len(data) > 0:
            result = data[0]
            geo = {
                "lat": float(result["lat"]),
                "lon": float(result["lon"]),
                "display_name": result.get("display_name", ""),
                "bounding_box": [float(x) for x in result.get("boundingbox", [])],
            }
            _geocode_cache[cache_key] = geo
            return geo

    except httpx.HTTPStatusError as exc:
        logger.warning("Nominatim HTTP error for '%s': %s", city_name, exc)
    except httpx.RequestError as exc:
        logger.warning("Nominatim request error for '%s': %s", city_name, exc)
    except Exception as exc:
        logger.warning("Nominatim unexpected error for '%s': %s", city_name, exc)

    return None


async def geocode_city_with_fallback(city_name: str) -> dict:
    """
    Geocode a city; return a default Indian location if Nominatim fails.
    """
    result = await geocode_city(city_name)
    if result:
        return result
    # Fallback: center of India
    return {
        "lat": 20.5937,
        "lon": 78.9629,
        "display_name": f"{city_name}, India (approximate)",
        "bounding_box": [],
    }
