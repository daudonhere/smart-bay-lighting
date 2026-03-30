import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateBookingDto } from '@/types/booking';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

interface BookingEvent {
  event: 'booking_extended';
  booking_id: string;
  bay_id: string;
  customer: string;
  start_time: string;
  end_time: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateBookingDto & { id: string } = await request.json();
    const { id, endTime } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'started' && booking.status !== 'extended') {
      return NextResponse.json(
        { success: false, error: 'Can only extend active bookings' },
        { status: 400 }
      );
    }

    const now = new Date().getTime();
    const currentEndTime = new Date(booking.endTime).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (currentEndTime - now < fiveMinutes) {
      return NextResponse.json(
        { success: false, error: 'Cannot extend: less than 5 minutes before end time' },
        { status: 400 }
      );
    }

    const newEndTime = endTime ? new Date(endTime) : new Date(currentEndTime + 3600000);

    const eventResponse: BookingEvent = {
      event: 'booking_extended',
      booking_id: booking.id,
      bay_id: booking.bayId,
      customer: booking.customerName,
      start_time: booking.startTime.toISOString(),
      end_time: newEndTime.toISOString(),
    };

    await prisma.booking.update({
      where: { id },
      data: {
        endTime: newEndTime,
        status: 'extended',
      },
    });

    await prisma.bay.update({
      where: { id: booking.bayId },
      data: {
        isActive: false,
      },
    });

    await mqttBridgeService.publishBooking(eventResponse);

    return NextResponse.json({
      success: true,
      message: 'Booking extended',
      data: eventResponse,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to extend booking' },
      { status: 500 }
    );
  }
}
