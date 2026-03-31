'use client';

import { useState, useEffect } from 'react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function Topbar({ title, subtitle, rightElement }: TopbarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <header className="h-20 flex-shrink-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between px-4 sm:px-8 z-30" />
    );
  }

  return (
    <header className="h-20 flex-shrink-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between px-4 sm:px-8 z-30">
      <div className="flex items-center gap-4">
        <div className="flex flex-col lg:ml-0 ml-12 sm:ml-14">
          <h2 className="text-xl font-bold text-white tracking-tight leading-none">{title}</h2>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-wide uppercase mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {rightElement}
      </div>
    </header>
  );
}
