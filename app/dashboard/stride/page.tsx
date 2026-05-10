'use client';

import { useEffect, useState } from 'react';
import { STRIDE_COLORS } from '@/lib/mock-data';
import { StrideCategory, StrideCount } from '@/lib/types';
import { StrideDonutChart } from '@/components/charts/StrideDonutChart';
import { Shield, Filter } from 'lucide-react';

interface Threat {
  id: string;
  category: string;
  description: string;
  severity: string;
  source: string;
  target: string;
  status: string;
  createdAt: string;
}

const ALL = 'All';

const CATEGORIES: (StrideCategory | typeof ALL)[] = [
  ALL, 'Spoofing', 'Tampering', 'Repudiation',
  'Information Disclosure', 'Denial of Service', 'Elevation of Privilege',
];

function SeverityBadge({ severity }: Readonly<{ severity: string }>) {
  const styles: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[severity] ?? styles.low}`}>{severity}</span>;
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const styles: Record<string, string> = {
    active: 'bg-red-500/10 text-red-400 border-red-500/20',
    investigating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    mitigated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status] ?? styles.active}`}>{status}</span>;
}

const STRIDE_CATS = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'] as const;

function buildStrideCounts(threats: Threat[]): StrideCount[] {
  return STRIDE_CATS.map(cat => ({
    category: cat,
    count: threats.filter(t => t.category === cat).length,
    color: STRIDE_COLORS[cat] ?? '#64748b',
  }));
}

export default function StridePage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<StrideCategory | typeof ALL>(ALL);
  const [filterStatus, setFilterStatus] = useState<string>(ALL);

  useEffect(() => {
    fetch('/api/threats')
      .then(r => r.json())
      .then(data => { setThreats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const strideCounts = buildStrideCounts(threats);

  const filtered = threats.filter(t => {
    if (filterCategory !== ALL && t.category !== filterCategory) return false;
    if (filterStatus !== ALL && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">STRIDE Threat Mapping</h1>
        <p className="text-slate-400 text-sm mt-1">All security events classified under the STRIDE threat model framework.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {strideCounts.map(s => (
          <button
            key={s.category}
            type="button"
            className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
            onClick={() => setFilterCategory(filterCategory === s.category ? ALL : s.category)}
            style={{ borderColor: filterCategory === s.category ? s.color : undefined }}
          >
            <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ background: `${s.color}18` }}>
              <Shield className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-slate-100">{s.count}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{s.category}</p>
          </button>
        ))}
      </div>

      {/* Chart + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-slate-100 font-medium text-sm mb-4">Threat Distribution by STRIDE Category</h3>
          <StrideDonutChart data={strideCounts} />
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-slate-100 font-medium text-sm mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {strideCounts.map(s => {
              const total = strideCounts.reduce((a, b) => a + b.count, 0) || 1;
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-xs">{s.category}</span>
                    <span className="text-xs font-semibold" style={{ color: s.color }}>{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-slate-500 text-xs">
              <span className="text-red-400 font-medium">Information Disclosure</span> is the most prevalent threat vector,
              followed by <span className="text-cyan-400 font-medium">Spoofing</span>.
              Prioritise data access controls and phishing defences.
            </p>
          </div>
        </div>
      </div>

      {/* Filters + table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    filterCategory === cat
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                      : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                  style={cat !== ALL && filterCategory === cat ? { borderColor: STRIDE_COLORS[cat] + '80', backgroundColor: STRIDE_COLORS[cat] + '18', color: STRIDE_COLORS[cat] } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="ml-auto bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-slate-400 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value={ALL}>All statuses</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="mitigated">Mitigated</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Description</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Target</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Severity</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">Loading threats…</td></tr>
              ) : filtered.map(threat => (
                <tr key={threat.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded" style={{ color: STRIDE_COLORS[threat.category], background: STRIDE_COLORS[threat.category] + '18' }}>
                      {threat.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-300 text-xs max-w-xs">{threat.description}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{threat.target}</td>
                  <td className="px-5 py-3"><SeverityBadge severity={threat.severity} /></td>
                  <td className="px-5 py-3"><StatusBadge status={threat.status} /></td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(threat.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">No threats match the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-800">
          <p className="text-slate-600 text-xs">{filtered.length} of {threats.length} threats shown</p>
        </div>
      </div>
    </div>
  );
}
