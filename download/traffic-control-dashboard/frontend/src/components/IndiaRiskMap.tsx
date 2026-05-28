import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { RiskMarker } from '../types';

interface IndiaRiskMapProps {
  markers: RiskMarker[];
  onCitySelect: (city: string) => void;
}

const riskColors: Record<string, string> = {
  Low: '#22C55E',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export default function IndiaRiskMap({ markers, onCitySelect }: IndiaRiskMapProps) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      className="w-full h-full rounded-2xl"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lon]}
          radius={Math.max(5, Math.min(18, marker.riskScore / 6))}
          pathOptions={{
            fillColor: riskColors[marker.riskLevel],
            color: riskColors[marker.riskLevel],
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.5,
          }}
          eventHandlers={{
            click: () => onCitySelect(marker.city),
          }}
        >
          <Popup>
            <div className="p-3 min-w-[220px]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm">{marker.area || marker.city}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${
                  marker.riskLevel === 'High' ? 'bg-red-500' :
                  marker.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {marker.riskLevel}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{marker.state}, {marker.city}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Risk Score</span>
                  <span className="font-semibold">{marker.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Violations</span>
                  <span className="font-semibold">{marker.totalViolations.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accidents</span>
                  <span className="font-semibold text-red-500">{marker.accidentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Common Violation</span>
                  <span className="font-semibold">{marker.mostCommonViolation}</span>
                </div>
              </div>
              <button
                className="w-full mt-2 py-1.5 bg-[#66B800] text-white text-xs font-medium rounded-lg hover:bg-[#5ca300] transition-colors"
                onClick={(e) => { e.stopPropagation(); onCitySelect(marker.city); }}
              >
                View City Details
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
