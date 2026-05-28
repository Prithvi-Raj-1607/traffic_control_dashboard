"""
API Router: Map
GET /api/map/india-risk   — India-level risk markers
GET /api/map/city-risk     — City-level risk points
Also registers frontend-compatible shortcuts:
GET /api/india-risk
GET /api/city-risk
"""

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RiskMarker
from app.crud import get_india_risk_markers, get_city_risk_points

router = APIRouter(prefix="/api/map", tags=["Map"])
shortcut_router = APIRouter(tags=["Map Shortcuts"])


@router.get("/india-risk", response_model=List[RiskMarker])
def india_risk(db: Session = Depends(get_db)):
    """Return India-level risk markers aggregated from DimCity + FactViolations."""
    return get_india_risk_markers(db)


@router.get("/city-risk", response_model=List[RiskMarker])
def city_risk(
    city: str = Query(..., description="City name"),
    db: Session = Depends(get_db),
):
    """Return city-level risk points from DimLocation + FactViolations."""
    return get_city_risk_points(db, city)


# ── Frontend-compatible shortcut routes ──

@shortcut_router.get("/api/india-risk", response_model=List[RiskMarker])
def india_risk_shortcut(db: Session = Depends(get_db)):
    return get_india_risk_markers(db)


@shortcut_router.get("/api/city-risk", response_model=List[RiskMarker])
def city_risk_shortcut(
    city: str = Query(..., description="City name"),
    db: Session = Depends(get_db),
):
    return get_city_risk_points(db, city)
