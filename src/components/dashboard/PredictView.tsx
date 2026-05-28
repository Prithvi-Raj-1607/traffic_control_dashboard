'use client';

import React from 'react';
import { clusterResults } from '@/lib/dashboard-data';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { Shield, ShieldAlert, ShieldCheck, Users, Target } from 'lucide-react';

const clusterColors: Record<string, string> = { Low: '#22C55E', Medium: '#F59E0B', High: '#EF4444' };

const clusterStats = [
  { id: 0, label: 'High Risk', icon: ShieldAlert, color: '#EF4444', bgColor: 'bg-red-50', count: clusterResults.filter(c => c.cluster === 0).length, areas: clusterResults.filter(c => c.cluster === 0).slice(0, 3).map(c => c.area) },
  { id: 1, label: 'Medium Risk', icon: Shield, color: '#F59E0B', bgColor: 'bg-yellow-50', count: clusterResults.filter(c => c.cluster === 1).length, areas: clusterResults.filter(c => c.cluster === 1).slice(0, 3).map(c => c.area) },
  { id: 2, label: 'Low Risk', icon: ShieldCheck, color: '#22C55E', bgColor: 'bg-green-50', count: clusterResults.filter(c => c.cluster === 2).length, areas: clusterResults.filter(c => c.cluster === 2).slice(0, 3).map(c => c.area) },
];

export default function PredictView() {
  const [selectedCluster, setSelectedCluster] = React.useState<number | null>(null);
  const filteredResults = selectedCluster !== null ? clusterResults.filter(c => c.cluster === selectedCluster) : clusterResults;
  const scatterData = clusterResults.map(c => ({ x: c.totalViolations, y: c.accidentCount, riskLevel: c.riskLevel, area: c.area, city: c.city }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">K-Means Risk Prediction</h2>
        <p className="text-sm text-gray-500">Clustering analysis for risk zone classification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusterStats.map((cs) => {
          const Icon = cs.icon;
          return (
            <button key={cs.id} onClick={() => setSelectedCluster(selectedCluster === cs.id ? null : cs.id)} className={`bg-white rounded-2xl shadow-sm border p-5 text-left transition-all hover:shadow-md ${selectedCluster === cs.id ? 'ring-2' : 'border-gray-100'}`} style={selectedCluster === cs.id ? { borderColor: cs.color, outlineColor: cs.color } : {}}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${cs.bgColor} flex items-center justify-center`}><Icon className="w-5 h-5" style={{ color: cs.color }} /></div>
                <div><p className="text-sm font-bold text-gray-900">{cs.label}</p><p className="text-xs text-gray-500">Cluster {cs.id} &middot; {cs.count} areas</p></div>
              </div>
              <div className="space-y-1">{cs.areas.map((area) => (<p key={area} className="text-xs text-gray-600">&bull; {area}</p>))}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Cluster Scatter Plot</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" dataKey="x" name="Violations" tick={{ fontSize: 10, fill: '#6B7280' }} label={{ value: 'Total Violations', position: 'insideBottom', offset: -10, fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Accidents" tick={{ fontSize: 10, fill: '#6B7280' }} label={{ value: 'Accident Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} />
              <ZAxis range={[40, 200]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} formatter={(value: number, name: string) => [value.toLocaleString(), name === 'x' ? 'Violations' : 'Accidents']} labelFormatter={() => ''} />
              <Scatter data={scatterData}>
                {scatterData.map((entry, index) => (<Cell key={index} fill={clusterColors[entry.riskLevel]} fillOpacity={0.7} />))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Risky Areas by Cluster</h3>
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white"><tr className="border-b border-gray-100"><th className="text-left py-2 font-semibold text-gray-500">Area</th><th className="text-left py-2 font-semibold text-gray-500">City</th><th className="text-center py-2 font-semibold text-gray-500">Cluster</th><th className="text-center py-2 font-semibold text-gray-500">Risk</th><th className="text-right py-2 font-semibold text-gray-500">Score</th></tr></thead>
              <tbody>{filteredResults.map((r) => (<tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50"><td className="py-2 text-gray-800 font-medium">{r.area}</td><td className="py-2 text-gray-600">{r.city}</td><td className="py-2 text-center"><span className={`inline-block w-5 h-5 rounded-full text-white text-[10px] font-bold leading-5 ${r.cluster === 0 ? 'bg-red-500' : r.cluster === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}>{r.cluster}</span></td><td className="py-2 text-center"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${r.riskLevel === 'High' ? 'bg-red-500' : r.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>{r.riskLevel}</span></td><td className="py-2 text-right font-bold text-gray-900">{r.riskScore}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-[#66B800]" /><h3 className="text-sm font-bold text-gray-900">Suggested Police Resource Allocation</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clusterStats.map((cs) => {
            const Icon = Users;
            return (
              <div key={cs.id} className={`${cs.bgColor} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2"><Icon className="w-4 h-4" style={{ color: cs.color }} /><span className="text-sm font-bold text-gray-900">{cs.label} Zones</span></div>
                <div className="space-y-1 text-xs text-gray-700">
                  <p>&bull; Deploy <strong>{cs.id === 0 ? '8-12' : cs.id === 1 ? '4-6' : '2-3'}</strong> patrol units</p>
                  <p>&bull; Checkpoint frequency: <strong>{cs.id === 0 ? 'Every 2 hrs' : cs.id === 1 ? 'Every 4 hrs' : 'Daily'}</strong></p>
                  <p>&bull; Emergency response: <strong>{cs.id === 0 ? '5 min' : cs.id === 1 ? '10 min' : '15 min'}</strong></p>
                  <p>&bull; Camera coverage: <strong>{cs.id === 0 ? '100%' : cs.id === 1 ? '75%' : '50%'}</strong></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
