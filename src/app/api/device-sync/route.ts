import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    for (const bay of bays) {
      const existingBay = await prisma.bay.findUnique({
        where: { name: bay.bay_id },
      });

      if (existingBay) {
        await prisma.bay.update({
          where: { id: existingBay.id },
          data: {
            isActive: true,
          },
        });
        updatedBays.push(bay.bay_id);
      } else {
        await prisma.bay.create({
          data: {
            name: bay.bay_id,
            isActive: true,
          },
        });
        createdBays.push(bay.bay_id);
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
  } catch (err: any) {
    console.error('[Device Sync] Failed:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to sync device info' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bays = await prisma.bay.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: bays,
      count: bays.length,
    });
  } catch (err: any) {
    console.error('[Device Sync] GET failed:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch bays' },
      { status: 500 }
    );
  }
}
