'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import FaceDetection from '@/components/EmotionDetector/FaceDetection';
import VoiceDetection from '@/components/EmotionDetector/VoiceDetection';
import TextAnalysis from '@/components/EmotionDetector/TextAnalysis';
import HeartRateMonitor from '@/components/EmotionDetector/HeartRateMonitor';
import EmotionResults from '@/components/EmotionResults';
import { EmotionScore, DetectionStep, EmotionResult } from '@/lib/types';
import { aggregateEmotions } from '@/lib/emotionDetection';

const steps: DetectionStep[] = ['face', 'voice', 'text', 'heartrate', 'analysis'];

const stepTitles: Record<DetectionStep, string> = {
    face: 'Face Detection',
    voice: 'Voice Analysis',
    text: 'Text Analysis',
    heartrate: 'Heart Rate',
    analysis: 'Complete Analysis',
};

export default function DetectEmotionPage() {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [emotionData, setEmotionData] = useState<Partial<EmotionResult>>({});

    const currentStep = steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const handleFaceComplete = (emotions: EmotionScore[]) => {
        setEmotionData(prev => ({ ...prev, face: emotions }));
        nextStep();
    };

    const handleVoiceComplete = (emotions: EmotionScore[]) => {
        setEmotionData(prev => ({ ...prev, voice: emotions }));
        nextStep();
    };

    const handleTextComplete = (emotions: EmotionScore[]) => {
        setEmotionData(prev => ({ ...prev, text: emotions }));
        nextStep();
    };

    const handleHeartRateComplete = (heartRate?: number) => {
        setEmotionData(prev => ({ ...prev, heartRate }));
        nextStep();
    };

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handleGenerateMusic = () => {
        // Store emotion data for music generation
        const aggregated = aggregateEmotions(
            emotionData.face,
            emotionData.voice,
            emotionData.text
        );

        const emotionWithTimestamp = {
            ...emotionData,
            aggregated,
            timestamp: new Date(),
        };

        localStorage.setItem('currentEmotionData', JSON.stringify(emotionWithTimestamp));

        // Save to session history
        saveSession(aggregated, emotionData.heartRate);

        router.push('/music');
    };

    const saveSession = (emotions: EmotionScore[], heartRate?: number) => {
        // Get existing sessions
        const storedSessions = localStorage.getItem('sessionHistory');
        const sessions = storedSessions ? JSON.parse(storedSessions) : [];

        // Get primary emotion
        const primaryEmotion = emotions && emotions.length > 0 ? emotions[0] : null;

        if (!primaryEmotion) return;

        // Create new session
        const newSession = {
            id: `session_${Date.now()}`,
            date: new Date().toISOString(),
            emotion: primaryEmotion.emotion,
            confidence: primaryEmotion.confidence,
            musicGenerated: false, // Will be updated when music is generated
            rating: null,
            heartRate: heartRate,
        };

        // Add to sessions
        sessions.push(newSession);

        // Save back to localStorage
        localStorage.setItem('sessionHistory', JSON.stringify(sessions));
        localStorage.setItem('currentSessionId', newSession.id); // Store current session ID
    };

    return (
        <div className="min-h-screen p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.div
                className="max-w-4xl mx-auto relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-white/60 hover:text-white/90 transition-colors mb-4 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                        Emotion Detection Journey
                    </h1>
                    <p className="text-xl text-white/70">
                        We'll analyze your emotions step by step through multiple modalities
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-white/80 font-medium">Progress</span>
                        <span className="text-white/60">{currentStepIndex + 1} / {steps.length}</span>
                    </div>

                    <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        {steps.map((step, idx) => (
                            <div
                                key={step}
                                className={`flex items-center gap-2 ${idx <= currentStepIndex ? 'text-purple-400' : 'text-white/30'
                                    }`}
                            >
                                <div
                                    className={`w-2 h-2 rounded-full ${idx < currentStepIndex
                                        ? 'bg-green-400'
                                        : idx === currentStepIndex
                                            ? 'bg-purple-400 animate-pulse'
                                            : 'bg-white/20'
                                        }`}
                                />
                                <span className="hidden md:block">{stepTitles[step]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 'face' && <FaceDetection onComplete={handleFaceComplete} />}
                        {currentStep === 'voice' && <VoiceDetection onComplete={handleVoiceComplete} />}
                        {currentStep === 'text' && <TextAnalysis onComplete={handleTextComplete} />}
                        {currentStep === 'heartrate' && <HeartRateMonitor onComplete={handleHeartRateComplete} />}
                        {currentStep === 'analysis' && (
                            <EmotionResults
                                emotionData={emotionData}
                                onGenerateMusic={handleGenerateMusic}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
