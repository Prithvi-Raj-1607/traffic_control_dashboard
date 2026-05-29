'use client';

import React from 'react';
import L from 'leaflet';

const IndiaCenter: [number, number] = [22.5, 79.0];

interface IndiaRiskMapProps {
  markers: Array<{
    id: string;
    lat: number;
    lon: number;
    city: string;
    area?: string;
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    totalViolations: number;
    accidentCount: number;
    mostCommonViolation: string;
  }>;
  onCityClick?: (cityName: string) => void;
}

export default function IndiaRiskMap({ markers, onCityClick }: IndiaRiskMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);

  React.useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(IndiaCenter, 5);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    markers.forEach((marker) => {
      const color = marker.riskLevel === 'High' ? '#ef4444' : marker.riskLevel === 'Medium' ? '#f59e0b' : '#22c55e';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const m = L.marker([marker.lat, marker.lon], { icon }).addTo(map);
      m.bindPopup(`
        <div style="min-width:200px;font-family:system-ui;">
          <h3 style="font-size:14px;font-weight:600;margin:0 0 4px 0;">${marker.area || marker.city}</h3>
          <p style="font-size:12px;color:#666;margin:0 0 8px 0;">${marker.city}</p>
          <div style="display:flex;gap:12px;font-size:12px;">
            <div><span style="color:${color};font-weight:600;">Risk: ${marker.riskScore}</span></div>
            <div>Violations: ${marker.totalViolations.toLocaleString()}</div>
          </div>
          <div style="font-size:11px;color:#888;margin-top:4px;">Accidents: ${marker.accidentCount} | Top: ${marker.mostCommonViolation}</div>
        </div>
      `);

      if (onCityClick) {
        m.on('click', () => onCityClick(marker.city));
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}
