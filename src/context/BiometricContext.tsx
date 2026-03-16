"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

type ConnectionType = 'none' | 'manual' | 'simulated';

interface BiometricContextType {
  bpm: number | null;
  connectionType: ConnectionType;
  isConnected: boolean;
  disconnect: () => void;
  simulate: () => void;
  setBpmManual: (val: number) => void;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export function BiometricProvider({ children }: { children: React.ReactNode }) {
  const [bpm, setBpm] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType>('none');
  const simulationIntervalRef = useRef<any>(null);

  const isConnected = connectionType !== 'none';

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  const setBpmManual = (val: number) => {
    setConnectionType('manual');
    setBpm(val);
  };

  const disconnect = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setConnectionType('none');
    setBpm(null);
  };

  const simulate = () => {
    setConnectionType('simulated');
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = setInterval(() => {
      const newBpm = 70 + Math.floor(Math.random() * 15);
      setBpm(newBpm);
    }, 5000);
  };

  return (
    <BiometricContext.Provider value={{ 
      bpm, 
      connectionType, 
      isConnected,
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
