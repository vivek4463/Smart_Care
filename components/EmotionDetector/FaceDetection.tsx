'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, Loader } from 'lucide-react';
import { detectFaceEmotion } from '@/lib/emotionDetection';
import { EmotionScore } from '@/lib/types';

interface FaceDetectionProps {
    onComplete: (emotions: EmotionScore[]) => void;
}

export default function FaceDetection({ onComplete }: FaceDetectionProps) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [results, setResults] = useState<EmotionScore[] | null>(null);
    const webcamRef = useRef<Webcam>(null);

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setIsAnalyzing(true);

            try {
                const emotions = await detectFaceEmotion(imageSrc);
                setResults(emotions);
                setIsAnalyzing(false);

                // Auto-complete after showing results
                setTimeout(() => {
                    onComplete(emotions);
                }, 2000);
            } catch (error) {
                console.error('Error analyzing face emotion:', error);
                setIsAnalyzing(false);
            }
        }
    }, [webcamRef, onComplete]);

    return (
        <div className="space-y-6">
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Face Emotion Detection</h2>
                        <p className="text-white/60">Let us analyze your facial expressions</p>
                    </div>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-black/30 aspect-video mb-6">
                    {!capturedImage ? (
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            onUserMedia={() => setIsCapturing(true)}
                        />
                    ) : (
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    )}

                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="text-center">
                                <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                                <p className="text-white text-lg">Analyzing your expression...</p>
                            </div>
                        </div>
                    )}

                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end"
                        >
                            <div className="p-6 w-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                    <span className="text-white font-semibold">Analysis Complete</span>
                                </div>
                                <div className="space-y-2">
                                    {results.map((result, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="text-white/80 capitalize w-24">{result.emotion}</span>
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.confidence * 100}%` }}
                                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                />
                                            </div>
                                            <span className="text-white/60 w-12 text-right">
                                                {(result.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {isCapturing && !capturedImage && (
                    <div className="space-y-3">
                        <motion.button
                            onClick={capture}
                            className="btn-primary w-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Camera className="w-5 h-5 inline mr-2" />
                            Capture Photo
                        </motion.button>

                        <button
                            onClick={() => onComplete([])}
                            className="text-white/60 hover:text-white/90 transition-colors text-sm underline w-full"
                        >
                            Skip Face Detection →
                        </button>
                    </div>
                )}
            </div>

            <div className="glass-card p-6">
                <p className="text-white/70 text-sm">
                    <span className="font-semibold text-purple-400">Privacy Note:</span> Your image is processed
                    locally and never uploaded to our servers. We respect your privacy.
                </p>
            </div>
        </div>
    );
}
