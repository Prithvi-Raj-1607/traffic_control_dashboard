"""
Database CRUD operations with CSV fallback.
Every function first attempts to query MySQL; if the DB is unavailable
or returns no data, it falls back to reading CSV files from data/.
"""

import os
import logging
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

import pandas as pd
from sqlalchemy import text, func
from sqlalchemy.orm import Session

from app.database import is_db_available, ensure_engine
from app.schemas import (
    OverviewResponse, CitySearchResult, RiskMarker, CityRiskPoint,
    CitySummaryResponse, PopularCity, TrafficInsightResponse,
    EventResponse, DepartmentInfo, KeyMetricsResponse,
    ViolationAnalysisResponse, ViolationCountItem, ViolationAgeGroupItem,
    ViolationGenderItem, FineByTypeItem, RepeatOffenderItem,
    AssociationRuleResponse, ClusterResultResponse,
    WeatherResponse, SimulateTickResponse,
)
from app.cache import (
    cache_get, cache_set, dashboard_cache, city_search_cache,
    map_cache, analysis_cache, ml_cache, events_cache,
)

logger = logging.getLogger(__name__)

# ── Paths ──
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

# ── CSV helpers ──

def _csv_path(name: str) -> str:
    return os.path.join(DATA_DIR, name)


def _read_csv(name: str) -> Optional[pd.DataFrame]:
    """Read a CSV from data/; return None if missing."""
    path = _csv_path(name)
    if os.path.exists(path):
        try:
            return pd.read_csv(path)
        except Exception as exc:
            logger.warning("Failed to read %s: %s", path, exc)
    return None


def _load_violations() -> pd.DataFrame:
    """Load the main violations dataset from any available CSV."""
    for name in ("cleaned_traffic_violations.csv", "raw_traffic_violations.csv"):
        df = _read_csv(name)
        if df is not None and not df.empty:
            return df
    return pd.DataFrame()


def _load_cities() -> pd.DataFrame:
    for name in ("city_master.csv", "dim_city.csv"):
        df = _read_csv(name)
        if df is not None and not df.empty:
            return df
    return pd.DataFrame()


# ────────────────────────────────────────────
# OVERVIEW
# ────────────────────────────────────────────

def get_overview_stats(db: Optional[Session]) -> dict:
    """
    Return high-level dashboard KPIs.
    Keys: total_violations, total_fine_collected, total_drivers,
          total_vehicles, accident_violations, high_risk_locations,
          most_common_violation, average_fine, last_updated
    """
    cache_key = "overview_stats"
    cached = cache_get(dashboard_cache, cache_key)
    if cached:
        return cached

    result = None

    # ── Try MySQL ──
    if db is not None and is_db_available():
        try:
            row = db.execute(text("""
                SELECT
                    COUNT(*) AS total_violations,
                    COALESCE(SUM(fine_amount), 0) AS total_fine_collected,
                    COUNT(DISTINCT driver_key) AS total_drivers,
                    COUNT(DISTINCT vehicle_key) AS total_vehicles,
                    SUM(CASE WHEN accident_involved = 1 THEN 1 ELSE 0 END) AS accident_violations,
                    0 AS high_risk_locations,
                    (SELECT violation_type FROM fact_violations
                     GROUP BY violation_type ORDER BY COUNT(*) DESC LIMIT 1) AS most_common_violation,
                    COALESCE(AVG(fine_amount), 0) AS average_fine
                FROM fact_violations
            """)).mappings().first()

            if row and row["total_violations"]:
                # High-risk locations from dim_location
                hr = db.execute(text(
                    "SELECT COUNT(*) AS c FROM dim_location WHERE risk_zone = 'High'"
                )).scalar() or 0
                result = {
                    "total_violations": int(row["total_violations"]),
                    "total_fine_collected": float(row["total_fine_collected"]),
                    "total_drivers": int(row["total_drivers"]),
                    "total_vehicles": int(row["total_vehicles"]),
                    "accident_violations": int(row["accident_violations"]),
                    "high_risk_locations": int(hr),
                    "most_common_violation": row["most_common_violation"] or "N/A",
                    "average_fine": round(float(row["average_fine"]), 2),
                    "last_updated": datetime.utcnow().isoformat(),
                }
        except Exception as exc:
            logger.warning("DB query failed for overview: %s", exc)

    # ── CSV fallback ──
    if result is None:
        df = _load_violations()
        if not df.empty:
            violation_col = _pick_col(df, ["violation_type", "Violation_Type", "type"])
            fine_col = _pick_col(df, ["fine_amount", "Fine_Amount", "fine"])
            accident_col = _pick_col(df, ["accident_involved", "Accident_Involved", "accident"])
            mcv = df[violation_col].mode().iloc[0] if violation_col else "N/A"
            result = {
                "total_violations": len(df),
                "total_fine_collected": float(df[fine_col].sum()) if fine_col else 0,
                "total_drivers": int(df.get("driver_id", df.get("Driver_ID", pd.Series(range(len(df))))).nunique()),
                "total_vehicles": int(df.get("vehicle_id", df.get("Vehicle_ID", pd.Series(range(len(df))))).nunique()),
                "accident_violations": _count_accidents(df, accident_col),
                "high_risk_locations": 42,
                "most_common_violation": str(mcv),
                "average_fine": round(float(df[fine_col].mean()), 2) if fine_col else 0,
                "last_updated": datetime.utcnow().isoformat(),
            }
        else:
            result = _default_overview()

    cache_set(dashboard_cache, cache_key, result)
    return result


def _default_overview() -> dict:
    return {
        "total_violations": 487650,
        "total_fine_collected": 382450000,
        "total_drivers": 189432,
        "total_vehicles": 156789,
        "accident_violations": 12456,
        "high_risk_locations": 42,
        "most_common_violation": "Overspeeding",
        "average_fine": 784.50,
        "last_updated": datetime.utcnow().isoformat(),
    }


# ────────────────────────────────────────────
# CITY SEARCH
# ────────────────────────────────────────────

def search_city(db: Optional[Session], query: str) -> List[CitySearchResult]:
    cache_key = f"city_search_{query.lower()}"
    cached = cache_get(city_search_cache, cache_key)
    if cached:
        return cached

    results: List[CitySearchResult] = []

    # ── Try MySQL ──
    if db is not None and is_db_available():
        try:
            rows = db.execute(text("""
                SELECT city_id, city_name, state_name, latitude, longitude,
                       population_category, traffic_density_level
                FROM dim_city
                WHERE city_name LIKE :q OR state_name LIKE :q
                ORDER BY city_name
                LIMIT 20
            """), {"q": f"%{query}%"}).mappings().all()

            for r in rows:
                results.append(CitySearchResult(
                    name=r["city_name"],
                    state=r["state_name"],
                    lat=float(r["latitude"] or 0),
                    lon=float(r["longitude"] or 0),
                    population=0,
                    totalViolations=0,
                    totalAccidents=0,
                    riskScore=0,
                    city_id=r["city_id"],
                    population_category=r["population_category"],
                    traffic_density_level=r["traffic_density_level"],
                ))
        except Exception as exc:
            logger.warning("DB query failed for city search: %s", exc)

    # ── CSV fallback ──
    if not results:
        df = _load_cities()
        if not df.empty:
            name_col = _pick_col(df, ["city_name", "City_Name", "name", "Name"])
            state_col = _pick_col(df, ["state_name", "State_Name", "state", "State"])
            lat_col = _pick_col(df, ["latitude", "Latitude", "lat"])
            lon_col = _pick_col(df, ["longitude", "Longitude", "lon"])
            pop_col = _pick_col(df, ["population", "Population"])
            id_col = _pick_col(df, ["city_id", "City_ID"])

            if name_col:
                mask = df[name_col].str.contains(query, case=False, na=False)
                if state_col:
                    mask |= df[state_col].str.contains(query, case=False, na=False)
                matches = df[mask].head(20)
                for _, r in matches.iterrows():
                    results.append(CitySearchResult(
                        name=str(r.get(name_col, "")),
                        state=str(r.get(state_col, "")) if state_col else "",
                        lat=float(r.get(lat_col, 0) or 0) if lat_col else 0,
                        lon=float(r.get(lon_col, 0) or 0) if lon_col else 0,
                        population=int(r.get(pop_col, 0) or 0) if pop_col else 0,
                        totalViolations=0,
                        totalAccidents=0,
                        riskScore=0,
                        city_id=str(r.get(id_col, "")) if id_col else None,
                        population_category=str(r.get("population_category", "")) if "population_category" in r else None,
                        traffic_density_level=str(r.get("traffic_density_level", "")) if "traffic_density_level" in r else None,
                    ))

    # ── Hardcoded fallback ──
    if not results:
        results = _default_city_search(query)

    cache_set(city_search_cache, cache_key, results)
    return results


def _default_city_search(query: str) -> List[CitySearchResult]:
    from app.utils.generate_dataset import CITY_DATA
    q = query.lower()
    return [
        CitySearchResult(
            name=c["name"], state=c["state"],
            lat=c["lat"], lon=c["lon"],
            population=c.get("population", 0),
            totalViolations=c.get("totalViolations", 0),
            totalAccidents=c.get("totalAccidents", 0),
            riskScore=c.get("riskScore", 0),
        )
        for c in CITY_DATA
        if q in c["name"].lower() or q in c["state"].lower()
    ]


# ────────────────────────────────────────────
# INDIA RISK MARKERS (Map)
# ────────────────────────────────────────────

def get_india_risk_markers(db: Optional[Session]) -> List[RiskMarker]:
    cache_key = "india_risk"
    cached = cache_get(map_cache, cache_key)
    if cached:
        return cached

    markers: List[RiskMarker] = []

    # ── Try MySQL ──
    if db is not None and is_db_available():
        try:
            rows = db.execute(text("""
                SELECT
                    c.city_name, c.state_name, c.latitude, c.longitude,
                    COUNT(v.violation_key) AS total_violations,
                    SUM(CASE WHEN v.accident_involved = 1 THEN 1 ELSE 0 END) AS accident_count,
                    AVG(v.fine_amount) AS avg_fine,
                    AVG(v.average_speed) AS avg_speed,
                    (SELECT v2.violation_type FROM fact_violations v2
                     JOIN dim_location l2 ON v2.location_key = l2.location_key
                     JOIN dim_city c2 ON l2.city_key = c2.city_key
                     WHERE c2.city_name = c.city_name
                     GROUP BY v2.violation_type ORDER BY COUNT(*) DESC LIMIT 1) AS top_violation
                FROM dim_city c
                LEFT JOIN dim_location l ON l.city_key = c.city_key
                LEFT JOIN fact_violations v ON v.location_key = l.location_key
                GROUP BY c.city_key
                ORDER BY total_violations DESC
            """)).mappings().all()

            for i, r in enumerate(rows):
                tv = int(r["total_violations"] or 0)
                ac = int(r["accident_count"] or 0)
                risk = _calc_risk_score(tv, ac)
                markers.append(RiskMarker(
                    id=f"city_{i}",
                    lat=float(r["latitude"] or 0),
                    lon=float(r["longitude"] or 0),
                    state=r["state_name"] or "",
                    city=r["city_name"] or "",
                    riskScore=risk,
                    riskLevel=_risk_level(risk),
                    totalViolations=tv,
                    accidentCount=ac,
                    mostCommonViolation=r["top_violation"] or "N/A",
                    avgFine=round(float(r["avg_fine"] or 0), 2),
                    avgSpeed=round(float(r["avg_speed"] or 0), 1),
                ))
        except Exception as exc:
            logger.warning("DB query failed for india risk: %s", exc)

    # ── CSV fallback ──
    if not markers:
        markers = _default_india_risk()

    cache_set(map_cache, cache_key, markers)
    return markers


def _default_india_risk() -> List[RiskMarker]:
    """Hardcoded default risk markers matching the frontend mock data."""
    from app.utils.generate_dataset import INDIA_RISK_MARKERS
    return [
        RiskMarker(
            id=m["id"], lat=m["lat"], lon=m["lon"],
            state=m["state"], city=m["city"], area=m.get("area"),
            riskScore=m["riskScore"], riskLevel=m["riskLevel"],
            totalViolations=m["totalViolations"], accidentCount=m["accidentCount"],
            mostCommonViolation=m["mostCommonViolation"],
            roadType=m.get("roadType"), avgFine=m.get("avgFine"),
            avgSpeed=m.get("avgSpeed"), weather=m.get("weather"),
        )
        for m in INDIA_RISK_MARKERS
    ]


# ────────────────────────────────────────────
# CITY RISK POINTS
# ────────────────────────────────────────────

def get_city_risk_points(db: Optional[Session], city: str) -> List[RiskMarker]:
    cache_key = f"city_risk_{city.lower()}"
    cached = cache_get(map_cache, cache_key)
    if cached:
        return cached

    markers: List[RiskMarker] = []

    # ── Try MySQL ──
    if db is not None and is_db_available():
        try:
            rows = db.execute(text("""
                SELECT
                    l.area_name, l.road_type, l.latitude, l.longitude, l.risk_zone,
                    c.city_name, c.state_name,
                    COUNT(v.violation_key) AS total_violations,
                    SUM(CASE WHEN v.accident_involved = 1 THEN 1 ELSE 0 END) AS accident_count,
                    AVG(v.fine_amount) AS avg_fine,
                    AVG(v.average_speed) AS avg_speed,
                    (SELECT v2.violation_type FROM fact_violations v2
                     WHERE v2.location_key = l.location_key
                     GROUP BY v2.violation_type ORDER BY COUNT(*) DESC LIMIT 1) AS top_violation
                FROM dim_location l
                JOIN dim_city c ON l.city_key = c.city_key
                LEFT JOIN fact_violations v ON v.location_key = l.location_key
                WHERE c.city_name = :city
                GROUP BY l.location_key
                ORDER BY total_violations DESC
            """), {"city": city}).mappings().all()

            for i, r in enumerate(rows):
                tv = int(r["total_violations"] or 0)
                ac = int(r["accident_count"] or 0)
                risk = _calc_risk_score(tv, ac)
                markers.append(RiskMarker(
                    id=f"loc_{i}",
                    lat=float(r["latitude"] or 0),
                    lon=float(r["longitude"] or 0),
                    state=r["state_name"] or "",
                    city=r["city_name"] or "",
                    area=r["area_name"] or "",
                    riskScore=risk,
                    riskLevel=_risk_level(risk),
                    totalViolations=tv,
                    accidentCount=ac,
                    mostCommonViolation=r["top_violation"] or "N/A",
                    roadType=r["road_type"],
                    avgFine=round(float(r["avg_fine"] or 0), 2),
                    avgSpeed=round(float(r["avg_speed"] or 0), 1),
                ))
        except Exception as exc:
            logger.warning("DB query failed for city risk: %s", exc)

    # ── CSV fallback ──
    if not markers:
        markers = _default_city_risk(city)

    cache_set(map_cache, cache_key, markers)
    return markers


def _default_city_risk(city: str) -> List[RiskMarker]:
    from app.utils.generate_dataset import CITY_AREAS
    areas = CITY_AREAS.get(city, CITY_AREAS.get(city.title(), []))
    return [
        RiskMarker(
            id=a["id"], lat=a["lat"], lon=a["lon"],
            state=a["state"], city=a["city"], area=a.get("area"),
            riskScore=a["riskScore"], riskLevel=a["riskLevel"],
            totalViolations=a["totalViolations"], accidentCount=a["accidentCount"],
            mostCommonViolation=a["mostCommonViolation"],
            roadType=a.get("roadType"), avgFine=a.get("avgFine"),
            avgSpeed=a.get("avgSpeed"), weather=a.get("weather"),
        )
        for a in areas
    ]


# ────────────────────────────────────────────
# CITY SUMMARY
# ────────────────────────────────────────────

def get_city_summary(db: Optional[Session], city: str) -> Optional[CitySummaryResponse]:
    cache_key = f"city_summary_{city.lower()}"
    cached = cache_get(dashboard_cache, cache_key)
    if cached:
        return cached

    result = None

    # ── Try MySQL ──
    if db is not None and is_db_available():
        try:
            r = db.execute(text("""
                SELECT
                    c.city_name, c.state_name,
                    COUNT(v.violation_key) AS total_violations,
                    SUM(CASE WHEN v.accident_involved = 1 THEN 1 ELSE 0 END) AS total_accidents,
                    COALESCE(SUM(v.fine_amount), 0) AS total_fine,
                    AVG(v.average_speed) AS avg_speed,
                    (SELECT COUNT(*) FROM dim_location l
                     JOIN dim_city c2 ON l.city_key = c2.city_key
                     WHERE c2.city_name = c.city_name AND l.risk_zone = 'High') AS high_risk_areas,
                    (SELECT v2.violation_type FROM fact_violations v2
                     JOIN dim_location l3 ON v2.location_key = l3.location_key
                     JOIN dim_city c3 ON l3.city_key = c3.city_key
                     WHERE c3.city_name = c.city_name
                     GROUP BY v2.violation_type ORDER BY COUNT(*) DESC LIMIT 1) AS top_violation
                FROM dim_city c
                LEFT JOIN dim_location l ON l.city_key = c.city_key
                LEFT JOIN fact_violations v ON v.location_key = l.location_key
                WHERE c.city_name = :city
                GROUP BY c.city_key
            """), {"city": city}).mappings().first()

            if r and r["total_violations"]:
                tv = int(r["total_violations"] or 0)
                ta = int(r["total_accidents"] or 0)
                risk = _calc_risk_score(tv, ta)
                result = CitySummaryResponse(
                    city=r["city_name"],
                    state=r["state_name"],
                    totalViolations=tv,
                    totalAccidents=ta,
                    highRiskAreas=int(r["high_risk_areas"] or 0),
                    mostCommonViolation=r["top_violation"] or "N/A",
                    avgSpeed=round(float(r["avg_speed"] or 0), 1),
                    totalFineCollected=float(r["total_fine"] or 0),
                    weather="Clear",
                    riskScore=risk,
                    temperature=32.0,
                    humidity=55.0,
                )
        except Exception as exc:
            logger.warning("DB query failed for city summary: %s", exc)

    # ── CSV fallback / hardcoded ──
    if result is None:
        result = _default_city_summary(city)

    cache_set(dashboard_cache, cache_key, result)
    return result


def _default_city_summary(city: str) -> CitySummaryResponse:
    from app.utils.generate_dataset import CITY_SUMMARIES
    s = CITY_SUMMARIES.get(city, CITY_SUMMARIES.get(city.title(), None))
    if s:
        return CitySummaryResponse(**s)
    return CitySummaryResponse(
        city=city, state="India",
        totalViolations=25000, totalAccidents=750,
        highRiskAreas=5, mostCommonViolation="Overspeeding",
        avgSpeed=38.0, totalFineCollected=18000000,
        weather="Clear", riskScore=65, temperature=30.0, humidity=50.0,
    )


# ────────────────────────────────────────────
# POPULAR CITIES
# ────────────────────────────────────────────

def get_popular_cities(db: Optional[Session]) -> List[PopularCity]:
    cache_key = "popular_cities"
    cached = cache_get(dashboard_cache, cache_key)
    if cached:
        return cached

    results: List[PopularCity] = []

    if db is not None and is_db_available():
        try:
            rows = db.execute(text("""
                SELECT c.city_name, c.state_name, c.latitude, c.longitude,
                       COUNT(v.violation_key) AS total_violations,
                       SUM(CASE WHEN v.accident_involved=1 THEN 1 ELSE 0 END) AS total_accidents
                FROM dim_city c
                LEFT JOIN dim_location l ON l.city_key = c.city_key
                LEFT JOIN fact_violations v ON v.location_key = l.location_key
                GROUP BY c.city_key
                ORDER BY total_violations DESC
                LIMIT 12
            """)).mappings().all()
            for r in rows:
                tv = int(r["total_violations"] or 0)
                ta = int(r["total_accidents"] or 0)
                results.append(PopularCity(
                    name=r["city_name"], state=r["state_name"],
                    lat=float(r["latitude"] or 0), lon=float(r["longitude"] or 0),
                    totalViolations=tv, totalAccidents=ta,
                    riskScore=_calc_risk_score(tv, ta),
                ))
        except Exception as exc:
            logger.warning("DB query failed for popular cities: %s", exc)

    if not results:
        from app.utils.generate_dataset import CITY_DATA
        results = [PopularCity(**c) for c in CITY_DATA]

    cache_set(dashboard_cache, cache_key, results)
    return results


# ────────────────────────────────────────────
# TRAFFIC INSIGHTS
# ────────────────────────────────────────────

def get_traffic_insights(db: Optional[Session]) -> TrafficInsightResponse:
    cache_key = "traffic_insights"
    cached = cache_get(dashboard_cache, cache_key)
    if cached:
        return cached

    result = None

    if db is not None and is_db_available():
        try:
            r = db.execute(text("""
                SELECT
                    COUNT(*) AS violation_count,
                    AVG(average_speed) AS avg_speed,
                    SUM(CASE WHEN accident_involved=1 THEN 1 ELSE 0 END) AS accident_count
                FROM fact_violations
            """)).mappings().first()
            if r:
                result = TrafficInsightResponse(
                    vehicleCount=random.randint(120000, 135000),
                    avgSpeed=round(float(r["avg_speed"] or 42), 1),
                    violationCount=int(r["violation_count"] or 0),
                    accidentDetected=int(r["accident_count"] or 0),
                    lastUpdated=datetime.utcnow().isoformat(),
                    vehicleCountTrend=[120000, 122000, 118000, 125000, 128000, 130000, 127000, 128456],
                    avgSpeedTrend=[40, 42, 38, 44, 41, 43, 39, 42],
                    violationTrend=[8200, 8500, 8100, 8900, 8400, 8600, 8700, 8734],
                    accidentTrend=[18, 22, 19, 25, 20, 24, 21, 23],
                )
        except Exception as exc:
            logger.warning("DB query failed for traffic insights: %s", exc)

    if result is None:
        result = TrafficInsightResponse(
            vehicleCount=128456,
            avgSpeed=42.0,
            violationCount=8734,
            accidentDetected=23,
            lastUpdated=datetime.utcnow().isoformat(),
            vehicleCountTrend=[120000, 122000, 118000, 125000, 128000, 130000, 127000, 128456],
            avgSpeedTrend=[40, 42, 38, 44, 41, 43, 39, 42],
            violationTrend=[8200, 8500, 8100, 8900, 8400, 8600, 8700, 8734],
            accidentTrend=[18, 22, 19, 25, 20, 24, 21, 23],
        )

    cache_set(dashboard_cache, cache_key, result)
    return result


# ────────────────────────────────────────────
# RECENT EVENTS
# ────────────────────────────────────────────

def get_recent_events(db: Optional[Session]) -> List[EventResponse]:
    cache_key = "recent_events"
    cached = cache_get(events_cache, cache_key)
    if cached:
        return cached

    results: List[EventResponse] = []

    # DB-based events would be built from recent FactViolations
    # For now, always generate realistic events
    results = _generate_recent_events()

    cache_set(events_cache, cache_key, results)
    return results


def _generate_recent_events() -> List[EventResponse]:
    now = datetime.utcnow()
    events = [
        EventResponse(
            id="evt1", title="Multi-Vehicle Collision on NH-44",
            description="Three vehicles involved in a high-speed collision near Hingna T-point.",
            severity="Critical", location="NH-44, Hingna T-Point", city="Nagpur",
            accidentOccurred=True, weather="Clear",
            vehicleTypes=["Truck", "Car", "Car"], affectedLanes=3,
            ambulanceOnScene=True, policeOnScene=True, fireOnScene=False,
            timestamp=(now - timedelta(minutes=15)).isoformat(),
        ),
        EventResponse(
            id="evt2", title="Overspeeding Violation Cluster",
            description="Cluster of 12 overspeeding violations detected on Wardha Road stretch.",
            severity="High", location="Wardha Road", city="Nagpur",
            accidentOccurred=False, weather="Clear",
            vehicleTypes=["Car", "Bike", "Car", "SUV"], affectedLanes=2,
            ambulanceOnScene=False, policeOnScene=True, fireOnScene=False,
            timestamp=(now - timedelta(minutes=32)).isoformat(),
        ),
        EventResponse(
            id="evt3", title="Signal Jumping at Hinjewadi Junction",
            description="Multiple two-wheelers caught jumping red signal during peak hours.",
            severity="Medium", location="Hinjewadi Junction", city="Pune",
            accidentOccurred=False, weather="Cloudy",
            vehicleTypes=["Bike", "Bike", "Bike"], affectedLanes=1,
            ambulanceOnScene=False, policeOnScene=True, fireOnScene=False,
            timestamp=(now - timedelta(minutes=48)).isoformat(),
        ),
        EventResponse(
            id="evt4", title="Drunk Driving Arrest – Connaught Place",
            description="Driver apprehended with BAC 0.12% near Connaught Place inner circle.",
            severity="High", location="Connaught Place", city="Delhi",
            accidentOccurred=False, weather="Hazy",
            vehicleTypes=["Car"], affectedLanes=1,
            ambulanceOnScene=False, policeOnScene=True, fireOnScene=False,
            timestamp=(now - timedelta(hours=1)).isoformat(),
        ),
        EventResponse(
            id="evt5", title="Bike-Pedestrian Collision – Silk Board",
            description="Two-wheeler hit pedestrian at Silk Board signal; minor injuries reported.",
            severity="Medium", location="Silk Board Junction", city="Bengaluru",
            accidentOccurred=True, weather="Rainy",
            vehicleTypes=["Bike"], affectedLanes=1,
            ambulanceOnScene=True, policeOnScene=True, fireOnScene=False,
            timestamp=(now - timedelta(hours=1, minutes=20)).isoformat(),
        ),
        EventResponse(
            id="evt6", title="Wrong-Way Driving on ORR",
            description="Car driving against traffic on Gachibowli ORR; multiple near-misses reported.",
            severity="Critical", location="Gachibowli ORR", city="Hyderabad",
            accidentOccurred=False, weather="Clear",
            vehicleTypes=["Car"], affectedLanes=2,
            ambulanceOnScene=False, policeOnScene=True, fireOnScene=False,
            timestamp=(now - timedelta(hours=2)).isoformat(),
        ),
        EventResponse(
            id="evt7", title="No-Helmet Violation Drive – Anna Salai",
            description="Traffic police drive nets 45 no-helmet violators on Anna Salai stretch.",
            severity="Low", location="Anna Salai", city="Chennai",
            accidentOccurred=False, weather="Rainy",
            vehicleTypes=["Bike", "Bike", "Bike"], affectedLanes=1,
            ambulanceOnScene=False, policeOnScene=True, fireOnScene=False,
            timestamp=(now - timedelta(hours=2, minutes=30)).isoformat(),
        ),
        EventResponse(
            id="evt8", title="Truck Overturn on Katraj Slope",
            description="Loaded truck overturned on Katraj ghat section; road partially blocked.",
            severity="High", location="Katraj Ghat", city="Pune",
            accidentOccurred=True, weather="Cloudy",
            vehicleTypes=["Truck"], affectedLanes=2,
            ambulanceOnScene=True, policeOnScene=True, fireOnScene=True,
            timestamp=(now - timedelta(hours=3)).isoformat(),
        ),
    ]
    return events


# ────────────────────────────────────────────
# KEY METRICS
# ────────────────────────────────────────────

def get_key_metrics(db: Optional[Session]) -> List[KeyMetricsResponse]:
    cache_key = "key_metrics"
    cached = cache_get(dashboard_cache, cache_key)
    if cached:
        return cached

    metrics: List[KeyMetricsResponse] = []

    if db is not None and is_db_available():
        try:
            r = db.execute(text("""
                SELECT
                    COUNT(*) AS total_violations,
                    COALESCE(AVG(fine_amount), 0) AS avg_fine,
                    SUM(CASE WHEN accident_involved=1 THEN 1 ELSE 0 END) AS total_accidents,
                    AVG(average_speed) AS avg_speed,
                    COUNT(DISTINCT location_key) AS monitored_areas
                FROM fact_violations
            """)).mappings().first()
            if r:
                metrics = _build_key_metrics(
                    total_violations=int(r["total_violations"] or 0),
                    avg_fine=float(r["avg_fine"] or 0),
                    total_accidents=int(r["total_accidents"] or 0),
                    avg_speed=float(r["avg_speed"] or 0),
                    monitored_areas=int(r["monitored_areas"] or 0),
                )
        except Exception as exc:
            logger.warning("DB query failed for key metrics: %s", exc)

    if not metrics:
        metrics = _build_key_metrics()

    cache_set(dashboard_cache, cache_key, metrics)
    return metrics


def _build_key_metrics(
    total_violations: int = 487650,
    avg_fine: float = 784.5,
    total_accidents: int = 12456,
    avg_speed: float = 42.0,
    monitored_areas: int = 342,
) -> List[KeyMetricsResponse]:
    return [
        KeyMetricsResponse(id="km1", title="Total Violations", value=f"{total_violations:,}",
                           subtitle="All-time recorded violations", icon="alert-triangle",
                           trend="up", trendValue="+5.2%"),
        KeyMetricsResponse(id="km2", title="Avg Fine Amount", value=f"₹{avg_fine:,.0f}",
                           subtitle="Per violation average", icon="indian-rupee",
                           trend="stable", trendValue="+0.3%"),
        KeyMetricsResponse(id="km3", title="Total Accidents", value=f"{total_accidents:,}",
                           subtitle="Accidents involving violations", icon="shield-alert",
                           trend="down", trendValue="-2.1%"),
        KeyMetricsResponse(id="km4", title="Avg Speed", value=f"{avg_speed:.0f} km/h",
                           subtitle="Across monitored zones", icon="gauge",
                           trend="stable", trendValue="+0.1%"),
        KeyMetricsResponse(id="km5", title="Monitored Areas", value=str(monitored_areas),
                           subtitle="Active monitoring zones", icon="map-pin",
                           trend="up", trendValue="+3.5%"),
        KeyMetricsResponse(id="km6", title="Active Vehicles", value="1,56,789",
                           subtitle="Unique vehicles tracked", icon="car",
                           trend="up", trendValue="+4.8%"),
        KeyMetricsResponse(id="km7", title="High Risk Zones", value="42",
                           subtitle="Zones requiring attention", icon="alert-circle",
                           trend="down", trendValue="-1.2%"),
        KeyMetricsResponse(id="km8", title="Fine Collected", value="₹38.2Cr",
                           subtitle="Total fines collected", icon="wallet",
                           trend="up", trendValue="+6.7%"),
    ]


# ────────────────────────────────────────────
# VIOLATION ANALYSIS
# ────────────────────────────────────────────

def get_violation_analysis(db: Optional[Session]) -> ViolationAnalysisResponse:
    cache_key = "violation_analysis"
    cached = cache_get(analysis_cache, cache_key)
    if cached:
        return cached

    result = None

    # ── Try MySQL ──
    if db is not None and is_db_available():
        try:
            # By type
            by_type = db.execute(text("""
                SELECT violation_type AS type, COUNT(*) AS count
                FROM fact_violations GROUP BY violation_type ORDER BY count DESC
            """)).mappings().all()

            # By vehicle type
            by_vehicle = db.execute(text("""
                SELECT ve.vehicle_type AS type, COUNT(*) AS count
                FROM fact_violations v
                JOIN dim_vehicle ve ON v.vehicle_key = ve.vehicle_key
                GROUP BY ve.vehicle_type ORDER BY count DESC
            """)).mappings().all()

            # By age group
            by_age = db.execute(text("""
                SELECT d.age_group AS ageGroup, COUNT(*) AS count
                FROM fact_violations v
                JOIN dim_driver d ON v.driver_key = d.driver_key
                GROUP BY d.age_group ORDER BY count DESC
            """)).mappings().all()

            # By gender
            by_gender = db.execute(text("""
                SELECT d.driver_gender AS gender, COUNT(*) AS count
                FROM fact_violations v
                JOIN dim_driver d ON v.driver_key = d.driver_key
                GROUP BY d.driver_gender
            """)).mappings().all()

            # By license type
            by_license = db.execute(text("""
                SELECT d.license_type AS type, COUNT(*) AS count
                FROM fact_violations v
                JOIN dim_driver d ON v.driver_key = d.driver_key
                GROUP BY d.license_type ORDER BY count DESC
            """)).mappings().all()

            # By road type
            by_road = db.execute(text("""
                SELECT l.road_type AS type, COUNT(*) AS count
                FROM fact_violations v
                JOIN dim_location l ON v.location_key = l.location_key
                GROUP BY l.road_type ORDER BY count DESC
            """)).mappings().all()

            # Fine by violation type
            fine_by_type = db.execute(text("""
                SELECT violation_type AS type, AVG(fine_amount) AS amount
                FROM fact_violations GROUP BY violation_type ORDER BY amount DESC
            """)).mappings().all()

            # Repeat offenders
            repeat = db.execute(text("""
                SELECT
                    CASE
                        WHEN d.previous_violations = 0 THEN 'First-time'
                        WHEN d.previous_violations BETWEEN 1 AND 3 THEN '2-3'
                        WHEN d.previous_violations BETWEEN 4 AND 7 THEN '4-7'
                        ELSE '8+'
                    END AS `range`,
                    COUNT(*) AS count
                FROM fact_violations v
                JOIN dim_driver d ON v.driver_key = d.driver_key
                GROUP BY `range`
            """)).mappings().all()

            result = ViolationAnalysisResponse(
                violationsByType=[ViolationCountItem(type=r["type"], count=int(r["count"])) for r in by_type],
                violationsByVehicleType=[ViolationCountItem(type=r["type"], count=int(r["count"])) for r in by_vehicle],
                violationsByAgeGroup=[ViolationAgeGroupItem(ageGroup=r["ageGroup"] or "Unknown", count=int(r["count"])) for r in by_age],
                violationsByGender=[ViolationGenderItem(gender=r["gender"] or "Unknown", count=int(r["count"])) for r in by_gender],
                violationsByLicenseType=[ViolationCountItem(type=r["type"] or "Unknown", count=int(r["count"])) for r in by_license],
                violationsByRoadType=[ViolationCountItem(type=r["type"] or "Unknown", count=int(r["count"])) for r in by_road],
                fineByViolationType=[FineByTypeItem(type=r["type"], amount=round(float(r["amount"]), 2)) for r in fine_by_type],
                repeatOffenders=[RepeatOffenderItem(range=r["range"], count=int(r["count"])) for r in repeat],
            )
        except Exception as exc:
            logger.warning("DB query failed for violation analysis: %s", exc)

    # ── CSV fallback ──
    if result is None:
        df = _load_violations()
        if not df.empty:
            result = _analysis_from_df(df)
        else:
            result = _default_analysis()

    cache_set(analysis_cache, cache_key, result)
    return result


def _analysis_from_df(df: pd.DataFrame) -> ViolationAnalysisResponse:
    vtype = _pick_col(df, ["violation_type", "Violation_Type"])
    veh = _pick_col(df, ["vehicle_type", "Vehicle_Type"])
    age = _pick_col(df, ["age_group", "Age_Group"])
    gender = _pick_col(df, ["driver_gender", "Gender"])
    license_c = _pick_col(df, ["license_type", "License_Type"])
    road = _pick_col(df, ["road_type", "Road_Type"])
    fine = _pick_col(df, ["fine_amount", "Fine_Amount"])
    prev = _pick_col(df, ["previous_violations", "Previous_Violations"])

    def _counts(col, label="type"):
        if col and col in df.columns:
            s = df[col].fillna("Unknown").value_counts()
            return [ViolationCountItem(type=str(k), count=int(v)) for k, v in s.items()]
        return []

    def _age_counts():
        if age and age in df.columns:
            s = df[age].fillna("Unknown").value_counts()
            return [ViolationAgeGroupItem(ageGroup=str(k), count=int(v)) for k, v in s.items()]
        return []

    def _gender_counts():
        if gender and gender in df.columns:
            s = df[gender].fillna("Unknown").value_counts()
            return [ViolationGenderItem(gender=str(k), count=int(v)) for k, v in s.items()]
        return []

    def _fine_by_type():
        if vtype and fine and vtype in df.columns and fine in df.columns:
            s = df.groupby(vtype)[fine].mean().sort_values(ascending=False)
            return [FineByTypeItem(type=str(k), amount=round(float(v), 2)) for k, v in s.items()]
        return []

    def _repeat():
        if prev and prev in df.columns:
            bins = [(-1, 0, "First-time"), (0, 3, "2-3"), (3, 7, "4-7"), (7, 999, "8+")]
            items = []
            for lo, hi, label in bins:
                c = int(((df[prev] > lo) & (df[prev] <= hi)).sum())
                items.append(RepeatOffenderItem(range=label, count=c))
            return items
        return [RepeatOffenderItem(range="N/A", count=0)]

    return ViolationAnalysisResponse(
        violationsByType=_counts(vtype),
        violationsByVehicleType=_counts(veh),
        violationsByAgeGroup=_age_counts(),
        violationsByGender=_gender_counts(),
        violationsByLicenseType=_counts(license_c),
        violationsByRoadType=_counts(road),
        fineByViolationType=_fine_by_type(),
        repeatOffenders=_repeat(),
    )


def _default_analysis() -> ViolationAnalysisResponse:
    return ViolationAnalysisResponse(
        violationsByType=[
            ViolationCountItem(type=t, count=c) for t, c in [
                ("Overspeeding", 98450), ("Signal Jumping", 72300), ("No Helmet", 68900),
                ("Wrong Side Driving", 45200), ("Drunk Driving", 34100), ("No Seatbelt", 28700),
                ("Triple Riding", 21300), ("Using Mobile", 18700), ("Document Expired", 12400),
                ("Illegal Parking", 8900),
            ]
        ],
        violationsByVehicleType=[
            ViolationCountItem(type=t, count=c) for t, c in [
                ("Bike", 198000), ("Car", 145000), ("Truck", 56000),
                ("Auto", 42000), ("Bus", 28000), ("SUV", 18700),
            ]
        ],
        violationsByAgeGroup=[
            ViolationAgeGroupItem(ageGroup=g, count=c) for g, c in [
                ("18-25", 142000), ("26-35", 178000), ("36-50", 112000), ("51+", 55650),
            ]
        ],
        violationsByGender=[
            ViolationGenderItem(gender=g, count=c) for g, c in [
                ("Male", 389000), ("Female", 98650),
            ]
        ],
        violationsByLicenseType=[
            ViolationCountItem(type=t, count=c) for t, c in [
                ("LMV", 189000), ("MCWG", 145000), ("HMV", 56000),
                ("LMV-NT", 42000), ("MCWOG", 35000), ("No License", 20650),
            ]
        ],
        violationsByRoadType=[
            ViolationCountItem(type=t, count=c) for t, c in [
                ("Highway", 156000), ("Arterial", 124000), ("Intersection", 89000),
                ("Residential", 56000), ("Market", 34000), ("Rural", 28650),
            ]
        ],
        fineByViolationType=[
            FineByTypeItem(type=t, amount=a) for t, a in [
                ("Drunk Driving", 2500), ("Overspeeding", 1500), ("Signal Jumping", 800),
                ("Wrong Side Driving", 600), ("No Helmet", 500), ("No Seatbelt", 500),
                ("Triple Riding", 500), ("Using Mobile", 1000), ("Document Expired", 300),
                ("Illegal Parking", 200),
            ]
        ],
        repeatOffenders=[
            RepeatOffenderItem(range="First-time", count=312000),
            RepeatOffenderItem(range="2-3", count=98700),
            RepeatOffenderItem(range="4-7", count=45600),
            RepeatOffenderItem(range="8+", count=31350),
        ],
    )


# ────────────────────────────────────────────
# ASSOCIATION RULES (Apriori)
# ────────────────────────────────────────────

def get_association_rules(db: Optional[Session]) -> List[AssociationRuleResponse]:
    cache_key = "association_rules"
    cached = cache_get(ml_cache, cache_key)
    if cached:
        return cached

    # First try to load pre-computed rules from CSV
    try:
        rules_csv = os.path.join(DATA_DIR, 'association_rules.csv')
        if os.path.exists(rules_csv):
            df = pd.read_csv(rules_csv)
            if not df.empty:
                rules = []
                for i, row in df.iterrows():
                    rules.append(AssociationRuleResponse(
                        id=f"ar_{i}",
                        antecedent=str(row.get('antecedent', '')),
                        consequent=str(row.get('consequent', '')),
                        support=float(row.get('support', 0)),
                        confidence=float(row.get('confidence', 0)),
                        lift=float(row.get('lift', 1.0)),
                        interpretation=str(row.get('interpretation', ''))
                    ))
                if rules:
                    cache_set(ml_cache, cache_key, rules)
                    return rules
    except Exception as exc:
        logger.warning("Failed to load association rules from CSV: %s", exc)

    # Fallback to default rules
    rules = _default_association_rules()
    cache_set(ml_cache, cache_key, rules)
    return rules


def _default_association_rules() -> List[AssociationRuleResponse]:
    return [
        AssociationRuleResponse(id="ar1", antecedent="Overspeeding", consequent="Highway",
                                support=0.18, confidence=0.72, lift=2.1,
                                interpretation="Overspeeding is strongly associated with highway locations"),
        AssociationRuleResponse(id="ar2", antecedent="No Helmet", consequent="Bike",
                                support=0.22, confidence=0.89, lift=3.4,
                                interpretation="No-helmet violations almost exclusively involve two-wheelers"),
        AssociationRuleResponse(id="ar3", antecedent="Drunk Driving", consequent="Night",
                                support=0.08, confidence=0.65, lift=2.8,
                                interpretation="Drunk driving violations peak during night hours"),
        AssociationRuleResponse(id="ar4", antecedent="Signal Jumping", consequent="Intersection",
                                support=0.15, confidence=0.78, lift=2.5,
                                interpretation="Signal jumping naturally occurs at intersections"),
        AssociationRuleResponse(id="ar5", antecedent="Young Driver (18-25)", consequent="Overspeeding",
                                support=0.12, confidence=0.58, lift=1.9,
                                interpretation="Young drivers are more likely to overspeed"),
        AssociationRuleResponse(id="ar6", antecedent="Wrong Side", consequent="Residential",
                                support=0.07, confidence=0.52, lift=1.7,
                                interpretation="Wrong-side driving is common in residential areas"),
        AssociationRuleResponse(id="ar7", antecedent="Truck", consequent="Overspeeding",
                                support=0.09, confidence=0.61, lift=2.0,
                                interpretation="Truck drivers tend to overspeed on highways"),
        AssociationRuleResponse(id="ar8", antecedent="Repeat Offender", consequent="No Helmet",
                                support=0.14, confidence=0.67, lift=2.2,
                                interpretation="Repeat offenders frequently violate helmet rules"),
        AssociationRuleResponse(id="ar9", antecedent="Weekend", consequent="Drunk Driving",
                                support=0.06, confidence=0.55, lift=2.3,
                                interpretation="Drunk driving incidents increase on weekends"),
        AssociationRuleResponse(id="ar10", antecedent="Car", consequent="No Seatbelt",
                                support=0.11, confidence=0.48, lift=1.6,
                                interpretation="Car drivers often neglect seatbelt usage"),
        AssociationRuleResponse(id="ar11", antecedent="Rainy Weather", consequent="Signal Jumping",
                                support=0.05, confidence=0.42, lift=1.4,
                                interpretation="Signal jumping slightly increases during rain"),
        AssociationRuleResponse(id="ar12", antecedent="Mobile Usage", consequent="Car",
                                support=0.08, confidence=0.71, lift=2.3,
                                interpretation="Mobile phone usage while driving is common in cars"),
        AssociationRuleResponse(id="ar13", antecedent="Triple Riding", consequent="Bike",
                                support=0.10, confidence=0.92, lift=3.5,
                                interpretation="Triple riding violations are almost exclusively on bikes"),
        AssociationRuleResponse(id="ar14", antecedent="High Severity", consequent="Highway",
                                support=0.07, confidence=0.58, lift=1.9,
                                interpretation="High severity violations are more likely on highways"),
        AssociationRuleResponse(id="ar15", antecedent="Male Driver", consequent="Overspeeding",
                                support=0.16, confidence=0.54, lift=1.8,
                                interpretation="Male drivers show higher tendency for overspeeding"),
    ]


# ────────────────────────────────────────────
# RISK CLUSTERS (K-Means)
# ────────────────────────────────────────────

def get_risk_clusters(db: Optional[Session]) -> List[ClusterResultResponse]:
    cache_key = "risk_clusters"
    cached = cache_get(ml_cache, cache_key)
    if cached:
        return cached

    # First try to load pre-computed clusters from CSV
    try:
        clusters_csv = os.path.join(DATA_DIR, 'risk_clusters.csv')
        if os.path.exists(clusters_csv):
            df = pd.read_csv(clusters_csv)
            if not df.empty:
                clusters = []
                for i, row in df.iterrows():
                    risk_level = str(row.get('risk_level', 'Low'))
                    cluster = int(row.get('cluster', 2))
                    total_violations = int(row.get('total_violations', 0))
                    accident_count = int(row.get('accident_count', 0))
                    lat = float(row.get('latitude', 0))
                    lon = float(row.get('longitude', 0))
                    clusters.append(ClusterResultResponse(
                        id=f"cl_{i}",
                        area=str(row.get('area_name', '')),
                        city=str(row.get('city', '')),
                        cluster=cluster,
                        riskLevel=risk_level,
                        riskScore=min(99, total_violations / 100),
                        totalViolations=total_violations,
                        accidentCount=accident_count,
                        lat=lat,
                        lon=lon,
                    ))
                if clusters:
                    # Limit to first 200 to avoid memory issues
                    cache_set(ml_cache, cache_key, clusters[:200])
                    return clusters[:200]
    except Exception as exc:
        logger.warning("Failed to load risk clusters from CSV: %s", exc)

    clusters = _default_clusters()
    cache_set(ml_cache, cache_key, clusters)
    return clusters


def _default_clusters() -> List[ClusterResultResponse]:
    areas = [
        ("Bandra-Worli Sea Link", "Mumbai", 8920, 245, 19.076, 72.877),
        ("Hinjewadi IT Park", "Pune", 6780, 172, 18.520, 73.856),
        ("Silk Board Junction", "Bengaluru", 7890, 234, 12.971, 77.594),
        ("Connaught Place", "Delhi", 9870, 312, 28.630, 77.217),
        ("Gachibowli ORR", "Hyderabad", 6230, 178, 17.440, 78.348),
        ("Dharampeth", "Nagpur", 3450, 89, 21.146, 79.088),
        ("Anna Salai", "Chennai", 4890, 123, 13.082, 80.270),
        ("Park Street", "Kolkata", 3450, 87, 22.572, 88.363),
        ("MI Road", "Jaipur", 2870, 72, 26.912, 75.787),
        ("Hazratganj", "Lucknow", 3120, 84, 26.847, 80.946),
        ("Andheri-Kurla Road", "Mumbai", 7650, 198, 19.088, 72.835),
        ("Noida Expressway", "Delhi", 7650, 278, 28.535, 77.391),
        ("Koramangala", "Bengaluru", 4320, 112, 12.935, 77.624),
        ("Hitech City Junction", "Hyderabad", 5670, 145, 17.385, 78.486),
        ("ECR Road", "Chennai", 5670, 167, 13.047, 80.243),
        ("Wardha Road", "Nagpur", 4120, 105, 21.120, 79.075),
        ("Rohini Sector", "Delhi", 5430, 167, 28.669, 77.453),
        ("Hebbal Flyover", "Bengaluru", 5670, 156, 13.035, 77.597),
        ("Swargate Junction", "Pune", 5430, 134, 18.531, 73.844),
        ("Lower Parel", "Mumbai", 5430, 134, 19.017, 72.850),
        ("SG Highway", "Ahmedabad", 3240, 78, 23.022, 72.571),
        ("Habibganj Junction", "Bhopal", 2130, 52, 23.259, 77.412),
        ("NH-66 Edappally", "Kochi", 3560, 94, 9.931, 76.267),
        ("Gandhi Maidan Area", "Patna", 3780, 108, 25.609, 85.137),
    ]
    clusters = []
    for i, (area, city, tv, ac, lat, lon) in enumerate(areas):
        risk_score = _calc_risk_score(tv, ac)
        cluster = 2 if risk_score >= 75 else (1 if risk_score >= 55 else 0)
        risk_level = "High" if cluster == 2 else ("Medium" if cluster == 1 else "Low")
        clusters.append(ClusterResultResponse(
            id=f"cl_{i}", area=area, city=city,
            cluster=cluster, riskLevel=risk_level,
            riskScore=risk_score, totalViolations=tv,
            accidentCount=ac, lat=lat, lon=lon,
        ))
    return clusters


# ────────────────────────────────────────────
# SIMULATE TICK
# ────────────────────────────────────────────

def simulate_tick(db: Optional[Session]) -> SimulateTickResponse:
    """Generate 5-20 random traffic violation records."""
    count = random.randint(5, 20)
    now = datetime.utcnow()

    violation_types = ["Overspeeding", "Signal Jumping", "No Helmet", "Wrong Side Driving",
                       "Drunk Driving", "No Seatbelt", "Triple Riding", "Using Mobile",
                       "Document Expired", "Illegal Parking"]
    severities = ["Low", "Medium", "High", "Critical"]
    vehicle_types = ["Car", "Bike", "Truck", "Auto", "Bus", "SUV"]
    cities = ["Nagpur", "Pune", "Mumbai", "Delhi", "Bengaluru", "Hyderabad",
              "Chennai", "Kolkata", "Jaipur", "Lucknow"]

    new_records = []
    for i in range(count):
        vtype = random.choice(violation_types)
        severity = random.choice(severities)
        fine_map = {"Overspeeding": 1500, "Signal Jumping": 800, "No Helmet": 500,
                    "Wrong Side Driving": 600, "Drunk Driving": 2500, "No Seatbelt": 500,
                    "Triple Riding": 500, "Using Mobile": 1000, "Document Expired": 300,
                    "Illegal Parking": 200}
        new_records.append({
            "violation_id": f"SIM-{now.strftime('%Y%m%d%H%M%S')}-{i:03d}",
            "violation_type": vtype,
            "fine_amount": fine_map.get(vtype, 500) * random.uniform(0.8, 1.2),
            "severity": severity,
            "accident_involved": random.random() < 0.08,
            "average_speed": random.uniform(15, 95),
            "vehicle_type": random.choice(vehicle_types),
            "city": random.choice(cities),
            "timestamp": (now - timedelta(minutes=random.randint(0, 60))).isoformat(),
        })

    # ── Try inserting into MySQL ──
    if db is not None and is_db_available():
        try:
            from app.models import FactViolations, DimDriver, DimVehicle, DimLocation, DimTime
            # Simplified: just log that we would insert
            for rec in new_records:
                pass  # In production, insert into fact table with dimension lookups
            db.commit()
        except Exception as exc:
            logger.warning("Failed to insert simulated records: %s", exc)
            if db:
                db.rollback()

    # Save to CSV as well
    try:
        df_new = pd.DataFrame(new_records)
        sim_path = _csv_path("simulated_violations.csv")
        if os.path.exists(sim_path):
            df_existing = pd.read_csv(sim_path)
            df_combined = pd.concat([df_existing, df_new], ignore_index=True)
            df_combined.to_csv(sim_path, index=False)
        else:
            df_new.to_csv(sim_path, index=False)
    except Exception as exc:
        logger.warning("Failed to save simulated records to CSV: %s", exc)

    # Clear caches so new data is reflected
    from app.cache import clear_dashboard_cache, clear_map_cache
    clear_dashboard_cache()
    clear_map_cache()

    return SimulateTickResponse(
        status="ok",
        count=count,
        message=f"Added {count} simulated violations at {now.isoformat()}",
    )


# ────────────────────────────────────────────
# HELPER UTILITIES
# ────────────────────────────────────────────

def _pick_col(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    """Return the first column name that exists in the DataFrame."""
    for c in candidates:
        if c in df.columns:
            return c
    return None


def _count_accidents(df: pd.DataFrame, col: Optional[str]) -> int:
    """Count accident-involved records, handling bool/int/string values."""
    if not col or col not in df.columns:
        return 0
    series = df[col]
    if series.dtype == bool:
        return int(series.sum())
    if series.dtype in (int, float):
        return int(series.sum())
    # String values like "Yes"/"No", "True"/"False", "1"/"0"
    try:
        mapped = series.astype(str).str.lower().map(
            lambda x: 1 if x in ("yes", "true", "1") else 0
        )
        return int(mapped.sum())
    except Exception:
        return 0


def _calc_risk_score(total_violations: int, accident_count: int) -> int:
    """Heuristic risk score 0-100."""
    v_score = min(total_violations / 200, 50)  # up to 50 points for violations
    a_score = min(accident_count / 5, 50)       # up to 50 points for accidents
    return min(int(v_score + a_score), 100)


def _risk_level(score: int) -> str:
    if score >= 75:
        return "High"
    if score >= 45:
        return "Medium"
    return "Low"
