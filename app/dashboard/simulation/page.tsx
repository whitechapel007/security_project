'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { SimulationChart } from '@/components/charts/SimulationChart';
import { Swords, Play, CheckCircle, Clock, ShieldCheck, AlertTriangle, Wifi } from 'lucide-react';

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

type SimState = 'idle' | 'running' | 'done';

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export default function SimulationPage() {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<SimScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<Record<string, SimState>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});

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

    // Animate progress locally
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 15 + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setStates(prev => ({ ...prev, [id]: 'done' }));
        // Also persist to backend
        fetch('/api/simulation/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId: id }),
        }).catch(() => {});
      }
      setProgress(prev => ({ ...prev, [id]: Math.min(100, pct) }));
    }, 200);
  };

  const resetSimulation = (id: string) => {
    setStates(prev => ({ ...prev, [id]: 'idle' }));
    setProgress(prev => ({ ...prev, [id]: 0 }));
  };

  const scenarioIcons: Record<string, React.ReactNode> = {
    phishing: <Wifi className="w-5 h-5" />,
    misconfiguration: <AlertTriangle className="w-5 h-5" />,
    tampering: <ShieldCheck className="w-5 h-5" />,
  };

  const scenarioColors: Record<string, string> = {
    phishing: 'bg-red-500/10 border-red-500/20 text-red-400',
    misconfiguration: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    tampering: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  };

  const chartData = scenarios.map(s => ({
    name: s.type === 'phishing' ? 'Phishing' : s.type === 'misconfiguration' ? 'Cloud Config' : 'Tampering',
    without: s.attackSuccessWithout,
    with: s.attackSuccessWith,
  }));

  const allDone = scenarios.length > 0 && scenarios.every(s => states[s.id] === 'done');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Attack Simulation</h1>
        <p className="text-slate-400 text-sm mt-1">
          Controlled simulations demonstrating attack success rates before and after security controls. No real systems are affected.
        </p>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 text-sm font-medium">Controlled Environment</p>
          <p className="text-slate-400 text-xs mt-0.5">
            All simulations use synthetic data in an isolated sandbox. Results reflect statistical modelling of real-world attack patterns.
            {!canRun && <span className="text-amber-400/70"> · Your role cannot run simulations.</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500 text-sm">Loading scenarios…</div>
        ) : scenarios.map(scenario => {
          const state = states[scenario.id] ?? 'idle';
          const pct = progress[scenario.id] ?? 0;

          return (
            <div key={scenario.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${scenarioColors[scenario.type] ?? ''}`}>
                  {scenarioIcons[scenario.type]}
                </div>
                <div>
                  <h3 className="text-slate-100 font-semibold text-sm">{scenario.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5 capitalize">{scenario.type} scenario</p>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mb-4 flex-1">{scenario.description}</p>

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

              {state === 'running' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Simulating...</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <ProgressBar value={pct} color="#06b6d4" />
                </div>
              )}

              {state === 'done' && (
                <div className="mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2.5 text-center">
                      <p className="text-slate-500 text-xs mb-0.5">Without Controls</p>
                      <p className="text-red-400 font-bold text-lg">{scenario.attackSuccessWithout}%</p>
                      <p className="text-slate-600 text-xs">attack success</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 text-center">
                      <p className="text-slate-500 text-xs mb-0.5">With Controls</p>
                      <p className="text-emerald-400 font-bold text-lg">{scenario.attackSuccessWith}%</p>
                      <p className="text-slate-600 text-xs">attack success</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
                      <p className="text-cyan-400 font-bold text-sm">{scenario.detectionRate}%</p>
                      <p className="text-slate-500 text-xs">detection</p>
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
                      <Clock className="w-3.5 h-3.5 text-violet-400 mx-auto mb-0.5" />
                      <p className="text-violet-400 font-bold text-sm">{scenario.recoveryTime}</p>
                      <p className="text-slate-500 text-xs">recovery</p>
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
                      <p className="text-emerald-400 font-bold text-sm">
                        -{Math.round(scenario.attackSuccessWithout - scenario.attackSuccessWith)}%
                      </p>
                      <p className="text-slate-500 text-xs">reduction</p>
                    </div>
                  </div>
                </div>
              )}

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
                <button disabled className="w-full flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-500 rounded-lg py-2.5 text-sm font-medium cursor-not-allowed">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Simulating...
                </button>
              )}
              {state === 'done' && (
                <button
                  onClick={() => resetSimulation(scenario.id)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Swords className="w-4 h-4 text-cyan-400" />
          <h3 className="text-slate-100 font-medium text-sm">Attack Success Rate: Before vs After Controls</h3>
        </div>
        <p className="text-slate-500 text-xs mb-4">
          Comparison of attack success rates (%) with and without security controls applied.
        </p>
        <SimulationChart data={chartData} />
      </div>

      {allDone && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-slate-100 font-medium text-sm">Simulation Results Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase">Scenario</th>
                  <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase">Without Controls</th>
                  <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase">With Controls</th>
                  <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase">Reduction</th>
                  <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase">Detection Rate</th>
                  <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase">Recovery Time</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map(s => (
                  <tr key={s.id} className="border-b border-slate-800/50">
                    <td className="px-5 py-3 text-slate-300 text-xs font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-center text-red-400 font-semibold">{s.attackSuccessWithout}%</td>
                    <td className="px-5 py-3 text-center text-emerald-400 font-semibold">{s.attackSuccessWith}%</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-cyan-400 font-bold">-{s.attackSuccessWithout - s.attackSuccessWith}pp</span>
                    </td>
                    <td className="px-5 py-3 text-center text-slate-300 font-semibold">{s.detectionRate}%</td>
                    <td className="px-5 py-3 text-center text-violet-400 font-medium">{s.recoveryTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
