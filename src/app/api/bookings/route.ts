import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateBookingDto } from '@/types/booking';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { startTime: 'desc' },
    });

    const formattedBookings = bookings.map((booking) => ({
      event: 'booking_started',
      booking_id: booking.id,
      bay_id: booking.bayId,
      customer: booking.customerName,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
    }));

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

    const VALID_BAYS = ['bay-01', 'bay-02', 'bay-03'];

    if (!bayId || !customerName || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!VALID_BAYS.includes(bayId)) {
      return NextResponse.json(
        { success: false, error: 'Bay not found' },
        { status: 404 }
      );
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        bayId,
        status: 'active',
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
        status: 'active',
      },
    });

    const eventResponse = {
      event: 'booking_started' as const,
      booking_id: booking.id,
      bay_id: bayId,
      customer: booking.customerName,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
    };

    // Publish to MQTT (non-blocking, don't fail request if MQTT fails)
    mqttBridgeService.publishBooking(eventResponse)
      .then(() => console.log('[Booking] Published to MQTT'))
      .catch((err) => console.error('[Booking] MQTT publish failed:', err.message));

    return NextResponse.json({
      success: true,
      data: eventResponse,
    }, { status: 201 });
  } catch (err: any) {
    console.error('[Booking] Create failed:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.booking.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'All bookings deleted',
      data: { deleted: true },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete all bookings' },
      { status: 500 }
    );
  }
}
