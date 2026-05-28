import type { KeyMetric } from '../types';
import {
  Camera, Wifi, Zap, AlertTriangle, Siren, Droplets, Banknote, MapPin,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';

interface KeyMetricCardProps {
  metrics: KeyMetric[];
}

const iconMap: Record<string, React.ElementType> = {
  camera: Camera,
  wifi: Wifi,
  zap: Zap,
  'alert-triangle': AlertTriangle,
  siren: Siren,
  droplets: Droplets,
  banknote: Banknote,
  'map-pin': MapPin,
};

export default function KeyMetricCard({ metrics }: KeyMetricCardProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.icon] || AlertTriangle;
        const TrendIcon =
          metric.trend === 'up' ? TrendingUp :
          metric.trend === 'down' ? TrendingDown : Minus;
        const trendColor =
          metric.trend === 'up' ? 'text-green-500' :
          metric.trend === 'down' ? 'text-red-500' : 'text-gray-400';

        return (
          <div key={metric.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#66B800]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#66B800]" />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span>{metric.trendValue}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{metric.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{metric.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
