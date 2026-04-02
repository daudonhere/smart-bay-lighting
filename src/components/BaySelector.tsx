'use client';

import { LayoutGrid, AlertCircle, CheckCircle2, Zap, Lightbulb } from 'lucide-react';

interface Bay {
  id: string;
  isActive: boolean;
}

interface BaySelectorProps {
  bays: Bay[];
  selectedBay: string;
  onSelect: (id: string) => void;
}

export function BaySelector({ bays, selectedBay, onSelect }: BaySelectorProps) {
  if (bays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-zinc-900/10 border-2 border-dashed border-zinc-800/50 rounded-[2.5rem]">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
          <AlertCircle className="w-10 h-10 text-zinc-700" />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold text-zinc-400">No Bays Detected</p>
          <p className="text-sm text-zinc-600 max-w-xs mx-auto font-medium">Connect your ESP32 controller to discover available slots.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {bays.map((bay) => {
        const isSelected = selectedBay === bay.id;
        const isActive = bay.isActive;

        return (
          <button
            key={bay.id}
            onClick={() => onSelect(bay.id)}
            className={`relative group p-7 rounded-[2rem] border-2 transition-all duration-500 text-left overflow-hidden ${
              isSelected
                ? 'border-blue-500 bg-blue-600/10 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-[1.02]'
                : 'border-zinc-800/80 bg-[#050508] hover:border-zinc-600 hover:bg-zinc-900/30'
            }`}
          >
            {/* Animated Glow for Selected State */}
            {isSelected && (
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-xl opacity-50 animate-pulse pointer-events-none"></div>
            )}

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl transition-all duration-500 transform group-hover:scale-110 ${
                  isSelected ? 'bg-blue-500 shadow-lg shadow-blue-500/40' : 'bg-zinc-900 border border-zinc-800'
                }`}>
                  <LayoutGrid className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
                </div>
                
                {isActive ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-40 animate-pulse"></div>
                    <div className="relative p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700 mt-2 mr-1"></div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className={`text-xl font-black uppercase tracking-tight transition-colors ${
                  isSelected ? 'text-white' : 'text-zinc-400'
                }`}>
                  {bay.id}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-zinc-700'}`}></span>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                    isSelected ? 'text-blue-400/70' : 'text-zinc-600'
                  }`}>
                    Area Segment
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute bottom-0 right-0 animate-in slide-in-from-right-4 duration-500">
                  <div className="bg-blue-500 rounded-full p-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
