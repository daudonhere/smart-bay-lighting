import { NextResponse } from 'next/server';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

export async function GET() {
  try {
    const deviceInfo = await mqttBridgeService.requestDeviceInfo();
    const isConnected = mqttBridgeService.isConnected();

    return NextResponse.json({
      success: true,
      data: deviceInfo,
      mqtt: {
        connected: isConnected,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device status' },
      { status: 500 }
    );
  }
}
