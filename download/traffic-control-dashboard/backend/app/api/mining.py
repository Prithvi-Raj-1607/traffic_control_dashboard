"""
API Router: Data Mining
GET /api/mining/association-rules — Apriori rules
GET /api/mining/risk-clusters     — K-Means clusters
GET /api/association-rules        — frontend shortcut
GET /api/risk-clusters            — frontend shortcut
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import AssociationRuleResponse, ClusterResultResponse
from app.crud import get_association_rules, get_risk_clusters

router = APIRouter(prefix="/api/mining", tags=["Mining"])
shortcut_router = APIRouter(tags=["Mining Shortcuts"])


@router.get("/association-rules", response_model=List[AssociationRuleResponse])
def association_rules(db: Session = Depends(get_db)):
    """Return Apriori association rules with support, confidence, lift."""
    return get_association_rules(db)


@router.get("/risk-clusters", response_model=List[ClusterResultResponse])
def risk_clusters(db: Session = Depends(get_db)):
    """Return K-Means cluster results for location risk grouping."""
    return get_risk_clusters(db)


@shortcut_router.get("/api/association-rules", response_model=List[AssociationRuleResponse])
def association_rules_shortcut(db: Session = Depends(get_db)):
    return get_association_rules(db)


@shortcut_router.get("/api/risk-clusters", response_model=List[ClusterResultResponse])
def risk_clusters_shortcut(db: Session = Depends(get_db)):
    return get_risk_clusters(db)
