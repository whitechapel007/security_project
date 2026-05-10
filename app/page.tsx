'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface TestAccount {
  email: string;
  role: string;
  badge: string;
  suspended?: boolean;
}

const TEST_ACCOUNTS: TestAccount[] = [
  { email: 'alex@artistshield.io',   role: 'Admin',        badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
  { email: 'maya@artistshield.io',   role: 'Manager',      badge: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  { email: 'sam@artistshield.io',    role: 'Artist',       badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  { email: 'taylor@artistshield.io', role: 'Collaborator', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  { email: 'jordan@artistshield.io', role: 'Artist',       badge: 'bg-slate-600/15 text-slate-500 border-slate-600/25', suspended: true },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (err) { setError(err); return; }
    router.push('/dashboard');
  };

  const prefill = (acc: typeof TEST_ACCOUNTS[number]) => {
    if (acc.suspended) return;
    setEmail(acc.email);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.05) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-150 h-75 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl mb-4 shadow-xl shadow-cyan-500/10">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">ArtistShield</h1>
          <p className="text-slate-500 text-sm mt-1">Cybersecurity Monitoring Dashboard</p>
        </div>

        {/* Login form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-slate-100 font-semibold text-base mb-5">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 pr-10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors shadow-lg shadow-cyan-500/20 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Test credentials */}
        <div className="mt-4 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Test Credentials</p>
            <span className="text-slate-600 text-xs">password: <code className="text-slate-500 font-mono">password123</code></span>
          </div>
          <div className="divide-y divide-slate-800/60">
            {TEST_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => prefill(acc)}
                disabled={acc.suspended}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  acc.suspended
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-slate-800/50 cursor-pointer'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-xs font-mono truncate">{acc.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${acc.badge}`}>
                  {acc.role}
                  {acc.suspended ? ' · suspended' : ''}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-800/60">
            <p className="text-slate-600 text-xs">Click any row to prefill the form above.</p>
          </div>
        </div>

        {/* STRIDE footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {['S', 'T', 'R', 'I', 'D', 'E'].map((letter, i) => (
            <div
              key={i}
              className="w-7 h-7 border border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-xs font-mono"
            >
              {letter}
            </div>
          ))}
        </div>
        <p className="text-slate-700 text-xs text-center mt-2">Protected by Zero Trust Architecture</p>
      </div>
    </div>
  );
}
