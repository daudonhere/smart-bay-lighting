import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

interface BookingEvent {
  event: 'booking_created' | 'booking_started' | 'booking_extended' | 'booking_ended';
  booking_id: string;
  bay_id: string;
  customer: string;
  start_time: string;
  end_time: string;
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const booking = await prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        );
      }

      const eventResponse: BookingEvent = {
        event: 'booking_ended',
        booking_id: booking.id,
        bay_id: booking.bayId,
        customer: booking.customerName,
        start_time: booking.startTime.toISOString(),
        end_time: booking.endTime.toISOString(),
      };

      await prisma.bay.update({
        where: { id: booking.bayId },
        data: {
          isActive: true,
        },
      });

      await prisma.booking.update({
        where: { id },
        data: {
          status: 'cancelled',
        },
      });

      await mqttBridgeService.publishBooking(eventResponse);

      return NextResponse.json({
        success: true,
        message: 'Booking cancelled',
        data: eventResponse,
      });
    } else {
      await prisma.booking.deleteMany({});

      return NextResponse.json({
        success: true,
        message: 'All bookings deleted',
        data: { deleted: true },
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete bookings' },
      { status: 500 }
    );
  }
}
