import { NextResponse } from 'next/server';

const DEFAULT_BAYS = [
  { id: 'bay-01', name: 'bay-01', isActive: true, relayPin: 4 },
  { id: 'bay-02', name: 'bay-02', isActive: true, relayPin: 5 },
  { id: 'bay-03', name: 'bay-03', isActive: true, relayPin: 6 },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: DEFAULT_BAYS,
      count: DEFAULT_BAYS.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bays' },
      { status: 500 }
    );
  }
}
