"""
API Router: Events
GET /api/events/recent   — recent traffic events with severity & department status
GET /api/recent-events   — frontend-compatible shortcut
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import EventResponse
from app.crud import get_recent_events

router = APIRouter(prefix="/api/events", tags=["Events"])
shortcut_router = APIRouter(tags=["Events Shortcuts"])


@router.get("/recent", response_model=List[EventResponse])
def recent_events(db: Session = Depends(get_db)):
    """Return recent traffic events with severity and emergency status."""
    return get_recent_events(db)


@shortcut_router.get("/api/recent-events", response_model=List[EventResponse])
def recent_events_shortcut(db: Session = Depends(get_db)):
    return get_recent_events(db)
