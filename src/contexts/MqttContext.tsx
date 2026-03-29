'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mqttService } from '@/lib/mqtt/service';
import { BookingEvent } from '@/lib/mqtt/config';

interface DeviceInfo {
  device_id: string;
  device_type: string;
  firmware_version: string;
  bays: Array<{
    bay_id: string;
    relay_pin: number;
    name: string;
  }>;
}

interface MqttContextType {
  connected: boolean;
  lastStatus: any | null;
  deviceInfo: DeviceInfo | null;
  publishBooking: (event: BookingEvent) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export function MqttProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastStatus, setLastStatus] = useState<any | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    mqttService.connect();

    const unsubscribeStatus = mqttService.onStatusUpdate((status) => {
      setLastStatus(status);
      setConnected(true);
      console.log('MQTT Status Update:', status);
    });

    const unsubscribeBooking = mqttService.onBookingEvent(() => {
      setConnected(true);
    });

    const unsubscribeDeviceInfo = mqttService.onDeviceInfo((info) => {
      setDeviceInfo(info);
      setConnected(true);
      console.log('MQTT Device Info:', info);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeBooking();
      unsubscribeDeviceInfo();
    };
  }, []);

  const publishBooking = (event: BookingEvent) => {
    mqttService.publishBooking(event);
  };

  return (
    <MqttContext.Provider value={{ connected, lastStatus, deviceInfo, publishBooking }}>
      {children}
    </MqttContext.Provider>
  );
}

export function useMqtt() {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error('useMqtt must be used within MqttProvider');
  }
  return context;
}
