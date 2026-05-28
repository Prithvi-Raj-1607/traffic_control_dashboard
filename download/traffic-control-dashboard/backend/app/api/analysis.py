"""
API Router: Analysis
GET /api/analysis/violations   — violation analysis chart data
GET /api/violation-analysis    — frontend-compatible shortcut
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ViolationAnalysisResponse
from app.crud import get_violation_analysis

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])
shortcut_router = APIRouter(tags=["Analysis Shortcuts"])


@router.get("/violations", response_model=ViolationAnalysisResponse)
def violation_analysis(db: Session = Depends(get_db)):
    """Return violation analysis grouped by type, severity, vehicle, road, age, license."""
    return get_violation_analysis(db)


@shortcut_router.get("/api/violation-analysis", response_model=ViolationAnalysisResponse)
def violation_analysis_shortcut(db: Session = Depends(get_db)):
    return get_violation_analysis(db)
