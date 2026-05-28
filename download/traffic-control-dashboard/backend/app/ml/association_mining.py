"""
Association Rule Mining using Apriori Algorithm
Loads data from CSV or database, groups violations by driver into transactions,
applies Apriori with min_support=0.05 and min_confidence=0.3,
generates human-readable interpretations, and returns formatted rules.
"""

import os
import logging
from typing import List, Optional

import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import is_db_available
from app.schemas import AssociationRuleResponse

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


def run_apriori(db: Optional[Session] = None) -> List[AssociationRuleResponse]:
    """
    Run Apriori association rule mining on traffic violation data.
    Steps:
    1. Load data (DB or CSV)
    2. Group violations by driver to create transactions
    3. Encode as binary matrix
    4. Apply Apriori with min_support=0.05
    5. Generate rules with min_confidence=0.3
    6. Add human-readable interpretations
    7. Save results to CSV
    8. Return formatted rules
    """
    try:
        from mlxtend.frequent_patterns import apriori, association_rules as ar_func
    except ImportError:
        logger.warning("mlxtend not installed. Cannot run Apriori mining.")
        return []

    # ── Step 1: Load data ──
    df = _load_data(db)
    if df is None or df.empty:
        logger.warning("No data available for Apriori mining.")
        return []

    # ── Step 2: Build transactions ──
    driver_col = _pick(df, ["driver_id", "Driver_ID"])
    vtype_col = _pick(df, ["violation_type", "Violation_Type"])
    vtype_vehicle = _pick(df, ["vehicle_type", "Vehicle_Type"])
    age_col = _pick(df, ["age_group", "Age_Group"])
    road_col = _pick(df, ["road_type", "Road_Type"])
    severity_col = _pick(df, ["severity", "Severity"])
    time_col = _pick(df, ["time_period", "Time_Period"])

    if not driver_col or not vtype_col:
        logger.warning("Required columns not found for Apriori mining.")
        return []

    # Create transaction items: combine violation_type with contextual features
    items_list = []
    for _, row in df.iterrows():
        items = []
        items.append(str(row.get(vtype_col, "")))

        if vtype_vehicle and pd.notna(row.get(vtype_vehicle)):
            items.append(f"Vehicle:{row[vtype_vehicle]}")
        if age_col and pd.notna(row.get(age_col)):
            items.append(f"Age:{row[age_col]}")
        if road_col and pd.notna(row.get(road_col)):
            items.append(f"Road:{row[road_col]}")
        if severity_col and pd.notna(row.get(severity_col)):
            items.append(f"Severity:{row[severity_col]}")
        if time_col and pd.notna(row.get(time_col)):
            items.append(f"Time:{row[time_col]}")

        items_list.append(items)

    df["__items"] = items_list

    # Group by driver
    transactions = df.groupby(driver_col)["__items"].apply(
        lambda x: list(set(item for sublist in x for item in sublist))
    ).tolist()

    if not transactions:
        return []

    # ── Step 3: Encode as binary matrix ──
    all_items = sorted(set(item for t in transactions for item in t))
    if len(all_items) == 0:
        return []

    # Limit to top 50 most frequent items for performance
    from collections import Counter
    item_counts = Counter(item for t in transactions for item in t)
    top_items = [item for item, _ in item_counts.most_common(50)]

    encoded_rows = []
    for t in transactions:
        row = {item: (1 if item in t else 0) for item in top_items}
        encoded_rows.append(row)

    basket_df = pd.DataFrame(encoded_rows)

    # Remove all-zero rows
    basket_df = basket_df[(basket_df > 0).any(axis=1)]

    if basket_df.empty:
        return []

    # ── Step 4: Apply Apriori ──
    try:
        frequent_itemsets = apriori(
            basket_df,
            min_support=0.05,
            use_colnames=True,
            max_len=3,
        )
    except Exception as exc:
        logger.warning("Apriori algorithm failed: %s", exc)
        return []

    if frequent_itemsets.empty:
        logger.info("No frequent itemsets found with min_support=0.05")
        return []

    # ── Step 5: Generate rules ──
    try:
        rules_df = ar_func(
            frequent_itemsets,
            metric="confidence",
            min_threshold=0.3,
        )
    except Exception as exc:
        logger.warning("Association rule generation failed: %s", exc)
        return []

    if rules_df.empty:
        return []

    # ── Step 6: Format and interpret ──
    rules_df = rules_df.sort_values("lift", ascending=False).head(20)

    results = []
    for i, (_, row) in enumerate(rules_df.iterrows()):
        antecedent = ", ".join(sorted(row["antecedents"]))
        consequent = ", ".join(sorted(row["consequents"]))
        interpretation = _interpret_rule(antecedent, consequent, row["lift"])

        results.append(AssociationRuleResponse(
            id=f"ar_{i+1}",
            antecedent=antecedent,
            consequent=consequent,
            support=round(float(row["support"]), 4),
            confidence=round(float(row["confidence"]), 4),
            lift=round(float(row["lift"]), 2),
            interpretation=interpretation,
        ))

    # ── Step 7: Save to CSV ──
    try:
        output_path = os.path.join(DATA_DIR, "association_rules.csv")
        pd.DataFrame([r.model_dump() for r in results]).to_csv(output_path, index=False)
        logger.info("Saved %d association rules to %s", len(results), output_path)
    except Exception as exc:
        logger.warning("Failed to save association rules CSV: %s", exc)

    return results


def _load_data(db: Optional[Session]) -> Optional[pd.DataFrame]:
    """Load violation data from DB or CSV."""
    # Try DB
    if db is not None and is_db_available():
        try:
            rows = db.execute(text("""
                SELECT v.violation_type, v.severity, v.fine_amount,
                       d.driver_id, d.age_group, d.driver_gender, d.license_type,
                       ve.vehicle_type, l.road_type, l.area_name,
                       t.time_period, t.is_weekend
                FROM fact_violations v
                JOIN dim_driver d ON v.driver_key = d.driver_key
                JOIN dim_vehicle ve ON v.vehicle_key = ve.vehicle_key
                JOIN dim_location l ON v.location_key = l.location_key
                JOIN dim_time t ON v.time_key = t.time_key
                LIMIT 50000
            """)).mappings().all()

            if rows:
                return pd.DataFrame([dict(r) for r in rows])
        except Exception as exc:
            logger.warning("DB load failed for Apriori: %s", exc)

    # Fallback to CSV
    for name in ("cleaned_traffic_violations.csv", "raw_traffic_violations.csv"):
        path = os.path.join(DATA_DIR, name)
        if os.path.exists(path):
            try:
                return pd.read_csv(path)
            except Exception as exc:
                logger.warning("CSV load failed for Apriori (%s): %s", name, exc)

    return None


def _interpret_rule(antecedent: str, consequent: str, lift: float) -> str:
    """Generate a human-readable interpretation of a rule."""
    if lift > 2.0:
        strength = "strongly"
    elif lift > 1.5:
        strength = "moderately"
    else:
        strength = "slightly"

    return f"When {antecedent} is observed, {consequent} is {strength} likely (lift={lift:.2f})"


def _pick(df: pd.DataFrame, candidates: list) -> Optional[str]:
    for c in candidates:
        if c in df.columns:
            return c
    return None
