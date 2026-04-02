import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface BookingEvent {
  event: 'booking_created' | 'booking_started' | 'booking_extended' | 'booking_ended';
  booking_id: string;
  bay_id: string;
  customer: string;
  start_time: string;
  end_time: string;
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          not: 'cancelled',
        },
      },
      orderBy: { startTime: 'desc' },
    });

    const formattedBookings = bookings.map((booking) => {
      let event: BookingEvent['event'] = 'booking_created';
      if (booking.status === 'started') event = 'booking_started';
      else if (booking.status === 'extended') event = 'booking_extended';
      else if (booking.status === 'ended') event = 'booking_ended';

      return {
        event,
        booking_id: booking.id,
        bay_id: booking.bayId,
        customer: booking.customerName,
        start_time: booking.startTime.toISOString(),
        end_time: booking.endTime.toISOString(),
        status: booking.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedBookings,
      count: formattedBookings.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
