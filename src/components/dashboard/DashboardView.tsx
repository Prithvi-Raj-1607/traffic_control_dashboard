'use client';

import React from 'react';
import { MOCK_NOW, citySummaries, departmentStatus, cityAreasMap, citiesData, getTrafficInsightsForCity, getEventsForCity, getKeyMetricsForCity } from '@/lib/dashboard-data';
import type { EventData, KeyMetric } from '@/lib/dashboard-data';
import { IndiaRiskMap, CityRiskMap } from './MapPanel';
import {
  Car, Gauge, AlertTriangle, Siren, TrendingUp, TrendingDown,
  Hospital, Shield, Flame, Truck, TrafficCone, Radio,
  Camera, Wifi, OctagonAlert, CloudRain, IndianRupee, MapPin,
  Thermometer, Droplets, Wind
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
  ZAxis, CartesianGrid, Legend
} from 'recharts';

// ── Insight Card Component ──
function InsightCard({ title, value, icon: Icon, trend, trendValue, trendData, color, suffix }: {
  title: string; value: string | number; icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable'; trendValue?: number; trendData: number[]; color: string; suffix?: string;
}) {
  const chartData = trendData.map((v, i) => ({ x: i, y: v }));
  const latestTrendPoint = trendData[trendData.length - 1] ?? 0;
  const previousTrendPoint = trendData[trendData.length - 2] ?? 0;
  const computedTrendValue = trendValue ?? Math.max(1, Math.round(Math.abs(latestTrendPoint) - Math.abs(previousTrendPoint)));
  const trendColor = trend === 'up' ? 'text-[#66B800]' : trend === 'down' ? 'text-amber-500' : 'text-gray-400';
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{typeof value === 'number' ? value.toLocaleString() : value}{suffix && <span className="text-sm font-normal text-gray-500">{suffix}</span>}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="y" stroke={trend === 'up' ? '#66B800' : '#f59e0b'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up' ? <TrendingUp className="w-3 h-3 text-[#66B800]" /> : trend === 'down' ? <TrendingDown className="w-3 h-3 text-amber-500" /> : <Gauge className="w-3 h-3 text-gray-400" />}
          <span className={`text-xs font-medium ${trendColor}`}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{computedTrendValue}%
          </span>
          <span className="text-xs text-gray-400">vs last hour</span>
        </div>
      )}
    </div>
  );
}

// ── Event Card Component ──
function EventCard({ event }: { event: EventData }) {
  const severityColors: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-green-100 text-green-700 border-green-200',
  };

  const timeAgo = (ts: string) => {
    const diff = new Date(MOCK_NOW).getTime() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${severityColors[event.severity]}`}>
              {event.severity}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(event.timestamp)}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{event.description}</p>
        </div>
        {event.accidentOccurred && (
          <Siren className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="text-xs text-gray-400">{event.location}</span>
        {event.ambulanceOnScene && <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded">Ambulance</span>}
        {event.policeOnScene && <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">Police</span>}
        {event.fireOnScene && <span className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded">Fire</span>}
      </div>
    </div>
  );
}

// ── Department Status Component ──
function DeptStatus() {
  const iconMap: Record<string, React.ElementType> = { Hospital, Shield, Flame, Truck, TrafficCone, Radio };
  const statusColors: Record<string, string> = {
    'In Progress': 'bg-blue-100 text-blue-700',
    'Dispatched': 'bg-orange-100 text-orange-700',
    'Notified': 'bg-yellow-100 text-yellow-700',
    'Triggered': 'bg-red-100 text-red-700',
    'Resolved': 'bg-green-100 text-green-700',
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {departmentStatus.map((dept) => {
        const Icon = iconMap[dept.icon] || Shield;
        return (
          <div key={dept.name} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F6F7F8] flex items-center justify-center">
              <Icon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 truncate">{dept.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[dept.status]}`}>
                {dept.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── City Summary Card ──
function CitySummaryCard({ summary }: { summary: typeof citySummaries[string] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{summary.city}</h3>
          <p className="text-xs text-gray-500">{summary.state}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          summary.riskScore >= 80 ? 'bg-red-100 text-red-700' :
          summary.riskScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {summary.riskScore}/100
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500">Violations</p>
          <p className="text-sm font-bold text-gray-900">{summary.totalViolations.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500">Accidents</p>
          <p className="text-sm font-bold text-gray-900">{summary.totalAccidents.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500">High Risk Areas</p>
          <p className="text-sm font-bold text-red-600">{summary.highRiskAreas}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500">Avg Speed</p>
          <p className="text-sm font-bold text-gray-900">{summary.avgSpeed} km/h</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          <span>{summary.temperature}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{summary.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{summary.weather}</span>
        </div>
      </div>
    </div>
  );
}

// ── Key Metric Card ──
function KeyMetricCard({ metric }: { metric: KeyMetric }) {
  const iconMap: Record<string, React.ElementType> = {
    Camera, Wifi, Gauge, OctagonAlert, Siren, CloudRain, IndianRupee, MapPin
  };
  const Icon = iconMap[metric.icon] || Camera;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#ecfccb] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#66B800]" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{metric.title}</p>
          <p className="text-lg font-bold text-gray-900">{metric.value}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{metric.subtitle}</span>
        {metric.trend && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${
            metric.trend === 'up' ? 'text-[#66B800]' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-400'
          }`}>
            {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            {metric.trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN DASHBOARD VIEW
// ═══════════════════════════════════════════════
interface DashboardViewProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  onSwitchToLiveMap: () => void;
}

export default function DashboardView({ selectedCity, onCityChange, onSwitchToLiveMap }: DashboardViewProps) {
  const isIndiaView = !selectedCity || selectedCity === 'All India';
  const summary = citySummaries[selectedCity] || citySummaries['Nagpur'];
  const cityAreas = cityAreasMap[selectedCity] || cityAreasMap['Nagpur'];
  const cityData = citiesData.find(c => c.name === selectedCity) || citiesData[0];
  const cityInsights = getTrafficInsightsForCity(selectedCity);
  const cityEvents = getEventsForCity(selectedCity);
  const cityKeyMetrics = getKeyMetricsForCity(selectedCity);

  return (
    <div className="space-y-6">
      {/* Top Section: City Summary + Map + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: City Summary + Map */}
        <div className="lg:col-span-1 space-y-4">
          <CitySummaryCard summary={summary} />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '340px' }}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {isIndiaView ? 'India Risk Map' : `${selectedCity} Risk Map`}
              </h3>
              <button onClick={onSwitchToLiveMap} className="text-xs text-[#66B800] hover:underline font-medium">
                View Full Map →
              </button>
            </div>
            <div className="h-[290px]">
              {isIndiaView ? (
                <IndiaRiskMap markers={[]} onCityClick={onCityChange} />
              ) : (
                <CityRiskMap markers={cityAreas} center={[cityData.lat, cityData.lon]} zoom={12} />
              )}
            </div>
          </div>
        </div>

        {/* Right: Insights + Events + Departments */}
        <div className="lg:col-span-2 space-y-4">
          {/* Insight Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InsightCard
              title="Vehicle Count"
              value={cityInsights.vehicleCount}
              icon={Car}
              trend="up"
              trendValue={3}
              trendData={cityInsights.vehicleCountTrend}
              color="bg-[#66B800]"
            />
            <InsightCard
              title="Avg Speed"
              value={cityInsights.avgSpeed}
              icon={Gauge}
              suffix=" km/h"
              trend="stable"
              trendValue={0}
              trendData={cityInsights.avgSpeedTrend}
              color="bg-blue-500"
            />
            <InsightCard
              title="Violations"
              value={cityInsights.violationCount}
              icon={AlertTriangle}
              trend="up"
              trendValue={6}
              trendData={cityInsights.violationTrend}
              color="bg-amber-500"
            />
            <InsightCard
              title="Accidents"
              value={cityInsights.accidentDetected}
              icon={Siren}
              trend="down"
              trendValue={4}
              trendData={cityInsights.accidentTrend}
              color="bg-red-500"
            />
          </div>

          {/* Recent Events + Department Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Events */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Events</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {cityEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>

            {/* Department Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Department Status</h3>
              <DeptStatus />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {cityKeyMetrics.map((metric) => (
            <KeyMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  );
}
