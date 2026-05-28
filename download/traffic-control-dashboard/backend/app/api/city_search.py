"""
API Router: City Search
GET /api/search/city?query={city_name}
Also supports ?q= for frontend compatibility.
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CitySearchResult
from app.crud import search_city

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/search", tags=["City Search"])


@router.get("/city", response_model=List[CitySearchResult])
async def search_city_endpoint(
    query: str = Query(..., alias="query", description="City or state name to search"),
    q: str = Query(None, description="Alternative query param (frontend compat)"),
    db: Session = Depends(get_db),
):
    """
    Search for Indian cities by name or state.
    Uses DimCity table first; falls back to Nominatim API if needed.
    """
    search_term = q if q else query
    results = search_city(db, search_term)

    # If still no results, try Nominatim as last resort
    if not results:
        try:
            from app.services.nominatim_service import geocode_city
            geo = await geocode_city(search_term)
            if geo:
                results = [CitySearchResult(
                    name=search_term.title(),
                    state="India",
                    lat=geo["lat"],
                    lon=geo["lon"],
                    bounding_box=geo.get("bounding_box"),
                )]
        except Exception as exc:
            logger.warning("Nominatim fallback failed: %s", exc)

    return results
