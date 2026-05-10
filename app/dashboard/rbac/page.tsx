'use client';

import { useEffect, useState } from 'react';
import { PERMISSIONS } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { Users, CheckCircle, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  mfaEnabled: boolean;
  status: string;
  createdAt: string;
}

const ROLE_DESCRIPTIONS: Record<string, { desc: string; color: string; bg: string }> = {
  admin: { desc: 'Full system access. Manages users, permissions, and security configuration.', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  manager: { desc: 'Manages artists and collaborators. Can view reports and run simulations.', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  artist: { desc: 'Owns their content. Can upload, download master tracks, and manage their profile.', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  collaborator: { desc: 'Limited access for co-producers and session musicians. Upload-only.', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

export default function RbacPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAdmin]);

  const suspendUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Access Control (RBAC)</h1>
        <p className="text-slate-400 text-sm mt-1">
          Role-Based Access Control enforcing the Zero Trust principle of least privilege.
        </p>
      </div>

      {!isAdmin && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-amber-400/80 text-sm">You are viewing in read-only mode. Administrator access is required to manage roles and users.</p>
        </div>
      )}

      {/* Role cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(ROLE_DESCRIPTIONS).map(([role, meta]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div
              key={role}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                activeRole === role ? meta.bg : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => setActiveRole(activeRole === role ? null : role)}
            >
              <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${meta.color}`}>{role}</div>
              <p className="text-slate-400 text-xs leading-relaxed">{meta.desc}</p>
              {isAdmin && (
                <p className="text-slate-600 text-xs mt-2">{count} user{count !== 1 ? 's' : ''}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Permission matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-slate-100 font-medium text-sm">Permission Matrix</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider w-64">Permission</th>
                {['admin', 'manager', 'artist', 'collaborator'].map(role => {
                  const meta = ROLE_DESCRIPTIONS[role];
                  return (
                    <th key={role} className="text-center px-5 py-3">
                      <span className={`text-xs font-semibold capitalize ${meta.color}`}>{role}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(perm => (
                <tr key={perm.action} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3 text-slate-300 text-xs">{perm.action}</td>
                  {(['admin', 'manager', 'artist', 'collaborator'] as const).map(role => (
                    <td key={role} className="px-5 py-3 text-center">
                      {perm[role] ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-700 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User list — admin only */}
      {isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-slate-100 font-medium text-sm">User Accounts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Role</th>
                  <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">MFA</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Joined</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">Loading users…</td></tr>
                ) : users.map(u => {
                  const meta = ROLE_DESCRIPTIONS[u.role] ?? ROLE_DESCRIPTIONS.collaborator;
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${isSelf ? 'bg-cyan-500/5' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="text-slate-300 text-xs font-medium">
                              {u.name}
                              {isSelf && <span className="ml-1.5 text-cyan-400 text-xs">(you)</span>}
                            </p>
                            <p className="text-slate-600 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${meta.bg} ${meta.color}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {u.mfaEnabled ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {!isSelf && (
                          <button
                            onClick={() => suspendUser(u.id, u.status)}
                            className={`text-xs transition-colors px-2 py-1 rounded border ${
                              u.status === 'active'
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Reinstate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Zero Trust */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-slate-100 font-medium text-sm mb-3">Zero Trust Principles Applied</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Least Privilege', desc: 'Each role only has access to the minimum permissions needed for their function. Collaborators cannot view financial data.' },
            { title: 'Continuous Verification', desc: 'All actions are logged in the audit trail. Role changes require admin approval and are flagged for review.' },
            { title: 'Assume Breach', desc: 'Even authenticated users are limited in scope. No single role has unrestricted access to all system resources.' },
          ].map(item => (
            <div key={item.title} className="flex gap-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 text-sm font-medium">{item.title}</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
