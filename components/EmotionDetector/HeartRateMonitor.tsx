'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Bluetooth, AlertCircle } from 'lucide-react';

interface HeartRateMonitorProps {
    onComplete: (heartRate?: number) => void;
}

export default function HeartRateMonitor({ onComplete }: HeartRateMonitorProps) {
    const [heartRate, setHeartRate] = useState<number | null>(null);
    const [showManual, setShowManual] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [bluetoothSupported, setBluetoothSupported] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if Web Bluetooth is supported
        if (!navigator.bluetooth) {
            setBluetoothSupported(false);
        }
    }, []);

    const connectToWatch = async () => {
        if (!navigator.bluetooth) {
            setError('Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.');
            setShowManual(true);
            return;
        }

        try {
            setIsConnecting(true);
            setConnectionStatus('connecting');
            setError(null);

            // Request Bluetooth device with Heart Rate service
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service']
            });

            const server = await device.gatt?.connect();
            if (!server) throw new Error('Failed to connect to device');

            setConnectionStatus('connected');

            // Get Heart Rate service
            const service = await server.getPrimaryService('heart_rate');
            const characteristic = await service.getCharacteristic('heart_rate_measurement');

            // Start listening to heart rate notifications
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
                const value = event.target.value;
                const hr = value.getUint8(1); // Heart rate is in the second byte
                setHeartRate(hr);
            });

            setIsConnecting(false);

            // Auto-complete after 3 seconds of stable reading
            setTimeout(() => {
                if (heartRate) {
                    onComplete(heartRate);
                }
            }, 3000);

        } catch (err: any) {
            console.error('Bluetooth connection error:', err);
            setIsConnecting(false);
            setConnectionStatus('disconnected');

            if (err.name === 'NotFoundError') {
                setError('No heart rate device found. Make sure your smartwatch is nearby and in pairing mode.');
            } else if (err.name === 'NotAllowedError') {
                setError('Bluetooth permission denied. Please allow access to connect your device.');
            } else {
                setError('Failed to connect. You can enter your heart rate manually instead.');
            }

            setShowManual(true);
        }
    };

    const handleSkip = () => {
        onComplete(undefined);
    };

    const handleManualSubmit = () => {
        const hr = parseInt(manualInput);
        if (hr && hr > 0 && hr < 250) {
            setHeartRate(hr);
            setTimeout(() => {
                onComplete(hr);
            }, 1500);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Heart Rate Monitoring</h2>
                        <p className="text-white/60">Optional: Connect your smartwatch or enter manually</p>
                    </div>
                </div>

                <div className="text-center py-8">
                    {!heartRate && !showManual && connectionStatus === 'disconnected' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center border-2 border-orange-500/30">
                                <Bluetooth className="w-16 h-16 text-orange-400" />
                            </div>

                            <h3 className="text-2xl font-semibold text-white mb-4">
                                Connect Your Smartwatch
                            </h3>
                            <p className="text-white/70 mb-8 max-w-md mx-auto">
                                Connect your Bluetooth-enabled smartwatch or fitness tracker for real-time heart rate monitoring.
                            </p>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-w-md mx-auto">
                                    <div className="flex items-center gap-2 text-red-400 mb-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-semibold">Connection Error</span>
                                    </div>
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {bluetoothSupported && (
                                    <motion.button
                                        onClick={connectToWatch}
                                        disabled={isConnecting}
                                        className="btn-primary w-full max-w-sm mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Bluetooth className="w-5 h-5 inline mr-2" />
                                        {isConnecting ? 'Connecting...' : 'Connect via Bluetooth'}
                                    </motion.button>
                                )}

                                <motion.button
                                    onClick={() => setShowManual(true)}
                                    className="btn-secondary w-full max-w-sm mx-auto"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Enter Heart Rate Manually
                                </motion.button>

                                <button
                                    onClick={handleSkip}
                                    className="text-white/60 hover:text-white/90 transition-colors text-sm underline"
                                >
                                    Skip this step
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {connectionStatus === 'connected' && !heartRate && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border-2 border-green-500/30">
                                <Activity className="w-16 h-16 text-green-400 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">Connected!</h3>
                            <p className="text-white/60">Reading heart rate from your device...</p>
                        </motion.div>
                    )}

                    {showManual && !heartRate && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="max-w-sm mx-auto">
                                <label className="block text-white/80 font-medium mb-3 text-left">
                                    Current Heart Rate (BPM)
                                </label>
                                <input
                                    type="number"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    placeholder="e.g., 72"
                                    min="40"
                                    max="200"
                                    className="input-field mb-4 text-center text-2xl"
                                />

                                <motion.button
                                    onClick={handleManualSubmit}
                                    disabled={!manualInput}
                                    className="btn-primary w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={manualInput ? { scale: 1.02 } : {}}
                                    whileTap={manualInput ? { scale: 0.98 } : {}}
                                >
                                    Submit
                                </motion.button>

                                {!bluetoothSupported && (
                                    <button
                                        onClick={handleSkip}
                                        className="text-white/60 hover:text-white/90 transition-colors text-sm"
                                    >
                                        Skip
                                    </button>
                                )}

                                {bluetoothSupported && (
                                    <button
                                        onClick={() => setShowManual(false)}
                                        className="text-white/60 hover:text-white/90 transition-colors text-sm"
                                    >
                                        Back
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {heartRate && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <CheckCircle className="w-16 h-16 text-white" />
                            </div>

                            <h3 className="text-2xl font-semibold text-white mb-2">Heart Rate Recorded</h3>
                            <div className="text-6xl font-bold text-gradient-sunset mb-2">{heartRate}</div>
                            <p className="text-white/60">BPM</p>

                            {connectionStatus === 'connected' && (
                                <p className="text-green-400 text-sm mt-4">
                                    <Bluetooth className="w-4 h-4 inline mr-1" />
                                    Connected to device
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="glass-card p-6">
                <p className="text-white/70 text-sm">
                    <span className="font-semibold text-orange-400">Note:</span> Heart rate monitoring is
                    optional but can provide additional context for your emotional state and help personalize
                    your therapeutic music. A typical resting heart rate ranges from 60-100 BPM.
                </p>
                {!bluetoothSupported && (
                    <p className="text-yellow-400 text-sm mt-3">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Web Bluetooth is not supported in this browser. Manual entry is available.
                    </p>
                )}
            </div>
        </div>
    );
}
