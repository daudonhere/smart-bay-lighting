'use client';

import { useBookings } from '@/hooks/useBooking';
import { BookingCard } from './BookingCard';
import { BookingEventResponse } from '@/types/booking';

interface BookingWithBay extends BookingEventResponse {
  bayName: string;
  status?: 'active' | 'completed' | 'cancelled';
}

export function BookingList() {
  const { data: bookings = [], isLoading, error } = useBookings();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-slate-400"></div>
        <p className="text-slate-400 mt-4">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-400 font-semibold">Failed to load bookings</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-600/50 flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">No bookings yet</p>
        <p className="text-slate-500 text-sm mt-1">Create your first booking to get started</p>
      </div>
    );
  }

  const activeBookings = bookings.filter((b: BookingWithBay) => b.event === 'booking_started');
  const endedBookings = bookings.filter((b: BookingWithBay) => b.event === 'booking_ended');

  return (
    <div className="space-y-6">
      {activeBookings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <h3 className="text-lg font-bold text-slate-100">Active Bookings</h3>
            <span className="px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded-full text-xs font-bold">
              {activeBookings.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBookings.map((booking: BookingWithBay) => (
              <BookingCard
                key={booking.booking_id}
                id={booking.booking_id}
                bayName={booking.bay_id}
                customerName={booking.customer}
                startTime={booking.start_time}
                endTime={booking.end_time}
                status="active"
              />
            ))}
          </div>
        </div>
      )}

      {endedBookings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            <h3 className="text-lg font-bold text-slate-100">Past Bookings</h3>
            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs font-bold">
              {endedBookings.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endedBookings.map((booking: BookingWithBay) => (
              <BookingCard
                key={booking.booking_id}
                id={booking.booking_id}
                bayName={booking.bay_id}
                customerName={booking.customer}
                startTime={booking.start_time}
                endTime={booking.end_time}
                status="completed"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
