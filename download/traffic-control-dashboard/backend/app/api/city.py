"""
API Router: City Summary & Popular Cities
GET /api/city-summary?city=     — city summary stats
GET /api/popular-cities         — top cities by violations
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CitySummaryResponse, PopularCity, CitySearchResult
from app.crud import get_city_summary, get_popular_cities, search_city

router = APIRouter(prefix="/api", tags=["City"])


@router.get("/city-summary", response_model=Optional[CitySummaryResponse])
def city_summary(
    city: str = Query(..., description="City name"),
    db: Session = Depends(get_db),
):
    """Return city-level summary with violations, accidents, risk score."""
    return get_city_summary(db, city)


@router.get("/popular-cities", response_model=List[PopularCity])
def popular_cities(db: Session = Depends(get_db)):
    """Return the most popular cities by violation count."""
    return get_popular_cities(db)


@router.get("/key-metrics")
def key_metrics_redirect(db: Session = Depends(get_db)):
    """Frontend-compatible: /api/key-metrics"""
    from app.crud import get_key_metrics
    return get_key_metrics(db)
