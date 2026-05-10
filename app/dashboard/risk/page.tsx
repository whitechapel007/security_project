'use client';

import { useEffect, useState } from 'react';
import { STRIDE_COLORS } from '@/lib/mock-data';
import { Target, Info } from 'lucide-react';

interface RiskItem {
  id: string;
  name: string;
  category: string;
  likelihood: number;
  impact: number;
  mitigation: string;
  status: string;
}

function getRiskLevel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 15) return 'critical';
  if (score >= 9) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function getRiskColor(level: string): string {
  const map: Record<string, string> = { critical: '#ef4444', high: '#f59e0b', medium: '#eab308', low: '#10b981' };
  return map[level] ?? '#10b981';
}

function getCellColor(l: number, i: number): string {
  const score = l * i;
  if (score >= 15) return 'bg-red-500/20 border-red-500/10';
  if (score >= 9) return 'bg-amber-500/20 border-amber-500/10';
  if (score >= 4) return 'bg-yellow-500/20 border-yellow-500/10';
  return 'bg-emerald-500/20 border-emerald-500/10';
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[level] ?? styles.low}`}>{level}</span>;
}

export default function RiskPage() {
  const [riskItems, setRiskItems] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/risk')
      .then(r => r.json())
      .then(data => { setRiskItems(data.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const selectedRisk = riskItems.find(r => r.id === selected);
  const riskWithLevels = riskItems.map(r => ({ ...r, riskLevel: getRiskLevel(r.likelihood, r.impact) }));

  const counts = {
    critical: riskWithLevels.filter(r => r.riskLevel === 'critical').length,
    high: riskWithLevels.filter(r => r.riskLevel === 'high').length,
    medium: riskWithLevels.filter(r => r.riskLevel === 'medium').length,
    low: riskWithLevels.filter(r => r.riskLevel === 'low').length,
  };

  const categoryColor = (cat: string) => STRIDE_COLORS[cat] ?? '#64748b';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Risk Assessment</h1>
        <p className="text-slate-400 text-sm mt-1">Likelihood × Impact scoring mapped to the STRIDE threat model.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { level: 'Critical', count: counts.critical, color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
          { level: 'High', count: counts.high, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
          { level: 'Medium', count: counts.medium, color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5' },
          { level: 'Low', count: counts.low, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
        ].map(item => (
          <div key={item.level} className={`${item.bg} border ${item.border} rounded-xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${item.color}`}>{item.count}</p>
            <p className="text-slate-400 text-sm mt-1">{item.level}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Risk Matrix */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-slate-100 font-medium text-sm">Risk Matrix (5×5)</h3>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col items-center justify-center w-6">
              <span className="text-slate-500 text-xs" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>IMPACT →</span>
            </div>

            <div className="flex-1">
              <div className="grid gap-1" style={{ gridTemplateRows: 'repeat(5, 1fr)', gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {[5, 4, 3, 2, 1].map(impact =>
                  [1, 2, 3, 4, 5].map(likelihood => {
                    const cellRisks = riskWithLevels.filter(r => r.likelihood === likelihood && r.impact === impact);
                    return (
                      <div
                        key={`${impact}-${likelihood}`}
                        className={`relative ${getCellColor(likelihood, impact)} border rounded-lg p-2 min-h-[56px] cursor-pointer hover:opacity-90 transition-opacity`}
                        onClick={() => cellRisks[0] && setSelected(cellRisks[0].id)}
                      >
                        <div className="flex flex-wrap gap-1">
                          {cellRisks.map((r, idx) => (
                            <div
                              key={r.id}
                              title={r.name}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-slate-900 cursor-pointer"
                              style={{ background: categoryColor(r.category) }}
                              onClick={e => { e.stopPropagation(); setSelected(r.id); }}
                            >
                              {idx + 1}
                            </div>
                          ))}
                        </div>
                        <div className="absolute bottom-1 right-1 text-slate-700 text-xs">{likelihood * impact}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-between mt-2 px-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} className="flex-1 text-center text-slate-600 text-xs">{n}</div>
                ))}
              </div>
              <p className="text-center text-slate-500 text-xs mt-1">LIKELIHOOD →</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-800">
            {[
              { label: 'Critical (15–25)', color: 'bg-red-500/40' },
              { label: 'High (9–14)', color: 'bg-amber-500/40' },
              { label: 'Medium (4–8)', color: 'bg-yellow-500/40' },
              { label: 'Low (1–3)', color: 'bg-emerald-500/40' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${item.color}`} />
                <span className="text-slate-500 text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected risk detail */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          {selectedRisk ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 text-xs font-mono">{selectedRisk.id.slice(0, 8)}</p>
                  <h3 className="text-slate-100 font-semibold mt-0.5">{selectedRisk.name}</h3>
                </div>
                <RiskBadge level={getRiskLevel(selectedRisk.likelihood, selectedRisk.impact)} />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">STRIDE Category</p>
                  <span className="text-xs font-medium px-2 py-1 rounded" style={{ color: categoryColor(selectedRisk.category), background: categoryColor(selectedRisk.category) + '18' }}>
                    {selectedRisk.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-slate-400 text-xs mb-1">Likelihood</p>
                    <p className="text-2xl font-bold text-amber-400">{selectedRisk.likelihood}/5</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-slate-400 text-xs mb-1">Impact</p>
                    <p className="text-2xl font-bold text-red-400">{selectedRisk.impact}/5</p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs mb-1">Risk Score</p>
                  <p className="text-3xl font-bold" style={{ color: getRiskColor(getRiskLevel(selectedRisk.likelihood, selectedRisk.impact)) }}>
                    {selectedRisk.likelihood * selectedRisk.impact}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">Likelihood × Impact</p>
                </div>

                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Recommended Mitigation</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedRisk.mitigation}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full border capitalize ${
                    selectedRisk.status === 'mitigated' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    selectedRisk.status === 'accepted' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {selectedRisk.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <Info className="w-8 h-8 text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Select a risk item from the matrix or table to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-slate-100 font-medium text-sm">Full Risk Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Risk</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Category</th>
                <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Likelihood</th>
                <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Impact</th>
                <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Risk Level</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-sm">Loading risk items…</td></tr>
              ) : riskWithLevels
                .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
                .map(risk => (
                  <tr
                    key={risk.id}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer ${selected === risk.id ? 'bg-slate-800/50' : ''}`}
                    onClick={() => setSelected(risk.id === selected ? null : risk.id)}
                  >
                    <td className="px-5 py-3">
                      <p className="text-slate-300 text-xs font-medium">{risk.name}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ color: categoryColor(risk.category), background: categoryColor(risk.category) + '18' }}>
                        {risk.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-slate-300 text-sm font-semibold">{risk.likelihood}</td>
                    <td className="px-5 py-3 text-center text-slate-300 text-sm font-semibold">{risk.impact}</td>
                    <td className="px-5 py-3 text-center font-bold text-sm" style={{ color: getRiskColor(risk.riskLevel) }}>
                      {risk.likelihood * risk.impact}
                    </td>
                    <td className="px-5 py-3"><RiskBadge level={risk.riskLevel} /></td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                        risk.status === 'mitigated' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        risk.status === 'accepted' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {risk.status}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
