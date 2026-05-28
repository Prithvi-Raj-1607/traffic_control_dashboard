const BASE_URL = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

import type {
  OverviewResponse,
  RiskMarker,
  CitySummary,
  TrafficInsight,
  EventData,
  KeyMetric,
  ViolationAnalysis,
  AssociationRule,
  ClusterResult,
  WeatherData,
  CityData,
} from '../types';

export const api = {
  getOverview: () => fetchAPI<OverviewResponse>('/overview'),

  searchCity: (query: string) =>
    fetchAPI<CityData[]>(`/search/city?q=${encodeURIComponent(query)}`),

  getIndiaRisk: () => fetchAPI<RiskMarker[]>('/india-risk'),

  getCityRisk: (city: string) =>
    fetchAPI<RiskMarker[]>(`/city-risk?city=${encodeURIComponent(city)}`),

  getCitySummary: (city: string) =>
    fetchAPI<CitySummary>(`/city-summary?city=${encodeURIComponent(city)}`),

  getPopularCities: () => fetchAPI<CityData[]>('/popular-cities'),

  getTrafficInsights: () => fetchAPI<TrafficInsight>('/traffic-insights'),

  getRecentEvents: () => fetchAPI<EventData[]>('/recent-events'),

  getKeyMetrics: () => fetchAPI<KeyMetric[]>('/key-metrics'),

  getViolationAnalysis: () => fetchAPI<ViolationAnalysis>('/violation-analysis'),

  getAssociationRules: () => fetchAPI<AssociationRule[]>('/association-rules'),

  getRiskClusters: () => fetchAPI<ClusterResult[]>('/risk-clusters'),

  getCurrentWeather: (lat: number, lon: number) =>
    fetchAPI<WeatherData>(`/weather?lat=${lat}&lon=${lon}`),

  simulateTick: () => fetchAPI<{ status: string }>('/simulate-tick'),
};
