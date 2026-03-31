'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { 
  LayoutDashboard, 
  Activity, 
  BookOpen, 
  ChevronLeft, 
  Menu,
  Zap,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/monitoring',
    label: 'Live Monitoring',
    icon: Activity,
  },
  {
    href: '/docs',
    label: 'API Explorer',
    icon: BookOpen,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Prevent hydration mismatch by not rendering the desktop-specific dynamic width until mounted
  const sidebarWidth = !mounted ? 'lg:w-24' : (isCollapsed ? 'lg:w-24' : 'lg:w-72');

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-5 left-4 z-50 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 active:scale-95 transition-all shadow-xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarWidth} bg-[#0a0a0f] border-r border-zinc-800/50 flex flex-col transition-all duration-500 ease-in-out ${className || ''}`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {mounted && !isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-lg font-black text-white tracking-tighter uppercase">Smart Bay</h1>
                <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase opacity-60">Controller</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center h-12 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
                } ${mounted && isCollapsed ? 'justify-center' : 'px-4'}`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-zinc-600'}`} />
                {mounted && !isCollapsed && (
                  <span className="ml-4 text-sm font-bold tracking-tight animate-in fade-in duration-500">{item.label}</span>
                )}
                
                {mounted && isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:block px-4 py-6 border-t border-zinc-800/50">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center h-12 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all group"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${mounted && isCollapsed ? 'rotate-180' : ''}`} />
            {mounted && !isCollapsed && <span className="ml-2 text-xs font-black uppercase tracking-widest">Minimize</span>}
          </button>
        </div>

        {/* Footer Info */}
        <div className="p-6 border-t border-zinc-800/50 bg-[#050508]/50">
          <div className={`flex items-center ${mounted && isCollapsed ? 'justify-center' : 'gap-4'}`}>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-zinc-600" />
            </div>
            {mounted && !isCollapsed && (
              <div className="animate-in fade-in duration-500">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">ESP32-S3 Core</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">v1.0.5 Stable</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
