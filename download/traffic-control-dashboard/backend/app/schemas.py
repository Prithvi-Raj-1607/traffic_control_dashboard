"""
Pydantic schemas for all API request/response models.
These schemas match the frontend TypeScript interfaces exactly.
"""

from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


# ────────────────────────────────────────────
# City & Search
# ────────────────────────────────────────────

class CitySearchResult(BaseModel):
    """Matches frontend CityData interface."""
    name: str
    state: str
    lat: float
    lon: float
    population: int = 0
    totalViolations: int = 0
    totalAccidents: int = 0
    riskScore: int = 0
    # Extra fields from backend enrichment
    city_id: Optional[str] = None
    bounding_box: Optional[List[float]] = None
    population_category: Optional[str] = None
    traffic_density_level: Optional[str] = None


class PopularCity(BaseModel):
    name: str
    state: str
    lat: float
    lon: float
    population: int = 0
    totalViolations: int = 0
    totalAccidents: int = 0
    riskScore: int = 0


# ────────────────────────────────────────────
# Map / Risk Markers
# ────────────────────────────────────────────

class RiskMarker(BaseModel):
    """Matches frontend RiskMarker interface."""
    id: str
    lat: float
    lon: float
    state: str
    city: str
    area: Optional[str] = None
    riskScore: int
    riskLevel: str  # 'Low' | 'Medium' | 'High'
    totalViolations: int
    accidentCount: int
    mostCommonViolation: str
    roadType: Optional[str] = None
    avgFine: Optional[float] = None
    avgSpeed: Optional[float] = None
    weather: Optional[str] = None


class CityRiskPoint(BaseModel):
    """Alias for city-level risk points (same shape as RiskMarker)."""
    id: str
    lat: float
    lon: float
    state: str
    city: str
    area: Optional[str] = None
    riskScore: int
    riskLevel: str
    totalViolations: int
    accidentCount: int
    mostCommonViolation: str
    roadType: Optional[str] = None
    avgFine: Optional[float] = None
    avgSpeed: Optional[float] = None
    weather: Optional[str] = None


# ────────────────────────────────────────────
# City Summary
# ────────────────────────────────────────────

class CitySummaryResponse(BaseModel):
    """Matches frontend CitySummary interface."""
    city: str
    state: str
    totalViolations: int
    totalAccidents: int
    highRiskAreas: int
    mostCommonViolation: str
    avgSpeed: float
    totalFineCollected: float
    weather: str
    riskScore: int
    temperature: float
    humidity: float


# ────────────────────────────────────────────
# Traffic Insights
# ────────────────────────────────────────────

class TrafficInsightResponse(BaseModel):
    """Matches frontend TrafficInsight interface."""
    vehicleCount: int
    avgSpeed: float
    violationCount: int
    accidentDetected: int
    lastUpdated: str
    vehicleCountTrend: List[int]
    avgSpeedTrend: List[float]
    violationTrend: List[int]
    accidentTrend: List[int]


# ────────────────────────────────────────────
# Events
# ────────────────────────────────────────────

class EventResponse(BaseModel):
    """Matches frontend EventData interface."""
    id: str
    title: str
    description: str
    severity: str  # 'Critical' | 'High' | 'Medium' | 'Low'
    location: str
    city: str
    accidentOccurred: bool
    weather: str
    vehicleTypes: List[str]
    affectedLanes: int
    ambulanceOnScene: bool
    policeOnScene: bool
    fireOnScene: bool
    timestamp: str


class DepartmentInfo(BaseModel):
    name: str
    status: str  # 'In Progress' | 'Dispatched' | 'Notified' | 'Triggered' | 'Resolved'
    icon: str


# ────────────────────────────────────────────
# Key Metrics
# ────────────────────────────────────────────

class KeyMetricsResponse(BaseModel):
    """Matches frontend KeyMetric interface."""
    id: str
    title: str
    value: str | int | float
    subtitle: str
    icon: str
    trend: Optional[str] = None   # 'up' | 'down' | 'stable'
    trendValue: Optional[str] = None


# ────────────────────────────────────────────
# Violation Analysis
# ────────────────────────────────────────────

class ViolationCountItem(BaseModel):
    type: str
    count: int


class ViolationAgeGroupItem(BaseModel):
    ageGroup: str
    count: int


class ViolationGenderItem(BaseModel):
    gender: str
    count: int


class FineByTypeItem(BaseModel):
    type: str
    amount: float


class RepeatOffenderItem(BaseModel):
    range: str
    count: int


class ViolationAnalysisResponse(BaseModel):
    """Matches frontend ViolationAnalysis interface."""
    violationsByType: List[ViolationCountItem]
    violationsByVehicleType: List[ViolationCountItem]
    violationsByAgeGroup: List[ViolationAgeGroupItem]
    violationsByGender: List[ViolationGenderItem]
    violationsByLicenseType: List[ViolationCountItem]
    violationsByRoadType: List[ViolationCountItem]
    fineByViolationType: List[FineByTypeItem]
    repeatOffenders: List[RepeatOffenderItem]


# ────────────────────────────────────────────
# Association Rules (Apriori)
# ────────────────────────────────────────────

class AssociationRuleResponse(BaseModel):
    """Matches frontend AssociationRule interface."""
    id: str
    antecedent: str
    consequent: str
    support: float
    confidence: float
    lift: float
    interpretation: str


# ────────────────────────────────────────────
# Cluster Results (K-Means)
# ────────────────────────────────────────────

class ClusterResultResponse(BaseModel):
    """Matches frontend ClusterResult interface."""
    id: str
    area: str
    city: str
    cluster: int
    riskLevel: str  # 'Low' | 'Medium' | 'High'
    riskScore: float
    totalViolations: int
    accidentCount: int
    lat: float
    lon: float


# ────────────────────────────────────────────
# Weather
# ────────────────────────────────────────────

class WeatherResponse(BaseModel):
    """Matches frontend WeatherData interface."""
    temperature: float
    humidity: float
    condition: str
    windSpeed: float
    visibility: float


# ────────────────────────────────────────────
# Simulate Tick
# ────────────────────────────────────────────

class SimulateTickResponse(BaseModel):
    status: str
    count: int = 0
    message: str = ""


# ────────────────────────────────────────────
# Overview (aggregate)
# ────────────────────────────────────────────

class OverviewResponse(BaseModel):
    """Matches frontend OverviewResponse interface."""
    insights: TrafficInsightResponse
    events: List[EventResponse]
    departments: List[DepartmentInfo]
    metrics: List[KeyMetricsResponse]
    summary: Optional[CitySummaryResponse] = None
