'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mqttService } from '@/lib/mqtt/service';
import { BookingEvent } from '@/lib/mqtt/config';

interface MqttContextType {
  connected: boolean;
  lastStatus: any | null;
  publishBooking: (event: BookingEvent) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export function MqttProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastStatus, setLastStatus] = useState<any | null>(null);

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

    return () => {
      unsubscribeStatus();
      unsubscribeBooking();
    };
  }, []);

  const publishBooking = (event: BookingEvent) => {
    mqttService.publishBooking(event);
  };

  return (
    <MqttContext.Provider value={{ connected, lastStatus, publishBooking }}>
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
