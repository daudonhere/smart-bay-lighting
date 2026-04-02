'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ArrowRight, Check } from 'lucide-react';

interface BookingInfo {
  bay_id: string;
  start_time: string;
  end_time: string;
  status?: string;
}

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  selectedBayId: string;
  existingBookings: BookingInfo[];
  type?: 'start' | 'end';
  startTimeValue?: string;
}

export function DateTimePicker({ 
  label, 
  value, 
  onChange, 
  selectedBayId, 
  existingBookings,
  type = 'start',
  startTimeValue
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'date' | 'hour' | 'minute'>('date');
  const [mounted, setMounted] = useState(false);
  
  const [tempDate, setTempDate] = useState<Date>(value ? new Date(value) : new Date());
  const [tempHour, setTempHour] = useState<number | null>(value ? new Date(value).getHours() : null);
  const [tempMinute, setTempMinute] = useState<number | null>(value ? new Date(value).getMinutes() : null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const dates = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      d.setHours(0, 0, 0, 0);
      arr.push(d);
    }
    return arr;
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const isMinuteBooked = (date: Date, hour: number, minute: number) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);

    return existingBookings.some(b => {
      if (b.bay_id.toLowerCase() !== selectedBayId.toLowerCase() || b.status?.toLowerCase() === 'cancelled') return false;
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      const targetTime = slotTime.getTime();
      return (targetTime >= bStart && targetTime < bEnd);
    });
  };

  const isHourFullyBooked = (date: Date, hour: number) => {
    return minutes.every(m => isMinuteBooked(date, hour, m));
  };

  const isDayFullyBooked = (date: Date) => {
    return hours.every(h => isHourFullyBooked(date, h));
  };

  const isPast = (date: Date, hour: number, minute: number = 0) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    return slotTime.getTime() < new Date().getTime();
  };

  const isValidRange = (date: Date, hour: number, minute: number = 0) => {
    if (type === 'end' && startTimeValue) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);
      return slotTime.getTime() > new Date(startTimeValue).getTime();
    }
    return true;
  };

  const handleDone = () => {
    if (tempHour === null || tempMinute === null) return;
    const finalDate = new Date(tempDate);
    finalDate.setHours(tempHour, tempMinute, 0, 0);
    onChange(finalDate.toISOString());
    setIsOpen(false);
  };

  const handleDiscard = () => {
    const current = value ? new Date(value) : new Date();
    setTempDate(current);
    setTempHour(value ? current.getHours() : null);
    setTempMinute(value ? current.getMinutes() : null);
    setIsOpen(false);
    setStep('date');
  };

  const formatDisplay = (val: string) => {
    if (!val) return `Select ${label}`;
    const date = new Date(val);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | ${h}:${m}`;
  };

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0a0a0f] border border-zinc-800 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 flex flex-col">
        <div className="p-8 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/20">
          <div className="flex items-center gap-4">
            {step !== 'date' && (
              <button 
                type="button"
                onClick={() => setStep(step === 'minute' ? 'hour' : 'date')}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {step === 'date' ? 'Step 1: Date' : step === 'hour' ? 'Step 2: Hour' : 'Step 3: Minute'}
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                {step === 'date' ? 'Select reservation date' : step === 'hour' ? 'Select 24H time slot' : 'Select exact starting minute'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 h-[450px] overflow-y-auto custom-scrollbar">
          {step === 'date' && (
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3">
              {dates.map((d) => {
                const fullyBooked = isDayFullyBooked(d);
                const isSelected = tempDate.toDateString() === d.toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    disabled={fullyBooked}
                    onClick={() => setTempDate(d)}
                    className={`py-3 sm:py-4 rounded-xl border-2 flex flex-col items-center gap-0.5 sm:gap-1 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        : fullyBooked
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed opacity-20'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:bg-zinc-900'
                    }`}
                  >
                    <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-60">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-sm sm:text-base font-black">{d.getDate()}</span>
                    <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tighter">
                      {d.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 'hour' && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
              {hours.map((h) => {
                const fullyBooked = isHourFullyBooked(tempDate, h);
                const past = isPast(tempDate, h, 59);
                const disabled = fullyBooked || past;
                return (
                  <button
                    key={h}
                    type="button"
                    disabled={disabled}
                    onClick={() => setTempHour(h)}
                    className={`py-4 sm:py-5 rounded-xl border-2 text-xs sm:text-sm font-black transition-all ${
                      tempHour === h
                        ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        : disabled
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed opacity-20'
                          : 'border-zinc-800 bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-blue-500/50'
                    }`}
                  >
                    {h.toString().padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          )}

          {step === 'minute' && (
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 sm:gap-2">
              {minutes.map((m) => {
                const booked = isMinuteBooked(tempDate, tempHour!, m);
                const past = isPast(tempDate, tempHour!, m);
                const invalid = !isValidRange(tempDate, tempHour!, m);
                const disabled = booked || past || invalid;

                return (
                  <button
                    key={m}
                    type="button"
                    disabled={disabled}
                    onClick={() => setTempMinute(m)}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all ${
                      tempMinute === m
                        ? 'border-emerald-500 bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : disabled
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed opacity-20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400'
                    }`}
                  >
                    {m.toString().padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-8 bg-zinc-900/30 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
          <button 
            type="button"
            onClick={handleDiscard}
            className="px-6 py-4 rounded-xl border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all"
          >
            Discard Selection
          </button>

          <div className="flex gap-3">
            {step !== 'minute' ? (
              <button
                type="button"
                onClick={() => setStep(step === 'date' ? 'hour' : 'minute')}
                disabled={(step === 'date' && tempDate === null) || (step === 'hour' && tempHour === null)}
                className="px-8 py-4 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2"
              >
                Next Step
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDone}
                disabled={tempMinute === null}
                className="px-8 py-4 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2"
              >
                Confirm & Done
                <Check className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">
        <Clock className="w-3 h-3" />
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setStep('date');
        }}
        className={`w-full flex items-center justify-between bg-zinc-950 border-2 rounded-2xl px-6 py-5 transition-all duration-300 ${
          value ? 'border-blue-500/30 bg-blue-500/5' : 'border-zinc-800'
        }`}
      >
        <span className={`text-sm font-bold ${value ? 'text-white' : 'text-zinc-600'}`}>
          {formatDisplay(value)}
        </span>
        <CalendarIcon className="w-4 h-4 text-zinc-500" />
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </div>
  );
}
