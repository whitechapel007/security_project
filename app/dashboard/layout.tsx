'use client';

import { useAuth } from '@/lib/auth-context';
import { RealtimeProvider } from '@/lib/realtime-context';
import { Sidebar } from '@/components/Sidebar';
import { Header, ToastContainer } from '@/components/Header';
import { ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  // proxy.ts guards this route at the edge — this spinner covers only the brief
  // client-side hydration window while /api/auth/me resolves.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm">Loading ArtistShield…</p>
        </div>
      </div>
    );
  }

  return (
    <RealtimeProvider>
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer />
    </RealtimeProvider>
  );
}
