import { useState, useCallback } from 'react';
import MapPanel from '../components/MapPanel';
import CitySummaryCard from '../components/CitySummaryCard';
import { indiaRiskMarkers, citySummaries, getCityAreas, citiesData } from '../data/mockDashboardData';
import type { CityData, MapMode, RiskMarker } from '../types';
import { Layers, Filter, CloudSun, Thermometer, Droplets, Wind, Eye } from 'lucide-react';

export default function LiveMap() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('india');
  const [cityMarkers, setCityMarkers] = useState<RiskMarker[]>([]);
  const [cityCenter, setCityCenter] = useState<[number, number]>([20.5937, 78.9629]);

  const handleCitySearch = useCallback((city: CityData) => {
    setSelectedCity(city.name);
    setMapMode('city');
    setCityCenter([city.lat, city.lon]);
    setCityMarkers(getCityAreas(city.name));
  }, []);

  const handleCitySelect = useCallback((cityName: string) => {
    const city = citiesData.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city.name);
      setMapMode('city');
      setCityCenter([city.lat, city.lon]);
      setCityMarkers(getCityAreas(city.name));
    }
  }, []);

  const handleReset = useCallback(() => {
    setSelectedCity(null);
    setMapMode('india');
    setCityMarkers([]);
  }, []);

  const summary = selectedCity ? citySummaries[selectedCity] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Live Traffic Map</h2>
          <p className="text-sm text-gray-500">Real-time risk monitoring across India</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Layers className="w-3.5 h-3.5" /> Layers
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Map */}
        <div className="col-span-9">
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

        {/* Sidebar Info */}
        <div className="col-span-3 space-y-4">
          {summary && <CitySummaryCard summary={summary} />}

          {/* Weather */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Current Weather</h3>
            <div className="flex items-center gap-3 mb-3">
              <CloudSun className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary?.temperature || 32}°C</p>
                <p className="text-xs text-gray-500">{summary?.weather || 'Clear'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500"><Thermometer className="w-3.5 h-3.5" /> Humidity</span>
                <span className="font-medium">{summary?.humidity || 45}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500"><Wind className="w-3.5 h-3.5" /> Wind</span>
                <span className="font-medium">12 km/h</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500"><Eye className="w-3.5 h-3.5" /> Visibility</span>
                <span className="font-medium">10 km</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500"><Droplets className="w-3.5 h-3.5" /> Rain Chance</span>
                <span className="font-medium">15%</span>
              </div>
            </div>
          </div>

          {/* Location Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Locations</h3>
            <div className="space-y-1.5">
              {['Nagpur', 'Delhi', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad'].map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    selectedCity === city
                      ? 'bg-[#66B800]/10 text-[#66B800]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
