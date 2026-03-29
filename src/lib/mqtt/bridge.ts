import mqtt, { MqttClient } from 'mqtt';

const MQTT_BROKER = 'mqtt://broker.emqx.io:1883';
const MQTT_CLIENT_ID = `smart-bay-server-${process.pid}`;

class MqttBridgeService {
  private client: MqttClient | null = null;
  private connected: boolean = false;
  private connectPromise: Promise<void> | null = null;

  async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(MQTT_BROKER, {
          clientId: MQTT_CLIENT_ID,
          reconnectPeriod: 1000,
          connectTimeout: 5000,
        });

        this.client.on('connect', () => {
          console.log('[MQTT Bridge] Connected to broker');
          this.connected = true;
          this.subscribe();
          resolve();
        });

        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message.toString());
        });

        this.client.on('error', (err) => {
          console.error('[MQTT Bridge] Error:', err.message);
          this.connected = false;
          reject(err);
        });

        this.client.on('close', () => {
          console.log('[MQTT Bridge] Disconnected');
          this.connected = false;
        });
      } catch (err) {
        reject(err);
      }
    });

    return this.connectPromise;
  }

  private subscribe() {
    if (!this.client) return;

    this.client.subscribe('smart-bay/device-info', (err) => {
      if (!err) {
        console.log('[MQTT Bridge] Subscribed to smart-bay/device-info');
      }
    });
  }

  private async handleMessage(topic: string, message: string) {
    if (topic === 'smart-bay/device-info') {
      try {
        const data = JSON.parse(message);
        console.log('[MQTT Bridge] Received device info:', data);

        await fetch('http://localhost:3000/api/device-sync', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        console.log('[MQTT Bridge] Device info synced to database');
      } catch (err) {
        console.error('[MQTT Bridge] Failed to process device info:', err);
      }
    }
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
      console.log('[MQTT Bridge] Publishing to smart-bay/booking:', message);

      this.client.publish('smart-bay/booking', message, { qos: 1 }, (err) => {
        if (err) {
          console.error('[MQTT Bridge] Publish error:', err);
          reject(err);
        } else {
          console.log('[MQTT Bridge] Published successfully');
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
    await this.connect();

    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

      const message = JSON.stringify(command);
      console.log('[MQTT Bridge] Publishing to smart-bay/command:', message);

      this.client.publish('smart-bay/command', message, { qos: 1 }, (err) => {
        if (err) {
          console.error('[MQTT Bridge] Publish error:', err);
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
