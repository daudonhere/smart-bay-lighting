import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
