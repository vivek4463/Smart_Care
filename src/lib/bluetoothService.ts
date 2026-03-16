export interface HeartRateData {
  bpm: number;
  timestamp: number;
}

class BluetoothService {
  private device: any = null;
  private server: any = null;
  private characteristic: any = null;
  private listeners: ((data: HeartRateData) => void)[] = [];

  public async connect(): Promise<boolean> {
    try {
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });

      if (!this.device.gatt) return false;

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService('heart_rate');
      this.characteristic = await service.getCharacteristic('heart_rate_measurement');

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const bpm = this.parseHeartRate(value);
        const data = { bpm, timestamp: Date.now() };
        this.listeners.forEach(l => l(data));
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        console.log('Bluetooth device disconnected');
        this.device = null;
        this.server = null;
        this.characteristic = null;
      });

      return true;
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      return false;
    }
  }

  public disconnect() {
    if (this.server) {
      this.server.disconnect();
    }
  }

  public onHeartRate(callback: (data: HeartRateData) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private parseHeartRate(value: DataView): number {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    if (rate16Bits) {
      return value.getUint16(1, true);
    } else {
      return value.getUint8(1);
    }
  }
}

export const bluetoothService = new BluetoothService();
