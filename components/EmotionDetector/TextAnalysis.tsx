'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Loader, Sparkles } from 'lucide-react';
import { analyzeTextEmotionML } from '@/lib/emotionDetection';
import { EmotionScore } from '@/lib/types';

interface TextAnalysisProps {
    onComplete: (emotions: EmotionScore[]) => void;
}

export default function TextAnalysis({ onComplete }: TextAnalysisProps) {
    const [text, setText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<EmotionScore[] | null>(null);

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        setIsAnalyzing(true);
        try {
            const emotions = await analyzeTextEmotionML(text);
            setResults(emotions);
            setIsAnalyzing(false);

            // Auto-complete after showing results
            setTimeout(() => {
                onComplete(emotions);
            }, 2000);
        } catch (error) {
            console.error('Error analyzing text emotion:', error);
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Text Emotion Analysis</h2>
                        <p className="text-white/60">Share your thoughts and feelings in words</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-white/80 font-medium mb-3">
                            How are you feeling today?
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Express yourself freely... Tell us about your day, your emotions, what's on your mind..."
                            className="w-full h-48 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all duration-300 resize-none"
                            disabled={isAnalyzing || results !== null}
                        />
                        <div className="mt-2 text-right text-sm text-white/40">
                            {text.length} characters
                        </div>
                    </div>

                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8"
                        >
                            <Loader className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
                            <p className="text-white text-lg">Analyzing your message...</p>
                        </motion.div>
                    )}

                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                                <span className="text-white font-semibold text-lg">Analysis Complete</span>
                            </div>

                            <div className="space-y-3">
                                {results.map((result, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="text-white/80 capitalize w-24">{result.emotion}</span>
                                        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.confidence * 100}%` }}
                                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
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

                    {!results && !isAnalyzing && (
                        <div className="space-y-3">
                            <motion.button
                                onClick={handleAnalyze}
                                disabled={!text.trim()}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={text.trim() ? { scale: 1.02 } : {}}
                                whileTap={text.trim() ? { scale: 0.98 } : {}}
                            >
                                <MessageSquare className="w-5 h-5 inline mr-2" />
                                Analyze Text
                            </motion.button>

                            <button
                                onClick={() => onComplete([])}
                                className="text-white/60 hover:text-white/90 transition-colors text-sm underline w-full"
                            >
                                Skip Text Analysis →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card p-6">
                <p className="text-white/70 text-sm">
                    <span className="font-semibold text-pink-400">Tip:</span> Be as expressive as you'd like.
                    The more you share, the better we can understand and support your emotional state.
                </p>
            </div>
        </div>
    );
}
