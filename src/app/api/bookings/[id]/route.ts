import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateBookingDto } from '@/types/booking';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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

      const eventResponse = {
        event: 'booking_started' as const,
        booking_id: booking.id,
        bay_id: booking.bayId,
        customer: booking.customerName,
        start_time: booking.startTime.toISOString(),
        end_time: booking.endTime.toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: eventResponse,
      });
    }

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

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateBookingDto & { id: string } = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID required' },
        { status: 400 }
      );
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id },
      data,
    });

    let event: 'booking_started' | 'booking_ended' | 'booking_extended' = 'booking_started';
    if (data.status === 'completed' || data.status === 'cancelled') {
      event = 'booking_ended';
    } else if (data.endTime && data.endTime !== existing.endTime.toISOString()) {
      event = 'booking_extended';
    }

    const eventResponse = {
      event,
      booking_id: booking.id,
      bay_id: booking.bayId,
      customer: booking.customerName,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
    };

    mqttBridgeService.publishBooking(eventResponse).catch(console.error);

    return NextResponse.json({
      success: true,
      data: eventResponse,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

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

    await prisma.booking.delete({
      where: { id },
    });

    const eventResponse = {
      event: 'booking_ended' as const,
      booking_id: booking.id,
      bay_id: booking.bayId,
      customer: booking.customerName,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
    };

    mqttBridgeService.publishBooking(eventResponse).catch(console.error);

    return NextResponse.json({
      success: true,
      data: eventResponse,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
