'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Music as MusicIcon, Loader, CheckCircle } from 'lucide-react';
import MusicPlayer from '@/components/MusicPlayer';
import { EmotionResult, GeneratedMusic } from '@/lib/types';
import { generateMusic, getMusicDescription } from '@/lib/musicGeneration';
import { getEmotionEmoji } from '@/lib/emotionDetection';

export default function MusicPage() {
    const router = useRouter();
    const [emotionData, setEmotionData] = useState<EmotionResult | null>(null);
    const [music, setMusic] = useState<GeneratedMusic | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [playbackComplete, setPlaybackComplete] = useState(false);

    useEffect(() => {
        // Load emotion data from localStorage
        const data = localStorage.getItem('currentEmotionData');
        if (!data) {
            router.push('/detect-emotion');
            return;
        }

        const emotionResult: EmotionResult = JSON.parse(data);
        setEmotionData(emotionResult);

        // Generate music
        setIsGenerating(true);
        setTimeout(async () => {
            const generatedMusic = await generateMusic([emotionResult.aggregated]);
            setMusic(generatedMusic);
            setIsGenerating(false);

            // Update session history
            updateSessionWithMusic();
        }, 3000); // Simulate generation time
    }, [router]);

    const updateSessionWithMusic = () => {
        const sessionId = localStorage.getItem('currentSessionId');
        if (!sessionId) return;

        const storedSessions = localStorage.getItem('sessionHistory');
        if (!storedSessions) return;

        const sessions = JSON.parse(storedSessions);
        const sessionIndex = sessions.findIndex((s: any) => s.id === sessionId);

        if (sessionIndex !== -1) {
            sessions[sessionIndex].musicGenerated = true;
            localStorage.setItem('sessionHistory', JSON.stringify(sessions));
        }
    };

    const handlePlaybackComplete = () => {
        setPlaybackComplete(true);
    };

    const handleContinueToFeedback = () => {
        if (music) {
            localStorage.setItem('currentMusic', JSON.stringify(music));
            router.push('/feedback');
        }
    };

    if (!emotionData) {
        return null;
    }

    return (
        <div className="min-h-screen p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 90, 180, 270, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.3, 1, 1.3],
                        rotate: [360, 270, 180, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
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
                        className="text-white/60 hover:text-white/90 transition-colors mb-4"
                    >
                        ← Back to Dashboard
                    </button>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                        Your Personalized Music
                    </h1>
                    <p className="text-xl text-white/70">
                        AI-generated therapeutic music tailored to your emotional state
                    </p>
                </div>

                {/* Emotion Summary */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="text-5xl">{getEmotionEmoji(emotionData.aggregated.emotion)}</div>
                        <div>
                            <h3 className="text-xl font-semibold text-white capitalize">
                                {emotionData.aggregated.emotion}
                            </h3>
                            <p className="text-white/60">
                                Detected emotional state • {(emotionData.aggregated.confidence * 100).toFixed(0)}% confidence
                            </p>
                        </div>
                    </div>
                </div>

                {/* Generation or Player */}
                {isGenerating && (
                    <motion.div
                        className="glass-card p-16 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="inline-block mb-6"
                        >
                            <Sparkles className="w-20 h-20 text-purple-400" />
                        </motion.div>

                        <h2 className="text-3xl font-bold text-white mb-4">
                            Generating Your Music...
                        </h2>
                        <p className="text-white/70 text-lg">
                            Our AI is composing a personalized therapeutic piece just for you
                        </p>

                        <div className="mt-8 max-w-md mx-auto">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {music && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Music Description */}
                        <div className="glass-card p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <MusicIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Therapeutic Composition #{music.id.split('_')[1]}
                                    </h3>
                                    <p className="text-white/70">
                                        {getMusicDescription(music.config)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-white/60 text-sm mb-1">Tempo</div>
                                    <div className="text-white font-semibold">{music.config.tempo} BPM</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-white/60 text-sm mb-1">Key</div>
                                    <div className="text-white font-semibold">{music.config.key}</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-white/60 text-sm mb-1">Mode</div>
                                    <div className="text-white font-semibold capitalize">{music.config.mode}</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-white/60 text-sm mb-1">Duration</div>
                                    <div className="text-white font-semibold">{Math.floor(music.duration / 60)} min</div>
                                </div>
                            </div>
                        </div>

                        {/* Player */}
                        <MusicPlayer music={music} onPlaybackComplete={handlePlaybackComplete} />

                        {/* Continue Button */}
                        {playbackComplete && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="glass-card p-6 mb-4">
                                    <div className="flex items-center gap-3 text-green-400 mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Playback Complete</span>
                                    </div>
                                    <p className="text-white/70">
                                        We&apos;d love to hear your feedback on this therapeutic music experience
                                    </p>
                                </div>

                                <motion.button
                                    onClick={handleContinueToFeedback}
                                    className="btn-primary w-full text-lg py-5"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Continue to Feedback
                                </motion.button>
                            </motion.div>
                        )}

                        {!playbackComplete && (
                            <button
                                onClick={handleContinueToFeedback}
                                className="text-white/60 hover:text-white/90 transition-colors text-sm underline w-full text-center"
                            >
                                Skip to feedback
                            </button>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
