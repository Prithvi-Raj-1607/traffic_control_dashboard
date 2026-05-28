// ── Types ──
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

// ── Indian Cities Data ──
export const citiesData: CityData[] = [
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, population: 2405665, totalViolations: 45230, totalAccidents: 1245, riskScore: 78 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, population: 3124458, totalViolations: 52100, totalAccidents: 1580, riskScore: 82 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, population: 12442373, totalViolations: 68900, totalAccidents: 2100, riskScore: 88 },
  { name: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025, population: 11034555, totalViolations: 73200, totalAccidents: 2450, riskScore: 91 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, population: 8443675, totalViolations: 48700, totalAccidents: 1890, riskScore: 79 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, population: 6809970, totalViolations: 39800, totalAccidents: 1120, riskScore: 72 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, population: 4681087, totalViolations: 41200, totalAccidents: 1340, riskScore: 75 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, population: 4496694, totalViolations: 37600, totalAccidents: 1080, riskScore: 70 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, population: 3073350, totalViolations: 29800, totalAccidents: 920, riskScore: 65 },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, population: 2817105, totalViolations: 34500, totalAccidents: 1050, riskScore: 69 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, population: 5577940, totalViolations: 35200, totalAccidents: 980, riskScore: 67 },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, population: 1795648, totalViolations: 22100, totalAccidents: 670, riskScore: 58 },
];

// ── India Risk Markers ──
export const indiaRiskMarkers: RiskMarker[] = [
  { id: 'mh1', lat: 19.076, lon: 72.877, state: 'Maharashtra', city: 'Mumbai', area: 'Bandra-Worli Sea Link', riskScore: 92, riskLevel: 'High', totalViolations: 8920, accidentCount: 245, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1500, avgSpeed: 72, weather: 'Clear' },
  { id: 'mh2', lat: 19.088, lon: 72.835, state: 'Maharashtra', city: 'Mumbai', area: 'Andheri-Kurla Road', riskScore: 87, riskLevel: 'High', totalViolations: 7650, accidentCount: 198, mostCommonViolation: 'Signal Jumping', roadType: 'Arterial', avgFine: 800, avgSpeed: 28, weather: 'Clear' },
  { id: 'mh3', lat: 18.520, lon: 73.856, state: 'Maharashtra', city: 'Pune', area: 'Hinjewadi IT Park', riskScore: 84, riskLevel: 'High', totalViolations: 6780, accidentCount: 172, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1200, avgSpeed: 65, weather: 'Cloudy' },
  { id: 'mh4', lat: 18.531, lon: 73.844, state: 'Maharashtra', city: 'Pune', area: 'Swargate Junction', riskScore: 79, riskLevel: 'High', totalViolations: 5430, accidentCount: 134, mostCommonViolation: 'Wrong Side Driving', roadType: 'Intersection', avgFine: 600, avgSpeed: 22, weather: 'Cloudy' },
  { id: 'mh5', lat: 21.145, lon: 79.088, state: 'Maharashtra', city: 'Nagpur', area: 'Dharampeth Zone', riskScore: 78, riskLevel: 'High', totalViolations: 4560, accidentCount: 112, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 35, weather: 'Clear' },
  { id: 'mh6', lat: 21.150, lon: 79.095, state: 'Maharashtra', city: 'Nagpur', area: 'Sitabuldi Junction', riskScore: 74, riskLevel: 'Medium', totalViolations: 3920, accidentCount: 89, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 700, avgSpeed: 25, weather: 'Clear' },
  { id: 'dl1', lat: 28.630, lon: 77.217, state: 'Delhi', city: 'Delhi', area: 'Connaught Place', riskScore: 91, riskLevel: 'High', totalViolations: 9870, accidentCount: 312, mostCommonViolation: 'Signal Jumping', roadType: 'Arterial', avgFine: 900, avgSpeed: 30, weather: 'Hazy' },
  { id: 'dl2', lat: 28.535, lon: 77.391, state: 'Delhi', city: 'Delhi', area: 'Noida Expressway', riskScore: 89, riskLevel: 'High', totalViolations: 7650, accidentCount: 278, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1500, avgSpeed: 85, weather: 'Hazy' },
  { id: 'dl3', lat: 28.669, lon: 77.453, state: 'Delhi', city: 'Delhi', area: 'Rohini Sector', riskScore: 82, riskLevel: 'High', totalViolations: 5430, accidentCount: 167, mostCommonViolation: 'Drunk Driving', roadType: 'Residential', avgFine: 2000, avgSpeed: 38, weather: 'Hazy' },
  { id: 'dl4', lat: 28.567, lon: 77.210, state: 'Delhi', city: 'Delhi', area: 'Saket-Mehrauli', riskScore: 76, riskLevel: 'Medium', totalViolations: 4210, accidentCount: 98, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 42, weather: 'Hazy' },
  { id: 'ka1', lat: 12.971, lon: 77.594, state: 'Karnataka', city: 'Bengaluru', area: 'Silk Board Junction', riskScore: 85, riskLevel: 'High', totalViolations: 7890, accidentCount: 234, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 800, avgSpeed: 18, weather: 'Rainy' },
  { id: 'ka2', lat: 12.935, lon: 77.624, state: 'Karnataka', city: 'Bengaluru', area: 'Koramangala', riskScore: 72, riskLevel: 'Medium', totalViolations: 4320, accidentCount: 112, mostCommonViolation: 'Wrong Side Driving', roadType: 'Residential', avgFine: 600, avgSpeed: 32, weather: 'Rainy' },
  { id: 'ka3', lat: 13.035, lon: 77.597, state: 'Karnataka', city: 'Bengaluru', area: 'Hebbal Flyover', riskScore: 80, riskLevel: 'High', totalViolations: 5670, accidentCount: 156, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1200, avgSpeed: 68, weather: 'Rainy' },
  { id: 'ts1', lat: 17.385, lon: 78.486, state: 'Telangana', city: 'Hyderabad', area: 'Hitech City Junction', riskScore: 78, riskLevel: 'High', totalViolations: 5670, accidentCount: 145, mostCommonViolation: 'Overspeeding', roadType: 'Arterial', avgFine: 1000, avgSpeed: 55, weather: 'Clear' },
  { id: 'ts2', lat: 17.440, lon: 78.348, state: 'Telangana', city: 'Hyderabad', area: 'Gachibowli ORR', riskScore: 82, riskLevel: 'High', totalViolations: 6230, accidentCount: 178, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1500, avgSpeed: 90, weather: 'Clear' },
  { id: 'tn1', lat: 13.082, lon: 80.270, state: 'Tamil Nadu', city: 'Chennai', area: 'Anna Salai', riskScore: 76, riskLevel: 'Medium', totalViolations: 4890, accidentCount: 123, mostCommonViolation: 'Signal Jumping', roadType: 'Arterial', avgFine: 700, avgSpeed: 35, weather: 'Rainy' },
  { id: 'tn2', lat: 13.047, lon: 80.243, state: 'Tamil Nadu', city: 'Chennai', area: 'ECR Road', riskScore: 83, riskLevel: 'High', totalViolations: 5670, accidentCount: 167, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1400, avgSpeed: 78, weather: 'Rainy' },
  { id: 'wb1', lat: 22.572, lon: 88.363, state: 'West Bengal', city: 'Kolkata', area: 'Park Street', riskScore: 70, riskLevel: 'Medium', totalViolations: 3450, accidentCount: 87, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 28, weather: 'Humid' },
  { id: 'wb2', lat: 22.540, lon: 88.340, state: 'West Bengal', city: 'Kolkata', area: 'Howrah Bridge Approach', riskScore: 74, riskLevel: 'Medium', totalViolations: 4120, accidentCount: 105, mostCommonViolation: 'Wrong Side Driving', roadType: 'Bridge', avgFine: 600, avgSpeed: 22, weather: 'Humid' },
  { id: 'rj1', lat: 26.912, lon: 75.787, state: 'Rajasthan', city: 'Jaipur', area: 'MI Road', riskScore: 65, riskLevel: 'Medium', totalViolations: 2870, accidentCount: 72, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 40, weather: 'Clear' },
  { id: 'rj2', lat: 26.850, lon: 75.760, state: 'Rajasthan', city: 'Jaipur', area: 'Ajmer Road Highway', riskScore: 71, riskLevel: 'Medium', totalViolations: 3450, accidentCount: 98, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1100, avgSpeed: 75, weather: 'Clear' },
  { id: 'up1', lat: 26.846, lon: 80.946, state: 'Uttar Pradesh', city: 'Lucknow', area: 'Hazratganj', riskScore: 69, riskLevel: 'Medium', totalViolations: 3120, accidentCount: 84, mostCommonViolation: 'Signal Jumping', roadType: 'Arterial', avgFine: 700, avgSpeed: 32, weather: 'Foggy' },
  { id: 'up2', lat: 26.780, lon: 80.890, state: 'Uttar Pradesh', city: 'Lucknow', area: 'Amar Shaheed Path', riskScore: 73, riskLevel: 'Medium', totalViolations: 3780, accidentCount: 102, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1000, avgSpeed: 68, weather: 'Foggy' },
  { id: 'up3', lat: 28.613, lon: 77.209, state: 'Uttar Pradesh', city: 'Agra', area: 'Taj Expressway', riskScore: 77, riskLevel: 'High', totalViolations: 4560, accidentCount: 134, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1500, avgSpeed: 95, weather: 'Foggy' },
  { id: 'gj1', lat: 23.022, lon: 72.571, state: 'Gujarat', city: 'Ahmedabad', area: 'SG Highway', riskScore: 67, riskLevel: 'Medium', totalViolations: 3240, accidentCount: 78, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1000, avgSpeed: 72, weather: 'Clear' },
  { id: 'gj2', lat: 22.307, lon: 73.181, state: 'Gujarat', city: 'Vadodara', area: 'NH-48 Bypass', riskScore: 62, riskLevel: 'Medium', totalViolations: 2560, accidentCount: 65, mostCommonViolation: 'No Helmet', roadType: 'Highway', avgFine: 500, avgSpeed: 60, weather: 'Clear' },
  { id: 'mp1', lat: 23.259, lon: 77.412, state: 'Madhya Pradesh', city: 'Bhopal', area: 'Habibganj Junction', riskScore: 58, riskLevel: 'Medium', totalViolations: 2130, accidentCount: 52, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 600, avgSpeed: 35, weather: 'Clear' },
  { id: 'kl1', lat: 9.931, lon: 76.267, state: 'Kerala', city: 'Kochi', area: 'NH-66 Edappally', riskScore: 71, riskLevel: 'Medium', totalViolations: 3560, accidentCount: 94, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 900, avgSpeed: 55, weather: 'Rainy' },
  { id: 'kl2', lat: 8.524, lon: 76.936, state: 'Kerala', city: 'Thiruvananthapuram', area: 'MG Road', riskScore: 63, riskLevel: 'Medium', totalViolations: 2340, accidentCount: 58, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 38, weather: 'Rainy' },
  { id: 'br1', lat: 25.609, lon: 85.137, state: 'Bihar', city: 'Patna', area: 'Gandhi Maidan Area', riskScore: 72, riskLevel: 'Medium', totalViolations: 3780, accidentCount: 108, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 400, avgSpeed: 30, weather: 'Foggy' },
  { id: 'pb1', lat: 30.900, lon: 75.857, state: 'Punjab', city: 'Ludhiana', area: 'GT Road', riskScore: 68, riskLevel: 'Medium', totalViolations: 2890, accidentCount: 76, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 800, avgSpeed: 62, weather: 'Foggy' },
  { id: 'as1', lat: 26.144, lon: 91.736, state: 'Assam', city: 'Guwahati', area: 'GS Road', riskScore: 60, riskLevel: 'Medium', totalViolations: 1980, accidentCount: 48, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 400, avgSpeed: 35, weather: 'Rainy' },
  { id: 'od1', lat: 20.296, lon: 85.824, state: 'Odisha', city: 'Bhubaneswar', area: 'NH-16', riskScore: 64, riskLevel: 'Medium', totalViolations: 2450, accidentCount: 62, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 700, avgSpeed: 58, weather: 'Clear' },
  { id: 'ts3', lat: 17.360, lon: 78.560, state: 'Telangana', city: 'Hyderabad', area: 'Charminar Zone', riskScore: 69, riskLevel: 'Medium', totalViolations: 2890, accidentCount: 76, mostCommonViolation: 'Wrong Side Driving', roadType: 'Residential', avgFine: 500, avgSpeed: 22, weather: 'Clear' },
];

// ── City Areas Map ──
export const cityAreasMap: Record<string, RiskMarker[]> = {
  'Nagpur': [
    { id: 'ngp1', lat: 21.1458, lon: 79.0882, state: 'Maharashtra', city: 'Nagpur', area: 'Dharampeth', riskScore: 78, riskLevel: 'High', totalViolations: 3450, accidentCount: 89, mostCommonViolation: 'Overspeeding', roadType: 'Arterial', avgFine: 800, avgSpeed: 45, weather: 'Clear' },
    { id: 'ngp2', lat: 21.1500, lon: 79.0950, state: 'Maharashtra', city: 'Nagpur', area: 'Sitabuldi', riskScore: 74, riskLevel: 'Medium', totalViolations: 2980, accidentCount: 72, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 600, avgSpeed: 28, weather: 'Clear' },
    { id: 'ngp3', lat: 21.1200, lon: 79.0750, state: 'Maharashtra', city: 'Nagpur', area: 'Wardha Road', riskScore: 82, riskLevel: 'High', totalViolations: 4120, accidentCount: 105, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1200, avgSpeed: 68, weather: 'Clear' },
    { id: 'ngp4', lat: 21.1600, lon: 79.1000, state: 'Maharashtra', city: 'Nagpur', area: 'Civil Lines', riskScore: 55, riskLevel: 'Medium', totalViolations: 1560, accidentCount: 34, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 32, weather: 'Clear' },
    { id: 'ngp5', lat: 21.1000, lon: 79.0600, state: 'Maharashtra', city: 'Nagpur', area: 'Hingna Industrial', riskScore: 71, riskLevel: 'Medium', totalViolations: 2340, accidentCount: 58, mostCommonViolation: 'Drunk Driving', roadType: 'Industrial', avgFine: 1500, avgSpeed: 42, weather: 'Clear' },
    { id: 'ngp6', lat: 21.1800, lon: 79.1100, state: 'Maharashtra', city: 'Nagpur', area: 'Kamptee Road', riskScore: 76, riskLevel: 'High', totalViolations: 3120, accidentCount: 84, mostCommonViolation: 'Wrong Side Driving', roadType: 'Arterial', avgFine: 600, avgSpeed: 35, weather: 'Clear' },
    { id: 'ngp7', lat: 21.1300, lon: 79.1200, state: 'Maharashtra', city: 'Nagpur', area: 'Manewada', riskScore: 68, riskLevel: 'Medium', totalViolations: 2180, accidentCount: 52, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 30, weather: 'Clear' },
    { id: 'ngp8', lat: 21.0900, lon: 79.0500, state: 'Maharashtra', city: 'Nagpur', area: 'Wadi Junction', riskScore: 73, riskLevel: 'Medium', totalViolations: 2670, accidentCount: 67, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 700, avgSpeed: 25, weather: 'Clear' },
    { id: 'ngp9', lat: 21.1700, lon: 79.0800, state: 'Maharashtra', city: 'Nagpur', area: 'Koradi Road', riskScore: 65, riskLevel: 'Medium', totalViolations: 1890, accidentCount: 45, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 38, weather: 'Clear' },
    { id: 'ngp10', lat: 21.1100, lon: 79.0900, state: 'Maharashtra', city: 'Nagpur', area: 'Itwari Bazaar', riskScore: 70, riskLevel: 'Medium', totalViolations: 2450, accidentCount: 62, mostCommonViolation: 'Wrong Side Driving', roadType: 'Market', avgFine: 500, avgSpeed: 18, weather: 'Clear' },
    { id: 'ngp11', lat: 21.0800, lon: 79.0700, state: 'Maharashtra', city: 'Nagpur', area: 'Automotive Square', riskScore: 80, riskLevel: 'High', totalViolations: 3780, accidentCount: 98, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1100, avgSpeed: 72, weather: 'Clear' },
    { id: 'ngp12', lat: 21.1900, lon: 79.0600, state: 'Maharashtra', city: 'Nagpur', area: 'Kdk Road', riskScore: 62, riskLevel: 'Medium', totalViolations: 1780, accidentCount: 41, mostCommonViolation: 'No Seatbelt', roadType: 'Arterial', avgFine: 500, avgSpeed: 40, weather: 'Clear' },
    { id: 'ngp13', lat: 21.1550, lon: 79.0400, state: 'Maharashtra', city: 'Nagpur', area: 'Lakshmi Nagar', riskScore: 58, riskLevel: 'Medium', totalViolations: 1450, accidentCount: 32, mostCommonViolation: 'Signal Jumping', roadType: 'Residential', avgFine: 600, avgSpeed: 28, weather: 'Clear' },
    { id: 'ngp14', lat: 21.1050, lon: 79.1050, state: 'Maharashtra', city: 'Nagpur', area: 'Bajaj Nagar', riskScore: 66, riskLevel: 'Medium', totalViolations: 2010, accidentCount: 48, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 34, weather: 'Clear' },
    { id: 'ngp15', lat: 21.1350, lon: 79.0500, state: 'Maharashtra', city: 'Nagpur', area: 'Pratap Nagar', riskScore: 54, riskLevel: 'Low', totalViolations: 1120, accidentCount: 22, mostCommonViolation: 'No Seatbelt', roadType: 'Residential', avgFine: 500, avgSpeed: 30, weather: 'Clear' },
  ],
  'Pune': [
    { id: 'pune1', lat: 18.5204, lon: 73.8567, state: 'Maharashtra', city: 'Pune', area: 'Hinjewadi', riskScore: 84, riskLevel: 'High', totalViolations: 6780, accidentCount: 172, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1200, avgSpeed: 65, weather: 'Cloudy' },
    { id: 'pune2', lat: 18.5310, lon: 73.8440, state: 'Maharashtra', city: 'Pune', area: 'Swargate', riskScore: 79, riskLevel: 'High', totalViolations: 5430, accidentCount: 134, mostCommonViolation: 'Wrong Side Driving', roadType: 'Intersection', avgFine: 600, avgSpeed: 22, weather: 'Cloudy' },
    { id: 'pune3', lat: 18.5590, lon: 73.8210, state: 'Maharashtra', city: 'Pune', area: 'Aundh', riskScore: 62, riskLevel: 'Medium', totalViolations: 2340, accidentCount: 56, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 30, weather: 'Cloudy' },
    { id: 'pune4', lat: 18.5000, lon: 73.8700, state: 'Maharashtra', city: 'Pune', area: 'Katraj', riskScore: 75, riskLevel: 'Medium', totalViolations: 3890, accidentCount: 92, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1000, avgSpeed: 58, weather: 'Cloudy' },
    { id: 'pune5', lat: 18.5600, lon: 73.7800, state: 'Maharashtra', city: 'Pune', area: 'Bavdhan', riskScore: 58, riskLevel: 'Medium', totalViolations: 1670, accidentCount: 38, mostCommonViolation: 'Signal Jumping', roadType: 'Arterial', avgFine: 600, avgSpeed: 35, weather: 'Cloudy' },
    { id: 'pune6', lat: 18.4900, lon: 73.8200, state: 'Maharashtra', city: 'Pune', area: 'Hadapsar', riskScore: 71, riskLevel: 'Medium', totalViolations: 3120, accidentCount: 78, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 38, weather: 'Cloudy' },
    { id: 'pune7', lat: 18.5700, lon: 73.8400, state: 'Maharashtra', city: 'Pune', area: 'Pashan', riskScore: 54, riskLevel: 'Low', totalViolations: 1230, accidentCount: 28, mostCommonViolation: 'No Seatbelt', roadType: 'Residential', avgFine: 500, avgSpeed: 32, weather: 'Cloudy' },
    { id: 'pune8', lat: 18.5400, lon: 73.8900, state: 'Maharashtra', city: 'Pune', area: 'Kharadi', riskScore: 68, riskLevel: 'Medium', totalViolations: 2560, accidentCount: 62, mostCommonViolation: 'Overspeeding', roadType: 'Arterial', avgFine: 800, avgSpeed: 45, weather: 'Cloudy' },
    { id: 'pune9', lat: 18.5100, lon: 73.8300, state: 'Maharashtra', city: 'Pune', area: 'Shivajinagar', riskScore: 73, riskLevel: 'Medium', totalViolations: 2980, accidentCount: 74, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 700, avgSpeed: 24, weather: 'Cloudy' },
    { id: 'pune10', lat: 18.5800, lon: 73.8100, state: 'Maharashtra', city: 'Pune', area: 'Wakad', riskScore: 66, riskLevel: 'Medium', totalViolations: 2180, accidentCount: 52, mostCommonViolation: 'Triple Riding', roadType: 'Residential', avgFine: 500, avgSpeed: 28, weather: 'Cloudy' },
  ],
  'Mumbai': [
    { id: 'mum1', lat: 19.076, lon: 72.877, state: 'Maharashtra', city: 'Mumbai', area: 'Bandra-Worli', riskScore: 92, riskLevel: 'High', totalViolations: 8920, accidentCount: 245, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1500, avgSpeed: 72, weather: 'Clear' },
    { id: 'mum2', lat: 19.088, lon: 72.835, state: 'Maharashtra', city: 'Mumbai', area: 'Andheri-Kurla', riskScore: 87, riskLevel: 'High', totalViolations: 7650, accidentCount: 198, mostCommonViolation: 'Signal Jumping', roadType: 'Arterial', avgFine: 800, avgSpeed: 28, weather: 'Clear' },
    { id: 'mum3', lat: 19.017, lon: 72.850, state: 'Maharashtra', city: 'Mumbai', area: 'Lower Parel', riskScore: 78, riskLevel: 'High', totalViolations: 5430, accidentCount: 134, mostCommonViolation: 'Wrong Side Driving', roadType: 'Arterial', avgFine: 600, avgSpeed: 22, weather: 'Clear' },
    { id: 'mum4', lat: 18.950, lon: 72.820, state: 'Maharashtra', city: 'Mumbai', area: 'Marine Drive', riskScore: 74, riskLevel: 'Medium', totalViolations: 4120, accidentCount: 98, mostCommonViolation: 'Overspeeding', roadType: 'Coastal', avgFine: 1000, avgSpeed: 55, weather: 'Clear' },
    { id: 'mum5', lat: 19.120, lon: 72.890, state: 'Maharashtra', city: 'Mumbai', area: 'Goregaon', riskScore: 69, riskLevel: 'Medium', totalViolations: 3450, accidentCount: 82, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 32, weather: 'Clear' },
    { id: 'mum6', lat: 19.200, lon: 72.970, state: 'Maharashtra', city: 'Mumbai', area: 'Thane GB Road', riskScore: 76, riskLevel: 'High', totalViolations: 4980, accidentCount: 118, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1100, avgSpeed: 62, weather: 'Clear' },
    { id: 'mum7', lat: 19.040, lon: 72.860, state: 'Maharashtra', city: 'Mumbai', area: 'Dadar Junction', riskScore: 83, riskLevel: 'High', totalViolations: 6230, accidentCount: 167, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 800, avgSpeed: 20, weather: 'Clear' },
    { id: 'mum8', lat: 18.990, lon: 72.830, state: 'Maharashtra', city: 'Mumbai', area: 'Nariman Point', riskScore: 62, riskLevel: 'Medium', totalViolations: 2180, accidentCount: 48, mostCommonViolation: 'No Seatbelt', roadType: 'Commercial', avgFine: 500, avgSpeed: 28, weather: 'Clear' },
    { id: 'mum9', lat: 19.060, lon: 72.920, state: 'Maharashtra', city: 'Mumbai', area: 'Chembur', riskScore: 72, riskLevel: 'Medium', totalViolations: 3780, accidentCount: 88, mostCommonViolation: 'Drunk Driving', roadType: 'Arterial', avgFine: 1500, avgSpeed: 35, weather: 'Clear' },
    { id: 'mum10', lat: 19.150, lon: 72.840, state: 'Maharashtra', city: 'Mumbai', area: 'Borivali', riskScore: 58, riskLevel: 'Medium', totalViolations: 1890, accidentCount: 42, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 30, weather: 'Clear' },
  ],
  'Delhi': [
    { id: 'del1', lat: 28.630, lon: 77.217, state: 'Delhi', city: 'Delhi', area: 'Connaught Place', riskScore: 91, riskLevel: 'High', totalViolations: 9870, accidentCount: 312, mostCommonViolation: 'Signal Jumping', roadType: 'Arterial', avgFine: 900, avgSpeed: 30, weather: 'Hazy' },
    { id: 'del2', lat: 28.535, lon: 77.391, state: 'Delhi', city: 'Delhi', area: 'Noida Expressway', riskScore: 89, riskLevel: 'High', totalViolations: 7650, accidentCount: 278, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1500, avgSpeed: 85, weather: 'Hazy' },
    { id: 'del3', lat: 28.669, lon: 77.453, state: 'Delhi', city: 'Delhi', area: 'Rohini', riskScore: 82, riskLevel: 'High', totalViolations: 5430, accidentCount: 167, mostCommonViolation: 'Drunk Driving', roadType: 'Residential', avgFine: 2000, avgSpeed: 38, weather: 'Hazy' },
    { id: 'del4', lat: 28.567, lon: 77.210, state: 'Delhi', city: 'Delhi', area: 'Saket', riskScore: 76, riskLevel: 'Medium', totalViolations: 4210, accidentCount: 98, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 42, weather: 'Hazy' },
    { id: 'del5', lat: 28.613, lon: 77.229, state: 'Delhi', city: 'Delhi', area: 'India Gate Area', riskScore: 72, riskLevel: 'Medium', totalViolations: 3560, accidentCount: 84, mostCommonViolation: 'Overspeeding', roadType: 'Arterial', avgFine: 1000, avgSpeed: 48, weather: 'Hazy' },
    { id: 'del6', lat: 28.482, lon: 77.510, state: 'Delhi', city: 'Delhi', area: 'Greater Noida', riskScore: 80, riskLevel: 'High', totalViolations: 5120, accidentCount: 142, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1400, avgSpeed: 92, weather: 'Hazy' },
    { id: 'del7', lat: 28.704, lon: 77.102, state: 'Delhi', city: 'Delhi', area: 'Pitampura', riskScore: 68, riskLevel: 'Medium', totalViolations: 2890, accidentCount: 72, mostCommonViolation: 'Signal Jumping', roadType: 'Residential', avgFine: 600, avgSpeed: 34, weather: 'Hazy' },
    { id: 'del8', lat: 28.635, lon: 77.282, state: 'Delhi', city: 'Delhi', area: 'Laxmi Nagar', riskScore: 74, riskLevel: 'Medium', totalViolations: 3670, accidentCount: 92, mostCommonViolation: 'Wrong Side Driving', roadType: 'Market', avgFine: 600, avgSpeed: 22, weather: 'Hazy' },
    { id: 'del9', lat: 28.590, lon: 77.050, state: 'Delhi', city: 'Delhi', area: 'Dwarka', riskScore: 63, riskLevel: 'Medium', totalViolations: 2340, accidentCount: 56, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 38, weather: 'Hazy' },
    { id: 'del10', lat: 28.650, lon: 77.230, state: 'Delhi', city: 'Delhi', area: 'Karol Bagh', riskScore: 71, riskLevel: 'Medium', totalViolations: 3120, accidentCount: 78, mostCommonViolation: 'Triple Riding', roadType: 'Market', avgFine: 500, avgSpeed: 20, weather: 'Hazy' },
  ],
  'Bengaluru': [
    { id: 'blr1', lat: 12.971, lon: 77.594, state: 'Karnataka', city: 'Bengaluru', area: 'Silk Board', riskScore: 85, riskLevel: 'High', totalViolations: 7890, accidentCount: 234, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 800, avgSpeed: 18, weather: 'Rainy' },
    { id: 'blr2', lat: 12.935, lon: 77.624, state: 'Karnataka', city: 'Bengaluru', area: 'Koramangala', riskScore: 72, riskLevel: 'Medium', totalViolations: 4320, accidentCount: 112, mostCommonViolation: 'Wrong Side Driving', roadType: 'Residential', avgFine: 600, avgSpeed: 32, weather: 'Rainy' },
    { id: 'blr3', lat: 13.035, lon: 77.597, state: 'Karnataka', city: 'Bengaluru', area: 'Hebbal Flyover', riskScore: 80, riskLevel: 'High', totalViolations: 5670, accidentCount: 156, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1200, avgSpeed: 68, weather: 'Rainy' },
    { id: 'blr4', lat: 12.970, lon: 77.640, state: 'Karnataka', city: 'Bengaluru', area: 'Whitefield', riskScore: 76, riskLevel: 'High', totalViolations: 4980, accidentCount: 128, mostCommonViolation: 'Overspeeding', roadType: 'Arterial', avgFine: 900, avgSpeed: 52, weather: 'Rainy' },
    { id: 'blr5', lat: 12.910, lon: 77.560, state: 'Karnataka', city: 'Bengaluru', area: 'JP Nagar', riskScore: 64, riskLevel: 'Medium', totalViolations: 2450, accidentCount: 58, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 30, weather: 'Rainy' },
    { id: 'blr6', lat: 12.980, lon: 77.570, state: 'Karnataka', city: 'Bengaluru', area: 'Indiranagar', riskScore: 69, riskLevel: 'Medium', totalViolations: 3120, accidentCount: 76, mostCommonViolation: 'Drunk Driving', roadType: 'Arterial', avgFine: 1500, avgSpeed: 28, weather: 'Rainy' },
    { id: 'blr7', lat: 13.020, lon: 77.630, state: 'Karnataka', city: 'Bengaluru', area: 'Manyata Tech Park', riskScore: 73, riskLevel: 'Medium', totalViolations: 3560, accidentCount: 88, mostCommonViolation: 'Overspeeding', roadType: 'Arterial', avgFine: 800, avgSpeed: 45, weather: 'Rainy' },
    { id: 'blr8', lat: 12.890, lon: 77.590, state: 'Karnataka', city: 'Bengaluru', area: 'Electronic City', riskScore: 78, riskLevel: 'High', totalViolations: 4560, accidentCount: 112, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1100, avgSpeed: 58, weather: 'Rainy' },
    { id: 'blr9', lat: 12.950, lon: 77.550, state: 'Karnataka', city: 'Bengaluru', area: 'Basavanagudi', riskScore: 56, riskLevel: 'Medium', totalViolations: 1560, accidentCount: 34, mostCommonViolation: 'Signal Jumping', roadType: 'Residential', avgFine: 600, avgSpeed: 24, weather: 'Rainy' },
    { id: 'blr10', lat: 13.010, lon: 77.580, state: 'Karnataka', city: 'Bengaluru', area: 'Malleshwaram', riskScore: 61, riskLevel: 'Medium', totalViolations: 1980, accidentCount: 42, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 26, weather: 'Rainy' },
  ],
  'Hyderabad': [
    { id: 'hyd1', lat: 17.385, lon: 78.486, state: 'Telangana', city: 'Hyderabad', area: 'Hitech City', riskScore: 78, riskLevel: 'High', totalViolations: 5670, accidentCount: 145, mostCommonViolation: 'Overspeeding', roadType: 'Arterial', avgFine: 1000, avgSpeed: 55, weather: 'Clear' },
    { id: 'hyd2', lat: 17.440, lon: 78.348, state: 'Telangana', city: 'Hyderabad', area: 'Gachibowli ORR', riskScore: 82, riskLevel: 'High', totalViolations: 6230, accidentCount: 178, mostCommonViolation: 'Overspeeding', roadType: 'Highway', avgFine: 1500, avgSpeed: 90, weather: 'Clear' },
    { id: 'hyd3', lat: 17.360, lon: 78.560, state: 'Telangana', city: 'Hyderabad', area: 'Charminar', riskScore: 69, riskLevel: 'Medium', totalViolations: 2890, accidentCount: 76, mostCommonViolation: 'Wrong Side Driving', roadType: 'Residential', avgFine: 500, avgSpeed: 22, weather: 'Clear' },
    { id: 'hyd4', lat: 17.410, lon: 78.440, state: 'Telangana', city: 'Hyderabad', area: 'Banjara Hills', riskScore: 65, riskLevel: 'Medium', totalViolations: 2340, accidentCount: 56, mostCommonViolation: 'Signal Jumping', roadType: 'Arterial', avgFine: 600, avgSpeed: 32, weather: 'Clear' },
    { id: 'hyd5', lat: 17.460, lon: 78.520, state: 'Telangana', city: 'Hyderabad', area: 'Secunderabad', riskScore: 73, riskLevel: 'Medium', totalViolations: 3450, accidentCount: 88, mostCommonViolation: 'No Helmet', roadType: 'Arterial', avgFine: 500, avgSpeed: 35, weather: 'Clear' },
    { id: 'hyd6', lat: 17.320, lon: 78.480, state: 'Telangana', city: 'Hyderabad', area: 'LB Nagar', riskScore: 71, riskLevel: 'Medium', totalViolations: 3120, accidentCount: 78, mostCommonViolation: 'Overspeeding', roadType: 'Arterial', avgFine: 800, avgSpeed: 42, weather: 'Clear' },
    { id: 'hyd7', lat: 17.380, lon: 78.380, state: 'Telangana', city: 'Hyderabad', area: 'Kukatpally', riskScore: 67, riskLevel: 'Medium', totalViolations: 2670, accidentCount: 62, mostCommonViolation: 'Drunk Driving', roadType: 'Residential', avgFine: 1500, avgSpeed: 30, weather: 'Clear' },
    { id: 'hyd8', lat: 17.500, lon: 78.400, state: 'Telangana', city: 'Hyderabad', area: 'Miyapur', riskScore: 60, riskLevel: 'Medium', totalViolations: 1890, accidentCount: 44, mostCommonViolation: 'No Helmet', roadType: 'Residential', avgFine: 500, avgSpeed: 28, weather: 'Clear' },
    { id: 'hyd9', lat: 17.340, lon: 78.420, state: 'Telangana', city: 'Hyderabad', area: 'Mehdipatnam', riskScore: 74, riskLevel: 'Medium', totalViolations: 3560, accidentCount: 92, mostCommonViolation: 'Signal Jumping', roadType: 'Intersection', avgFine: 700, avgSpeed: 24, weather: 'Clear' },
    { id: 'hyd10', lat: 17.470, lon: 78.560, state: 'Telangana', city: 'Hyderabad', area: 'Uppal', riskScore: 62, riskLevel: 'Medium', totalViolations: 2120, accidentCount: 50, mostCommonViolation: 'Wrong Side Driving', roadType: 'Arterial', avgFine: 500, avgSpeed: 34, weather: 'Clear' },
  ],
};

// ── City Summary Data ──
export const citySummaries: Record<string, CitySummary> = {
  'Nagpur': { city: 'Nagpur', state: 'Maharashtra', totalViolations: 45230, totalAccidents: 1245, highRiskAreas: 8, mostCommonViolation: 'Overspeeding', avgSpeed: 38, totalFineCollected: 34250000, weather: 'Clear', riskScore: 78, temperature: 32, humidity: 45 },
  'Pune': { city: 'Pune', state: 'Maharashtra', totalViolations: 52100, totalAccidents: 1580, highRiskAreas: 10, mostCommonViolation: 'Overspeeding', avgSpeed: 42, totalFineCollected: 42180000, weather: 'Cloudy', riskScore: 82, temperature: 28, humidity: 65 },
  'Mumbai': { city: 'Mumbai', state: 'Maharashtra', totalViolations: 68900, totalAccidents: 2100, highRiskAreas: 14, mostCommonViolation: 'Signal Jumping', avgSpeed: 32, totalFineCollected: 58760000, weather: 'Clear', riskScore: 88, temperature: 30, humidity: 72 },
  'Delhi': { city: 'Delhi', state: 'Delhi', totalViolations: 73200, totalAccidents: 2450, highRiskAreas: 16, mostCommonViolation: 'Overspeeding', avgSpeed: 38, totalFineCollected: 65420000, weather: 'Hazy', riskScore: 91, temperature: 34, humidity: 55 },
  'Bengaluru': { city: 'Bengaluru', state: 'Karnataka', totalViolations: 48700, totalAccidents: 1890, highRiskAreas: 12, mostCommonViolation: 'Signal Jumping', avgSpeed: 35, totalFineCollected: 39870000, weather: 'Rainy', riskScore: 79, temperature: 26, humidity: 80 },
  'Hyderabad': { city: 'Hyderabad', state: 'Telangana', totalViolations: 39800, totalAccidents: 1120, highRiskAreas: 9, mostCommonViolation: 'Overspeeding', avgSpeed: 40, totalFineCollected: 32140000, weather: 'Clear', riskScore: 72, temperature: 35, humidity: 40 },
  'Chennai': { city: 'Chennai', state: 'Tamil Nadu', totalViolations: 41200, totalAccidents: 1340, highRiskAreas: 11, mostCommonViolation: 'Overspeeding', avgSpeed: 36, totalFineCollected: 33450000, weather: 'Rainy', riskScore: 75, temperature: 33, humidity: 78 },
  'Kolkata': { city: 'Kolkata', state: 'West Bengal', totalViolations: 37600, totalAccidents: 1080, highRiskAreas: 8, mostCommonViolation: 'No Helmet', avgSpeed: 28, totalFineCollected: 28970000, weather: 'Humid', riskScore: 70, temperature: 34, humidity: 85 },
  'Jaipur': { city: 'Jaipur', state: 'Rajasthan', totalViolations: 29800, totalAccidents: 920, highRiskAreas: 6, mostCommonViolation: 'No Helmet', avgSpeed: 44, totalFineCollected: 21340000, weather: 'Clear', riskScore: 65, temperature: 38, humidity: 25 },
  'Lucknow': { city: 'Lucknow', state: 'Uttar Pradesh', totalViolations: 34500, totalAccidents: 1050, highRiskAreas: 7, mostCommonViolation: 'Signal Jumping', avgSpeed: 36, totalFineCollected: 25780000, weather: 'Foggy', riskScore: 69, temperature: 30, humidity: 60 },
};

// ── Traffic Insights ──
export const trafficInsights: TrafficInsight = {
  vehicleCount: 128456,
  avgSpeed: 42,
  violationCount: 8734,
  accidentDetected: 23,
  lastUpdated: new Date().toISOString(),
  vehicleCountTrend: [120000, 122000, 118000, 125000, 128000, 130000, 127000, 128456],
  avgSpeedTrend: [40, 42, 38, 44, 41, 43, 39, 42],
  violationTrend: [8200, 8500, 8100, 8900, 8400, 8600, 8700, 8734],
  accidentTrend: [18, 22, 19, 25, 20, 24, 21, 23],
};

// ── Recent Events ──
export const recentEvents: EventData[] = [
  { id: 'evt1', title: 'Multi-Vehicle Collision on NH-44', description: 'Three vehicles involved in a high-speed collision near Hingna T-point. Truck rammed into two cars waiting at signal.', severity: 'Critical', location: 'NH-44, Hingna T-Point', city: 'Nagpur', accidentOccurred: true, weather: 'Clear', vehicleTypes: ['Truck', 'Car', 'Car'], affectedLanes: 3, ambulanceOnScene: true, policeOnScene: true, fireOnScene: false, timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'evt2', title: 'Overspeeding Violation Cluster', description: 'Cluster of 12 overspeeding violations detected on Wardha Road stretch between Dharampeth and Sitabuldi.', severity: 'High', location: 'Wardha Road', city: 'Nagpur', accidentOccurred: false, weather: 'Clear', vehicleTypes: ['Car', 'Bike', 'Car', 'SUV'], affectedLanes: 2, ambulanceOnScene: false, policeOnScene: true, fireOnScene: false, timestamp: new Date(Date.now() - 32 * 60000).toISOString() },
  { id: 'evt3', title: 'Signal Jumping at Hinjewadi Junction', description: 'Multiple signal jumping incidents detected at Hinjewadi Phase-2 junction during peak hours.', severity: 'Medium', location: 'Hinjewadi Phase-2', city: 'Pune', accidentOccurred: false, weather: 'Cloudy', vehicleTypes: ['Bike', 'Auto', 'Car'], affectedLanes: 1, ambulanceOnScene: false, policeOnScene: false, fireOnScene: false, timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'evt4', title: 'Bike-Pedestrian Accident', description: 'Two-wheeler hit a pedestrian at Bandra-Worli Sea Link approach. Pedestrian injured and transported to hospital.', severity: 'Critical', location: 'Bandra-Worli Sea Link', city: 'Mumbai', accidentOccurred: true, weather: 'Clear', vehicleTypes: ['Bike'], affectedLanes: 1, ambulanceOnScene: true, policeOnScene: true, fireOnScene: false, timestamp: new Date(Date.now() - 58 * 60000).toISOString() },
  { id: 'evt5', title: 'Drunk Driving Detection', description: 'AI camera detected suspected drunk driving on Rohini Sector 7. Vehicle intercepted and driver booked.', severity: 'High', location: 'Rohini Sector 7', city: 'Delhi', accidentOccurred: false, weather: 'Hazy', vehicleTypes: ['Car'], affectedLanes: 1, ambulanceOnScene: false, policeOnScene: true, fireOnScene: false, timestamp: new Date(Date.now() - 72 * 60000).toISOString() },
  { id: 'evt6', title: 'Traffic Jam on Silk Board', description: 'Severe traffic congestion at Silk Board Junction due to waterlogging from heavy rain. Multiple lanes blocked.', severity: 'Medium', location: 'Silk Board Junction', city: 'Bengaluru', accidentOccurred: false, weather: 'Rainy', vehicleTypes: ['Car', 'Bus', 'Bike'], affectedLanes: 3, ambulanceOnScene: false, policeOnScene: true, fireOnScene: false, timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: 'evt7', title: 'ORR Overspeeding Alert', description: 'Speed camera flagged 8 vehicles exceeding 120km/h limit on Outer Ring Road near Gachibowli.', severity: 'High', location: 'Gachibowli ORR', city: 'Hyderabad', accidentOccurred: false, weather: 'Clear', vehicleTypes: ['Car', 'SUV', 'Car'], affectedLanes: 2, ambulanceOnScene: false, policeOnScene: true, fireOnScene: false, timestamp: new Date(Date.now() - 105 * 60000).toISOString() },
  { id: 'evt8', title: 'Wrong Side Driving Incident', description: 'Multiple wrong-side driving incidents detected near Charminar area creating dangerous situations.', severity: 'Low', location: 'Charminar Area', city: 'Hyderabad', accidentOccurred: false, weather: 'Clear', vehicleTypes: ['Bike', 'Auto'], affectedLanes: 1, ambulanceOnScene: false, policeOnScene: false, fireOnScene: false, timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
];

// ── Department Status ──
export const departmentStatus: DepartmentInfo[] = [
  { name: 'Hospital', status: 'Dispatched', icon: 'Hospital' },
  { name: 'Police', status: 'In Progress', icon: 'Shield' },
  { name: 'Fire', status: 'Notified', icon: 'Flame' },
  { name: 'Tow Truck', status: 'Triggered', icon: 'Truck' },
  { name: 'Traffic Control', status: 'Resolved', icon: 'TrafficCone' },
  { name: 'Radio', status: 'In Progress', icon: 'Radio' },
];

// ── Key Metrics ──
export const keyMetrics: KeyMetric[] = [
  { id: 'km1', title: 'Active Cameras', value: '2,456', subtitle: 'Across India', icon: 'Camera', trend: 'up', trendValue: '+12' },
  { id: 'km2', title: 'Online Devices', value: '2,180', subtitle: '88.7% uptime', icon: 'Wifi', trend: 'up', trendValue: '+5' },
  { id: 'km3', title: 'Speed Violations', value: '3,421', subtitle: 'Last 24 hours', icon: 'Gauge', trend: 'down', trendValue: '-8%' },
  { id: 'km4', title: 'Signal Jumps', value: '1,892', subtitle: 'Last 24 hours', icon: 'OctagonAlert', trend: 'up', trendValue: '+15%' },
  { id: 'km5', title: 'Accident Alerts', value: '23', subtitle: 'Active now', icon: 'Siren', trend: 'stable', trendValue: '0%' },
  { id: 'km6', title: 'Weather Alerts', value: '5', subtitle: 'Active zones', icon: 'CloudRain', trend: 'up', trendValue: '+2' },
  { id: 'km7', title: 'Fine Collected', value: '\u20b94.2Cr', subtitle: 'This month', icon: 'IndianRupee', trend: 'up', trendValue: '+18%' },
  { id: 'km8', title: 'Hotspot Zones', value: '34', subtitle: 'High risk areas', icon: 'MapPin', trend: 'up', trendValue: '+3' },
];

// ── Violation Analysis ──
export const violationAnalysis: ViolationAnalysis = {
  violationsByType: [
    { type: 'Overspeeding', count: 28450 },
    { type: 'Signal Jumping', count: 19820 },
    { type: 'No Helmet', count: 15670 },
    { type: 'Wrong Side', count: 8930 },
    { type: 'Drunk Driving', count: 5210 },
    { type: 'No Seatbelt', count: 4580 },
    { type: 'Triple Riding', count: 3240 },
    { type: 'Using Mobile', count: 2890 },
  ],
  violationsByVehicleType: [
    { type: 'Two-Wheeler', count: 34560 },
    { type: 'Car', count: 22340 },
    { type: 'Auto', count: 8920 },
    { type: 'Truck', count: 5670 },
    { type: 'Bus', count: 3450 },
    { type: 'SUV', count: 4280 },
  ],
  violationsByAgeGroup: [
    { ageGroup: '18-25', count: 22340 },
    { ageGroup: '26-35', count: 28960 },
    { ageGroup: '36-45', count: 18450 },
    { ageGroup: '46-55', count: 8920 },
    { ageGroup: '55+', count: 3780 },
  ],
  violationsByGender: [
    { gender: 'Male', count: 62450 },
    { gender: 'Female', count: 15670 },
    { gender: 'Other', count: 830 },
  ],
  violationsByLicenseType: [
    { type: 'LMV', count: 31200 },
    { type: 'MCWG', count: 28450 },
    { type: 'HMV', count: 8900 },
    { type: 'Learner', count: 5670 },
    { type: 'No License', count: 6730 },
  ],
  violationsByRoadType: [
    { type: 'Highway', count: 22340 },
    { type: 'Arterial', count: 18920 },
    { type: 'Residential', count: 12670 },
    { type: 'Intersection', count: 8930 },
    { type: 'Market', count: 5210 },
    { type: 'Bridge', count: 2890 },
  ],
  fineByViolationType: [
    { type: 'Drunk Driving', amount: 2000 },
    { type: 'Overspeeding', amount: 1500 },
    { type: 'Signal Jumping', amount: 800 },
    { type: 'Wrong Side', amount: 600 },
    { type: 'No Helmet', amount: 500 },
    { type: 'No Seatbelt', amount: 500 },
    { type: 'Triple Riding', amount: 500 },
    { type: 'Using Mobile', amount: 1000 },
  ],
  repeatOffenders: [
    { range: '1st Offense', count: 45230 },
    { range: '2nd Offense', count: 18920 },
    { range: '3rd Offense', count: 6780 },
    { range: '4th Offense', count: 2340 },
    { range: '5th+ Offense', count: 890 },
  ],
};

// ── Association Rules (Apriori) ──
export const associationRules: AssociationRule[] = [
  { id: 'ar1', antecedent: 'Overspeeding + Highway', consequent: 'High Risk Accident Zone', support: 0.42, confidence: 0.78, lift: 2.34, interpretation: 'Overspeeding on highways strongly predicts accident-prone zones with high confidence.' },
  { id: 'ar2', antecedent: 'No Helmet + Two-Wheeler', consequent: 'Severe Injury Accident', support: 0.38, confidence: 0.72, lift: 2.18, interpretation: 'Riders without helmets on two-wheelers are highly likely to be in severe injury accidents.' },
  { id: 'ar3', antecedent: 'Drunk Driving + Night', consequent: 'Fatal Accident', support: 0.31, confidence: 0.85, lift: 3.12, interpretation: 'Drunk driving at night has the strongest association with fatal accidents.' },
  { id: 'ar4', antecedent: 'Signal Jumping + Intersection', consequent: 'Multi-Vehicle Collision', support: 0.29, confidence: 0.68, lift: 1.95, interpretation: 'Signal jumping at intersections frequently leads to multi-vehicle collisions.' },
  { id: 'ar5', antecedent: 'Rainy Weather + Highway', consequent: 'Speed Violation Increase', support: 0.35, confidence: 0.64, lift: 1.78, interpretation: 'Rainy conditions on highways lead to increased speed violations due to reduced visibility.' },
  { id: 'ar6', antecedent: 'Wrong Side + Residential', consequent: 'Pedestrian Accident', support: 0.27, confidence: 0.71, lift: 2.05, interpretation: 'Wrong-side driving in residential areas poses significant risk to pedestrians.' },
  { id: 'ar7', antecedent: 'Young Driver (18-25) + Bike', consequent: 'Overspeeding', support: 0.44, confidence: 0.66, lift: 1.89, interpretation: 'Young bike riders are strongly associated with overspeeding violations.' },
  { id: 'ar8', antecedent: 'No Seatbelt + Car', consequent: 'Severe Injury', support: 0.22, confidence: 0.74, lift: 2.28, interpretation: 'Car occupants without seatbelts are more likely to sustain severe injuries in accidents.' },
  { id: 'ar9', antecedent: 'Foggy + Highway', consequent: 'Multi-Vehicle Collision', support: 0.18, confidence: 0.82, lift: 2.76, interpretation: 'Foggy conditions on highways are strongly linked to pile-up accidents.' },
  { id: 'ar10', antecedent: 'Triple Riding + Bike', consequent: 'Loss of Control', support: 0.15, confidence: 0.79, lift: 2.45, interpretation: 'Triple riding on bikes frequently leads to loss of control incidents.' },
  { id: 'ar11', antecedent: 'Mobile Use + Car', consequent: 'Signal Jumping', support: 0.26, confidence: 0.58, lift: 1.62, interpretation: 'Mobile phone usage while driving is associated with signal jumping behavior.' },
  { id: 'ar12', antecedent: 'Learner License + Night', consequent: 'Wrong Side Driving', support: 0.14, confidence: 0.62, lift: 1.85, interpretation: 'Learner drivers at night are more likely to drive on the wrong side.' },
  { id: 'ar13', antecedent: 'Overspeeding + Truck', consequent: 'High Risk Zone', support: 0.33, confidence: 0.76, lift: 2.52, interpretation: 'Speeding trucks are strong indicators of high-risk traffic zones.' },
  { id: 'ar14', antecedent: 'Rain + Intersection', consequent: 'Signal Jumping', support: 0.21, confidence: 0.55, lift: 1.48, interpretation: 'Rain at intersections moderately increases signal jumping violations.' },
  { id: 'ar15', antecedent: 'Night + Weekend', consequent: 'Drunk Driving', support: 0.28, confidence: 0.73, lift: 2.67, interpretation: 'Weekend nights show the highest association with drunk driving incidents.' },
  { id: 'ar16', antecedent: 'Heavy Vehicle + Bridge', consequent: 'Speed Violation', support: 0.19, confidence: 0.61, lift: 1.72, interpretation: 'Heavy vehicles on bridges tend to violate speed limits more frequently.' },
  { id: 'ar17', antecedent: 'Market Area + Bike', consequent: 'Wrong Side', support: 0.24, confidence: 0.67, lift: 1.95, interpretation: 'Bikes in market areas are more likely to drive on the wrong side of the road.' },
  { id: 'ar18', antecedent: 'Peak Hour + Intersection', consequent: 'Signal Jumping', support: 0.39, confidence: 0.62, lift: 1.76, interpretation: 'Peak hour traffic at intersections leads to increased signal jumping.' },
  { id: 'ar19', antecedent: 'Elderly Driver + Night', consequent: 'Wrong Side', support: 0.11, confidence: 0.56, lift: 1.65, interpretation: 'Elderly drivers at night have a moderate association with wrong-side driving.' },
  { id: 'ar20', antecedent: 'No Helmet + Repeat Offender', consequent: 'Severe Injury', support: 0.16, confidence: 0.88, lift: 3.45, interpretation: 'Repeat offenders riding without helmets have the highest risk of severe injury.' },
];

// ── Cluster Results (K-Means) ──
export const clusterResults: ClusterResult[] = [
  // Cluster 0 - High Risk
  { id: 'cl1', area: 'Bandra-Worli', city: 'Mumbai', cluster: 0, riskLevel: 'High', riskScore: 92, totalViolations: 8920, accidentCount: 245, lat: 19.076, lon: 72.877 },
  { id: 'cl2', area: 'Connaught Place', city: 'Delhi', cluster: 0, riskLevel: 'High', riskScore: 91, totalViolations: 9870, accidentCount: 312, lat: 28.630, lon: 77.217 },
  { id: 'cl3', area: 'Noida Expressway', city: 'Delhi', cluster: 0, riskLevel: 'High', riskScore: 89, totalViolations: 7650, accidentCount: 278, lat: 28.535, lon: 77.391 },
  { id: 'cl4', area: 'Andheri-Kurla', city: 'Mumbai', cluster: 0, riskLevel: 'High', riskScore: 87, totalViolations: 7650, accidentCount: 198, lat: 19.088, lon: 72.835 },
  { id: 'cl5', area: 'Silk Board', city: 'Bengaluru', cluster: 0, riskLevel: 'High', riskScore: 85, totalViolations: 7890, accidentCount: 234, lat: 12.971, lon: 77.594 },
  { id: 'cl6', area: 'Hinjewadi', city: 'Pune', cluster: 0, riskLevel: 'High', riskScore: 84, totalViolations: 6780, accidentCount: 172, lat: 18.520, lon: 73.856 },
  { id: 'cl7', area: 'ECR Road', city: 'Chennai', cluster: 0, riskLevel: 'High', riskScore: 83, totalViolations: 5670, accidentCount: 167, lat: 13.047, lon: 80.243 },
  { id: 'cl8', area: 'Gachibowli ORR', city: 'Hyderabad', cluster: 0, riskLevel: 'High', riskScore: 82, totalViolations: 6230, accidentCount: 178, lat: 17.440, lon: 78.348 },
  { id: 'cl9', area: 'Rohini', city: 'Delhi', cluster: 0, riskLevel: 'High', riskScore: 82, totalViolations: 5430, accidentCount: 167, lat: 28.669, lon: 77.453 },
  { id: 'cl10', area: 'Hebbal Flyover', city: 'Bengaluru', cluster: 0, riskLevel: 'High', riskScore: 80, totalViolations: 5670, accidentCount: 156, lat: 13.035, lon: 77.597 },
  // Cluster 1 - Medium Risk
  { id: 'cl11', area: 'Swargate', city: 'Pune', cluster: 1, riskLevel: 'Medium', riskScore: 79, totalViolations: 5430, accidentCount: 134, lat: 18.531, lon: 73.844 },
  { id: 'cl12', area: 'Dharampeth', city: 'Nagpur', cluster: 1, riskLevel: 'Medium', riskScore: 78, totalViolations: 4560, accidentCount: 112, lat: 21.145, lon: 79.088 },
  { id: 'cl13', area: 'Hitech City', city: 'Hyderabad', cluster: 1, riskLevel: 'Medium', riskScore: 78, totalViolations: 5670, accidentCount: 145, lat: 17.385, lon: 78.486 },
  { id: 'cl14', area: 'Wardha Road', city: 'Nagpur', cluster: 1, riskLevel: 'Medium', riskScore: 82, totalViolations: 4120, accidentCount: 105, lat: 21.120, lon: 79.075 },
  { id: 'cl15', area: 'Koramangala', city: 'Bengaluru', cluster: 1, riskLevel: 'Medium', riskScore: 72, totalViolations: 4320, accidentCount: 112, lat: 12.935, lon: 77.624 },
  { id: 'cl16', area: 'Saket', city: 'Delhi', cluster: 1, riskLevel: 'Medium', riskScore: 76, totalViolations: 4210, accidentCount: 98, lat: 28.567, lon: 77.210 },
  { id: 'cl17', area: 'Anna Salai', city: 'Chennai', cluster: 1, riskLevel: 'Medium', riskScore: 76, totalViolations: 4890, accidentCount: 123, lat: 13.082, lon: 80.270 },
  { id: 'cl18', area: 'Marine Drive', city: 'Mumbai', cluster: 1, riskLevel: 'Medium', riskScore: 74, totalViolations: 4120, accidentCount: 98, lat: 18.950, lon: 72.820 },
  { id: 'cl19', area: 'Howrah Bridge', city: 'Kolkata', cluster: 1, riskLevel: 'Medium', riskScore: 74, totalViolations: 4120, accidentCount: 105, lat: 22.540, lon: 88.340 },
  { id: 'cl20', area: 'Sitabuldi', city: 'Nagpur', cluster: 1, riskLevel: 'Medium', riskScore: 74, totalViolations: 3920, accidentCount: 89, lat: 21.150, lon: 79.095 },
  // Cluster 2 - Low Risk
  { id: 'cl21', area: 'Aundh', city: 'Pune', cluster: 2, riskLevel: 'Low', riskScore: 62, totalViolations: 2340, accidentCount: 56, lat: 18.559, lon: 73.821 },
  { id: 'cl22', area: 'Civil Lines', city: 'Nagpur', cluster: 2, riskLevel: 'Low', riskScore: 55, totalViolations: 1560, accidentCount: 34, lat: 21.160, lon: 79.100 },
  { id: 'cl23', area: 'Nariman Point', city: 'Mumbai', cluster: 2, riskLevel: 'Low', riskScore: 62, totalViolations: 2180, accidentCount: 48, lat: 18.990, lon: 72.830 },
  { id: 'cl24', area: 'Dwarka', city: 'Delhi', cluster: 2, riskLevel: 'Low', riskScore: 63, totalViolations: 2340, accidentCount: 56, lat: 28.590, lon: 77.050 },
  { id: 'cl25', area: 'JP Nagar', city: 'Bengaluru', cluster: 2, riskLevel: 'Low', riskScore: 64, totalViolations: 2450, accidentCount: 58, lat: 12.910, lon: 77.560 },
  { id: 'cl26', area: 'Banjara Hills', city: 'Hyderabad', cluster: 2, riskLevel: 'Low', riskScore: 65, totalViolations: 2340, accidentCount: 56, lat: 17.410, lon: 78.440 },
  { id: 'cl27', area: 'Bavdhan', city: 'Pune', cluster: 2, riskLevel: 'Low', riskScore: 58, totalViolations: 1670, accidentCount: 38, lat: 18.560, lon: 73.780 },
  { id: 'cl28', area: 'Borivali', city: 'Mumbai', cluster: 2, riskLevel: 'Low', riskScore: 58, totalViolations: 1890, accidentCount: 42, lat: 19.150, lon: 72.840 },
  { id: 'cl29', area: 'Pashan', city: 'Pune', cluster: 2, riskLevel: 'Low', riskScore: 54, totalViolations: 1230, accidentCount: 28, lat: 18.570, lon: 73.840 },
  { id: 'cl30', area: 'Pratap Nagar', city: 'Nagpur', cluster: 2, riskLevel: 'Low', riskScore: 54, totalViolations: 1120, accidentCount: 22, lat: 21.135, lon: 79.050 },
  { id: 'cl31', area: 'Basavanagudi', city: 'Bengaluru', cluster: 2, riskLevel: 'Low', riskScore: 56, totalViolations: 1560, accidentCount: 34, lat: 12.950, lon: 77.550 },
  { id: 'cl32', area: 'Uppal', city: 'Hyderabad', cluster: 2, riskLevel: 'Low', riskScore: 62, totalViolations: 2120, accidentCount: 50, lat: 17.470, lon: 78.560 },
];

// ── City-Specific Data Helpers ──

// Get traffic insights for a specific city (derived from city summary data)
export function getTrafficInsightsForCity(city: string): TrafficInsight {
  const isAllIndia = !city || city === 'All India';
  if (isAllIndia) return trafficInsights;

  const summary = citySummaries[city];
  if (!summary) return trafficInsights;

  const ratio = summary.totalViolations / trafficInsights.violationCount;
  return {
    vehicleCount: Math.round(trafficInsights.vehicleCount * ratio),
    avgSpeed: summary.avgSpeed,
    violationCount: Math.round(summary.totalViolations / 365),
    accidentDetected: Math.round(summary.totalAccidents / 365),
    lastUpdated: new Date().toISOString(),
    vehicleCountTrend: trafficInsights.vehicleCountTrend.map(v => Math.round(v * ratio)),
    avgSpeedTrend: trafficInsights.avgSpeedTrend.map(() => summary.avgSpeed + Math.round((Math.random() - 0.5) * 8)),
    violationTrend: trafficInsights.violationTrend.map(v => Math.round(v * ratio)),
    accidentTrend: trafficInsights.accidentTrend.map(v => Math.max(1, Math.round(v * ratio))),
  };
}

// Get events filtered by city
export function getEventsForCity(city: string): EventData[] {
  if (!city || city === 'All India') return recentEvents;
  return recentEvents.filter(e => e.city === city);
}

// Get cluster results filtered by city
export function getClusterResultsForCity(city: string): ClusterResult[] {
  if (!city || city === 'All India') return clusterResults;
  return clusterResults.filter(c => c.city === city);
}

// Get key metrics for a specific city
export function getKeyMetricsForCity(city: string): KeyMetric[] {
  if (!city || city === 'All India') return keyMetrics;
  const summary = citySummaries[city];
  if (!summary) return keyMetrics;

  const ratio = summary.totalViolations / 498000; // total of all cities
  return keyMetrics.map(m => ({
    ...m,
    value: typeof m.value === 'number'
      ? (m.id === 'avg-response' ? m.value : Math.round(Number(m.value) * ratio))
      : m.value,
    subtitle: m.subtitle.replace(/\d+/, Math.round(Number(m.value) * ratio).toString()),
  }));
}

// Get violation analysis scaled for a specific city
export function getViolationAnalysisForCity(city: string): ViolationAnalysis {
  if (!city || city === 'All India') return violationAnalysis;
  const summary = citySummaries[city];
  if (!summary) return violationAnalysis;

  const ratio = summary.totalViolations / 498000;
  const scaleArray = <T extends Record<string, unknown>>(arr: T[], key: keyof T): T[] =>
    arr.map(item => ({ ...item, [key]: Math.round(Number(item[key]) * ratio) }));

  return {
    violationsByType: scaleArray(violationAnalysis.violationsByType, 'count'),
    violationsByVehicleType: scaleArray(violationAnalysis.violationsByVehicleType, 'count'),
    violationsByAgeGroup: scaleArray(violationAnalysis.violationsByAgeGroup, 'count'),
    violationsByGender: scaleArray(violationAnalysis.violationsByGender, 'count'),
    violationsByLicenseType: scaleArray(violationAnalysis.violationsByLicenseType, 'count'),
    violationsByRoadType: scaleArray(violationAnalysis.violationsByRoadType, 'count'),
    fineByViolationType: scaleArray(violationAnalysis.fineByViolationType, 'amount'),
    repeatOffenders: scaleArray(violationAnalysis.repeatOffenders, 'count'),
  };
}
