'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, Send, CheckCircle, TrendingUp } from 'lucide-react';
import { Feedback, SatisfactionLevel, GeneratedMusic } from '@/lib/types';
import { analyzeFeedback, storeFeedback, getSatisfactionEmoji, generateImprovementSuggestions } from '@/lib/feedbackAnalysis';

const satisfactionLevels: { value: SatisfactionLevel; label: string }[] = [
    { value: 'very_dissatisfied', label: 'Very Dissatisfied' },
    { value: 'dissatisfied', label: 'Dissatisfied' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'satisfied', label: 'Satisfied' },
    { value: 'very_satisfied', label: 'Very Satisfied' },
];

export default function FeedbackPage() {
    const router = useRouter();
    const [satisfaction, setSatisfaction] = useState<SatisfactionLevel>('neutral');
    const [rating, setRating] = useState(3);
    const [comments, setComments] = useState('');
    const [emotionalImpact, setEmotionalImpact] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const musicData = localStorage.getItem('currentMusic');
        if (!musicData) return;

        const music: GeneratedMusic = JSON.parse(musicData);

        const feedback: Feedback = {
            musicId: music.id,
            satisfaction,
            rating,
            comments: comments || undefined,
            emotionalImpact: emotionalImpact || undefined,
            suggestions: suggestions || undefined,
            timestamp: new Date(),
        };

        // Analyze feedback
        const feedbackAnalysis = analyzeFeedback(feedback);
        const improvements = generateImprovementSuggestions(feedbackAnalysis);

        // Store feedback
        await storeFeedback(feedback);

        setAnalysis({ ...feedbackAnalysis, improvements });
        setIsSubmitting(false);
        setSubmitted(true);
    };

    const handleContinue = () => {
        router.push('/dashboard');
    };

    if (submitted && analysis) {
        return (
            <div className="min-h-screen p-6 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    />
                </div>

                <motion.div
                    className="max-w-3xl mx-auto relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6"
                        >
                            <CheckCircle className="w-12 h-12 text-white" />
                        </motion.div>

                        <h1 className="text-5xl font-bold mb-4 text-gradient">
                            Thank You!
                        </h1>
                        <p className="text-xl text-white/70">
                            Your feedback helps us improve and serve you better
                        </p>
                    </div>

                    <div className="glass-card p-8 mb-6">
                        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                            Self-Improvement Analysis
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="text-white/60 text-sm mb-2 uppercase tracking-wide">
                                    Overall Satisfaction
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${analysis.overallSatisfaction * 100}%` }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                        />
                                    </div>
                                    <span className="text-white font-semibold">
                                        {(analysis.overallSatisfaction * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {analysis.strengthAreas && analysis.strengthAreas.length > 0 && (
                                <div>
                                    <div className="text-white/60 text-sm mb-3 uppercase tracking-wide">
                                        Strength Areas
                                    </div>
                                    <div className="space-y-2">
                                        {analysis.strengthAreas.map((area: string, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + idx * 0.1 }}
                                                className="flex items-center gap-3 bg-green-500/10 rounded-lg p-3 border border-green-500/20"
                                            >
                                                <ThumbsUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                <span className="text-white/80">{area}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.improvements && analysis.improvements.length > 0 && (
                                <div>
                                    <div className="text-white/60 text-sm mb-3 uppercase tracking-wide">
                                        AI Self-Improvements
                                    </div>
                                    <div className="space-y-2">
                                        {analysis.improvements.map((improvement: string, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.7 + idx * 0.1 }}
                                                className="flex items-start gap-3 bg-purple-500/10 rounded-lg p-3 border border-purple-500/20"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                                <span className="text-white/80">{improvement}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <motion.button
                        onClick={handleContinue}
                        className="btn-primary w-full text-lg py-5"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Return to Dashboard
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                />
            </div>

            <motion.div
                className="max-w-3xl mx-auto relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-white/60 hover:text-white/90 transition-colors mb-4"
                    >
                        ← Skip Feedback
                    </button>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                        Share Your Experience
                    </h1>
                    <p className="text-xl text-white/70">
                        Help us improve by sharing your thoughts on the music therapy session
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Satisfaction */}
                    <div className="glass-card p-8">
                        <label className="block text-xl font-semibold text-white mb-4">
                            How satisfied are you with the music?
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                            {satisfactionLevels.map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setSatisfaction(level.value)}
                                    className={`p-4 rounded-xl border-2 transition-all ${satisfaction === level.value
                                            ? 'border-purple-500 bg-purple-500/20'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="text-4xl mb-2">{getSatisfactionEmoji(level.value)}</div>
                                    <div className="text-xs text-white/60">{level.label.split(' ')[0]}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="glass-card p-8">
                        <label className="block text-xl font-semibold text-white mb-4">
                            Rate your experience (1-5 stars)
                        </label>
                        <div className="flex gap-3 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-12 h-12 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="glass-card p-8">
                        <label className="block text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Additional Comments (Optional)
                        </label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Tell us what you liked or what could be improved..."
                            className="w-full h-32 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 resize-none"
                        />
                    </div>

                    {/* Emotional Impact */}
                    <div className="glass-card p-8">
                        <label className="block text-xl font-semibold text-white mb-4">
                            How did the music make you feel? (Optional)
                        </label>
                        <input
                            type="text"
                            value={emotionalImpact}
                            onChange={(e) => setEmotionalImpact(e.target.value)}
                            placeholder="e.g., Calm, Energized, Peaceful..."
                            className="input-field"
                        />
                    </div>

                    {/* Suggestions */}
                    <div className="glass-card p-8">
                        <label className="block text-xl font-semibold text-white mb-4">
                            Suggestions for improvement? (Optional)
                        </label>
                        <textarea
                            value={suggestions}
                            onChange={(e) => setSuggestions(e.target.value)}
                            placeholder="How can we make your next session even better?"
                            className="w-full h-24 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full text-lg py-5 flex items-center justify-center gap-3 disabled:opacity-50"
                        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    >
                        {isSubmitting ? (
                            'Analyzing Feedback...'
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Submit Feedback
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
