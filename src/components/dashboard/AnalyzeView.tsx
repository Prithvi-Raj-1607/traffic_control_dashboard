'use client';

import React from 'react';
import { getViolationAnalysisForCity } from '@/lib/dashboard-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const CHART_COLORS = ['#66B800', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#166534', '#86EFAC', '#BBF7D0'];
const PIE_COLORS = ['#66B800', '#F59E0B', '#8B5CF6'];

interface AnalyzeViewProps {
  selectedCity: string;
}

export default function AnalyzeView({ selectedCity }: AnalyzeViewProps) {
  const cityAnalysis = getViolationAnalysisForCity(selectedCity);
  const isAllIndia = !selectedCity || selectedCity === 'All India';

  const charts = [
    { title: `Violations by Type${!isAllIndia ? ` - ${selectedCity}` : ''}`, data: cityAnalysis.violationsByType as unknown as Record<string, unknown>[], xKey: 'type', yKey: 'count', type: 'bar' as const },
    { title: `Violations by Vehicle Type${!isAllIndia ? ` - ${selectedCity}` : ''}`, data: cityAnalysis.violationsByVehicleType as unknown as Record<string, unknown>[], xKey: 'type', yKey: 'count', type: 'bar' as const },
    { title: `Violations by Driver Age Group${!isAllIndia ? ` - ${selectedCity}` : ''}`, data: cityAnalysis.violationsByAgeGroup as unknown as Record<string, unknown>[], xKey: 'ageGroup', yKey: 'count', type: 'bar' as const },
    { title: `Violations by Gender${!isAllIndia ? ` - ${selectedCity}` : ''}`, data: cityAnalysis.violationsByGender as unknown as Record<string, unknown>[], xKey: 'gender', yKey: 'count', type: 'pie' as const },
    { title: `Violations by License Type${!isAllIndia ? ` - ${selectedCity}` : ''}`, data: cityAnalysis.violationsByLicenseType as unknown as Record<string, unknown>[], xKey: 'type', yKey: 'count', type: 'bar' as const },
    { title: `Violations by Road Type${!isAllIndia ? ` - ${selectedCity}` : ''}`, data: cityAnalysis.violationsByRoadType as unknown as Record<string, unknown>[], xKey: 'type', yKey: 'count', type: 'bar' as const },
    { title: `Fine Amount by Violation Type${!isAllIndia ? ` - ${selectedCity}` : ''}`, data: cityAnalysis.fineByViolationType as unknown as Record<string, unknown>[], xKey: 'type', yKey: 'amount', type: 'bar' as const },
    { title: `Repeat Offenders${!isAllIndia ? ` - ${selectedCity}` : ''}`, data: cityAnalysis.repeatOffenders as unknown as Record<string, unknown>[], xKey: 'range', yKey: 'count', type: 'bar' as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Violation Analysis</h2>
        <p className="text-sm text-gray-500">Comprehensive analysis of traffic violations {isAllIndia ? 'across India' : `in ${selectedCity}`}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <div key={chart.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">{chart.title}</h3>
            {chart.type === 'bar' ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chart.data} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={chart.xKey} tick={{ fontSize: 10, fill: '#6B7280' }} angle={-35} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey={chart.yKey} radius={[4, 4, 0, 0]}>
                    {chart.data.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={chart.data} dataKey={chart.yKey} nameKey={chart.xKey} cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#9CA3AF' }}>
                    {chart.data.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
