import type { RiskMarker, MapMode } from '../types';
import CitySearchBar from './CitySearchBar';
import IndiaRiskMap from './IndiaRiskMap';
import CityRiskMap from './CityRiskMap';
import type { CityData } from '../types';
import { RotateCcw } from 'lucide-react';

interface MapPanelProps {
  mapMode: MapMode;
  selectedCity: string | null;
  riskMarkers: RiskMarker[];
  cityMarkers: RiskMarker[];
  cityCenter: [number, number];
  onCitySelect: (city: string) => void;
  onCitySearch: (city: CityData) => void;
  onReset: () => void;
}

export default function MapPanel({
  mapMode,
  selectedCity,
  riskMarkers,
  cityMarkers,
  cityCenter,
  onCitySelect,
  onCitySearch,
  onReset,
}: MapPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            {mapMode === 'city' && selectedCity
              ? `${selectedCity} Traffic Risk Overview`
              : 'India Traffic Risk Overview'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {mapMode === 'city'
              ? `Showing local risk zones in ${selectedCity}`
              : 'Click on markers to explore city-level data'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Risk Legend */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High</span>
          </div>
          {mapMode === 'city' && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to India View
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <CitySearchBar onCitySelect={onCitySearch} />
      </div>

      {/* Map */}
      <div className="h-[420px] rounded-xl overflow-hidden">
        {mapMode === 'india' ? (
          <IndiaRiskMap markers={riskMarkers} onCitySelect={onCitySelect} />
        ) : (
          <CityRiskMap
            markers={cityMarkers}
            center={cityCenter}
            cityName={selectedCity || ''}
          />
        )}
      </div>
    </div>
  );
}
