'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { PANAS_ITEMS, PANASResponse, PANASResponses, createEmptyPANASResponse, validatePANASResponses, computePANASScores } from '@/lib/panasMeasurement';

interface PANASQuestionnaireProps {
    type: 'pre' | 'post';
    onComplete: (responses: PANASResponses) => void;
    onSkip?: () => void;
}

const SCALE_OPTIONS: { value: PANASResponse; label: string }[] = [
    { value: 1, label: 'Very slightly or not at all' },
    { value: 2, label: 'A little' },
    { value: 3, label: 'Moderately' },
    { value: 4, label: 'Quite a bit' },
    { value: 5, label: 'Extremely' }
];

export default function PANASQuestionnaire({ type, onComplete, onSkip }: PANASQuestionnaireProps) {
    const [responses, setResponses] = useState<PANASResponses>(createEmptyPANASResponse());
    const [currentSection, setCurrentSection] = useState<'positive' | 'negative'>('positive');
    const [errors, setErrors] = useState<string[]>([]);

    const items = currentSection === 'positive' ? PANAS_ITEMS.positive : PANAS_ITEMS.negative;
    const completedPositive = PANAS_ITEMS.positive.every(item => responses.positive[item.id]);
    const completedNegative = PANAS_ITEMS.negative.every(item => responses.negative[item.id]);

    const handleResponse = (itemId: string, value: PANASResponse) => {
        setResponses(prev => ({
            ...prev,
            [currentSection]: {
                ...prev[currentSection],
                [itemId]: value
            }
        }));
        setErrors([]); // Clear errors on interaction
    };

    const handleNext = () => {
        if (currentSection === 'positive') {
            setCurrentSection('negative');
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        const validation = validatePANASResponses(responses);

        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        // Update timestamp
        const finalResponses = {
            ...responses,
            timestamp: new Date()
        };

        onComplete(finalResponses);
    };

    const progress = currentSection === 'positive'
        ? (Object.keys(responses.positive).length / PANAS_ITEMS.positive.length) * 50
        : 50 + (Object.keys(responses.negative).length / PANAS_ITEMS.negative.length) * 50;

    return (
        <div className="glass-card p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-gradient">
                        {type === 'pre' ? 'Pre-Therapy Assessment' : 'Post-Therapy Assessment'}
                    </h2>
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            className="text-white/60 hover:text-white/80 text-sm transition-colors"
                        >
                            Skip →
                        </button>
                    )}
                </div>

                <p className="text-white/70 mb-4">
                    This scale consists of words that describe different feelings and emotions.
                    Indicate to what extent you feel this way <strong>right now</strong>, at this present moment.
                </p>

                {/* Progress Bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <p className="text-white/50 text-sm mt-2">
                    {currentSection === 'positive' ? 'Positive Feelings' : 'Negative Feelings'}
                    {' '}({Math.round(progress)}% complete)
                </p>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 font-semibold mb-2">Please complete all items:</p>
                    <ul className="text-red-200 text-sm space-y-1">
                        {errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Scale Legend */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm mb-2 font-medium">Response Scale:</p>
                <div className="flex flex-wrap gap-2">
                    {SCALE_OPTIONS.map(option => (
                        <span key={option.value} className="text-xs text-white/50">
                            <strong>{option.value}</strong> = {option.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Questions Grid */}
            <div className="space-y-4 mb-8">
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-lg font-medium text-white flex items-center gap-2">
                                {item.text}
                                {responses[currentSection][item.id] && (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                )}
                            </label>
                        </div>

                        {/* Response Buttons */}
                        <div className="flex gap-2">
                            {SCALE_OPTIONS.map(option => {
                                const isSelected = responses[currentSection][item.id] === option.value;
                                return (
                                    <motion.button
                                        key={option.value}
                                        onClick={() => handleResponse(item.id, option.value)}
                                        className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${isSelected
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}                                    >
                                        {option.value}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                {currentSection === 'negative' && (
                    <button
                        onClick={() => setCurrentSection('positive')}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                    >
                        ← Back
                    </button>
                )}

                <button
                    onClick={handleNext}
                    disabled={
                        (currentSection === 'positive' && !completedPositive) ||
                        (currentSection === 'negative' && !completedNegative)
                    }
                    className={`ml-auto px-8 py-3 rounded-lg font-medium transition-all ${((currentSection === 'positive' && completedPositive) ||
                            (currentSection === 'negative' && completedNegative))
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                >
                    {currentSection === 'positive' ? 'Next →' : 'Complete Assessment'}
                </button>
            </div>

            {/* Info Footer */}
            <p className="mt-6 text-white/40 text-xs text-center">
                PANAS (Positive and Negative Affect Schedule) • Watson, Clark, & Tellegen (1988)
            </p>
        </div>
    );
}
