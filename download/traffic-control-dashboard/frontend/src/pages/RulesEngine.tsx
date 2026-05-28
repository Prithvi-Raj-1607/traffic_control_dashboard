import { useState, useMemo } from 'react';
import { associationRules } from '../data/mockDashboardData';
import { ArrowRight, Filter, GitBranch } from 'lucide-react';

export default function RulesEngine() {
  const [minSupport, setMinSupport] = useState(0.05);
  const [minConfidence, setMinConfidence] = useState(0.3);
  const [minLift, setMinLift] = useState(1.5);

  const filteredRules = useMemo(() => {
    return associationRules.filter(
      r => r.support >= minSupport && r.confidence >= minConfidence && r.lift >= minLift
    );
  }, [minSupport, minConfidence, minLift]);

  const getLiftColor = (lift: number) => {
    if (lift >= 3) return 'text-red-600 bg-red-50';
    if (lift >= 2) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rules Engine</h2>
          <p className="text-sm text-gray-500">Apriori association rule mining results</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <GitBranch className="w-3.5 h-3.5" />
          <span>{filteredRules.length} rules active</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#66B800]" />
          <h3 className="text-sm font-bold text-gray-900">Rule Filters</h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Support: {minSupport.toFixed(2)}</label>
            <input
              type="range"
              min="0.01"
              max="0.3"
              step="0.01"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="w-full accent-[#66B800]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Confidence: {minConfidence.toFixed(2)}</label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full accent-[#66B800]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Lift: {minLift.toFixed(1)}</label>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-full accent-[#66B800]"
            />
          </div>
        </div>
      </div>

      {/* Rule Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="px-2.5 py-1 bg-[#66B800]/10 text-[#66B800] text-xs font-bold rounded-lg">
                  {rule.antecedent}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg">
                  {rule.consequent}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-xs">
                <span className="text-gray-400">Support: </span>
                <span className="font-semibold text-gray-700">{(rule.support * 100).toFixed(1)}%</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-400">Confidence: </span>
                <span className="font-semibold text-gray-700">{(rule.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="text-xs">
                <span className={`font-bold px-1.5 py-0.5 rounded ${getLiftColor(rule.lift)}`}>
                  Lift: {rule.lift.toFixed(2)}x
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{rule.interpretation}</p>
          </div>
        ))}
      </div>

      {/* Table View */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Rule Table</h3>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200">
                <th className="text-left py-2.5 font-semibold text-gray-500">Antecedent</th>
                <th className="text-center py-2.5 font-semibold text-gray-500">→</th>
                <th className="text-left py-2.5 font-semibold text-gray-500">Consequent</th>
                <th className="text-center py-2.5 font-semibold text-gray-500">Support</th>
                <th className="text-center py-2.5 font-semibold text-gray-500">Confidence</th>
                <th className="text-center py-2.5 font-semibold text-gray-500">Lift</th>
                <th className="text-left py-2.5 font-semibold text-gray-500">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{rule.antecedent}</td>
                  <td className="py-2.5 text-center"><ArrowRight className="w-3 h-3 text-gray-400 inline" /></td>
                  <td className="py-2.5 font-medium text-gray-800">{rule.consequent}</td>
                  <td className="py-2.5 text-center">{(rule.support * 100).toFixed(1)}%</td>
                  <td className="py-2.5 text-center">{(rule.confidence * 100).toFixed(1)}%</td>
                  <td className="py-2.5 text-center font-bold" style={{ color: rule.lift >= 3 ? '#EF4444' : rule.lift >= 2 ? '#F59E0B' : '#6B7280' }}>
                    {rule.lift.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-gray-500 max-w-[200px] truncate">{rule.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
