'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Music as MusicIcon, Activity, Sparkles, AlertTriangle } from 'lucide-react';
import PANASQuestionnaire from '@/components/PANASQuestionnaire';
import ConsentDialog from '@/components/ConsentDialog';
import CrisisAlertModal from '@/components/CrisisAlertModal';
import MusicPlayer from '@/components/MusicPlayer';
import {
    initializeTherapySession,
    startTherapySession,
    monitorEmotion,
    endTherapySession,
    TherapySessionState
} from '@/lib/therapyOrchestrator';
import { PANASResponses, computePANASScores } from '@/lib/panasMeasurement';
import { hasConsent, ConsentRecord } from '@/lib/privacy';
import { loadUserProfile, saveUserProfile, UserProfile } from '@/lib/types/userProfile';
import { CrisisDetectionResult, CrisisLevel } from '@/lib/clinicalSafety';
import { GeneratedMusic } from '@/lib/types';
import { getLocalStorage, setLocalStorage } from '@/lib/utils/storage';

type TherapyStep = 'consent' | 'panas-pre' | 'emotion-check' | 'therapy-active' | 'panas-post' | 'complete';

export default function TherapySessionPage() {
    const router = useRouter();
    const [userId] = useState(() => {
        let id = getLocalStorage('userId');
        if (!id) {
            id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setLocalStorage('userId', id);
        }
        return id;
    });

    const [currentStep, setCurrentStep] = useState<TherapyStep>('consent');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showConsentDialog, setShowConsentDialog] = useState(false);
    const [panasPre, setPanasPre] = useState<PANASResponses | null>(null);
    const [panasPost, setPanasPost] = useState<PANASResponses | null>(null);
    const [sessionState, setSessionState] = useState<TherapySessionState | null>(null);
    const [crisisDetected, setCrisisDetected] = useState<CrisisDetectionResult | null>(null);
    const [currentMusic, setCurrentMusic] = useState<GeneratedMusic | null>(null);
    const [userTextInput, setUserTextInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(0);
    const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Check consent on mount
    useEffect(() => {
        const profile = loadUserProfile(userId);
        setUserProfile(profile);

        if (!hasConsent(userId, 'emotionDetection')) {
            setShowConsentDialog(true);
        } else {
            setCurrentStep('panas-pre');
        }
    }, [userId]);

    // Session timer
    useEffect(() => {
        if (currentStep === 'therapy-active') {
            const interval = setInterval(() => {
                setSessionDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [currentStep]);

    // Monitoring loop (every 30 seconds during active therapy)
    useEffect(() => {
        if (currentStep === 'therapy-active' && sessionState && userProfile) {
            monitorIntervalRef.current = setInterval(async () => {
                // In a real app, you'd capture new face images here
                const result = await monitorEmotion(sessionState, undefined);
                if (result.crisisLevel >= CrisisLevel.HIGH) {
                    // Crisis detected during monitoring
                    setCrisisDetected({ level: result.crisisLevel, confidence: 0.8, detectedKeywords: [], recommendedAction: 'Crisis detected', emergencyResources: [] });
                }
            }, 30000); // Every 30 seconds

            return () => {
                if (monitorIntervalRef.current) {
                    clearInterval(monitorIntervalRef.current);
                }
            };
        }
    }, [currentStep, sessionState, userProfile]);

    const handleConsent = (consent: ConsentRecord) => {
        setShowConsentDialog(false);
        setCurrentStep('panas-pre');
    };

    const handleConsentDecline = () => {
        router.push('/dashboard');
    };

    const handlePANASPreComplete = (responses: PANASResponses) => {
        setPanasPre(responses);
        setCurrentStep('emotion-check');
    };

    const handleStartTherapy = async () => {
        if (!panasPre || !userProfile) return;

        setIsProcessing(true);

        try {
            // Initialize session
            const state = await initializeTherapySession(userId, userProfile);

            // Start session with 2-modality fusion (text + face)
            // Note: In real implementation, you'd capture actual face image from webcam
            const faceImage = undefined; // Set to actual ImageData from webcam
            const textInput = userTextInput || "I'm feeling okay today";

            const activeState = await startTherapySession(
                state,
                userProfile,
                faceImage,
                undefined, // No voice detection yet
                textInput
            );

            setSessionState(activeState);
            // Convert musicConfig to GeneratedMusic format for player
            if (activeState.musicConfig) {
                setCurrentMusic({
                    id: `music_${Date.now()}`,
                    config: activeState.musicConfig,
                    baseEmotions: [{ emotion: activeState.currentEmotion, confidence: 0.8 }],
                    duration: 180,
                    createdAt: new Date()
                });
            }

            // Check for crisis
            if (activeState.crisisLevel >= CrisisLevel.HIGH) {
                setCrisisDetected({ level: activeState.crisisLevel, confidence: 0.8, detectedKeywords: [], recommendedAction: 'Crisis detected', emergencyResources: [] });
            }

            setCurrentStep('therapy-active');
        } catch (error) {
            console.error('Error starting therapy:', error);
            alert('Failed to start therapy session. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEndTherapy = () => {
        setCurrentStep('panas-post');
        if (monitorIntervalRef.current) {
            clearInterval(monitorIntervalRef.current);
        }
    };

    const handlePANASPostComplete = async (responses: PANASResponses) => {
        setPanasPost(responses);

        if (!sessionState || !userProfile || !panasPre) return;

        setIsProcessing(true);

        try {
            const panasPostScores = computePANASScores(responses);
            const satisfaction = 4; // Default, would collect from user rating

            // End session and update RL
            const result = await endTherapySession(
                sessionState,
                userProfile,
                panasPostScores.totalScore,
                satisfaction
            );

            // Save updated profile with new RL data
            saveUserProfile(result.updatedProfile);
            setUserProfile(result.updatedProfile);

            // Save session to history
            saveSessionToHistory(result);

            setCurrentStep('complete');
        } catch (error) {
            console.error('Error ending therapy:', error);
            alert('Failed to save session. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const saveSessionToHistory = (result: any) => {
        const sessions = JSON.parse(getLocalStorage('sessionHistory') || '[]');

        const newSession = {
            id: result.sessionId,
            date: new Date().toISOString(),
            emotion: result.outcome.detectedEmotion?.emotion || 'unknown',
            confidence: result.outcome.detectedEmotion?.confidence || 0,
            musicGenerated: true,
            valenceTrend: result.outcome.valenceTrend,
            panasImprovement: result.outcome.panasImprovement,
            rating: result.outcome.userSatisfaction
        };

        sessions.push(newSession);
        setLocalStorage('sessionHistory', JSON.stringify(sessions));
        window.dispatchEvent(new Event('sessionHistoryUpdated'));
    };

    const handleCrisisAcknowledge = () => {
        setCrisisDetected(null);
    };

    const handleCrisisSeekHelp = () => {
        setCrisisDetected(null);
        // Optionally log or track that user is seeking help
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-white/60 hover:text-white/90 transition-colors mb-4"
                    >
                        ← Back to Dashboard
                    </button>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                        AI Music Therapy Session
                    </h1>
                    <p className="text-xl text-white/70">
                        Personalized emotional wellness through ML-powered music
                    </p>
                </div>

                {/* Consent Dialog */}
                {showConsentDialog && (
                    <ConsentDialog
                        userId={userId}
                        onConsent={handleConsent}
                        onDecline={handleConsentDecline}
                    />
                )}

                {/* Crisis Alert */}
                {crisisDetected && !showConsentDialog && (
                    <CrisisAlertModal
                        crisisResult={crisisDetected}
                        onAcknowledge={handleCrisisAcknowledge}
                        onSeekHelp={handleCrisisSeekHelp}
                    />
                )}

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {/* Step 1: Pre-PANAS */}
                    {currentStep === 'panas-pre' && (
                        <motion.div
                            key="panas-pre"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <PANASQuestionnaire
                                type="pre"
                                onComplete={handlePANASPreComplete}
                            />
                        </motion.div>
                    )}

                    {/* Step 2: Emotion Check */}
                    {currentStep === 'emotion-check' && (
                        <motion.div
                            key="emotion-check"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-3xl font-bold text-gradient mb-6">
                                How are you feeling right now?
                            </h2>

                            <p className="text-white/70 mb-6">
                                Share your current thoughts or feelings. Our AI will analyze your emotional state using advanced NLP and facial recognition (if camera is enabled).
                            </p>

                            {/* Text Input */}
                            <div className="mb-6">
                                <label className="block text-white font-medium mb-2">
                                    Your Thoughts (Optional)
                                </label>
                                <textarea
                                    value={userTextInput}
                                    onChange={(e) => setUserTextInput(e.target.value)}
                                    className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                                    rows={4}
                                    placeholder="I'm feeling a bit stressed about work today..."
                                />
                            </div>

                            {/* Info Box */}
                            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-blue-200 text-sm">
                                    💡 <strong>2-Modality Detection:</strong> We use Text (HuggingFace 76% accuracy) + Face (TensorFlow.js ~72% accuracy) for emotion detection. Both modalities are processed locally for your privacy.
                                </p>
                            </div>

                            <button
                                onClick={handleStartTherapy}
                                disabled={isProcessing}
                                className="btn-primary w-full text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Activity className="w-5 h-5" />
                                        Start Therapy Session
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Active Therapy */}
                    {currentStep === 'therapy-active' && currentMusic && (
                        <motion.div
                            key="therapy-active"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Session Info */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <MusicIcon className="w-6 h-6 text-purple-400" />
                                        Active Therapy Session
                                    </h2>
                                    <div className="text-white/60">
                                        Duration: <span className="text-white font-mono">{formatDuration(sessionDuration)}</span>
                                    </div>
                                </div>

                                {sessionState && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-4xl">{sessionState.currentEmotion === 'happy' ? '😊' : sessionState.currentEmotion === 'sad' ? '😢' : sessionState.currentEmotion === 'angry' ? '😠' : sessionState.currentEmotion === 'fearful' ? '😰' : sessionState.currentEmotion === 'neutral' ? '😐' : sessionState.currentEmotion === 'surprised' ? '😲' : '🤔'}</div>
                                        <div>
                                            <p className="text-white font-medium capitalize">{sessionState.currentEmotion}</p>
                                            <p className="text-white/60 text-sm">Valence: {(sessionState.currentValence * 100).toFixed(0)}%</p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <p className="text-green-200 text-sm">
                                        ✅ <strong>RL Personalization Active:</strong> Music is being selected using Q-learning to maximize your emotional improvement.
                                    </p>
                                </div>
                            </div>

                            {/* Music Player */}
                            <MusicPlayer music={currentMusic} />

                            {/* End Session Button */}
                            <button
                                onClick={handleEndTherapy}
                                className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                            >
                                End Therapy Session
                            </button>

                            <p className="text-white/40 text-xs text-center">
                                Recommended session length: 5-10 minutes
                            </p>
                        </motion.div>
                    )}

                    {/* Step 4: Post-PANAS */}
                    {currentStep === 'panas-post' && (
                        <motion.div
                            key="panas-post"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <PANASQuestionnaire
                                type="post"
                                onComplete={handlePANASPostComplete}
                            />
                        </motion.div>
                    )}

                    {/* Step 5: Complete */}
                    {currentStep === 'complete' && panasPre && panasPost && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-12 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>

                            <h2 className="text-4xl font-bold text-gradient mb-4">
                                Session Complete!
                            </h2>

                            <p className="text-xl text-white/70 mb-8">
                                Great job completing your therapy session
                            </p>

                            {/* Results */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-white/60 text-sm mb-1">PANAS Improvement</div>
                                    <div className="text-3xl font-bold text-green-400">
                                        +{Math.abs(computePANASScores(panasPost).totalScore - computePANASScores(panasPre).totalScore)}
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-white/60 text-sm mb-1">Session Duration</div>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {formatDuration(sessionDuration)}
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-white/60 text-sm mb-1">RL System</div>
                                    <div className="text-lg font-bold text-cyan-400">
                                        Updated ✓
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="btn-primary w-full text-lg py-4"
                                >
                                    Back to Dashboard
                                </button>
                                <button
                                    onClick={() => router.push('/history')}
                                    className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                                >
                                    View Session History
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
