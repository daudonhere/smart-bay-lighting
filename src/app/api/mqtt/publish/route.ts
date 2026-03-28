import { NextRequest, NextResponse } from 'next/server';
import { mqttService } from '@/lib/mqtt/service';
import { BookingEvent } from '@/lib/mqtt/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, booking_id, bay_id, customer, start_time, end_time } = body;

    if (!event || !bay_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: event, bay_id' },
        { status: 400 }
      );
    }

    const mqttEvent: BookingEvent = {
      event,
      booking_id: booking_id || '',
      bay_id,
      customer: customer || '',
      start_time: start_time || new Date().toISOString(),
      end_time: end_time || '',
    };

    mqttService.publishBooking(mqttEvent);

    return NextResponse.json({
      success: true,
      message: 'Event published to MQTT',
      data: mqttEvent,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Failed to publish MQTT event' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      connected: mqttService.isConnected(),
      topics: {
        booking: 'smart-bay/booking',
        status: 'smart-bay/status',
        command: 'smart-bay/command',
      },
    },
  });
}
