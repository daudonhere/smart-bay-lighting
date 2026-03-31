'use client';

import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./Sidebar').then(mod => mod.Sidebar), { ssr: false });

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden bg-[#050508] text-zinc-300 w-full">
      <Sidebar />
      {children}
    </div>
  );
}
