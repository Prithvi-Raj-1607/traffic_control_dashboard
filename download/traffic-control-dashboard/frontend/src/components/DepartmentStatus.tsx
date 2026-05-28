import type { DepartmentInfo } from '../types';
import { Hospital, Shield, Flame, Truck, Monitor, Radio } from 'lucide-react';

interface DepartmentStatusProps {
  departments: DepartmentInfo[];
}

const iconMap: Record<string, React.ElementType> = {
  hospital: Hospital,
  shield: Shield,
  flame: Flame,
  truck: Truck,
  monitor: Monitor,
  radio: Radio,
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  'In Progress': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Dispatched': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  'Notified': { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'Triggered': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Resolved': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
};

export default function DepartmentStatus({ departments }: DepartmentStatusProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Department Status</h3>
      <div className="grid grid-cols-2 gap-3">
        {departments.map((dept) => {
          const Icon = iconMap[dept.icon] || Shield;
          const colors = statusColors[dept.status] || statusColors['Notified'];
          return (
            <div
              key={dept.name}
              className={`rounded-xl p-3 ${colors.bg} border border-gray-100`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">{dept.name}</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.dot.replace('bg-', 'border-')}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {dept.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
