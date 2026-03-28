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

export async function POST() {
  try {
    const defaultBays = ['bay-01', 'bay-02', 'bay-03', 'bay-04', 'bay-05', 'bay-06', 'bay-07', 'bay-08'];

    const existing = await prisma.bay.findMany({
      select: { name: true },
    });

    const existingNames = new Set(existing.map((b) => b.name));

    const baysToCreate = defaultBays.filter((name) => !existingNames.has(name));

    if (baysToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Bays already exist',
        data: { created: 0, bays: existing.map((b) => b.name) },
      });
    }

    const bays = await prisma.bay.createMany({
      data: baysToCreate.map((name) => ({ name })),
    });

    return NextResponse.json({
      success: true,
      data: {
        created: bays.count,
        bays: baysToCreate,
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
