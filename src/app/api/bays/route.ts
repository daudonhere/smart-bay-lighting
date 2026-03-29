import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.error('[Bays API] GET failed:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch bays' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Delete single bay by ID
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
        message: `Bay '${existingBay.name}' deleted`,
        data: { deleted: true, id, name: existingBay.name },
      });
    } else {
      // Delete all bays
      const count = await prisma.bay.count();
      await prisma.bay.deleteMany({});

      return NextResponse.json({
        success: true,
        message: `All ${count} bays deleted`,
        data: { deleted: true, count },
      });
    }
  } catch (err: any) {
    console.error('[Bays API] DELETE failed:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete bays' },
      { status: 500 }
    );
  }
}
