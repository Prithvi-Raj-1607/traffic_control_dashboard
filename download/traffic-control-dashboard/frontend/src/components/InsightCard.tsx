import { Car, Gauge, AlertTriangle, Siren } from 'lucide-react';
import type { TrafficInsight } from '../types';
import MiniLineChart from './MiniLineChart';

interface InsightCardProps {
  insights: TrafficInsight;
}

export default function InsightCard({ insights }: InsightCardProps) {
  const cards = [
    {
      title: 'Vehicle Count',
      value: insights.vehicleCount.toLocaleString('en-IN'),
      icon: Car,
      color: '#66B800',
      trend: insights.vehicleCountTrend,
      labels: ['Average', 'Max', 'Min'],
      labelValues: [
        Math.round(insights.vehicleCountTrend.reduce((a, b) => a + b, 0) / insights.vehicleCountTrend.length).toLocaleString('en-IN'),
        Math.max(...insights.vehicleCountTrend).toLocaleString('en-IN'),
        Math.min(...insights.vehicleCountTrend).toLocaleString('en-IN'),
      ],
    },
    {
      title: 'Average Speed',
      value: `${insights.avgSpeed} km/h`,
      icon: Gauge,
      color: '#3B82F6',
      trend: insights.avgSpeedTrend,
      labels: ['Average', 'Max', 'Min'],
      labelValues: [
        `${Math.round(insights.avgSpeedTrend.reduce((a, b) => a + b, 0) / insights.avgSpeedTrend.length)} km/h`,
        `${Math.max(...insights.avgSpeedTrend)} km/h`,
        `${Math.min(...insights.avgSpeedTrend)} km/h`,
      ],
    },
    {
      title: 'Violation Count',
      value: insights.violationCount.toLocaleString('en-IN'),
      icon: AlertTriangle,
      color: '#F59E0B',
      trend: insights.violationTrend,
      labels: ['Normal', 'Max', 'Min'],
      labelValues: [
        Math.round(insights.violationTrend.reduce((a, b) => a + b, 0) / insights.violationTrend.length).toLocaleString('en-IN'),
        Math.max(...insights.violationTrend).toLocaleString('en-IN'),
        Math.min(...insights.violationTrend).toLocaleString('en-IN'),
      ],
    },
    {
      title: 'Accident Detected',
      value: insights.accidentDetected.toString(),
      icon: Siren,
      color: '#EF4444',
      trend: insights.accidentTrend,
      labels: ['Normal', 'Max', 'Min'],
      labelValues: [
        Math.round(insights.accidentTrend.reduce((a, b) => a + b, 0) / insights.accidentTrend.length).toString(),
        Math.max(...insights.accidentTrend).toString(),
        Math.min(...insights.accidentTrend).toString(),
      ],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <span className="text-sm font-medium text-gray-500">{card.title}</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">
                Updated {new Date(insights.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="w-24">
              <MiniLineChart data={card.trend} color={card.color} />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            {card.labels.map((label, i) => (
              <div key={label} className="text-xs">
                <span className="text-gray-400">{label}: </span>
                <span className="font-medium text-gray-600">{card.labelValues[i]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
