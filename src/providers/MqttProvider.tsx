'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { mqttService } from '@/lib/mqtt/service';
import { BookingEvent, BayStatus } from '@/lib/mqtt/config';
import { DEVICE_API } from '@/app/api';

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
  const [lastUpdateTime, setLastUpdateTime] = useState('');

  const { data: deviceInfoResponse } = useQuery({
    queryKey: ['device-info'],
    queryFn: async () => {
      const response = await axios.get(DEVICE_API.INFO);
      return response.data;
    },
    refetchInterval: 10000,
  });

  const deviceInfo = deviceInfoResponse?.data || null;

  useEffect(() => {
    mqttService.connect();

    const unsubscribeConnection = mqttService.onConnectionChange((isConnected) => {
      setConnected(isConnected);
      if (isConnected) {
        setLastUpdateTime(new Date().toLocaleTimeString());
      }
    });

    const unsubscribeStatus = mqttService.onStatusUpdate((status) => {
      setLastStatus(status);
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    });

    const unsubscribeBooking = mqttService.onBookingEvent(() => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    });

    const unsubscribeDeviceInfo = mqttService.onDeviceInfo(() => {
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    });

    return () => {
      unsubscribeConnection();
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
