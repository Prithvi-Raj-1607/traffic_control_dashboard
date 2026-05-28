import { useState, useCallback } from 'react';
import MapPanel from '../components/MapPanel';
import CitySummaryCard from '../components/CitySummaryCard';
import InsightCard from '../components/InsightCard';
import EventCard from '../components/EventCard';
import DepartmentStatus from '../components/DepartmentStatus';
import KeyMetricCard from '../components/KeyMetricCard';
import {
  trafficInsights,
  recentEvents,
  departmentStatuses,
  keyMetrics,
  indiaRiskMarkers,
  citySummaries,
  getCityAreas,
  citiesData,
} from '../data/mockDashboardData';
import type { CityData, MapMode, RiskMarker } from '../types';

interface DashboardProps {
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
}

export default function Dashboard({ selectedCity, setSelectedCity }: DashboardProps) {
  const [mapMode, setMapMode] = useState<MapMode>('india');
  const [cityMarkers, setCityMarkers] = useState<RiskMarker[]>([]);
  const [cityCenter, setCityCenter] = useState<[number, number]>([20.5937, 78.9629]);

  const handleCitySearch = useCallback((city: CityData) => {
    setSelectedCity(city.name);
    setMapMode('city');
    setCityCenter([city.lat, city.lon]);
    setCityMarkers(getCityAreas(city.name));
  }, [setSelectedCity]);

  const handleCitySelect = useCallback((cityName: string) => {
    const city = citiesData.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city.name);
      setMapMode('city');
      setCityCenter([city.lat, city.lon]);
      setCityMarkers(getCityAreas(city.name));
    }
  }, [setSelectedCity]);

  const handleReset = useCallback(() => {
    setSelectedCity(null);
    setMapMode('india');
    setCityMarkers([]);
  }, [setSelectedCity]);

  const summary = selectedCity ? citySummaries[selectedCity] : null;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Section - Map & City Info */}
      <div className="col-span-5 space-y-6">
        {summary && <CitySummaryCard summary={summary} />}
        <MapPanel
          mapMode={mapMode}
          selectedCity={selectedCity}
          riskMarkers={indiaRiskMarkers}
          cityMarkers={cityMarkers}
          cityCenter={cityCenter}
          onCitySelect={handleCitySelect}
          onCitySearch={handleCitySearch}
          onReset={handleReset}
        />
      </div>

      {/* Right Section - Insights & Events */}
      <div className="col-span-7 space-y-6">
        <InsightCard insights={trafficInsights} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {recentEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
        <DepartmentStatus departments={departmentStatuses} />
      </div>

      {/* Key Metrics - Full Width */}
      <div className="col-span-12">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Key Metrics</h3>
        <KeyMetricCard metrics={keyMetrics} />
      </div>
    </div>
  );
}
