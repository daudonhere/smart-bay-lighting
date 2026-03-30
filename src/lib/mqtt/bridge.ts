import mqtt, { MqttClient } from 'mqtt';

const MQTT_BROKER = 'mqtt://broker.emqx.io:1883';
const MQTT_CLIENT_ID = `smart-bay-server-${process.pid}`;

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

class MqttBridgeService {
  private client: MqttClient | null = null;
  private connected: boolean = false;
  private connectPromise: Promise<void> | null = null;
  private deviceInfoPromise: Promise<DeviceInfo> | null = null;
  private deviceInfoResolve: ((data: DeviceInfo) => void) | null = null;
  private deviceInfoTimeout: NodeJS.Timeout | null = null;

  async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(MQTT_BROKER, {
          clientId: MQTT_CLIENT_ID,
          reconnectPeriod: 1000,
          connectTimeout: 5000,
          clean: true,
        });

        this.client.on('connect', () => {
          this.connected = true;
          this.subscribe();
          resolve();
        });

        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message.toString());
        });

        this.client.on('error', () => {
          this.connected = false;
          this.connectPromise = null;
          reject(new Error('MQTT connection error'));
        });

        this.client.on('close', () => {
          this.connected = false;
        });

        this.client.on('offline', () => {
          this.connected = false;
        });
      } catch {
        this.connectPromise = null;
        reject(new Error('MQTT connection failed'));
      }
    });

    return this.connectPromise;
  }

  private subscribe() {
    if (!this.client) return;

    this.client.subscribe('smart-bay/device-info', () => {
    });
  }

  private async handleMessage(topic: string, message: string) {
    if (topic === 'smart-bay/device-info') {
      try {
        const data = JSON.parse(message);

        if (this.deviceInfoResolve) {
          this.deviceInfoResolve(data);
          this.deviceInfoResolve = null;
          if (this.deviceInfoTimeout) {
            clearTimeout(this.deviceInfoTimeout);
            this.deviceInfoTimeout = null;
          }
        }

        await fetch('http://localhost:3000/api/sync', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch {
      }
    }
  }

  async requestDeviceInfo(): Promise<DeviceInfo | null> {
    await this.connect();

    return new Promise((resolve, reject) => {
      this.deviceInfoResolve = resolve;

      const command = { command: 'device_info_request' };
      const message = JSON.stringify(command);

      this.client?.publish('smart-bay/command', message, { qos: 1 }, (err) => {
        if (err) {
          this.deviceInfoResolve = null;
          reject(err);
        }
      });

      this.deviceInfoTimeout = setTimeout(() => {
        this.deviceInfoResolve = null;
        resolve(null);
      }, 5000);
    });
  }

  async publishBooking(event: {
    event: string;
    booking_id: string;
    bay_id: string;
    customer?: string;
    start_time?: string;
    end_time?: string;
  }): Promise<void> {
    await this.connect();

    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

      const message = JSON.stringify(event);

      this.client.publish('smart-bay/booking', message, { qos: 1 }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async publishCommand(command: {
    command: string;
    bay_id?: string;
    booking_id?: string;
  }): Promise<void> {
    try {
      await this.connect();
    } catch {
      throw new Error('MQTT broker connection failed. Please try again.');
    }

    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

      const message = JSON.stringify(command);

      const timeout = setTimeout(() => {
        reject(new Error('MQTT publish timeout. Please try again.'));
      }, 5000);

      this.client.publish('smart-bay/command', message, { qos: 1 }, (err) => {
        clearTimeout(timeout);
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const mqttBridgeService = new MqttBridgeService();
