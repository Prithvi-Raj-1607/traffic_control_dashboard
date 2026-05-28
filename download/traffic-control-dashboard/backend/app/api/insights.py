"""
API Router: Traffic Insights
GET /api/traffic-insights — vehicle count, avg speed, violations with hourly trends
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import TrafficInsightResponse
from app.crud import get_traffic_insights

router = APIRouter(prefix="/api", tags=["Insights"])


@router.get("/traffic-insights", response_model=TrafficInsightResponse)
def traffic_insights(db: Session = Depends(get_db)):
    """Return current traffic insights with trend data."""
    return get_traffic_insights(db)
