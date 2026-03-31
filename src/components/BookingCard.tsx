'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '@/stores/useBookingStore';
import { 
  Clock, 
  User, 
  Calendar, 
  X, 
  Timer, 
  ChevronRight,
  Loader2
} from 'lucide-react';

interface BookingCardProps {
  id: string;
  bayName: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: 'created' | 'started' | 'extended' | 'completed' | 'cancelled';
}

export function BookingCard({
  id,
  bayName,
  customerName,
  startTime,
  endTime,
  status,
}: BookingCardProps) {
  const queryClient = useQueryClient();
  const updateBooking = useBookingStore((state) => state.updateBooking);
  const deleteBooking = useBookingStore((state) => state.deleteBooking);
  
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendEndTime, setExtendEndTime] = useState('');

  const updateMutation = useMutation({
    mutationFn: async (newEndTime: string) => {
      return updateBooking(id, { endTime: newEndTime });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setShowExtendModal(false);
      setExtendEndTime('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return deleteBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'started':
      case 'extended':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'created':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  const handleExtend = () => {
    if (!extendEndTime) return;
    updateMutation.mutate(extendEndTime);
  };

  const handleComplete = () => {
    if (confirm('Mark this booking as completed?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      deleteMutation.mutate(id);
    }
  };

  const openExtendModal = () => {
    const currentEnd = new Date(endTime);
    const defaultExtend = new Date(currentEnd.getTime() + 3600000);
    setExtendEndTime(defaultExtend.toISOString().slice(0, 16));
    setShowExtendModal(true);
  };

  return (
    <>
      <div className="group relative rounded-3xl border border-zinc-800 bg-[#0a0a0f] p-6 shadow-xl hover:border-zinc-700 transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-blue-500/30 transition-colors">
              <User className="w-6 h-6 text-zinc-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white uppercase tracking-tighter">{bayName}</h4>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{customerName}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle()}`}>
            {status}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800/50 rounded-2xl">
            <Calendar className="w-4 h-4 text-emerald-500/50" />
            <div>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Start Time</p>
              <p className="text-xs font-bold text-zinc-300">{formatTime(startTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800/50 rounded-2xl">
            <Clock className="w-4 h-4 text-rose-500/50" />
            <div>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">End Time</p>
              <p className="text-xs font-bold text-zinc-300">{formatTime(endTime)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {status === 'started' || status === 'extended' ? (
            <>
              <button
                onClick={openExtendModal}
                disabled={updateMutation.isPending}
                className="flex-1 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all"
              >
                Extend
              </button>
              <button
                onClick={handleComplete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-600/5"
              >
                Finish
              </button>
            </>
          ) : status === 'created' ? (
            <button
              onClick={handleCancel}
              disabled={deleteMutation.isPending}
              className="w-full py-3.5 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
            >
              Cancel Reservation
            </button>
          ) : null}
        </div>
      </div>

      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0f] border border-zinc-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Extend Session</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Update expiration time</p>
                </div>
              </div>
              <button
                onClick={() => setShowExtendModal(false)}
                className="p-2 rounded-xl hover:bg-zinc-900 text-zinc-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Current Expiry</label>
                <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-zinc-400 font-bold text-sm">
                  {formatTime(endTime)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">New Expiry Time</label>
                <input
                  type="datetime-local"
                  value={extendEndTime}
                  onChange={(e) => setExtendEndTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono [color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-zinc-800 text-zinc-500 font-black text-xs uppercase tracking-widest hover:bg-zinc-900 transition-all"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleExtend}
                  disabled={updateMutation.isPending || !extendEndTime}
                  className="flex-[2] py-4 rounded-2xl bg-amber-600 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
