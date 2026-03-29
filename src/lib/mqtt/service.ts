import mqtt, { MqttClient } from 'mqtt';
import { MQTT_CONFIG, BookingEvent, BayStatus, MqttCommand } from './config';

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

class MqttService {
  private client: MqttClient | null = null;
  private statusListeners: ((status: BayStatus) => void)[] = [];
  private bookingListeners: ((event: BookingEvent) => void)[] = [];
  private deviceInfoListeners: ((info: DeviceInfo) => void)[] = [];
  private connected: boolean = false;

  connect() {
    if (this.client) return;

    try {
      this.client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
        clientId: MQTT_CONFIG.clientId,
        reconnectPeriod: 1000,
        connectTimeout: 5000,
      });

      this.client.on('connect', () => {
        console.log('MQTT Connected');
        this.connected = true;
        this.subscribe();
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message.toString());
      });

      this.client.on('error', (err) => {
        console.error('MQTT Error:', err);
        this.connected = false;
      });

      this.client.on('close', () => {
        console.log('MQTT Disconnected');
        this.connected = false;
      });
    } catch (err) {
      console.error('MQTT Connection failed:', err);
    }
  }

  private subscribe() {
    if (!this.client) return;

    this.client.subscribe(MQTT_CONFIG.topics.status, (err) => {
      if (!err) console.log('Subscribed to status topic');
    });

    this.client.subscribe(MQTT_CONFIG.topics.booking, (err) => {
      if (!err) console.log('Subscribed to booking topic');
    });

    this.client.subscribe('smart-bay/device-info', (err) => {
      if (!err) console.log('Subscribed to device-info topic');
    });
  }

  private handleMessage(topic: string, message: string) {
    try {
      const data = JSON.parse(message);

      if (topic === MQTT_CONFIG.topics.status) {
        this.statusListeners.forEach((cb) => cb(data));
      } else if (topic === MQTT_CONFIG.topics.booking) {
        this.bookingListeners.forEach((cb) => cb(data));
      } else if (topic === 'smart-bay/device-info') {
        this.deviceInfoListeners.forEach((cb) => cb(data));
      }
    } catch (err) {
      console.error('Failed to parse MQTT message:', err);
    }
  }

  publishStatus(status: BayStatus) {
    this.publish(MQTT_CONFIG.topics.status, status);
  }

  publishBooking(event: BookingEvent) {
    this.publish(MQTT_CONFIG.topics.booking, event);
  }

  sendCommand(command: MqttCommand) {
    this.publish(MQTT_CONFIG.topics.command, command);
  }

  private publish(topic: string, data: unknown) {
    if (!this.client || !this.connected) {
      console.warn('MQTT not connected, cannot publish');
      return;
    }

    this.client.publish(topic, JSON.stringify(data), { qos: 1 }, (err) => {
      if (err) console.error('MQTT Publish error:', err);
    });
  }

  onStatusUpdate(callback: (status: BayStatus) => void) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  onBookingEvent(callback: (event: BookingEvent) => void) {
    this.bookingListeners.push(callback);
    return () => {
      this.bookingListeners = this.bookingListeners.filter((cb) => cb !== callback);
    };
  }

  onDeviceInfo(callback: (info: DeviceInfo) => void) {
    this.deviceInfoListeners.push(callback);
    return () => {
      this.deviceInfoListeners = this.deviceInfoListeners.filter((cb) => cb !== callback);
    };
  }

  isConnected() {
    return this.connected;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.connected = false;
    }
  }
}

export const mqttService = new MqttService();
