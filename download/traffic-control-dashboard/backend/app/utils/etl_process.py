"""
ETL Process for Traffic Control Intelligence Dashboard
Full pipeline:
  1. Load raw CSV
  2. Clean data (remove duplicates, handle missing values)
  3. Convert date/time
  4. Create derived columns (age_group, time_period, offender_type)
  5. Create DimCity
  6. Create DimLocation
  7. Create DimDriver
  8. Create DimVehicle
  9. Create DimTime
 10. Create FactViolations with foreign keys
 11. Save cleaned CSV
 12. Load into MySQL (if available)
 13. Log ETL summary
"""

import os
import logging
from datetime import datetime

import pandas as pd
import numpy as np
from sqlalchemy import text

from app.database import is_db_available, ensure_engine, Base, engine

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


def run_etl(
    input_csv: str = None,
    output_dir: str = DATA_DIR,
    load_to_db: bool = True,
) -> dict:
    """
    Run the full ETL pipeline.
    Returns a summary dict with counts and timing.
    """
    start = datetime.utcnow()
    summary = {"start_time": start.isoformat(), "steps": {}}

    # ── Step 1: Load raw CSV ──
    if input_csv is None:
        input_csv = os.path.join(DATA_DIR, "raw_traffic_violations.csv")

    if not os.path.exists(input_csv):
        # Generate data first if not available
        logger.info("Raw CSV not found. Generating dataset first...")
        from app.utils.generate_dataset import generate_all
        generate_all()

    logger.info("Step 1: Loading raw CSV from %s", input_csv)
    df = pd.read_csv(input_csv)
    summary["steps"]["1_load"] = {"rows": len(df), "columns": len(df.columns)}
    logger.info("  Loaded %d rows, %d columns", len(df), len(df.columns))

    # ── Step 2: Clean data ──
    logger.info("Step 2: Cleaning data...")
    before_dedup = len(df)
    df = df.drop_duplicates(subset=["violation_id"], keep="first")
    after_dedup = len(df)
    summary["steps"]["2_clean"] = {
        "duplicates_removed": before_dedup - after_dedup,
        "rows_after": after_dedup,
    }

    # Handle missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())

    categorical_cols = df.select_dtypes(include=["object"]).columns
    for col in categorical_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna("Unknown")

    # ── Step 3: Convert date/time ──
    logger.info("Step 3: Converting date/time...")
    if "violation_date" in df.columns:
        df["violation_date"] = pd.to_datetime(df["violation_date"], errors="coerce")
    if "violation_time" in df.columns:
        df["violation_time"] = df["violation_time"].astype(str)

    # ── Step 4: Create derived columns ──
    logger.info("Step 4: Creating derived columns...")
    if "age_group" not in df.columns and "driver_age" in df.columns:
        df["age_group"] = pd.cut(
            df["driver_age"],
            bins=[0, 25, 35, 50, 100],
            labels=["18-25", "26-35", "36-50", "51+"],
        ).astype(str)

    if "time_period" not in df.columns and "hour" in df.columns:
        df["time_period"] = df["hour"].apply(_assign_time_period)

    if "offender_type" not in df.columns and "previous_violations" in df.columns:
        df["offender_type"] = df["previous_violations"].apply(
            lambda x: "First-time" if x == 0 else ("Repeat" if x <= 3 else "Habitual")
        )

    # ── Step 5: Create DimCity ──
    logger.info("Step 5: Creating DimCity...")
    city_cols = [c for c in ["city_name", "state_name", "latitude", "longitude"] if c in df.columns]
    if city_cols:
        dim_city = df[city_cols].drop_duplicates(subset=["city_name"]).reset_index(drop=True)
        dim_city.insert(0, "city_key", range(1, len(dim_city) + 1))
        dim_city["city_id"] = dim_city["city_key"].apply(lambda x: f"CITY{x:03d}")

        # Add population category and traffic density
        if "population" not in dim_city.columns:
            dim_city["population_category"] = dim_city["city_key"].apply(
                lambda x: random_choice(["Small", "Medium", "Large", "Metro"])
            )
            dim_city["traffic_density_level"] = dim_city["city_key"].apply(
                lambda x: random_choice(["Low", "Medium", "High", "Very High"])
            )
    else:
        dim_city = pd.DataFrame()
    summary["steps"]["5_dim_city"] = {"rows": len(dim_city)}

    # ── Step 6: Create DimLocation ──
    logger.info("Step 6: Creating DimLocation...")
    loc_cols = [c for c in ["area_name", "road_type", "latitude", "longitude", "risk_zone", "city_name"] if c in df.columns]
    if loc_cols:
        dim_location = df[loc_cols].drop_duplicates(
            subset=["area_name", "city_name"] if "area_name" in df.columns else ["city_name"]
        ).reset_index(drop=True)
        dim_location.insert(0, "location_key", range(1, len(dim_location) + 1))
        dim_location["location_id"] = dim_location["location_key"].apply(lambda x: f"LOC{x:04d}")

        # Add city_key FK
        if not dim_city.empty and "city_name" in dim_location.columns:
            city_key_map = dict(zip(dim_city["city_name"], dim_city["city_key"]))
            dim_location["city_key"] = dim_location["city_name"].map(city_key_map)
    else:
        dim_location = pd.DataFrame()
    summary["steps"]["6_dim_location"] = {"rows": len(dim_location)}

    # ── Step 7: Create DimDriver ──
    logger.info("Step 7: Creating DimDriver...")
    driver_cols = [c for c in ["driver_id", "driver_age", "age_group", "driver_gender",
                                "license_type", "previous_violations", "offender_type"] if c in df.columns]
    if driver_cols:
        dim_driver = df[driver_cols].drop_duplicates(subset=["driver_id"]).reset_index(drop=True)
        dim_driver.insert(0, "driver_key", range(1, len(dim_driver) + 1))
    else:
        dim_driver = pd.DataFrame()
    summary["steps"]["7_dim_driver"] = {"rows": len(dim_driver)}

    # ── Step 8: Create DimVehicle ──
    logger.info("Step 8: Creating DimVehicle...")
    vehicle_cols = [c for c in ["vehicle_id", "vehicle_type", "vehicle_brand",
                                 "vehicle_age", "fuel_type"] if c in df.columns]
    if vehicle_cols:
        dim_vehicle = df[vehicle_cols].drop_duplicates(subset=["vehicle_id"]).reset_index(drop=True)
        dim_vehicle.insert(0, "vehicle_key", range(1, len(dim_vehicle) + 1))
    else:
        dim_vehicle = pd.DataFrame()
    summary["steps"]["8_dim_vehicle"] = {"rows": len(dim_vehicle)}

    # ── Step 9: Create DimTime ──
    logger.info("Step 9: Creating DimTime...")
    time_cols = [c for c in ["violation_date", "hour", "day_name", "month", "year",
                              "time_period", "is_weekend"] if c in df.columns]
    if time_cols:
        dim_time = df[time_cols].drop_duplicates().reset_index(drop=True)
        dim_time.insert(0, "time_key", range(1, len(dim_time) + 1))
        if "violation_date" in dim_time.columns:
            dim_time["full_date"] = pd.to_datetime(dim_time["violation_date"], errors="coerce").dt.date
            if "day" not in dim_time.columns:
                dim_time["day"] = pd.to_datetime(dim_time["violation_date"], errors="coerce").dt.day
    else:
        dim_time = pd.DataFrame()
    summary["steps"]["9_dim_time"] = {"rows": len(dim_time)}

    # ── Step 10: Create FactViolations with FKs ──
    logger.info("Step 10: Creating FactViolations...")
    fact_cols = [c for c in ["violation_id", "violation_type", "fine_amount", "severity",
                              "accident_involved", "average_speed"] if c in df.columns]
    if fact_cols:
        fact = df[fact_cols].copy()

        # Add foreign keys by mapping
        if not dim_driver.empty and "driver_id" in df.columns:
            driver_key_map = dict(zip(dim_driver["driver_id"], dim_driver["driver_key"]))
            fact["driver_key"] = df["driver_id"].map(driver_key_map)

        if not dim_vehicle.empty and "vehicle_id" in df.columns:
            vehicle_key_map = dict(zip(dim_vehicle["vehicle_id"], dim_vehicle["vehicle_key"]))
            fact["vehicle_key"] = df["vehicle_id"].map(vehicle_key_map)

        if not dim_location.empty and "area_name" in df.columns and "city_name" in df.columns:
            # Create a composite key for location mapping
            if "city_name" in df.columns:
                loc_key_map = {}
                for _, row in dim_location.iterrows():
                    key = (str(row.get("area_name", "")), str(row.get("city_name", "")))
                    loc_key_map[key] = row["location_key"]
                fact["location_key"] = df.apply(
                    lambda r: loc_key_map.get((str(r.get("area_name", "")), str(r.get("city_name", "")))), 1
                    if not loc_key_map else 1, axis=1
                )

        if not dim_time.empty:
            # Map time by matching date/hour combination
            fact["time_key"] = 1  # Simplified mapping

        fact.insert(0, "violation_key", range(1, len(fact) + 1))
        fact["violation_count"] = 1
    else:
        fact = pd.DataFrame()
    summary["steps"]["10_fact"] = {"rows": len(fact)}

    # ── Step 11: Save cleaned CSV ──
    logger.info("Step 11: Saving cleaned CSV...")
    os.makedirs(output_dir, exist_ok=True)
    cleaned_path = os.path.join(output_dir, "cleaned_traffic_violations.csv")
    df.to_csv(cleaned_path, index=False)
    summary["steps"]["11_save_csv"] = {"path": cleaned_path, "rows": len(df)}

    # Save dimension tables
    for name, dim_df in [("dim_city", dim_city), ("dim_location", dim_location),
                          ("dim_driver", dim_driver), ("dim_vehicle", dim_vehicle),
                          ("dim_time", dim_time), ("fact_violations", fact)]:
        if not dim_df.empty:
            path = os.path.join(output_dir, f"{name}.csv")
            dim_df.to_csv(path, index=False)

    # ── Step 12: Load into MySQL ──
    if load_to_db:
        logger.info("Step 12: Loading into MySQL...")
        try:
            ensure_engine()
            if is_db_available() and engine is not None:
                Base.metadata.create_all(bind=engine)

                if not dim_city.empty:
                    dim_city.to_sql("dim_city", con=engine, if_exists="replace", index=False)
                if not dim_location.empty:
                    dim_location.to_sql("dim_location", con=engine, if_exists="replace", index=False)
                if not dim_driver.empty:
                    dim_driver.to_sql("dim_driver", con=engine, if_exists="replace", index=False)
                if not dim_vehicle.empty:
                    dim_vehicle.to_sql("dim_vehicle", con=engine, if_exists="replace", index=False)
                if not dim_time.empty:
                    dim_time.to_sql("dim_time", con=engine, if_exists="replace", index=False)
                if not fact.empty:
                    fact.to_sql("fact_violations", con=engine, if_exists="replace", index=False)

                summary["steps"]["12_mysql"] = {"status": "success"}
                logger.info("  Data loaded into MySQL successfully.")
            else:
                summary["steps"]["12_mysql"] = {"status": "skipped", "reason": "MySQL not available"}
                logger.info("  MySQL not available. Skipping database load.")
        except Exception as exc:
            summary["steps"]["12_mysql"] = {"status": "failed", "error": str(exc)}
            logger.warning("  MySQL load failed: %s", exc)

    # ── Step 13: Log ETL summary ──
    end = datetime.utcnow()
    summary["end_time"] = end.isoformat()
    summary["duration_seconds"] = (end - start).total_seconds()
    summary["total_rows"] = len(df)

    logger.info("=" * 60)
    logger.info("ETL SUMMARY")
    logger.info("=" * 60)
    logger.info("Total rows: %d", len(df))
    logger.info("DimCity: %d rows", len(dim_city))
    logger.info("DimLocation: %d rows", len(dim_location))
    logger.info("DimDriver: %d rows", len(dim_driver))
    logger.info("DimVehicle: %d rows", len(dim_vehicle))
    logger.info("DimTime: %d rows", len(dim_time))
    logger.info("FactViolations: %d rows", len(fact))
    logger.info("Duration: %.2f seconds", summary["duration_seconds"])
    logger.info("=" * 60)

    return summary


def _assign_time_period(hour):
    if pd.isna(hour):
        return "Unknown"
    hour = int(hour)
    if 6 <= hour < 12:
        return "Morning"
    elif 12 <= hour < 17:
        return "Afternoon"
    elif 17 <= hour < 21:
        return "Evening"
    else:
        return "Night"


def random_choice(options):
    import random
    return random.choice(options)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    result = run_etl()
    print(f"ETL completed in {result['duration_seconds']:.2f}s with {result['total_rows']} rows")
