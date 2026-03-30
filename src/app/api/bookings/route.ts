import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateBookingDto } from '@/types/booking';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

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

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingDto = await request.json();
    const { bayId, customerName, startTime, endTime } = body;

    if (!bayId || !customerName || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bayIdPattern = /^bay-\d{2}$/;
    if (!bayIdPattern.test(bayId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bay_id format. Use format: bay-01, bay-02, etc' },
        { status: 400 }
      );
    }

    const bay = await prisma.bay.findUnique({
      where: { id: bayId },
    });

    if (!bay) {
      return NextResponse.json(
        { success: false, error: 'Bay not found' },
        { status: 404 }
      );
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        bayId,
        status: { in: ['created', 'started', 'extended'] },
        OR: [
          {
            startTime: { lte: new Date(startTime) },
            endTime: { gt: new Date(startTime) },
          },
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gte: new Date(endTime) },
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Time slot already booked' },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        bayId,
        customerName,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'created',
      },
    });

    const now = new Date().getTime();
    const bookingStartTime = new Date(startTime).getTime();
    const thirtySeconds = 30 * 1000;

    const eventResponse: BookingEvent = {
      event: 'booking_created',
      booking_id: booking.id,
      bay_id: bayId,
      customer: booking.customerName,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
    };

    if (bookingStartTime - now <= thirtySeconds) {
      await prisma.bay.update({
        where: { id: bayId },
        data: {
          isActive: true,
        },
      });
      await mqttBridgeService.publishBooking({
        ...eventResponse,
        event: 'booking_started',
      });
    } else {
      await mqttBridgeService.publishBooking(eventResponse);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created. Lamp will turn on 30 seconds before start time.',
      data: eventResponse,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
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
