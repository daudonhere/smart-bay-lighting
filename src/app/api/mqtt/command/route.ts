import { NextRequest, NextResponse } from 'next/server';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

interface CommandRequest {
  command: 'turn_on' | 'turn_off' | 'reset_error';
  bay_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CommandRequest = await request.json();
    const { command, bay_id } = body;

    const VALID_BAYS = ['bay-01', 'bay-02', 'bay-03'];
    const VALID_COMMANDS = ['turn_on', 'turn_off', 'reset_error'];

    if (!bay_id || !VALID_BAYS.includes(bay_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bay_id. Must be bay-01, bay-02, or bay-03' },
        { status: 400 }
      );
    }

    if (!command || !VALID_COMMANDS.includes(command)) {
      return NextResponse.json(
        { success: false, error: 'Invalid command. Must be turn_on, turn_off, or reset_error' },
        { status: 400 }
      );
    }

    await mqttBridgeService.publishCommand({ command, bay_id });

    return NextResponse.json({
      success: true,
      message: `Command '${command}' sent to ${bay_id}`,
      data: { command, bay_id },
    });
  } catch (err: any) {
    console.error('[MQTT Command] Failed:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to send command' },
      { status: 500 }
    );
  }
}
