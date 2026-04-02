'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '@/stores/useBookingStore';
import { 
  Clock, 
  User, 
  Calendar, 
  Timer, 
  Check,
  Loader2,
  ChevronLeft,
  ArrowRight,
  History
} from 'lucide-react';

interface BookingCardProps {
  id: string;
  bayName: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: string;
}

export function BookingCard({
  id,
  bayName,
  customerName,
  startTime,
  endTime,
  status: rawStatus,
}: BookingCardProps) {
  const queryClient = useQueryClient();
  const updateBooking = useBookingStore((state) => state.updateBooking);
  const deleteBooking = useBookingStore((state) => state.deleteBooking);
  const getBookings = useBookingStore((state) => state.getBookings);
  
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendStep, setExtendStep] = useState<'hour' | 'minute'>('hour');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const status = rawStatus?.toLowerCase() || 'created';

  const { data: bookingsResponse } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      return getBookings() as Promise<{ data: any[] }>;
    },
    staleTime: 0,
  });

  const existingBookings = bookingsResponse?.data || [];

  useEffect(() => {
    const refreshData = () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    };

    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (status === 'created') {
      const delay = (start - now) - 25000;
      if (delay > 0) {
        const timer = setTimeout(refreshData, delay + 30000);
        return () => clearTimeout(timer);
      }
    }

    if (status === 'started' || status === 'extended') {
      const delay = (end - now) + 35000;
      if (delay > 0) {
        const timer = setTimeout(refreshData, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [startTime, endTime, status, queryClient]);

  const updateMutation = useMutation({
    mutationFn: async (newEndTime: string) => {
      return updateBooking(id, { endTime: newEndTime });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bays'] });
      setShowExtendModal(false);
      setSelectedHour(null);
      setSelectedMinute(null);
      setExtendStep('hour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return deleteBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    },
  });

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | ${h}:${m}`;
    } catch {
      return '--:--';
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'started':
      case 'extended':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]';
      case 'created':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ended':
      case 'completed':
      case 'finished':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const displayStatus = status === 'ended' ? 'finished' : status;

  const canExtend = () => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;
    return now < (end - fiveMinutesInMs);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const isTimeBooked = (hour: number, minute: number) => {
    const baseDate = new Date(endTime);
    const targetTime = new Date(baseDate);
    targetTime.setHours(hour, minute, 0, 0);

    return existingBookings.some(b => {
      if (b.bay_id.toLowerCase() !== bayName.toLowerCase() || b.booking_id === id || b.status?.toLowerCase() === 'cancelled') return false;
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      const targetMs = targetTime.getTime();
      return (targetMs >= bStart && targetMs < bEnd);
    });
  };

  const isHourFullyBooked = (hour: number) => {
    return minutes.every(m => isTimeBooked(hour, m));
  };

  const handleExtend = () => {
    if (selectedHour === null || selectedMinute === null) return;
    const baseDate = new Date(endTime);
    const newEnd = new Date(baseDate);
    newEnd.setHours(selectedHour, selectedMinute, 0, 0);
    updateMutation.mutate(newEnd.toISOString());
  };

  const handleDiscard = () => {
    setShowExtendModal(false);
    setSelectedHour(null);
    setSelectedMinute(null);
    setExtendStep('hour');
  };

  const isSessionActive = status === 'created' || status === 'started' || status === 'extended';

  const extendModalContent = showExtendModal && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0a0a0f] border border-zinc-800 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 flex flex-col">
        <div className="p-8 border-b border-zinc-800/50 bg-zinc-900/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {extendStep !== 'hour' && (
              <button 
                type="button"
                onClick={() => setExtendStep('hour')}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <History className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {extendStep === 'hour' ? 'Choose Hour' : 'Choose Minute'}
                </h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Extending session for {bayName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 h-[400px] overflow-y-auto custom-scrollbar">
          {extendStep === 'hour' && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {hours.map((h) => {
                const fullyBooked = isHourFullyBooked(h);
                const isBefore = h < new Date(endTime).getHours();
                const disabled = fullyBooked || isBefore;
                return (
                  <button
                    key={h}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedHour(h)}
                    className={`py-5 rounded-2xl border-2 text-sm font-black transition-all ${
                      selectedHour === h
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

          {extendStep === 'minute' && (
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {minutes.map((m) => {
                const booked = isTimeBooked(selectedHour!, m);
                const isBefore = selectedHour === new Date(endTime).getHours() && m <= new Date(endTime).getMinutes();
                const disabled = booked || isBefore;

                return (
                  <button
                    key={m}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedMinute(m)}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all ${
                      selectedMinute === m
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
            Discard
          </button>

          <div className="flex gap-3">
            {extendStep === 'hour' ? (
              <button
                type="button"
                onClick={() => setExtendStep('minute')}
                disabled={selectedHour === null}
                className="px-8 py-4 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                Next Step
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExtend}
                disabled={selectedMinute === null || updateMutation.isPending}
                className="px-8 py-4 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-3 h-3" />}
                Confirm Extension
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`group relative rounded-[2rem] border transition-all duration-500 overflow-hidden ${
        status === 'started' || status === 'extended' 
          ? 'bg-blue-600/5 border-blue-500/30 shadow-2xl shadow-blue-500/10' 
          : 'bg-[#0a0a0f] border-zinc-800/50 hover:border-zinc-700 shadow-xl'
      }`}>
        <div className="p-7 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                status === 'started' || status === 'extended' ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-zinc-900 border border-zinc-800'
              }`}>
                <User className={`w-6 h-6 ${status === 'started' || status === 'extended' ? 'text-white' : 'text-zinc-600'}`} />
              </div>
              <div>
                <h4 className="text-base font-black text-white uppercase tracking-tighter">{bayName}</h4>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{customerName}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${getStatusStyle()}`}>
              {displayStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800/50 rounded-2xl group-hover:border-zinc-700 transition-colors">
              <Calendar className="w-5 h-5 text-emerald-500/40" />
              <div>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Start Time</p>
                <p className="text-xs font-bold text-zinc-300">{formatTime(startTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800/50 rounded-2xl group-hover:border-zinc-700 transition-colors">
              <Clock className="w-5 h-5 text-rose-500/40" />
              <div>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">End Time</p>
                <p className="text-xs font-bold text-zinc-300">{formatTime(endTime)}</p>
              </div>
            </div>
          </div>

          {isSessionActive && (
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => setShowExtendModal(true)}
                disabled={!canExtend() || updateMutation.isPending}
                className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  !canExtend() 
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-700 cursor-not-allowed opacity-20'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95'
                }`}
              >
                <Timer className="w-4 h-4" />
                Extend Session
              </button>
              
              {status === 'created' && (
                <button
                  onClick={() => deleteMutation.mutate(id)}
                  disabled={deleteMutation.isPending}
                  className="w-full py-4 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                >
                  Cancel Reservation
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {mounted && createPortal(extendModalContent, document.body)}
    </>
  );
}
