import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { RiskMarker } from '../types';

interface CityRiskMapProps {
  markers: RiskMarker[];
  center: [number, number];
  cityName: string;
}

const riskColors: Record<string, string> = {
  Low: '#22C55E',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export default function CityRiskMap({ markers, center, cityName }: CityRiskMapProps) {
  return (
    <MapContainer
      key={cityName}
      center={center}
      zoom={12}
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
          radius={Math.max(6, Math.min(20, marker.riskScore / 4))}
          pathOptions={{
            fillColor: riskColors[marker.riskLevel],
            color: riskColors[marker.riskLevel],
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.45,
          }}
        >
          <Popup>
            <div className="p-3 min-w-[240px]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm">{marker.area || 'Area'}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${
                  marker.riskLevel === 'High' ? 'bg-red-500' :
                  marker.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {marker.riskLevel}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{marker.city}, {marker.state}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Road Type</span>
                  <span className="font-medium">{marker.roadType || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Violations</span>
                  <span className="font-semibold">{marker.totalViolations.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accident Count</span>
                  <span className="font-semibold text-red-500">{marker.accidentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Average Fine</span>
                  <span className="font-semibold">₹{marker.avgFine || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Average Speed</span>
                  <span className="font-semibold">{marker.avgSpeed || 0} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weather</span>
                  <span className="font-medium">{marker.weather || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Risk Score</span>
                  <span className="font-bold">{marker.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Common Violation</span>
                  <span className="font-medium">{marker.mostCommonViolation}</span>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
