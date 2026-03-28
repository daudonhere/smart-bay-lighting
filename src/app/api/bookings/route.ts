import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateBookingDto } from '@/types/booking';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { bay: true },
      orderBy: { startTime: 'desc' },
    });

    const formattedBookings = bookings.map((booking) => ({
      event: 'booking_started',
      booking_id: booking.id,
      bay_id: booking.bay.name,
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

    if (!bayId || !customerName || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bay = await prisma.bay.findUnique({
      where: { id: bayId },
    });

    if (!bay) {
      return NextResponse.json(
        { error: 'Bay not found' },
        { status: 404 }
      );
    }

    if (!bay.isActive) {
      return NextResponse.json(
        { error: 'Bay is not active' },
        { status: 400 }
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
        { error: 'Time slot already booked' },
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
      include: { bay: true },
    });

    const eventResponse = {
      event: 'booking_started' as const,
      booking_id: booking.id,
      bay_id: booking.bay.name,
      customer: booking.customerName,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: eventResponse,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
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
