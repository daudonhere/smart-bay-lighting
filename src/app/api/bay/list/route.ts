import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
