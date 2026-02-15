'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Check, Loader, Info } from 'lucide-react';
import { calibrateFaceBaseline, calibrateVoiceBaseline, saveBaselineToStorage, CalibrationStatus } from '@/lib/baselineCalibration';
import { BaselineData } from '@/lib/types/userProfile';

interface BaselineCalibrationProps {
    userId: string;
    onComplete: (baseline: BaselineData) => void;
}

export default function BaselineCalibration({ userId, onComplete }: BaselineCalibrationProps) {
    const [stage, setStage] = useState<'intro' | 'face' | 'voice' | 'complete'>('intro');
    const [faceStatus, setFaceStatus] = useState<CalibrationStatus | null>(null);
    const [voiceStatus, setVoiceStatus] = useState<CalibrationStatus | null>(null);
    const [baseline, setBaseline] = useState<Partial<BaselineData>>({});

    // Placeholder: In real implementation, get from MediaPipe or similar
    const getFaceLandmarks = async (): Promise<number[]> => {
        // Simulate facial landmarks (468 coordinates)
        return Array(468).fill(0).map(() => Math.random());
    };

    // Placeholder: In real implementation, use MediaRecorder API
    const recordAudio = async (duration: number): Promise<Blob> => {
        // Simulate audio recording
        return new Blob(['audio data'], { type: 'audio/wav' });
    };

    const startFaceCalibration = async () => {
        setStage('face');

        try {
            const facialNeutral = await calibrateFaceBaseline(
                getFaceLandmarks,
                setFaceStatus
            );

            setBaseline(prev => ({
                ...prev,
                facialNeutral,
                calibratedAt: new Date()
            }));

            // Move to voice calibration
            setTimeout(() => setStage('voice'), 1000);

        } catch (error) {
            console.error('Face calibration failed:', error);
            alert('Face calibration failed. Please try again.');
            setStage('intro');
        }
    };

    const startVoiceCalibration = async () => {
        try {
            const voiceNeutral = await calibrateVoiceBaseline(
                recordAudio,
                setVoiceStatus
            );

            const completeBaseline: BaselineData = {
                ...baseline,
                voiceNeutral,
                calibratedAt: baseline.calibratedAt || new Date()
            } as BaselineData;

            setBaseline(completeBaseline);

            // Save to storage
            saveBaselineToStorage(userId, completeBaseline);

            // Complete
            setStage('complete');

            setTimeout(() => {
                onComplete(completeBaseline);
            }, 2000);

        } catch (error) {
            console.error('Voice calibration failed:', error);
            alert('Voice calibration failed. Please try again.');
            setStage('face');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">

                {stage === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 space-y-6"
                    >
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-white mb-4">
                                Baseline Calibration
                            </h1>
                            <p className="text-white/80 text-lg mb-6">
                                Let's personalize the system to your unique emotional baseline
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 glass-card p-4">
                                <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-white font-semibold mb-1">Why Calibration?</h3>
                                    <p className="text-white/70 text-sm">
                                        Everyone has a unique neutral expression and voice. By capturing your baseline,
                                        we can detect <strong>relative</strong> emotional changes more accurately.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-4 text-center">
                                    <Camera className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                                    <h4 className="text-white font-semibold mb-1">Face</h4>
                                    <p className="text-white/60 text-sm">10 seconds</p>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <Mic className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                    <h4 className="text-white font-semibold mb-1">Voice</h4>
                                    <p className="text-white/60 text-sm">10 seconds</p>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            onClick={startFaceCalibration}
                            className="btn-primary w-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Start Calibration
                        </motion.button>
                    </motion.div>
                )}

                {stage === 'face' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-8 space-y-6"
                    >
                        <div className="text-center">
                            <Camera className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">Face Calibration</h2>
                            <p className="text-white/80">
                                Maintain a <strong>neutral, relaxed</strong> expression for 10 seconds
                            </p>
                        </div>

                        {faceStatus && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-white/80 text-sm">
                                    <span>{faceStatus.message}</span>
                                    <span>{faceStatus.samplesCollected}/{faceStatus.samplesRequired}</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${faceStatus.progress}%` }}
                                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="glass-card p-6 bg-blue-500/10 border-blue-400/30">
                            <p className="text-white/80 text-sm text-center">
                                <strong>Tips:</strong> Look directly at the camera, keep your face well-lit,
                                and try not to move or smile
                            </p>
                        </div>
                    </motion.div>
                )}

                {stage === 'voice' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-8 space-y-6"
                    >
                        <div className="text-center">
                            <Mic className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">Voice Calibration</h2>
                            <p className="text-white/80">
                                Speak in a <strong>calm, neutral</strong> tone for 10 seconds
                            </p>
                        </div>

                        {voiceStatus && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-white/80 text-sm">
                                    <span>{voiceStatus.message}</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${voiceStatus.progress}%` }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="glass-card p-6 bg-purple-500/10 border-purple-400/30">
                            <p className="text-white/80 text-sm text-center mb-3">
                                <strong>Suggested Script:</strong>
                            </p>
                            <p className="text-white/70 text-sm italic text-center">
                                "The weather today is nice. I'm here to calibrate my voice baseline
                                for the Smart Care system. This will help detect my emotions more accurately."
                            </p>
                        </div>

                        <button
                            onClick={startVoiceCalibration}
                            className="btn-primary w-full"
                        >
                            <Mic className="w-5 h-5 inline mr-2" />
                            Start Voice Recording
                        </button>
                    </motion.div>
                )}

                {stage === 'complete' && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card p-8 text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-12 h-12 text-white" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Calibration Complete!
                            </h2>
                            <p className="text-white/80">
                                Your personalized baseline has been saved
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-4">
                                <Camera className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                                <p className="text-white/60 text-sm">Face ✓</p>
                            </div>
                            <div className="glass-card p-4">
                                <Mic className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                <p className="text-white/60 text-sm">Voice ✓</p>
                            </div>
                        </div>

                        <p className="text-white/60 text-sm">
                            Redirecting to emotion detection...
                        </p>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
