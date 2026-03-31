'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Clock, X } from 'lucide-react';

interface DateTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
}

export function DateTimePicker({ label, value, onChange, minDate }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDisplay = (val: string) => {
    if (!val) return 'Select date & time';
    const date = new Date(val);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-[0.2em] px-1">
          <CalendarIcon className="w-3 h-3" />
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-zinc-950 border rounded-2xl px-5 py-4 transition-all duration-300 ${
            isOpen ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className={`w-5 h-5 ${value ? 'text-blue-400' : 'text-zinc-600'}`} />
            <span className={`text-sm font-medium ${value ? 'text-white' : 'text-zinc-500'}`}>
              {formatDisplay(value)}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0a0a0f] border border-zinc-800 rounded-2xl shadow-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Choose Date & Time</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-600" />
                </button>
              </div>
              <input
                type="datetime-local"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  // Not closing on change to let user refine, but can be adjusted
                }}
                min={minDate ? minDate.toISOString().slice(0, 16) : undefined}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Set Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
