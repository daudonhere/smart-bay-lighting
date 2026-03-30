'use client';

import { useState, useRef, useEffect } from 'react';

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
}

export function DateTimePicker({ label, value, onChange, minDate }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    const timeValue = value ? value.slice(11, 16) : '00:00';
    onChange(`${dateValue}T${timeValue}`);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    const dateValue = value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
    onChange(`${dateValue}T${timeValue}`);
  };

  const getMinDateTime = () => {
    const min = minDate || new Date();
    return min.toISOString().slice(0, 16);
  };

  const formatDisplayValue = () => {
    if (!value) return 'Select date & time';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <div className="relative">
        <label className="block text-sm font-semibold text-zinc-400 mb-2">{label}</label>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-left text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 outline-none transition-all hover:border-zinc-600"
        >
          <div className="flex items-center justify-between">
            <span>{formatDisplayValue()}</span>
            <svg className={`w-5 h-5 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-[110] w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Date</label>
                <input
                  type="date"
                  value={value ? value.slice(0, 10) : ''}
                  onChange={handleDateChange}
                  min={getMinDateTime().slice(0, 10)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Time</label>
                <input
                  type="time"
                  value={value ? value.slice(11, 16) : ''}
                  onChange={handleTimeChange}
                  min={value && value.slice(0, 10) === new Date().toISOString().slice(0, 10) ? new Date().toTimeString().slice(0, 5) : undefined}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
