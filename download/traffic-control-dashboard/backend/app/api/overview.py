"""
API Router: Overview
GET /api/overview  — aggregated dashboard KPIs + insights + events + metrics
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    OverviewResponse, TrafficInsightResponse, EventResponse,
    DepartmentInfo, KeyMetricsResponse, CitySummaryResponse,
)
from app.crud import (
    get_overview_stats, get_traffic_insights, get_recent_events,
    get_key_metrics, get_city_summary,
)

router = APIRouter(prefix="/api", tags=["Overview"])


@router.get("/overview", response_model=OverviewResponse)
def get_overview(db: Session = Depends(get_db)):
    """Return the full dashboard overview payload."""
    stats = get_overview_stats(db)
    insights = get_traffic_insights(db)
    events = get_recent_events(db)
    metrics = get_key_metrics(db)

    departments = [
        DepartmentInfo(name="Traffic Police", status="In Progress", icon="shield"),
        DepartmentInfo(name="Ambulance", status="Dispatched", icon="heart-pulse"),
        DepartmentInfo(name="Fire Brigade", status="Notified", icon="flame"),
        DepartmentInfo(name="Municipal Corp", status="Triggered", icon="building-2"),
        DepartmentInfo(name="Highway Patrol", status="In Progress", icon="siren"),
        DepartmentInfo(name="RTO", status="Resolved", icon="file-check"),
    ]

    return OverviewResponse(
        insights=insights,
        events=events,
        departments=departments,
        metrics=metrics,
        summary=None,  # filled when a city is selected via /city-summary
    )
