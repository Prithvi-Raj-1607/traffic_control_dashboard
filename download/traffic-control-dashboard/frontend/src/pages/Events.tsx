import EventCard from '../components/EventCard';
import DepartmentStatus from '../components/DepartmentStatus';
import { recentEvents, departmentStatuses } from '../data/mockDashboardData';
import { Clock, Filter, AlertTriangle } from 'lucide-react';

export default function Events() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Events & Alerts</h2>
          <p className="text-sm text-gray-500">Recent traffic incidents and emergency events</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#66B800] text-white rounded-lg hover:bg-[#5ca300]">
            <Clock className="w-3.5 h-3.5" /> Last 24 Hours
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Critical Events', value: recentEvents.filter(e => e.severity === 'Critical').length, color: 'bg-red-500' },
          { label: 'High Severity', value: recentEvents.filter(e => e.severity === 'High').length, color: 'bg-orange-500' },
          { label: 'Medium Severity', value: recentEvents.filter(e => e.severity === 'Medium').length, color: 'bg-yellow-500' },
          { label: 'Total Accidents', value: recentEvents.filter(e => e.accidentOccurred).length, color: 'bg-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${stat.color}`} />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Events Timeline */}
        <div className="col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Event Timeline</h3>
              <span className="text-xs text-gray-400">{recentEvents.length} events</span>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {recentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>

        {/* Department Status */}
        <div className="col-span-4 space-y-6">
          <DepartmentStatus departments={departmentStatuses} />

          {/* High Severity Violations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">High Severity Violations</h3>
            <div className="space-y-2">
              {[
                { type: 'Overspeeding', count: 345, severity: 'Critical' },
                { type: 'Drunk Driving', count: 89, severity: 'Critical' },
                { type: 'Signal Jumping', count: 278, severity: 'High' },
                { type: 'Wrong Side Driving', count: 156, severity: 'High' },
                { type: 'No Helmet', count: 423, severity: 'Medium' },
              ].map((v) => (
                <div key={v.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-3.5 h-3.5 ${
                      v.severity === 'Critical' ? 'text-red-500' :
                      v.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'
                    }`} />
                    <span className="text-sm text-gray-700">{v.type}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{v.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
