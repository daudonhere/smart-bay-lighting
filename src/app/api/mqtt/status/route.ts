import { NextResponse } from 'next/server';
import { mqttService } from '@/lib/mqtt/service';
import { BayStatus } from '@/lib/mqtt/config';

let lastKnownStatus: BayStatus | null = null;

mqttService.connect();

mqttService.onStatusUpdate((status) => {
  lastKnownStatus = status;
});

export async function GET() {
  return NextResponse.json({
    success: true,
    data: lastKnownStatus || {
      success: true,
      timestamp: new Date().toISOString(),
      device_id: 'unknown',
      bays: [],
    },
    mqtt: {
      connected: mqttService.isConnected(),
    },
  });
}
