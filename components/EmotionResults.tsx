'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Activity } from 'lucide-react';
import { EmotionResult } from '@/lib/types';
import { aggregateEmotions, getEmotionColor, getEmotionEmoji } from '@/lib/emotionDetection';

interface EmotionResultsProps {
    emotionData: Partial<EmotionResult>;
    onGenerateMusic: () => void;
}

export default function EmotionResults({ emotionData, onGenerateMusic }: EmotionResultsProps) {
    const aggregated = aggregateEmotions(
        emotionData.face ?? null,
        emotionData.voice ?? null,
        emotionData.text ?? null
    );

    return (
        <div className="space-y-6">
            {/* Overall Result */}
            <motion.div
                className="glass-card p-10 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <motion.div
                    className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6"
                    style={{
                        background: `radial-gradient(circle, ${getEmotionColor(aggregated.emotion)}40, ${getEmotionColor(aggregated.emotion)}10)`,
                        border: `3px solid ${getEmotionColor(aggregated.emotion)}`,
                    }}
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                >
                    <span className="text-6xl">{getEmotionEmoji(aggregated.emotion)}</span>
                </motion.div>

                <h2 className="text-4xl font-bold text-white mb-2 capitalize">
                    {aggregated.emotion}
                </h2>
                <p className="text-xl text-white/70 mb-6">
                    Primary Emotion Detected
                </p>

                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-white/80">
                        Confidence: <span className="font-semibold text-white">
                            {(aggregated.confidence * 100).toFixed(1)}%
                        </span>
                    </span>
                </div>
            </motion.div>

            {/* Detailed Breakdown */}
            <div className="glass-card p-8">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-purple-400" />
                    Multimodal Analysis Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Face Emotions */}
                    {emotionData.face && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="text-sm text-white/60 mb-3 uppercase tracking-wide">
                                Facial Expression
                            </div>
                            <div className="space-y-3">
                                {emotionData.face.slice(0, 3).map((emotion, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/80 capitalize">{emotion.emotion}</span>
                                            <span className="text-white/60">{(emotion.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${emotion.confidence * 100}%` }}
                                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Voice Emotions */}
                    {emotionData.voice && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="text-sm text-white/60 mb-3 uppercase tracking-wide">
                                Voice Analysis
                            </div>
                            <div className="space-y-3">
                                {emotionData.voice.slice(0, 3).map((emotion, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/80 capitalize">{emotion.emotion}</span>
                                            <span className="text-white/60">{(emotion.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${emotion.confidence * 100}%` }}
                                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Text Emotions */}
                    {emotionData.text && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="text-sm text-white/60 mb-3 uppercase tracking-wide">
                                Text Sentiment
                            </div>
                            <div className="space-y-3">
                                {emotionData.text.slice(0, 3).map((emotion, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/80 capitalize">{emotion.emotion}</span>
                                            <span className="text-white/60">{(emotion.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${emotion.confidence * 100}%` }}
                                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Heart Rate */}
                {emotionData.heartRate && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl border border-orange-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="w-6 h-6 text-orange-400" />
                                <span className="text-white/80">Heart Rate</span>
                            </div>
                            <div className="text-3xl font-bold text-gradient-sunset">
                                {emotionData.heartRate} <span className="text-lg text-white/60">BPM</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CTA */}
            <motion.button
                onClick={onGenerateMusic}
                className="btn-primary w-full text-lg py-6 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Sparkles className="w-6 h-6" />
                Generate Personalized Music
            </motion.button>

            <div className="glass-card p-6">
                <p className="text-white/70 text-center">
                    Based on your emotional state, we'll create a personalized 2-3 minute therapeutic
                    music composition designed to support your well-being.
                </p>
            </div>
        </div>
    );
}
