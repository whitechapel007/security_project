'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRealtime, LiveEvent } from '@/lib/realtime-context';
import { STRIDE_COLORS } from '@/lib/mock-data';
import { StrideCount } from '@/lib/types';
import { SecurityTrendChart } from '@/components/charts/SecurityTrendChart';
import { StrideBarChart } from '@/components/charts/StrideBarChart';
import { ThreatTrendChart } from '@/components/charts/ThreatTrendChart';
import {
  ShieldCheck, AlertTriangle, Activity, Eye, CheckCircle, XCircle, Clock, Radio, Zap
} from 'lucide-react';

interface Threat {
  id: string;
  category: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
}
interface AuditLogEntry {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  status: string;
  ipAddress: string;
  details: string;
  createdAt: string;
}
interface Metric {
  date: string;
  score: number;
  threats: number;
  resolved: number;
}
function SeverityBadge({ severity }: { severity: string }) {
  const s: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${s[severity] ?? s.low}`}>{severity}</span>;
}

function StatusDot({ status }: { status: string }) {
  const s: Record<string, string> = { active: 'bg-red-400', investigating: 'bg-amber-400', mitigated: 'bg-emerald-400' };
  return <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${s[status] ?? 'bg-slate-400'}`} />;
}

function ScoreRing({ score }: { score: number }) {
  const r = 54, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-bold text-slate-100">{score}</p>
        <p className="text-xs text-slate-500">/ 100</p>
      </div>
    </div>
  );
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function LiveEventRow({ event, fresh }: { event: LiveEvent; fresh: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 30); return () => clearTimeout(t); }, []);
  return (
    <div className={`flex items-start gap-2.5 py-2 border-b border-slate-800/50 last:border-0 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {fresh && <span className="shrink-0 mt-1.5 relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" /></span>}
      {!fresh && <StatusDot status={event.status} />}
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-xs leading-relaxed truncate">{event.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: STRIDE_COLORS[event.category] }}>{event.category}</span>
          <span className="text-slate-600 text-xs">{timeAgo(event.detectedAt)}</span>
        </div>
      </div>
      <SeverityBadge severity={event.severity} />
    </div>
  );
}

function buildStrideCounts(threats: Threat[]): StrideCount[] {
  const cats = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'] as const;
  return cats.map(cat => ({
    category: cat,
    count: threats.filter(t => t.category === cat).length,
    color: STRIDE_COLORS[cat],
  }));
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const { liveFeed, failedLogins, scanCount, lastScan } = useRealtime();

  const [threats, setThreats] = useState<Threat[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    fetch('/api/threats').then(r => r.json()).then(setThreats).catch(() => {});
    fetch('/api/logs?limit=25').then(r => r.json()).then(setLogs).catch(() => {});
    fetch('/api/metrics').then(r => r.json()).then(setMetrics).catch(() => {});
  }, []);

  const latestScore = metrics.length > 0 ? metrics[metrics.length - 1].score : 72;
  const activeThreats = threats.filter(t => t.status === 'active').length;
  const criticalThreats = threats.filter(t => t.severity === 'critical').length;
  const strideCounts = buildStrideCounts(threats);

  const [secsSince, setSecsSince] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      if (lastScan) setSecsSince(Math.floor((Date.now() - lastScan.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [lastScan]);

  return (
    <div className="p-6 space-y-5">
      {/* Live monitoring banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span className="text-emerald-400 text-sm font-semibold">Live Monitoring Active</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 ml-auto">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-xs">Scans: <span className="text-cyan-400 font-semibold tabular-nums">{scanCount.toLocaleString()}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-slate-400 text-xs">Failed logins: <span className="text-red-400 font-semibold tabular-nums">{failedLogins}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 text-xs">Last event: <span className="text-slate-300 font-medium tabular-nums">{lastScan ? `${secsSince}s ago` : 'awaiting…'}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-slate-400 text-xs">Live events: <span className="text-violet-400 font-semibold tabular-nums">{liveFeed.length}</span></span>
          </div>
        </div>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center gap-3">
          <p className="text-slate-400 text-sm font-medium">Security Score</p>
          <ScoreRing score={latestScore} />
          <div className="flex items-center gap-1.5 text-amber-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{latestScore >= 75 ? 'Good Standing' : latestScore >= 50 ? 'Needs Improvement' : 'At Risk'}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm">MFA Status</p>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">Enabled</p>
          <p className="text-slate-500 text-xs mt-1">TOTP active on admin accounts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm">Active Threats</p>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{activeThreats + liveFeed.filter(e => e.status === 'active').length}</p>
          <p className="text-slate-500 text-xs mt-1">{criticalThreats} critical · {liveFeed.filter(e => e.status === 'active').length} live</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm">Audit Events</p>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400">{logs.length + liveFeed.length}</p>
          <p className="text-slate-500 text-xs mt-1">{liveFeed.length} live · {logs.length} logged</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-slate-100 font-medium text-sm">Security Score Trend (30 days)</h3>
          </div>
          <SecurityTrendChart data={metrics} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-slate-100 font-medium text-sm">STRIDE Threat Distribution</h3>
          </div>
          <StrideBarChart data={strideCounts} />
          <p className="text-slate-500 text-xs mt-2 text-center">
            {strideCounts.reduce((s, c) => s + c.count, 0) + liveFeed.length} total events classified
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-red-400" />
            <h3 className="text-slate-100 font-medium text-sm">Recent Threats</h3>
          </div>
          <div>
            {threats.slice(0, 5).map(threat => (
              <div key={threat.id} className="flex items-start gap-2.5 py-2.5 border-b border-slate-800/50 last:border-0">
                <StatusDot status={threat.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">{threat.description}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{threat.category}</p>
                </div>
                <SeverityBadge severity={threat.severity} />
              </div>
            ))}
            {threats.length === 0 && <p className="text-slate-600 text-xs py-4 text-center">Loading threats…</p>}
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-slate-100 font-medium text-sm">Live Event Feed</h3>
            {liveFeed.length > 0 && (
              <span className="ml-auto bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-1.5 py-0.5 rounded-full">
                {liveFeed.length} detected
              </span>
            )}
          </div>
          {liveFeed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600" />
                </span>
              </div>
              <p className="text-slate-500 text-sm">Awaiting live events…</p>
              <p className="text-slate-700 text-xs mt-1">Events will appear here as they are detected</p>
            </div>
          ) : (
            <div>
              {liveFeed.slice(0, 4).map((event, i) => (
                <LiveEventRow key={event.liveId} event={event} fresh={i === 0} />
              ))}
              {liveFeed.length > 4 && (
                <p className="text-slate-600 text-xs mt-2 text-center">+{liveFeed.length - 4} more events in notifications</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-violet-400" />
              <h3 className="text-slate-100 font-medium text-sm">Threat Activity (14 days)</h3>
            </div>
            <ThreatTrendChart data={metrics} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-100 font-medium text-sm">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    log.status === 'success' ? 'bg-emerald-400' :
                    log.status === 'failure' ? 'bg-red-400' : 'bg-amber-400'
                  }`} />
                  <div>
                    <p className="text-slate-400 text-xs">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-slate-600 text-xs">{log.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CIA Triad */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4">CIA Triad Status</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Confidentiality', score: 78, color: 'text-cyan-400', bar: 'bg-cyan-400', desc: 'Encryption & access controls active' },
            { label: 'Integrity', score: 65, color: 'text-violet-400', bar: 'bg-violet-400', desc: 'File hashing monitoring enabled' },
            { label: 'Availability', score: 82, color: 'text-emerald-400', bar: 'bg-emerald-400', desc: 'DDoS protection & backups online' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300 text-sm font-medium">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.score}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${item.bar} rounded-full`} style={{ width: `${item.score}%` }} />
              </div>
              <p className="text-slate-600 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
