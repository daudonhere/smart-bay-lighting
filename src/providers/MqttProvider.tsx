'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mqttService } from '@/lib/mqtt/service';
import { BookingEvent, BayStatus } from '@/lib/mqtt/config';

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
  lastStatus: BayStatus | null;
  deviceInfo: DeviceInfo | null;
  lastUpdateTime: string;
  publishBooking: (event: BookingEvent) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export function MqttProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [lastStatus, setLastStatus] = useState<BayStatus | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState('');

  useEffect(() => {
    mqttService.connect();

    const unsubscribeStatus = mqttService.onStatusUpdate((status) => {
      setLastStatus(status);
      setConnected(true);
      setLastUpdateTime(new Date().toLocaleTimeString());
      
      // Auto-invalidate queries when device sends status update
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    });

    const unsubscribeBooking = mqttService.onBookingEvent(() => {
      setConnected(true);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    });

    const unsubscribeDeviceInfo = mqttService.onDeviceInfo((info) => {
      setDeviceInfo(info);
      setConnected(true);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeBooking();
      unsubscribeDeviceInfo();
    };
  }, [queryClient]);

  const publishBooking = (event: BookingEvent) => {
    mqttService.publishBooking(event);
  };

  return (
    <MqttContext.Provider value={{ connected, lastStatus, deviceInfo, lastUpdateTime, publishBooking }}>
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
