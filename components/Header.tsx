'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Activity, Clock, ShieldAlert, AlertTriangle, X } from 'lucide-react';
import { useRealtime, LiveEvent } from '@/lib/realtime-context';
import { STRIDE_COLORS } from '@/lib/mock-data';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Security Overview', subtitle: 'Real-time threat monitoring & posture analysis' },
  '/dashboard/stride': { title: 'STRIDE Threats', subtitle: 'Threat classification & event mapping' },
  '/dashboard/risk': { title: 'Risk Assessment', subtitle: 'Likelihood × impact risk matrix' },
  '/dashboard/simulation': { title: 'Attack Simulation', subtitle: 'Controlled threat simulation environment' },
  '/dashboard/encryption': { title: 'Encryption Demo', subtitle: 'AES-256-GCM file protection' },
  '/dashboard/rbac': { title: 'Access Control', subtitle: 'Role-based permission management' },
  '/dashboard/audit': { title: 'Audit Logs', subtitle: 'Immutable security event trail' },
};

function SeverityColor(s: string) {
  const map: Record<string, string> = { critical: 'text-red-400', high: 'text-amber-400', medium: 'text-yellow-400', low: 'text-emerald-400' };
  return map[s] ?? 'text-slate-400';
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ event, onDismiss }: { event: LiveEvent; onDismiss: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 20); return () => clearTimeout(t); }, []);

  const colors: Record<string, string> = {
    critical: 'border-red-500/40 bg-slate-900',
    high: 'border-amber-500/40 bg-slate-900',
    medium: 'border-yellow-500/30 bg-slate-900',
    low: 'border-emerald-500/30 bg-slate-900',
  };
  const badge: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400',
    high: 'bg-amber-500/20 text-amber-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div
      className={`border rounded-xl p-3 shadow-2xl w-80 transition-all duration-300 ${colors[event.severity] ?? colors.low} ${
        mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {event.severity === 'critical'
          ? <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${badge[event.severity] ?? badge.low}`}>
              {event.severity}
            </span>
            <span className="text-xs font-medium" style={{ color: STRIDE_COLORS[event.category] }}>
              {event.category}
            </span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">{event.description}</p>
          <p className="text-slate-600 text-xs mt-1">{event.source} → {event.target}</p>
        </div>
        <button onClick={onDismiss} className="text-slate-600 hover:text-slate-300 flex-shrink-0 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Toast container ────────────────────────────────────────────────────── */
export function ToastContainer() {
  const { toasts, dismissToast } = useRealtime();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.liveId} className="pointer-events-auto">
          <Toast event={t} onDismiss={() => dismissToast(t.liveId)} />
        </div>
      ))}
    </div>
  );
}

/* ─── Main Header ─────────────────────────────────────────────────────────── */
export function Header() {
  const pathname = usePathname();
  const [time, setTime] = useState('');
  const [open, setOpen] = useState(false);
  const { liveFeed, notifCount, clearNotifs, failedLogins, scanCount } = useRealtime();
  const panelRef = useRef<HTMLDivElement>(null);
  const page = PAGE_META[pathname] ?? { title: 'Dashboard', subtitle: '' };

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBell = () => {
    setOpen(v => !v);
    if (!open) clearNotifs();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Left: page title */}
      <div className="min-w-0">
        <h2 className="text-slate-100 font-semibold text-base leading-tight truncate">{page.title}</h2>
        <p className="text-slate-500 text-xs truncate">{page.subtitle}</p>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-full px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-emerald-400 text-xs font-medium">LIVE</span>
        </div>

        {/* Scan counter */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-500 border border-slate-800 rounded-full px-3 py-1">
          <Activity className="w-3 h-3 text-cyan-500" />
          <span className="text-xs font-mono text-slate-400">{scanCount.toLocaleString()} scans</span>
        </div>

        {/* Clock */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-xs font-mono text-slate-400 tabular-nums w-16">{time}</span>
        </div>

        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleBell}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
          >
            <Bell className="w-4 h-4" />
            {notifCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1 animate-bounce">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-slate-200 text-sm font-semibold">Live Alerts</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{liveFeed.length} detected</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                </div>
              </div>

              {/* Live stats bar */}
              <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Failed logins: <span className="text-red-400 font-semibold">{failedLogins}</span></span>
                <span className="text-slate-400">Scans: <span className="text-cyan-400 font-semibold">{scanCount.toLocaleString()}</span></span>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {liveFeed.slice(0, 10).map(ev => (
                  <div key={ev.liveId} className="px-4 py-2.5 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${SeverityColor(ev.severity).replace('text-', 'bg-')}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">{ev.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ color: STRIDE_COLORS[ev.category] }}>{ev.category}</span>
                          <span className="text-slate-600 text-xs">{timeAgo(ev.detectedAt)}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold flex-shrink-0 capitalize ${SeverityColor(ev.severity)}`}>{ev.severity}</span>
                    </div>
                  </div>
                ))}
                {liveFeed.length === 0 && (
                  <div className="px-4 py-10 text-center">
                    <Bell className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">Monitoring for events…</p>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-800 text-xs text-slate-600 text-center">
                Real-time detection · Auto-updating
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
