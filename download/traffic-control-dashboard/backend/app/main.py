"""
FastAPI application — Traffic Control Intelligence Dashboard Backend
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.cache import clear_all_caches

logger = logging.getLogger(__name__)


# ── Lifespan ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("  Traffic Control Intelligence Dashboard — Backend Starting")
    logger.info("=" * 60)
    yield
    logger.info("Backend shutting down.")
    clear_all_caches()


# ── App ──
app = FastAPI(
    title="Traffic Control Intelligence Dashboard",
    description="FastAPI backend for India traffic violation analytics, ML mining, and real-time monitoring.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS (allow all for development) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Root & Health ──

@app.get("/")
def root():
    return {
        "project": "Traffic Control Intelligence Dashboard",
        "version": "1.0.0",
        "description": "India traffic violation analytics with ML-powered insights",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    from app.database import is_db_available
    return {
        "status": "ok",
        "database": "connected" if is_db_available() else "csv_fallback",
        "timestamp": _now_iso(),
    }


# ── Include API Routers ──

from app.api.overview import router as overview_router
from app.api.city_search import router as city_search_router
from app.api.map import router as map_router, shortcut_router as map_shortcut
from app.api.insights import router as insights_router
from app.api.events import router as events_router, shortcut_router as events_shortcut
from app.api.analysis import router as analysis_router, shortcut_router as analysis_shortcut
from app.api.mining import router as mining_router, shortcut_router as mining_shortcut
from app.api.weather import router as weather_router, shortcut_router as weather_shortcut
from app.api.simulate import router as simulate_router, shortcut_router as simulate_shortcut
from app.api.city import router as city_router

app.include_router(overview_router)
app.include_router(city_search_router)
app.include_router(map_router)
app.include_router(map_shortcut)
app.include_router(insights_router)
app.include_router(events_router)
app.include_router(events_shortcut)
app.include_router(analysis_router)
app.include_router(analysis_shortcut)
app.include_router(mining_router)
app.include_router(mining_shortcut)
app.include_router(weather_router)
app.include_router(weather_shortcut)
app.include_router(simulate_router)
app.include_router(simulate_shortcut)
app.include_router(city_router)


# ── WebSocket for live updates ──

import asyncio
import json
from datetime import datetime

connected_clients: list[WebSocket] = []


@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    """
    WebSocket endpoint for live dashboard updates.
    Sends a tick of simulated data every 5 seconds.
    Falls back gracefully if client disconnects.
    """
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            from app.crud import get_traffic_insights
            insights = get_traffic_insights(None)
            payload = {
                "type": "tick",
                "data": insights.model_dump(),
                "timestamp": _now_iso(),
            }
            await websocket.send_json(payload)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as exc:
        logger.warning("WebSocket error: %s", exc)
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)


def _now_iso() -> str:
    return datetime.utcnow().isoformat()
