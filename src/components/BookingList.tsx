'use client';

import { useQuery } from '@tanstack/react-query';
import { useBookingStore } from '@/stores/useBookingStore';
import { BookingCard } from './BookingCard';
import { BookingEventResponse } from '@/types/booking';
import { Loader2, AlertCircle, ClipboardList, Info } from 'lucide-react';

interface BookingWithBay extends BookingEventResponse {
  bayName?: string;
  status?: 'created' | 'started' | 'extended' | 'completed' | 'cancelled';
}

export function BookingList() {
  const getBookings = useBookingStore((state) => state.getBookings);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      return getBookings() as Promise<{ data: BookingEventResponse[] }>;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const bookings = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Synchronizing Schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-rose-500/5 border border-rose-500/20 rounded-3xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <div>
          <p className="text-sm font-black text-rose-400 uppercase tracking-widest">Connection Error</p>
          <p className="text-xs text-rose-500/60 font-medium">Failed to retrieve booking data</p>
        </div>
      </div>
    );
  }

  // Menampilkan hanya booking yang aktif atau akan datang
  const displayableBookings = bookings.filter((b: BookingWithBay) => 
    b.status === 'started' || 
    b.status === 'extended' || 
    b.status === 'created'
  );

  if (displayableBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <ClipboardList className="w-10 h-10 text-zinc-700" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-bold text-zinc-400">No Active Sessions</p>
          <p className="text-sm text-zinc-600 max-w-xs mx-auto">Schedules will appear here once a booking is confirmed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Schedules</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-zinc-400">
          <Info className="w-3 h-3" />
          {displayableBookings.length} TOTAL
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayableBookings.map((booking: BookingWithBay) => (
          <BookingCard
            key={booking.booking_id}
            id={booking.booking_id}
            bayName={booking.bay_id.toUpperCase()}
            customerName={booking.customer}
            startTime={booking.start_time} // Kirim RAW ISO string
            endTime={booking.end_time}     // Kirim RAW ISO string
            status={booking.status || 'created'}
          />
        ))}
      </div>
    </div>
  );
}
