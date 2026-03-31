'use client';

import { LayoutGrid, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

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
      <div className="text-center py-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
        <p className="text-zinc-500 font-medium">No bays available</p>
        <p className="text-zinc-600 text-sm mt-1">Connect ESP32 to discover bays</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {bays.map((bay) => {
        const isSelected = selectedBay === bay.id;
        const isActive = bay.isActive;

        return (
          <button
            key={bay.id}
            onClick={() => onSelect(bay.id)}
            className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
              isSelected
                ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/20'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            {/* Background Glow for Active Bay */}
            {isActive && !isSelected && (
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full pointer-events-none"></div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl transition-colors duration-300 ${
                isSelected ? 'bg-blue-500 shadow-lg shadow-blue-500/40' : 'bg-zinc-800 group-hover:bg-zinc-700'
              }`}>
                <LayoutGrid className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
              </div>
              
              {isActive ? (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Live</span>
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700"></div>
              )}
            </div>

            <div className="space-y-1">
              <h4 className={`text-lg font-black uppercase tracking-tighter transition-colors ${
                isSelected ? 'text-white' : 'text-zinc-400'
              }`}>
                {bay.id}
              </h4>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                Field Slot
              </p>
            </div>

            {isSelected && (
              <div className="absolute bottom-4 right-4 animate-in zoom-in duration-300">
                <div className="bg-blue-500 rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
