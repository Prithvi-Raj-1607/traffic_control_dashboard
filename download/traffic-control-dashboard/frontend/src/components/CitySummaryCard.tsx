import type { CitySummary } from '../types';
import { MapPin, Gauge, CloudSun, IndianRupee, ShieldAlert } from 'lucide-react';

interface CitySummaryCardProps {
  summary: CitySummary;
}

export default function CitySummaryCard({ summary }: CitySummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#66B800]" />
          <h3 className="text-lg font-bold text-gray-900">{summary.city}</h3>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          {summary.state}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Total Violations</p>
          <p className="text-lg font-bold text-[#66B800]">{summary.totalViolations.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Accident Cases</p>
          <p className="text-lg font-bold text-red-500">{summary.totalAccidents.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">High-Risk Areas</p>
          <p className="text-lg font-bold text-[#66B800]">{summary.highRiskAreas}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Most Common</p>
          <p className="text-sm font-semibold text-gray-800">{summary.mostCommonViolation}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-gray-500">
            <Gauge className="w-4 h-4" /> Avg Speed
          </span>
          <span className="font-semibold text-gray-800">{summary.avgSpeed} km/h</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-gray-500">
            <IndianRupee className="w-4 h-4" /> Fine Collected
          </span>
          <span className="font-semibold text-[#66B800]">₹{(summary.totalFineCollected / 10000000).toFixed(2)} Cr</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-gray-500">
            <CloudSun className="w-4 h-4" /> Weather
          </span>
          <span className="font-semibold text-gray-800">{summary.weather} · {summary.temperature}°C</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-gray-500">
            <ShieldAlert className="w-4 h-4" /> Risk Score
          </span>
          <span className={`font-bold text-lg ${
            summary.riskScore >= 80 ? 'text-red-500' :
            summary.riskScore >= 60 ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {summary.riskScore}/100
          </span>
        </div>
      </div>
    </div>
  );
}
