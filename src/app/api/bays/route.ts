import { NextResponse } from 'next/server';
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
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bays' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const customBays: string[] = body.bays || [];
    
    const baysToCreate = customBays.length > 0 ? customBays : [
      'bay-01', 'bay-02', 'bay-03', 'bay-04', 
      'bay-05', 'bay-06', 'bay-07', 'bay-08'
    ];

    const existing = await prisma.bay.findMany({
      select: { name: true },
    });

    const existingNames = new Set(existing.map((b) => b.name));

    const newBays = baysToCreate.filter((name) => !existingNames.has(name));

    if (newBays.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Bays already exist',
        data: { 
          created: 0, 
          bays: baysToCreate,
          skipped: baysToCreate.filter((name) => existingNames.has(name)),
        },
      });
    }

    const bays = await prisma.bay.createMany({
      data: newBays.map((name) => ({ name })),
    });

    const skipped = baysToCreate.filter((name) => existingNames.has(name));

    return NextResponse.json({
      success: true,
      data: {
        created: bays.count,
        bays: newBays,
        ...(skipped.length > 0 && { skipped, message: 'Some bays already existed' }),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create bays' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.bay.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'All bays deleted',
      data: { deleted: true },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete all bays' },
      { status: 500 }
    );
  }
}
