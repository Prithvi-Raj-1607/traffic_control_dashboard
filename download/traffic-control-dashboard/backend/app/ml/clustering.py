"""
K-Means Clustering for Location Risk Analysis
Loads location-aggregated data, normalizes features, applies K-Means (k=3),
maps clusters to risk levels (Low/Medium/High), and returns formatted results.
"""

import os
import logging
from typing import List, Optional

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import is_db_available
from app.schemas import ClusterResultResponse

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


def run_kmeans(db: Optional[Session] = None, k: int = 3) -> List[ClusterResultResponse]:
    """
    Run K-Means clustering on location-aggregated violation data.
    Steps:
    1. Load location-aggregated data (DB or CSV)
    2. Select features: total_violations, total_fine, avg_fine, accident_count,
       high_severity_count, avg_speed, lat, lon
    3. Normalize with StandardScaler
    4. Apply K-Means with k=3
    5. Map clusters to risk levels based on violation count
    6. Save results to CSV
    7. Return formatted cluster results
    """
    try:
        from sklearn.cluster import KMeans
        from sklearn.preprocessing import StandardScaler
    except ImportError:
        logger.warning("scikit-learn not installed. Cannot run K-Means clustering.")
        return []

    # ── Step 1: Load data ──
    df = _load_data(db)
    if df is None or df.empty or len(df) < k:
        logger.warning("Insufficient data for K-Means clustering (need >= %d rows).", k)
        return []

    # ── Step 2: Prepare features ──
    feature_cols = _resolve_feature_cols(df)
    if not feature_cols:
        logger.warning("Could not resolve feature columns for clustering.")
        return []

    available_features = [c for c in feature_cols if c in df.columns]
    if len(available_features) < 2:
        logger.warning("Not enough feature columns for clustering.")
        return []

    # Drop rows with missing feature values
    df_clean = df.dropna(subset=available_features).copy()

    if len(df_clean) < k:
        logger.warning("Too few clean rows (%d) for K-Means with k=%d.", len(df_clean), k)
        return []

    X = df_clean[available_features].values.astype(float)

    # ── Step 3: Normalize ──
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ── Step 4: Apply K-Means ──
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10, max_iter=300)
    clusters = kmeans.fit_predict(X_scaled)

    df_clean["cluster"] = clusters

    # ── Step 5: Map clusters to risk levels ──
    # Compute mean violation count per cluster to determine risk level
    violation_col = _pick(df_clean, ["total_violations", "Total_Violations", "violation_count"])
    if violation_col:
        cluster_means = df_clean.groupby("cluster")[violation_col].mean().sort_values(ascending=False)
        cluster_risk_map = {}
        for idx, (cluster_id, mean_v) in enumerate(cluster_means.items()):
            if idx == 0:
                cluster_risk_map[cluster_id] = "High"
            elif idx == 1:
                cluster_risk_map[cluster_id] = "Medium"
            else:
                cluster_risk_map[cluster_id] = "Low"
    else:
        cluster_risk_map = {0: "Low", 1: "Medium", 2: "High"}

    df_clean["risk_level"] = df_clean["cluster"].map(cluster_risk_map)

    # ── Step 6: Compute risk score per row ──
    lat_col = _pick(df_clean, ["latitude", "Latitude", "lat"])
    lon_col = _pick(df_clean, ["longitude", "Longitude", "lon"])
    area_col = _pick(df_clean, ["area_name", "Area_Name", "area", "Area"])
    city_col = _pick(df_clean, ["city_name", "City_Name", "city", "City"])
    accident_col = _pick(df_clean, ["accident_count", "Accident_Count", "total_accidents"])

    results = []
    for i, (_, row) in enumerate(df_clean.iterrows()):
        tv = int(row.get(violation_col, 0) or 0) if violation_col else 0
        ac = int(row.get(accident_col, 0) or 0) if accident_col else 0
        risk_score = min(int(tv / 200 + ac / 5), 100)

        results.append(ClusterResultResponse(
            id=f"cl_{i}",
            area=str(row.get(area_col, f"Area {i}")) if area_col else f"Area {i}",
            city=str(row.get(city_col, "Unknown")) if city_col else "Unknown",
            cluster=int(row["cluster"]),
            riskLevel=row["risk_level"],
            riskScore=float(risk_score),
            totalViolations=tv,
            accidentCount=ac,
            lat=float(row.get(lat_col, 0) or 0) if lat_col else 0.0,
            lon=float(row.get(lon_col, 0) or 0) if lon_col else 0.0,
        ))

    # Sort by risk score descending
    results.sort(key=lambda x: x.riskScore, reverse=True)

    # ── Step 7: Save to CSV ──
    try:
        output_path = os.path.join(DATA_DIR, "risk_clusters.csv")
        pd.DataFrame([r.model_dump() for r in results]).to_csv(output_path, index=False)
        logger.info("Saved %d cluster results to %s", len(results), output_path)
    except Exception as exc:
        logger.warning("Failed to save cluster results CSV: %s", exc)

    return results


def _load_data(db: Optional[Session]) -> Optional[pd.DataFrame]:
    """Load location-aggregated data from DB or CSV."""
    # Try DB first
    if db is not None and is_db_available():
        try:
            rows = db.execute(text("""
                SELECT
                    l.area_name, l.road_type, l.latitude, l.longitude, l.risk_zone,
                    c.city_name, c.state_name,
                    COUNT(v.violation_key) AS total_violations,
                    COALESCE(SUM(v.fine_amount), 0) AS total_fine_amount,
                    COALESCE(AVG(v.fine_amount), 0) AS average_fine_amount,
                    SUM(CASE WHEN v.accident_involved = 1 THEN 1 ELSE 0 END) AS accident_count,
                    SUM(CASE WHEN v.severity IN ('High', 'Critical') THEN 1 ELSE 0 END) AS high_severity_count,
                    COALESCE(AVG(v.average_speed), 0) AS average_speed
                FROM dim_location l
                JOIN dim_city c ON l.city_key = c.city_key
                LEFT JOIN fact_violations v ON v.location_key = l.location_key
                GROUP BY l.location_key
            """)).mappings().all()

            if rows:
                return pd.DataFrame([dict(r) for r in rows])
        except Exception as exc:
            logger.warning("DB load failed for K-Means: %s", exc)

    # Fallback to CSV
    for name in ("location_aggregated.csv", "cleaned_traffic_violations.csv", "raw_traffic_violations.csv"):
        path = os.path.join(DATA_DIR, name)
        if os.path.exists(path):
            try:
                df = pd.read_csv(path)
                if not df.empty:
                    return df
            except Exception as exc:
                logger.warning("CSV load failed for K-Means (%s): %s", name, exc)

    return None


def _resolve_feature_cols(df: pd.DataFrame) -> list:
    """Resolve feature column names from the DataFrame."""
    candidates = [
        ["total_violations", "Total_Violations", "violation_count"],
        ["total_fine_amount", "Total_Fine_Amount", "fine_amount", "Fine_Amount"],
        ["average_fine_amount", "Average_Fine_Amount"],
        ["accident_count", "Accident_Count", "total_accidents"],
        ["high_severity_count", "High_Severity_Count"],
        ["average_speed", "Average_Speed", "avg_speed"],
        ["latitude", "Latitude", "lat"],
        ["longitude", "Longitude", "lon"],
    ]

    resolved = []
    for group in candidates:
        for c in group:
            if c in df.columns:
                resolved.append(c)
                break

    return resolved


def _pick(df: pd.DataFrame, candidates: list) -> Optional[str]:
    for c in candidates:
        if c in df.columns:
            return c
    return None
