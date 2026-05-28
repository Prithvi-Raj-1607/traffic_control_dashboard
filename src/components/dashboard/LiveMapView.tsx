'use client';

import React from 'react';
import { indiaRiskMarkers, cityAreasMap, citySummaries, citiesData } from '@/lib/dashboard-data';
import { IndiaRiskMap, CityRiskMap } from './MapPanel';
import { Thermometer, Droplets, Wind, MapPin } from 'lucide-react';

interface LiveMapViewProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export default function LiveMapView({ selectedCity, onCityChange }: LiveMapViewProps) {
  const summary = citySummaries[selectedCity] || citySummaries['Nagpur'];
  const cityData = citiesData.find(c => c.name === selectedCity) || citiesData[0];
  const cityAreas = cityAreasMap[selectedCity] || cityAreasMap['Nagpur'];
  const isIndiaView = !selectedCity || selectedCity === 'All India';

  return (
    <div className="flex gap-6 h-[calc(100vh-7.5rem)]">
      {/* Map Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            {isIndiaView ? 'India Risk Overview' : `${selectedCity} - Risk Zones`}
          </h3>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> High</span>
            <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Medium</span>
            <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Low</span>
          </div>
        </div>
        <div className="h-[calc(100%-3rem)]">
          {isIndiaView ? (
            <IndiaRiskMap markers={indiaRiskMarkers} onCityClick={onCityChange} />
          ) : (
            <CityRiskMap markers={cityAreas} center={[cityData.lat, cityData.lon]} zoom={12} />
          )}
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="w-72 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Weather Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Weather</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl font-bold text-gray-900">{summary.temperature}°C</div>
            <div>
              <p className="text-sm font-medium text-gray-700">{summary.weather}</p>
              <p className="text-xs text-gray-400">{summary.city}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-[10px] text-gray-500">Humidity</p>
                <p className="text-sm font-semibold text-gray-900">{summary.humidity}%</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-500">Wind</p>
                <p className="text-sm font-semibold text-gray-900">12 km/h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Locations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Locations</h3>
          <div className="space-y-2">
            {citiesData.slice(0, 8).map((city) => (
              <button
                key={city.name}
                onClick={() => onCityChange(city.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                  selectedCity === city.name ? 'bg-[#ecfccb] text-[#66B800] font-medium' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {city.name}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  city.riskScore >= 80 ? 'bg-red-500' : city.riskScore >= 60 ? 'bg-amber-500' : 'bg-green-500'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* City Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">City Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Violations</span>
              <span className="font-semibold text-gray-900">{summary.totalViolations.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Accidents</span>
              <span className="font-semibold text-red-600">{summary.totalAccidents.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">High Risk Areas</span>
              <span className="font-semibold text-orange-600">{summary.highRiskAreas}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Most Common</span>
              <span className="font-semibold text-gray-900">{summary.mostCommonViolation}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fine Collected</span>
              <span className="font-semibold text-[#66B800]">₹{(summary.totalFineCollected / 10000000).toFixed(1)}Cr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
