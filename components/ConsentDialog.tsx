'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle, Check } from 'lucide-react';
import { ConsentRecord, recordConsent } from '@/lib/privacy';

interface ConsentDialogProps {
    userId: string;
    onConsent: (consent: ConsentRecord) => void;
    onDecline: () => void;
}

export default function ConsentDialog({ userId, onConsent, onDecline }: ConsentDialogProps) {
    const [purposes, setPurposes] = useState({
        dataCollection: false,
        emotionDetection: false,
        personalization: false,
        research: false
    });

    const [showDetails, setShowDetails] = useState(false);
    const allRequired = purposes.dataCollection && purposes.emotionDetection && purposes.personalization;

    const handleToggle = (purpose: keyof typeof purposes) => {
        setPurposes(prev => ({ ...prev, [purpose]: !prev[purpose] }));
    };

    const handleAccept = () => {
        const consent: ConsentRecord = {
            userId,
            consentGiven: true,
            consentTimestamp: new Date(),
            consentVersion: '1.0',
            purposes,
            canRevoke: true
        };

        recordConsent(userId, consent);
        onConsent(consent);
    };

    const consentItems = [
        {
            key: 'dataCollection' as const,
            title: 'Data Collection',
            description: 'Allow us to collect session data (emotion scores, music preferences)',
            required: true,
            details: 'We collect minimal data: emotion detection results, session outcomes (PANAS scores, valence), and music preferences. All data is encrypted (AES-256-GCM) and stored locally on your device.'
        },
        {
            key: 'emotionDetection' as const,
            title: 'Emotion Detection',
            description: 'Allow camera and microphone access for emotion analysis',
            required: true,
            details: 'Your face and voice are processed locally on your device using TensorFlow.js and Web Audio API. Raw images and audio are NEVER uploaded to servers - only emotion scores are stored temporarily.'
        },
        {
            key: 'personalization' as const,
            title: 'Personalization & Learning',
            description: 'Allow the system to learn your preferences and adapt therapy',
            required: true,
            details: 'We use reinforcement learning (Q-learning) to personalize music therapy based on your responses. Your user profile includes learned preferences, but can be deleted anytime.'
        },
        {
            key: 'research' as const,
            title: 'Research Use (Optional)',
            description: 'Allow anonymized data to be used for research and publication',
            required: false,
            details: 'If you opt in, your anonymized session data may be used for academic research to improve mental health AI. All personal information is removed before use. You can opt out anytime.'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-10 h-10 text-purple-400" />
                    <div>
                        <h2 className="text-3xl font-bold text-gradient">Privacy & Consent</h2>
                        <p className="text-white/60 text-sm">GDPR Compliant • Your data, your control</p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-blue-200 text-sm font-medium mb-1">Privacy-First Design</p>
                            <p className="text-blue-200/70 text-xs">
                                • Face & voice processed <strong>locally</strong> (never uploaded)<br />
                                • All data <strong>encrypted</strong> (AES-256)<br />
                                • <strong>Delete anytime</strong> (right to erasure)<br />
                                • <strong>No data sold</strong> to third parties
                            </p>
                        </div>
                    </div>
                </div>

                {/* Consent Items */}
                <div className="space-y-4 mb-6">
                    {consentItems.map(item => (
                        <div key={item.key} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <div className="flex items-start gap-3">
                                <motion.button
                                    onClick={() => handleToggle(item.key)}
                                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${purposes[item.key]
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500'
                                        : 'border-white/30'
                                        }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {purposes[item.key] && <Check className="w-4 h-4 text-white" />}
                                </motion.button>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <label className="text-white font-medium cursor-pointer" onClick={() => handleToggle(item.key)}>
                                            {item.title}
                                        </label>
                                        {item.required && (
                                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">Required</span>
                                        )}
                                    </div>
                                    <p className="text-white/60 text-sm mb-2">{item.description}</p>

                                    <AnimatePresence>
                                        {showDetails && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-white/50 text-xs mt-2 leading-relaxed"
                                            >
                                                {item.details}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show Details Toggle */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-purple-400 hover:text-purple-300 text-sm mb-6 transition-colors"
                >
                    {showDetails ? '▼ Hide Details' : '▶ Show Full Details'}
                </button>

                {/* Warning if not all required */}
                {!allRequired && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-200 text-sm">
                            ⚠️ Please accept all required consents to use Smart Care therapy features.
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                    >
                        Decline
                    </button>

                    <button
                        onClick={handleAccept}
                        disabled={!allRequired}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${allRequired
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                    >
                        Accept & Continue
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-6 text-white/40 text-xs text-center">
                    You can revoke consent anytime in Settings • <a href="/privacy-policy" className="text-purple-400 hover:underline">Privacy Policy</a>
                </p>
            </motion.div>
        </div>
    );
}
