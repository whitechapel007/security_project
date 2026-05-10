'use client';

import { useEffect, useState } from 'react';
import { ScrollText, Filter, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'warning';
  ipAddress: string;
  details: string;
  createdAt: string;
}

type StatusFilter = 'all' | 'success' | 'failure' | 'warning';

function StatusIcon({ status }: { status: AuditLog['status'] }) {
  if (status === 'success') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === 'failure') return <XCircle className="w-3.5 h-3.5 text-red-400" />;
  return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
}

function StatusBadge({ status }: { status: AuditLog['status'] }) {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failure: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status]}`}>{status}</span>;
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'text-red-400 bg-red-500/10 border-red-500/20',
    manager: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    artist: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    collaborator: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };
  return <span className={`px-1.5 py-0.5 rounded text-xs border capitalize ${styles[role] ?? styles.collaborator}`}>{role}</span>;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetch('/api/logs?limit=100')
      .then(r => r.json())
      .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const filtered = logs.filter(log => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!log.userName.toLowerCase().includes(q) &&
          !log.action.toLowerCase().includes(q) &&
          !log.resource.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const successCount = logs.filter(l => l.status === 'success').length;
  const failureCount = logs.filter(l => l.status === 'failure').length;
  const warningCount = logs.filter(l => l.status === 'warning').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Audit Logs</h1>
        <p className="text-slate-400 text-sm mt-1">
          Immutable record of all security-relevant events. Supports repudiation mitigation and forensic investigation.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Events', count: logs.length, color: 'text-cyan-400', bg: 'bg-cyan-500/5 border-cyan-500/10' },
          { label: 'Successful', count: successCount, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/10' },
          { label: 'Failed', count: failureCount, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/10' },
          { label: 'Warnings', count: warningCount, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/10' },
        ].map(item => (
          <div key={item.label} className={`border ${item.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
            <p className="text-slate-400 text-sm mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-slate-100 font-medium text-sm">Activity Timeline</h3>
        </div>
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-800" />
          <div className="space-y-4">
            {logs.slice(0, 8).map(log => (
              <div key={log.id} className="flex gap-4 relative">
                <div className={`w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0 z-10 ${
                  log.status === 'success' ? 'bg-emerald-500/20' :
                  log.status === 'failure' ? 'bg-red-500/20' : 'bg-amber-500/20'
                }`}>
                  <StatusIcon status={log.status} />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-slate-300 text-xs font-medium">{log.action}</span>
                      <span className="text-slate-600 text-xs mx-1.5">·</span>
                      <span className="text-slate-500 text-xs">{log.resource}</span>
                    </div>
                    <span className="text-slate-600 text-xs shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-xs">{log.userName}</span>
                    <RoleBadge role={log.userRole} />
                    <span className="text-slate-600 text-xs">{log.ipAddress}</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
            {loading && <p className="text-slate-600 text-xs pl-10 py-2">Loading logs…</p>}
          </div>
        </div>
      </div>

      {/* Filters + table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-5 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4" />
            </div>

            <div className="flex gap-1.5">
              {(['all', 'success', 'failure', 'warning'] as StatusFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border capitalize ${
                    statusFilter === s
                      ? s === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        s === 'failure' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        s === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-slate-400 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All actions</option>
              {uniqueActions.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search user, action, resource..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="ml-auto bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-slate-300 placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Action</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Resource</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">IP Address</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">Loading audit logs…</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-slate-300 text-xs">{log.userName}</p>
                      <RoleBadge role={log.userRole} />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-slate-400 text-xs font-mono bg-slate-800 px-1.5 py-0.5 rounded">{log.action}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs max-w-45 truncate">{log.resource}</td>
                  <td className="px-5 py-3"><StatusBadge status={log.status} /></td>
                  <td className="px-5 py-3 text-slate-500 text-xs font-mono">{log.ipAddress}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs max-w-50 truncate" title={log.details}>{log.details}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">No audit logs match the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <p className="text-slate-600 text-xs">{filtered.length} of {logs.length} events shown</p>
          <div className="flex items-center gap-2">
            <ScrollText className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-600 text-xs">WORM-protected · Tamper-evident</span>
          </div>
        </div>
      </div>
    </div>
  );
}
