import { NextResponse } from 'next/server';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

export async function GET() {
  try {
    const deviceInfo = await mqttBridgeService.requestDeviceInfo();

    if (!deviceInfo) {
      return NextResponse.json(
        { success: false, error: 'No response from ESP32. Device may be offline.' },
        { status: 504 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deviceInfo,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to get device info' },
      { status: 500 }
    );
  }
}
