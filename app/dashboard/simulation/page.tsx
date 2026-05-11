'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { SimulationChart } from '@/components/charts/SimulationChart';
import {
  Swords, Play, CheckCircle, Clock, ShieldCheck,
  AlertTriangle, Wifi, RefreshCw,
} from 'lucide-react';

interface SimScenario {
  id: string;
  name: string;
  type: string;
  description: string;
  attackSuccessWithout: number;
  attackSuccessWith: number;
  detectionRate: number;
  recoveryTime: string;
  controls: string[];
}

interface TrialMetrics {
  totalAttempts: number;
  successfulAttacks: number;
  blockedAttempts: number;
  detectedEvents: number;
  falsePositives: number;
  attackSuccessRate: number;
  detectionRate: number;
  falsePositiveRate: number;
  meanTimeToDetection: number;
}

interface SimulationReport {
  scenarioType: string;
  baseline: TrialMetrics;
  controlled: TrialMetrics;
  attackSuccessReduction: number;
  detectionImprovement: number;
}

type SimState = 'idle' | 'running' | 'done';

function formatMTTD(seconds: number): string {
  if (seconds === 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  return `${(seconds / 3600).toFixed(1)}h`;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-200"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

const RUNNING_LABELS: Record<string, string> = {
  phishing:         'Submitting 500 credential pairs against auth endpoint…',
  misconfiguration: 'Probing 50 storage endpoints for unauthorised access…',
  tampering:        'Sending 40 metadata modification requests from low-privilege account…',
};

export default function SimulationPage() {
  const { user } = useAuth();
  const [scenarios, setScenarios]   = useState<SimScenario[]>([]);
  const [loading, setLoading]       = useState(true);
  const [states, setStates]         = useState<Record<string, SimState>>({});
  const [progress, setProgress]     = useState<Record<string, number>>({});
  const [reports, setReports]       = useState<Record<string, SimulationReport>>({});

  const canRun = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetch('/api/simulation')
      .then(r => r.json())
      .then((data: SimScenario[]) => {
        setScenarios(data);
        setStates(Object.fromEntries(data.map(s => [s.id, 'idle' as SimState])));
        setProgress(Object.fromEntries(data.map(s => [s.id, 0])));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const runSimulation = async (id: string) => {
    setStates(prev => ({ ...prev, [id]: 'running' }));
    setProgress(prev => ({ ...prev, [id]: 0 }));

    // Animate to ~90% while the API processes
    let pct = 0;
    const interval = setInterval(() => {
      pct = Math.min(90, pct + Math.random() * 18 + 4);
      setProgress(prev => ({ ...prev, [id]: pct }));
      if (pct >= 90) clearInterval(interval);
    }, 160);

    try {
      const res = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id }),
      });
      clearInterval(interval);
      if (!res.ok) throw new Error('run failed');
      const { report } = await res.json() as { report: SimulationReport };
      setProgress(prev => ({ ...prev, [id]: 100 }));
      setReports(prev => ({ ...prev, [id]: report }));
      setStates(prev => ({ ...prev, [id]: 'done' }));
    } catch {
      clearInterval(interval);
      setStates(prev => ({ ...prev, [id]: 'idle' }));
    }
  };

  const resetSimulation = (id: string) => {
    setStates(prev => ({ ...prev, [id]: 'idle' }));
    setProgress(prev => ({ ...prev, [id]: 0 }));
  };

  const scenarioIcons: Record<string, React.ReactNode> = {
    phishing:         <Wifi className="w-5 h-5" />,
    misconfiguration: <AlertTriangle className="w-5 h-5" />,
    tampering:        <ShieldCheck className="w-5 h-5" />,
  };

  const scenarioAccent: Record<string, string> = {
    phishing:         'bg-red-500/10 border-red-500/20 text-red-400',
    misconfiguration: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    tampering:        'bg-violet-500/10 border-violet-500/20 text-violet-400',
  };

  // Chart uses computed results when available, otherwise scenario defaults
  const chartData = scenarios.map(s => {
    const r = reports[s.id];
    return {
      name: s.type === 'phishing' ? 'Phishing' : s.type === 'misconfiguration' ? 'Cloud Config' : 'Tampering',
      without: r ? r.baseline.attackSuccessRate   : s.attackSuccessWithout,
      with:    r ? r.controlled.attackSuccessRate : s.attackSuccessWith,
    };
  });

  const allDone = scenarios.length > 0 && scenarios.every(s => states[s.id] === 'done');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Attack Simulation</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monte Carlo simulations demonstrating attack success rates before and after security controls.
          Each run computes fresh results — expect small variance between executions.
        </p>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 text-sm font-medium">Controlled Environment</p>
          <p className="text-slate-400 text-xs mt-0.5">
            All simulations use synthetic data in an isolated statistical model. Results are computed
            probabilistically from calibrated attack-success parameters derived from threat intelligence
            baselines.
            {!canRun && <span className="text-amber-400/70"> · Your role cannot run simulations.</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500 text-sm">Loading scenarios…</div>
        ) : scenarios.map(scenario => {
          const state  = states[scenario.id]   ?? 'idle';
          const pct    = progress[scenario.id] ?? 0;
          const report = reports[scenario.id];

          // Displayed values: computed if available, otherwise scenario defaults
          const bASR = report ? report.baseline.attackSuccessRate   : scenario.attackSuccessWithout;
          const cASR = report ? report.controlled.attackSuccessRate : scenario.attackSuccessWith;
          const cDR  = report ? report.controlled.detectionRate     : scenario.detectionRate;

          return (
            <div key={scenario.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">

              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${scenarioAccent[scenario.type] ?? ''}`}>
                  {scenarioIcons[scenario.type]}
                </div>
                <div>
                  <h3 className="text-slate-100 font-semibold text-sm">{scenario.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5 capitalize">{scenario.type} scenario</p>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mb-4 flex-1">{scenario.description}</p>

              {/* Controls list */}
              <div className="mb-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Security Controls</p>
                <div className="space-y-1">
                  {scenario.controls.map(ctrl => (
                    <div key={ctrl} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-slate-400 text-xs">{ctrl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Running state */}
              {state === 'running' && (
                <div className="mb-4 space-y-2">
                  <p className="text-slate-500 text-xs">{RUNNING_LABELS[scenario.type]}</p>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Computing…</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <ProgressBar value={pct} color="#06b6d4" />
                </div>
              )}

              {/* Results */}
              {state === 'done' && (
                <div className="mb-4 space-y-3">
                  {/* ASR comparison */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2.5 text-center">
                      <p className="text-slate-500 text-xs mb-0.5">Without Controls</p>
                      <p className="text-red-400 font-bold text-lg">{bASR}%</p>
                      <p className="text-slate-600 text-xs">attack success</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 text-center">
                      <p className="text-slate-500 text-xs mb-0.5">With Controls</p>
                      <p className="text-emerald-400 font-bold text-lg">{cASR}%</p>
                      <p className="text-slate-600 text-xs">attack success</p>
                    </div>
                  </div>

                  {/* Key metrics row */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
                      <p className="text-cyan-400 font-bold text-sm">{cDR}%</p>
                      <p className="text-slate-500 text-xs">detection</p>
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
                      <Clock className="w-3.5 h-3.5 text-violet-400 mx-auto mb-0.5" />
                      <p className="text-violet-400 font-bold text-sm">{scenario.recoveryTime}</p>
                      <p className="text-slate-500 text-xs">recovery</p>
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
                      <p className="text-emerald-400 font-bold text-sm">
                        -{report ? report.attackSuccessReduction : Math.round(bASR - cASR)}pp
                      </p>
                      <p className="text-slate-500 text-xs">reduction</p>
                    </div>
                  </div>

                  {/* Computed run detail */}
                  {report && (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 space-y-1.5">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Run Detail</p>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 text-xs">
                        <span className="text-slate-500">Attempts</span>
                        <span className="col-span-2 text-slate-300 font-mono">{report.controlled.totalAttempts.toLocaleString()}</span>
                        <span className="text-slate-500">Succeeded</span>
                        <span className="col-span-2 text-red-400 font-mono">
                          {report.controlled.successfulAttacks} ({report.controlled.attackSuccessRate}%)
                        </span>
                        <span className="text-slate-500">Blocked</span>
                        <span className="col-span-2 text-emerald-400 font-mono">
                          {report.controlled.blockedAttempts} ({(100 - report.controlled.attackSuccessRate).toFixed(1)}%)
                        </span>
                        <span className="text-slate-500">Detected</span>
                        <span className="col-span-2 text-cyan-400 font-mono">
                          {report.controlled.detectedEvents} ({report.controlled.detectionRate}%)
                        </span>
                        <span className="text-slate-500">MTTD</span>
                        <span className="col-span-2 text-violet-400 font-mono">
                          {formatMTTD(report.controlled.meanTimeToDetection)}
                        </span>
                        <span className="text-slate-500">FPR</span>
                        <span className="col-span-2 text-slate-300 font-mono">
                          {report.controlled.falsePositiveRate}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              {state === 'idle' && (
                <button
                  onClick={() => canRun && runSimulation(scenario.id)}
                  disabled={!canRun}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors border ${
                    canRun
                      ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 text-cyan-400'
                      : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {canRun ? 'Run Simulation' : 'Insufficient Permissions'}
                </button>
              )}
              {state === 'running' && (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-500 rounded-lg py-2.5 text-sm font-medium cursor-not-allowed"
                >
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Simulating…
                </button>
              )}
              {state === 'done' && (
                <button
                  onClick={() => resetSimulation(scenario.id)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Run Again
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Swords className="w-4 h-4 text-cyan-400" />
          <h3 className="text-slate-100 font-medium text-sm">Attack Success Rate: Before vs After Controls</h3>
        </div>
        <p className="text-slate-500 text-xs mb-4">
          Attack success rate (%) with and without security controls. Chart updates after each run.
        </p>
        <SimulationChart data={chartData} />
      </div>

      {/* Summary table — shown when all scenarios have been run */}
      {allDone && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-slate-100 font-medium text-sm">Simulation Results Summary</h3>
            <span className="ml-auto text-slate-600 text-xs">All values computed from current run</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase">Scenario</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase">n</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase">ASR Baseline</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase">ASR Controlled</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase">Reduction</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase">Detection</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase">MTTD</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase">FPR</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase">Recovery</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map(s => {
                  const r = reports[s.id];
                  return (
                    <tr key={s.id} className="border-b border-slate-800/50">
                      <td className="px-5 py-3 text-slate-300 text-xs font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono text-xs">
                        {r ? r.controlled.totalAttempts : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-red-400 font-semibold text-xs">
                        {r ? r.baseline.attackSuccessRate : s.attackSuccessWithout}%
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-semibold text-xs">
                        {r ? r.controlled.attackSuccessRate : s.attackSuccessWith}%
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        <span className="text-cyan-400 font-bold">
                          -{r ? r.attackSuccessReduction : s.attackSuccessWithout - s.attackSuccessWith}pp
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300 font-semibold text-xs">
                        {r ? r.controlled.detectionRate : s.detectionRate}%
                      </td>
                      <td className="px-4 py-3 text-center text-violet-400 font-medium text-xs">
                        {r ? formatMTTD(r.controlled.meanTimeToDetection) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 text-xs">
                        {r ? `${r.controlled.falsePositiveRate}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-amber-400 font-medium text-xs">
                        {s.recoveryTime}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
