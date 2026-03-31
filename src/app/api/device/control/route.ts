import { NextRequest, NextResponse } from 'next/server';
import { mqttBridgeService } from '@/lib/mqtt/bridge';
import { prisma } from '@/lib/prisma';

interface CommandRequest {
  command: 'turn_on' | 'turn_off' | 'reset_error' | 'status_request';
  bay_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CommandRequest = await request.json();
    const { command, bay_id } = body;

    const VALID_COMMANDS = ['turn_on', 'turn_off', 'reset_error', 'status_request'];

    if (!command || !VALID_COMMANDS.includes(command)) {
      return NextResponse.json(
        { success: false, error: 'Invalid command' },
        { status: 400 }
      );
    }

    if (command === 'status_request') {
      await mqttBridgeService.publishCommand({ command });
      return NextResponse.json({
        success: true,
        message: 'Status request sent',
        data: { command },
      });
    }

    if (!bay_id) {
      return NextResponse.json(
        { success: false, error: 'bay_id required for this command' },
        { status: 400 }
      );
    }

    const bay = await prisma.bay.findUnique({
      where: { id: bay_id },
    });

    if (!bay) {
      return NextResponse.json(
        { success: false, error: 'Bay not found' },
        { status: 404 }
      );
    }

    if (command === 'turn_on') {
      await prisma.bay.update({
        where: { id: bay_id },
        data: { isActive: true },
      });
    } else if (command === 'turn_off') {
      await prisma.bay.update({
        where: { id: bay_id },
        data: { isActive: false },
      });
    } else if (command === 'reset_error') {
      await prisma.bay.update({
        where: { id: bay_id },
        data: { isActive: false },
      });
    }

    await mqttBridgeService.publishCommand({ command, bay_id });

    return NextResponse.json({
      success: true,
      message: `Command '${command}' sent to ${bay_id}`,
      data: { command, bay_id },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to send command' },
      { status: 500 }
    );
  }
}
