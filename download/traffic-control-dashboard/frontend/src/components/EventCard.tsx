import { Ambulance, Shield, Flame, CloudSun, Car } from 'lucide-react';
import type { EventData } from '../types';

interface EventCardProps {
  event: EventData;
}

const severityColors: Record<string, string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

const severityBgColors: Record<string, string> = {
  Critical: 'bg-red-50 border-red-100',
  High: 'bg-orange-50 border-orange-100',
  Medium: 'bg-yellow-50 border-yellow-100',
  Low: 'bg-green-50 border-green-100',
};

export default function EventCard({ event }: EventCardProps) {
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-5 ${severityBgColors[event.severity] || 'border-gray-100'}`}>
      {/* Severity Bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-1.5 h-8 rounded-full ${severityColors[event.severity]}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">{event.title}</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${severityColors[event.severity]}`}>
              {event.severity}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <CloudSun className="w-3.5 h-3.5 text-gray-400" />
          <span>Weather: {event.weather}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Car className="w-3.5 h-3.5 text-gray-400" />
          <span>{event.vehicleTypes.join(', ')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className={`w-2 h-2 rounded-full ${event.accidentOccurred ? 'bg-red-500' : 'bg-green-500'}`} />
          <span>Accident: {event.accidentOccurred ? 'Yes' : 'No'}</span>
        </div>
        <div className="text-xs text-gray-600">
          Affected Lanes: {event.affectedLanes}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          event.ambulanceOnScene ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <Ambulance className="w-3 h-3" />
          {event.ambulanceOnScene ? 'Ambulance On Scene' : 'Ambulance Pending'}
        </span>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          event.policeOnScene ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <Shield className="w-3 h-3" />
          {event.policeOnScene ? 'Police On Scene' : 'Police Pending'}
        </span>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          event.fireOnScene ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <Flame className="w-3 h-3" />
          {event.fireOnScene ? 'Fire On Scene' : 'Fire Pending'}
        </span>
      </div>

      <p className="text-xs text-gray-400 mt-3">{timeAgo(event.timestamp)}</p>
    </div>
  );
}
