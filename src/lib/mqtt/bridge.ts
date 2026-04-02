import mqtt, { MqttClient } from 'mqtt';
import { prisma } from '@/lib/prisma';

const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const MQTT_CLIENT_ID = `smart-bay-bridge-${Math.random().toString(16).slice(3)}`;

interface DeviceInfo {
  device_id: string;
  device_type: string;
  firmware_version: string;
  bays: Array<{
    bay_id: string;
    relay_pin: number;
    name: string;
    active: boolean;
  }>;
}

class MqttBridgeService {
  private client: MqttClient | null = null;
  private connected: boolean = false;
  private connectPromise: Promise<void> | null = null;
  private deviceInfoResolve: ((data: DeviceInfo | null) => void) | null = null;

  async connect(): Promise<void> {
    if (this.connected && this.client?.connected) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(MQTT_BROKER, {
          clientId: MQTT_CLIENT_ID,
          reconnectPeriod: 2000,
          connectTimeout: 5000,
          clean: true,
        });

        this.client.on('connect', async () => {
          this.connected = true;
          
          try {
            await this.subscribe();
            this.connectPromise = null;
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        this.client.on('message', (topic, message) => {
          const msgStr = message.toString();
          
          if (topic === 'smart-bay/info') {
            this.handleDeviceInfo(msgStr);
          }
        });

        this.client.on('error', (err) => {
          this.connected = false;
          this.connectPromise = null;
          reject(err);
        });

        this.client.on('close', () => {
          this.connected = false;
          this.connectPromise = null;
        });
      } catch (err) {
        this.connectPromise = null;
        reject(err);
      }
    });

    return this.connectPromise;
  }

  private subscribe(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) return reject(new Error('No client'));
      
      this.client.subscribe('smart-bay/#', { qos: 0 }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async handleDeviceInfo(message: string) {
    try {
      const data: DeviceInfo = JSON.parse(message);
      
      if (data.bays && Array.isArray(data.bays)) {
        for (const bay of data.bays) {
          try {
            await prisma.bay.update({
              where: { id: bay.bay_id },
              data: { 
                isActive: bay.active,
                relayPin: bay.relay_pin 
              }
            });
          } catch {
          }
        }
      }

      if (this.deviceInfoResolve) {
        const resolve = this.deviceInfoResolve;
        this.deviceInfoResolve = null;
        resolve(data);
      }
    } catch {
    }
  }

  async requestDeviceInfo(): Promise<DeviceInfo | null> {
    try {
      await this.connect();
    } catch {
      return null;
    }

    return new Promise((resolve) => {
      this.deviceInfoResolve = resolve;
      const command = { command: 'device_info_request' };
      
      this.client?.publish('smart-bay/command', JSON.stringify(command), { qos: 0 });

      setTimeout(() => {
        if (this.deviceInfoResolve === resolve) {
          this.deviceInfoResolve = null;
          resolve(null);
        }
      }, 10000);
    });
  }

  async publishBooking(event: any): Promise<void> {
    await this.connect();
    this.client?.publish('smart-bay/booking', JSON.stringify(event), { qos: 0 });
  }

  async publishCommand(command: any): Promise<void> {
    await this.connect();
    this.client?.publish('smart-bay/command', JSON.stringify(command), { qos: 0 });
  }

  isConnected(): boolean {
    return this.connected && (this.client?.connected || false);
  }
}

export const mqttBridgeService = new MqttBridgeService();
