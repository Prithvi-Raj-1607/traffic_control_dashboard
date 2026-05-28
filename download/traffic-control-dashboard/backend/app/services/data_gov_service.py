"""
Data.gov.in Integration Service — Stub/Placeholder
Function to fetch open government datasets if available.
"""

import os
import logging
from typing import Optional, List, Dict

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "")
DATA_GOV_BASE_URL = "https://api.data.gov.in/resource"


# Known data.gov.in dataset IDs related to traffic/transport
DATASET_IDS = {
    "road_accidents": "3b01b785-6c2a-4225-9ab1-e5c42a1f12e4",
    "vehicle_registration": "c5a3d3a0-0e6a-4b8e-9c2e-5d4a6c8e0f12",
    "road_network": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
}


async def fetch_road_accident_data(
    limit: int = 100,
    offset: int = 0,
    filters: Optional[Dict] = None,
) -> Optional[List[dict]]:
    """
    Fetch road accident statistics from data.gov.in.
    Requires DATA_GOV_API_KEY environment variable.

    Returns list of accident records or None if API key is not configured.
    """
    if not DATA_GOV_API_KEY:
        logger.info("data.gov.in API key not configured. Skipping dataset request.")
        return None

    dataset_id = DATASET_IDS["road_accidents"]

    try:
        params = {
            "api-key": DATA_GOV_API_KEY,
            "format": "json",
            "limit": limit,
            "offset": offset,
        }
        if filters:
            params.update(filters)

        url = f"{DATA_GOV_BASE_URL}/{dataset_id}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        records = data.get("records", [])
        logger.info("Fetched %d records from data.gov.in", len(records))
        return records

    except Exception as exc:
        logger.warning("data.gov.in API error: %s", exc)
        return None


async def fetch_vehicle_stats(state: Optional[str] = None) -> Optional[List[dict]]:
    """
    Fetch vehicle registration statistics from data.gov.in.
    Optionally filter by state name.
    """
    if not DATA_GOV_API_KEY:
        logger.info("data.gov.in API key not configured. Skipping vehicle stats.")
        return None

    dataset_id = DATASET_IDS["vehicle_registration"]

    try:
        params = {
            "api-key": DATA_GOV_API_KEY,
            "format": "json",
            "limit": 100,
        }
        if state:
            params["filters[state_name]"] = state

        url = f"{DATA_GOV_BASE_URL}/{dataset_id}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json().get("records", [])

    except Exception as exc:
        logger.warning("data.gov.in vehicle stats error: %s", exc)
        return None
