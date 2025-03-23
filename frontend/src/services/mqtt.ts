import mqtt from 'mqtt';

const MQTT_OPTIONS = {
  protocol: 'wss',
  host: 'Replace your MQTT URL',
  port: 8884,
  username: 'qwerty',
  password: 'Test@1234',
};

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private static instance: MQTTService;
  private messageHandlers: Map<string, (topic: string, message: Buffer) => void> = new Map();

  private constructor() {}

  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `${MQTT_OPTIONS.protocol}://${MQTT_OPTIONS.host}:${MQTT_OPTIONS.port}/mqtt`;
        this.client = mqtt.connect(url, {
          username: MQTT_OPTIONS.username,
          password: MQTT_OPTIONS.password,
          clean: true,
          connectTimeout: 4000,
          reconnectPeriod: 1000,
        });

        this.client.on('connect', () => {
          console.log('Connected to MQTT broker');
          resolve();
        });

        this.client.on('message', (topic, message) => {
          const handler = this.messageHandlers.get(topic);
          if (handler) {
            handler(topic, message);
          }
        });

        this.client.on('error', (err) => {
          console.error('MQTT connection error:', err);
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public subscribe(topic: string, handler: (topic: string, message: Buffer) => void): void {
    if (!this.client) {
      throw new Error('MQTT client not connected');
    }
    this.client.subscribe(topic);
    this.messageHandlers.set(topic, handler);
  }

  public publish(topic: string, message: string): void {
    if (!this.client) {
      throw new Error('MQTT client not connected');
    }
    this.client.publish(topic, message);
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.messageHandlers.clear();
    }
  }
}

export default MQTTService;