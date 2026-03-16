"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

type ConnectionType = 'none' | 'bluetooth' | 'simulated';

interface BiometricContextType {
  bpm: number | null;
  connectionType: ConnectionType;
  isSearching: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  simulate: () => void;
  setBpmManual: (val: number) => void;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export function BiometricProvider({ children }: { children: React.ReactNode }) {
  const [bpm, setBpm] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType>('none');
  const [isSearching, setIsSearching] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const simulationIntervalRef = useRef<any>(null);

  const isConnected = connectionType !== 'none';

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      if (device && device.gatt?.connected) device.gatt.disconnect();
    };
  }, [device]);

  const setBpmManual = (val: number) => {
    setBpm(val);
  };

  const disconnect = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
    }
    setConnectionType('none');
    setBpm(null);
    setDevice(null);
  };

  const simulate = () => {
    setConnectionType('simulated');
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = setInterval(() => {
      const newBpm = 70 + Math.floor(Math.random() * 15);
      setBpm(newBpm);
    }, 5000);
  };

  const connect = async () => {
    setIsSearching(true);
    try {
      // @ts-ignore
      const bleDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate']
      });

      console.log(`Paired with device: ${bleDevice.name || 'Unknown'}`);
      const server = await bleDevice.gatt.connect();
      console.log('GATT Server connected.');

      let service;
      try {
        service = await server.getPrimaryService('heart_rate');
      } catch (e) {
        console.warn("Standard heart_rate service not found. Logging available services...");
        const services = await server.getPrimaryServices();
        services.forEach((s: any) => console.log(`Discovered service: ${s.uuid}`));
        throw new Error("No compatible standard heart rate service found on this device.");
      }

      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      setConnectionType('bluetooth');
      setDevice(bleDevice);
      setIsSearching(false);

      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const heartRate = value.getUint8(1);
        setBpm(heartRate);
      });

      bleDevice.addEventListener('gattserverdisconnected', () => {
        setConnectionType('none');
        setBpm(null);
        setDevice(null);
      });
    } catch (error: any) {
      console.error('Bluetooth Sync Error:', error);
      setIsSearching(false);
      throw error;
    }
  };

  return (
    <BiometricContext.Provider value={{ 
      bpm, 
      connectionType, 
      isSearching, 
      isConnected,
      connect, 
      disconnect, 
      simulate,
      setBpmManual
    }}>
      {children}
    </BiometricContext.Provider>
  );
}

export function useBiometrics() {
  const context = useContext(BiometricContext);
  if (context === undefined) {
    throw new Error('useBiometrics must be used within a BiometricProvider');
  }
  return context;
}
