'use client';

import React from 'react';
import L from 'leaflet';

interface CityRiskMapProps {
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
    roadType?: string;
    avgSpeed?: number;
  }>;
  center: [number, number];
  zoom?: number;
}

export default function CityRiskMap({ markers, center, zoom = 12 }: CityRiskMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    markers.forEach((marker) => {
      const color = marker.riskLevel === 'High' ? '#ef4444' : marker.riskLevel === 'Medium' ? '#f59e0b' : '#22c55e';
      const size = marker.riskLevel === 'High' ? 16 : marker.riskLevel === 'Medium' ? 12 : 10;
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const m = L.marker([marker.lat, marker.lon], { icon }).addTo(map);
      m.bindPopup(`
        <div style="min-width:220px;font-family:system-ui;">
          <h3 style="font-size:14px;font-weight:600;margin:0 0 4px 0;">${marker.area || marker.city}</h3>
          <p style="font-size:12px;color:#666;margin:0 0 8px 0;">${marker.city} ${marker.roadType ? `• ${marker.roadType}` : ''}</p>
          <div style="display:flex;gap:12px;font-size:12px;">
            <div><span style="color:${color};font-weight:600;">Risk: ${marker.riskScore}</span></div>
            <div>Avg Speed: ${marker.avgSpeed || 'N/A'} km/h</div>
          </div>
          <div style="font-size:11px;color:#888;margin-top:4px;">Violations: ${marker.totalViolations.toLocaleString()} | Accidents: ${marker.accidentCount}</div>
          <div style="font-size:11px;color:#888;margin-top:2px;">Common: ${marker.mostCommonViolation}</div>
        </div>
      `);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [markers, center, zoom]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}
