'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '@/stores/useBookingStore';

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'started':
      case 'extended':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'created':
        return 'bg-gradient-to-r from-zinc-500 to-zinc-600 text-white';
      case 'completed':
        return 'bg-slate-600 text-white';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
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
      <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md p-5 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-zinc-100 uppercase">{bayName}</h4>
              <p className="text-sm text-zinc-500">{customerName}</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusStyle()}`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-zinc-400">
              <span className="font-semibold">Start:</span> {formatTime(startTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-zinc-400">
              <span className="font-semibold">End:</span> {formatTime(endTime)}
            </span>
          </div>
        </div>

        {status === 'started' || status === 'extended' ? (
          <div className="flex gap-2">
            <button
              onClick={openExtendModal}
              disabled={updateMutation.isPending}
              className="flex-1 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-3 py-2 text-sm text-white font-semibold hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg shadow-yellow-500/25"
            >
              Extend
            </button>
            <button
              onClick={handleComplete}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 text-sm text-white font-semibold hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg shadow-green-500/25"
            >
              Complete
            </button>
            <button
              onClick={handleCancel}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3 py-2 text-sm text-white font-semibold hover:from-red-500 hover:to-rose-500 disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg shadow-red-500/25"
            >
              Cancel
            </button>
          </div>
        ) : status === 'created' ? (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3 py-2 text-sm text-white font-semibold hover:from-red-500 hover:to-rose-500 disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg shadow-red-500/25"
            >
              Cancel
            </button>
          </div>
        ) : null}
      </div>

      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Extend Booking</h3>
                  <p className="text-sm text-zinc-500">{bayName} - {customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowExtendModal(false)}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                  Current End Time
                </label>
                <div className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-300">
                  {formatTime(endTime)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                  New End Time
                </label>
                <input
                  type="datetime-local"
                  value={extendEndTime}
                  onChange={(e) => setExtendEndTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-900 outline-none transition-all"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Default: +1 hour from current end time
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-300 font-semibold hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExtend}
                  disabled={updateMutation.isPending || !extendEndTime}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-lg shadow-yellow-500/25"
                >
                  {updateMutation.isPending ? 'Extending...' : 'Confirm Extend'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
