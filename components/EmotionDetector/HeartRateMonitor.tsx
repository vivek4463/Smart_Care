'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle } from 'lucide-react';

interface HeartRateMonitorProps {
    onComplete: (heartRate?: number) => void;
}

export default function HeartRateMonitor({ onComplete }: HeartRateMonitorProps) {
    const [heartRate, setHeartRate] = useState<number | null>(null);
    const [showManual, setShowManual] = useState(false);
    const [manualInput, setManualInput] = useState('');

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
                        <p className="text-white/60">Optional: Provide your current heart rate</p>
                    </div>
                </div>

                <div className="text-center py-8">
                    {!heartRate && !showManual && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center border-2 border-orange-500/30">
                                <Activity className="w-16 h-16 text-orange-400" />
                            </div>

                            <h3 className="text-2xl font-semibold text-white mb-4">
                                Connect Your Smartwatch
                            </h3>
                            <p className="text-white/70 mb-8 max-w-md mx-auto">
                                If you're wearing a smartwatch or fitness tracker, you can manually enter your
                                current heart rate for a more comprehensive analysis.
                            </p>

                            <div className="space-y-3">
                                <motion.button
                                    onClick={() => setShowManual(true)}
                                    className="btn-primary w-full max-w-sm mx-auto"
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

                                <button
                                    onClick={() => setShowManual(false)}
                                    className="text-white/60 hover:text-white/90 transition-colors text-sm"
                                >
                                    Back
                                </button>
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
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="glass-card p-6">
                <p className="text-white/70 text-sm">
                    <span className="font-semibold text-orange-400">Note:</span> Heart rate monitoring is
                    optional but can provide additional context for your emotional state. A typical resting
                    heart rate ranges from 60-100 BPM.
                </p>
            </div>
        </div>
    );
}
