export const MQTT_CONFIG = {
  brokerUrl: process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'ws://broker.emqx.io:8083/mqtt',
  clientId: `smart-bay-${Math.random().toString(16).slice(3)}`,
  topics: {
    booking: 'smart-bay/booking',
    status: 'smart-bay/status',
    command: 'smart-bay/command',
  },
};

export interface RelayStatus {
  bay_id: string;
  relay_pin: number;
  active: boolean;
  lamps: {
    lamp_1: boolean;
    lamp_2: boolean;
  };
  end_time: string | null;
}

export interface BayStatus {
  success: true;
  timestamp: string;
  device_id: string;
  bays: RelayStatus[];
}

export interface BookingEvent {
  event: 'booking_started' | 'booking_ended' | 'booking_extended';
  booking_id: string;
  bay_id: string;
  customer: string;
  start_time: string;
  end_time: string;
}

export interface MqttCommand {
  command: 'turn_on' | 'turn_off' | 'status_request';
  bay_id?: string;
  booking_id?: string;
}
