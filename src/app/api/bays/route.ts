import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Bay ID required' },
        { status: 400 }
      );
    }

    const updatedBay = await prisma.bay.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      data: updatedBay,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update bay' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const existingBay = await prisma.bay.findUnique({
        where: { id },
      });

      if (!existingBay) {
        return NextResponse.json(
          { success: false, error: 'Bay not found' },
          { status: 404 }
        );
      }

      await prisma.bay.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: `Bay '${existingBay.id}' deleted`,
        data: { deleted: true, id: existingBay.id },
      });
    } else {
      const count = await prisma.bay.count();
      await prisma.bay.deleteMany({});

      return NextResponse.json({
        success: true,
        message: `All ${count} bays deleted`,
        data: { deleted: true, count },
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete bays' },
      { status: 500 }
    );
  }
}
