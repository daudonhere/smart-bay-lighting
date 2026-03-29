'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/monitoring',
    label: 'Monitoring',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/docs',
    label: 'API Docs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-72'} bg-zinc-900/80 backdrop-blur-md border-r border-zinc-800 shadow-xl flex flex-col z-10 transition-all duration-300 ${className || ''}`}
    >
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Smart Bay
              </h1>
              <p className="text-xs text-zinc-500">Sports Lighting</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors text-zinc-400 hover:text-zinc-200 flex-shrink-0 ml-auto"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <nav className="mt-6 px-4 flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all hover:scale-[1.02] ${
              pathname === item.href
                ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg shadow-blue-500/20'
                : 'text-zinc-400 hover:bg-zinc-800/50'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <span className={pathname === item.href ? 'text-white' : 'text-zinc-600 group-hover:text-blue-400 transition-colors'}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="ml-3 font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-zinc-800">
          <div className="bg-gradient-to-br from-blue-600/50 to-purple-600/50 rounded-xl p-4 text-white border border-blue-500/30">
            <p className="text-sm font-medium">API Tester</p>
            <p className="text-xs opacity-80 mt-1">Test endpoints directly</p>
          </div>
        </div>
      )}
    </aside>
  );
}
