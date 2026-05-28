"""
API Router: Simulate
POST /api/simulate/tick   — generate random traffic violations
POST /api/simulate-tick   — frontend shortcut
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SimulateTickResponse
from app.crud import simulate_tick

router = APIRouter(prefix="/api/simulate", tags=["Simulate"])
shortcut_router = APIRouter(tags=["Simulate Shortcuts"])


@router.post("/tick", response_model=SimulateTickResponse)
def simulate_tick_endpoint(db: Session = Depends(get_db)):
    """Add 5-20 simulated traffic violation records per tick."""
    return simulate_tick(db)


@shortcut_router.post("/api/simulate-tick", response_model=SimulateTickResponse)
def simulate_tick_shortcut(db: Session = Depends(get_db)):
    return simulate_tick(db)
