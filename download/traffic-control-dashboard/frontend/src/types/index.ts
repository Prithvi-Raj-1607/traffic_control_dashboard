export interface CityData {
  name: string;
  state: string;
  lat: number;
  lon: number;
  population: number;
  totalViolations: number;
  totalAccidents: number;
  riskScore: number;
}

export interface RiskMarker {
  id: string;
  lat: number;
  lon: number;
  state: string;
  city: string;
  area?: string;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  totalViolations: number;
  accidentCount: number;
  mostCommonViolation: string;
  roadType?: string;
  avgFine?: number;
  avgSpeed?: number;
  weather?: string;
}

export interface TrafficInsight {
  vehicleCount: number;
  avgSpeed: number;
  violationCount: number;
  accidentDetected: number;
  lastUpdated: string;
  vehicleCountTrend: number[];
  avgSpeedTrend: number[];
  violationTrend: number[];
  accidentTrend: number[];
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  location: string;
  city: string;
  accidentOccurred: boolean;
  weather: string;
  vehicleTypes: string[];
  affectedLanes: number;
  ambulanceOnScene: boolean;
  policeOnScene: boolean;
  fireOnScene: boolean;
  timestamp: string;
}

export interface DepartmentInfo {
  name: string;
  status: 'In Progress' | 'Dispatched' | 'Notified' | 'Triggered' | 'Resolved';
  icon: string;
}

export interface KeyMetric {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export interface ViolationAnalysis {
  violationsByType: { type: string; count: number }[];
  violationsByVehicleType: { type: string; count: number }[];
  violationsByAgeGroup: { ageGroup: string; count: number }[];
  violationsByGender: { gender: string; count: number }[];
  violationsByLicenseType: { type: string; count: number }[];
  violationsByRoadType: { type: string; count: number }[];
  fineByViolationType: { type: string; amount: number }[];
  repeatOffenders: { range: string; count: number }[];
}

export interface AssociationRule {
  id: string;
  antecedent: string;
  consequent: string;
  support: number;
  confidence: number;
  lift: number;
  interpretation: string;
}

export interface ClusterResult {
  id: string;
  area: string;
  city: string;
  cluster: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  totalViolations: number;
  accidentCount: number;
  lat: number;
  lon: number;
}

export interface CitySummary {
  city: string;
  state: string;
  totalViolations: number;
  totalAccidents: number;
  highRiskAreas: number;
  mostCommonViolation: string;
  avgSpeed: number;
  totalFineCollected: number;
  weather: string;
  riskScore: number;
  temperature: number;
  humidity: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  visibility: number;
}

export interface DashboardState {
  selectedCity: string | null;
  mapMode: 'india' | 'city';
  lastUpdated: string;
  isOnline: boolean;
}

export interface OverviewResponse {
  insights: TrafficInsight;
  events: EventData[];
  departments: DepartmentInfo[];
  metrics: KeyMetric[];
  summary: CitySummary | null;
}

export type MapMode = 'india' | 'city';
