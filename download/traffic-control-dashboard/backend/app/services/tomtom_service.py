"""
TomTom Traffic API Service — Stub/Placeholder
Ready for integration when API key is available.
"""

import os
import logging
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY", "")
TOMTOM_BASE_URL = "https://api.tomtom.com/traffic/services/4.0"


async def get_traffic_flow(lat: float, lon: float, zoom: int = 10) -> Optional[dict]:
    """
    Get real-time traffic flow data from TomTom API.
    Requires TOMTOM_API_KEY environment variable.

    Returns traffic flow data or None if API key is not configured.
    """
    if not TOMTOM_API_KEY:
        logger.info("TomTom API key not configured. Skipping traffic flow request.")
        return None

    try:
        url = f"{TOMTOM_BASE_URL}/flowSegmentData/absolute/{zoom}/json"
        params = {
            "key": TOMTOM_API_KEY,
            "point": f"{lat},{lon}",
            "unit": "KMPH",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()

    except Exception as exc:
        logger.warning("TomTom API error: %s", exc)
        return None


async def get_incident_data(
    bbox_west: float, bbox_south: float,
    bbox_east: float, bbox_north: float,
) -> Optional[dict]:
    """
    Get traffic incident data from TomTom for a bounding box.
    Requires TOMTOM_API_KEY environment variable.
    """
    if not TOMTOM_API_KEY:
        logger.info("TomTom API key not configured. Skipping incident request.")
        return None

    try:
        url = f"{TOMTOM_BASE_URL}/incidentDetails"
        params = {
            "key": TOMTOM_API_KEY,
            "bbox": f"{bbox_west},{bbox_south},{bbox_east},{bbox_north}",
            "fields": "{incidents{type,geometry{type,coordinates},properties{id,from,to,delay,length,cause,iconCategory}}}",
            "language": "en-IN",
            "t": "true",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()

    except Exception as exc:
        logger.warning("TomTom incident API error: %s", exc)
        return None
