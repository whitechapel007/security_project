'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, Shield, Target, Swords, Lock, Users, ScrollText, LogOut, ShieldCheck
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/stride', icon: Shield, label: 'STRIDE Threats' },
  { href: '/dashboard/risk', icon: Target, label: 'Risk Assessment' },
  { href: '/dashboard/simulation', icon: Swords, label: 'Simulations' },
  { href: '/dashboard/encryption', icon: Lock, label: 'Encryption' },
  { href: '/dashboard/rbac', icon: Users, label: 'Access Control' },
  { href: '/dashboard/audit', icon: ScrollText, label: 'Audit Logs' },
];

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  manager: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  artist: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  collaborator: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const roleColor = roleBadgeColors[user?.role ?? 'artist'];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-slate-100 font-bold text-base leading-none tracking-tight">ArtistShield</h1>
            <p className="text-slate-500 text-xs mt-0.5">Security Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-100 text-sm font-medium truncate">{user?.name ?? 'Artist'}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded border capitalize ${roleColor}`}>
              {user?.role ?? 'artist'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
