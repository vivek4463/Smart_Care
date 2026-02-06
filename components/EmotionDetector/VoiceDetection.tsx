'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, CheckCircle, Loader } from 'lucide-react';
import { detectVoiceEmotion } from '@/lib/emotionDetection';
import { EmotionScore } from '@/lib/types';

interface VoiceDetectionProps {
    onComplete: (emotions: EmotionScore[]) => void;
}

export default function VoiceDetection({ onComplete }: VoiceDetectionProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [results, setResults] = useState<EmotionScore[] | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                setIsAnalyzing(true);
                try {
                    const emotions = await detectVoiceEmotion(audioBlob);
                    setResults(emotions);
                    setIsAnalyzing(false);

                    // Auto-complete after showing results
                    setTimeout(() => {
                        onComplete(emotions);
                    }, 2000);
                } catch (error) {
                    console.error('Error analyzing voice emotion:', error);
                    setIsAnalyzing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check your permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Voice Emotion Detection</h2>
                        <p className="text-white/60">Speak naturally to analyze your vocal emotions</p>
                    </div>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-white/10 p-12 mb-6">
                    <div className="text-center">
                        {!isRecording && !isAnalyzing && !results && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <Mic className="w-16 h-16 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-2">Ready to Record</h3>
                                <p className="text-white/60">Click below to start recording your voice</p>
                            </motion.div>
                        )}

                        {isRecording && (
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                            >
                                <motion.div
                                    className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Mic className="w-16 h-16 text-white" />
                                </motion.div>
                                <h3 className="text-2xl font-semibold text-white mb-2">Recording...</h3>
                                <p className="text-4xl font-mono text-cyan-400">{formatTime(recordingTime)}</p>
                                <p className="text-white/60 mt-2">Speak about how you're feeling</p>
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <div>
                                <Loader className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-white mb-2">Analyzing Voice...</h3>
                                <p className="text-white/60">Processing your vocal patterns</p>
                            </div>
                        )}

                        {results && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                    <CheckCircle className="w-16 h-16 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-6">Analysis Complete</h3>

                                <div className="space-y-3 max-w-md mx-auto">
                                    {results.map((result, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="text-white/80 capitalize w-24 text-left">{result.emotion}</span>
                                            <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.confidence * 100}%` }}
                                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                                />
                                            </div>
                                            <span className="text-white/60 w-12 text-right">
                                                {(result.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {!isRecording && !results && !isAnalyzing && (
                    <motion.button
                        onClick={startRecording}
                        className="btn-primary w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Mic className="w-5 h-5 inline mr-2" />
                        Start Recording
                    </motion.button>
                )}

                {isRecording && (
                    <motion.button
                        onClick={stopRecording}
                        className="btn-secondary w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Square className="w-5 h-5 inline mr-2" />
                        Stop Recording
                    </motion.button>
                )}
            </div>

            <div className="glass-card p-6">
                <p className="text-white/70 text-sm">
                    <span className="font-semibold text-blue-400">Privacy Note:</span> Your audio is processed
                    locally and immediately discarded after analysis. We never store or share your recordings.
                </p>
            </div>
        </div>
    );
}
