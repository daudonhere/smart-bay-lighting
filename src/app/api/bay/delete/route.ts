import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
