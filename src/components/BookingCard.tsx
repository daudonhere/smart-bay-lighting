'use client';

import { useUpdateBooking, useDeleteBooking } from '@/hooks/useBooking';
import { Booking } from '@/types/booking';

interface BookingCardProps extends Booking {
  bayName: string;
}

export function BookingCard({
  id,
  bayName,
  customerName,
  startTime,
  endTime,
  status,
}: BookingCardProps) {
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'completed':
        return 'bg-slate-600 text-white';
      case 'cancelled':
        return 'bg-gradient-to-r from-blue-500 to-red-500 text-white';
    }
  };

  const handleExtend = () => {
    const newEnd = new Date(endTime);
    newEnd.setHours(newEnd.getHours() + 1);
    updateBooking.mutate({
      id,
      data: { endTime: newEnd.toISOString() },
    });
  };

  const handleComplete = () => {
    updateBooking.mutate({ id, data: { status: 'completed' } });
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      deleteBooking.mutate(id);
    }
  };

  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md p-5 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-blue-500/20">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-zinc-100">{bayName}</h4>
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

      {status === 'active' && (
        <div className="flex gap-2">
          <button
            onClick={handleExtend}
            disabled={updateBooking.isPending}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm text-white font-semibold hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            Extend 1h
          </button>
          <button
            onClick={handleComplete}
            disabled={updateBooking.isPending}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-sm text-white font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            Complete
          </button>
          <button
            onClick={handleCancel}
            disabled={deleteBooking.isPending}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-4 py-2 text-sm text-white font-semibold hover:from-blue-500 hover:to-red-500 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
