import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

export const dynamic = 'force-dynamic';

interface DeviceInfo {
  device_id: string;
  device_type: string;
  firmware_version: string;
  bays: Array<{
    bay_id: string;
    relay_pin: number;
    name: string;
  }>;
}

export async function PUT(request: NextRequest) {
  try {
    const body: DeviceInfo = await request.json();
    const { device_id, device_type, firmware_version, bays } = body;

    if (!bays || !Array.isArray(bays)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bays array' },
        { status: 400 }
      );
    }

    const updatedBays: string[] = [];
    const createdBays: string[] = [];

    const existingBays = await prisma.bay.findMany({
      orderBy: { id: 'asc' },
    });

    for (let i = 0; i < bays.length; i++) {
      const bay = bays[i];
      const bayId = bay.bay_id;

      const existingBay = existingBays.find((b) => b.id === bayId);

      if (existingBay) {
        await prisma.bay.update({
          where: { id: bayId },
          data: {
            relayPin: bay.relay_pin,
            isActive: true,
          },
        });
        updatedBays.push(bayId);
      } else {
        await prisma.bay.create({
          data: {
            id: bayId,
            relayPin: bay.relay_pin,
            isActive: true,
          },
        });
        createdBays.push(bayId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Device info synced',
      data: {
        device_id,
        device_type,
        firmware_version,
        updated: updatedBays.length,
        created: createdBays.length,
        bays: [...updatedBays, ...createdBays],
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to sync device info' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const deviceInfo = await mqttBridgeService.requestDeviceInfo();
    
    if (deviceInfo) {
    } else {
    }

    const bays = await prisma.bay.findMany({
      orderBy: { id: 'asc' },
    });

    const now = new Date();

    const formattedBays = await Promise.all(
      bays.map(async (bay) => {
        const activeBooking = await prisma.booking.findFirst({
          where: {
            bayId: bay.id,
            status: { in: ['started', 'extended'] },
            startTime: { lte: now },
            endTime: { gt: now },
          },
        });

        return {
          id: bay.id,
          relayPin: bay.relayPin,
          isActive: bay.isActive,
          hasActiveBooking: !!activeBooking,
          currentBooking: activeBooking
            ? {
                id: activeBooking.id,
                customerName: activeBooking.customerName,
                endTime: activeBooking.endTime.toISOString(),
              }
            : null,
          createdAt: bay.createdAt,
          updatedAt: bay.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedBays,
      count: formattedBays.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bays' },
      { status: 500 }
    );
  }
}
