'use client';

import React from 'react';
import { getEventsForCity, cityAreasMap, departmentStatus } from '@/lib/dashboard-data';
import { Siren, ShieldCheck, AlertTriangle, Activity, Hospital, Shield, Flame, Truck, TrafficCone, Radio } from 'lucide-react';

interface EventsViewProps {
  selectedCity: string;
}

export default function EventsView({ selectedCity }: EventsViewProps) {
  const filteredEvents = getEventsForCity(selectedCity);

  const critical = filteredEvents.filter(e => e.severity === 'Critical').length;
  const high = filteredEvents.filter(e => e.severity === 'High').length;
  const medium = filteredEvents.filter(e => e.severity === 'Medium').length;
  const accidents = filteredEvents.filter(e => e.accidentOccurred).length;

  const iconMap: Record<string, React.ElementType> = { Hospital, Shield, Flame, Truck, TrafficCone, Radio };
  const statusColors: Record<string, string> = {
    'In Progress': 'bg-blue-100 text-blue-700',
    'Dispatched': 'bg-orange-100 text-orange-700',
    'Notified': 'bg-yellow-100 text-yellow-700',
    'Triggered': 'bg-red-100 text-red-700',
    'Resolved': 'bg-green-100 text-green-700',
  };
  const severityColors: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-green-100 text-green-700 border-green-200',
  };

  const cityAreaData = cityAreasMap[selectedCity] || [];
  const highSeverityViolations = cityAreaData.length > 0
    ? cityAreaData.slice(0, 5).map(area => ({
        type: area.mostCommonViolation,
        count: area.totalViolations,
        zone: area.area || area.city
      }))
    : [
        { type: 'Overspeeding', count: 156, zone: 'Highway NH-44' },
        { type: 'Signal Jumping', count: 89, zone: 'Silk Board Junction' },
        { type: 'Drunk Driving', count: 45, zone: 'Rohini Sector' },
        { type: 'Wrong Side', count: 67, zone: 'Charminar Area' },
        { type: 'No Helmet', count: 123, zone: 'Hinjewadi IT Park' },
      ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Siren className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Critical</p>
            <p className="text-xl font-bold text-red-600">{critical}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">High</p>
            <p className="text-xl font-bold text-orange-600">{high}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Medium</p>
            <p className="text-xl font-bold text-yellow-600">{medium}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Accidents</p>
            <p className="text-xl font-bold text-red-500">{accidents}</p>
          </div>
        </div>
      </div>

      {/* Events Timeline + Department + High Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Timeline */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Events Timeline</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {filteredEvents.map((event, idx) => {
              const timeAgo = (ts: string) => {
                const diff = Date.now() - new Date(ts).getTime();
                const mins = Math.floor(diff / 60000);
                return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
              };
              return (
                <div key={event.id} className="relative pl-6 pb-3">
                  {/* Timeline line */}
                  {idx < filteredEvents.length - 1 && (
                    <div className="absolute left-2 top-4 w-0.5 h-full bg-gray-200" />
                  )}
                  {/* Timeline dot */}
                  <div className={`absolute left-0.5 top-1 w-4 h-4 rounded-full border-2 border-white ${
                    event.severity === 'Critical' ? 'bg-red-500' :
                    event.severity === 'High' ? 'bg-orange-500' :
                    event.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} style={{ boxShadow: '0 0 0 2px rgba(0,0,0,0.05)' }} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${severityColors[event.severity]}`}>
                        {event.severity}
                      </span>
                      <span className="text-[10px] text-gray-400">{timeAgo(event.timestamp)}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{event.title}</p>
                    <p className="text-[10px] text-gray-500">{event.location} • {event.city}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Department Status</h3>
          <div className="space-y-3">
            {departmentStatus.map((dept) => {
              const Icon = iconMap[dept.icon] || Shield;
              return (
                <div key={dept.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[dept.status]}`}>
                      {dept.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Severity Violations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">High Severity Violations</h3>
          <div className="space-y-3">
            {highSeverityViolations.map((v, i) => (
              <div key={i} className="p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-red-800">{v.type}</p>
                  <span className="text-lg font-bold text-red-600">{v.count}</span>
                </div>
                <p className="text-xs text-red-600">{v.zone}</p>
                <div className="mt-2 w-full bg-red-200 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(v.count / 156) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
