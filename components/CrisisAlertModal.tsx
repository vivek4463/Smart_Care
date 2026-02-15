'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { CrisisDetectionResult, CrisisLevel } from '@/lib/clinicalSafety';

interface CrisisAlertModalProps {
    crisisResult: CrisisDetectionResult;
    onAcknowledge: () => void;
    onSeekHelp: () => void;
}

export default function CrisisAlertModal({ crisisResult, onAcknowledge, onSeekHelp }: CrisisAlertModalProps) {
    const { level, confidence, detectedKeywords, recommendedAction, emergencyResources } = crisisResult;

    // Map crisis level to display config
    const getLevelConfig = (level: CrisisLevel) => {
        switch (level) {
            case CrisisLevel.CRITICAL:
                return { color: 'red', severity: 'CRITICAL', gradient: 'from-red-500 to-orange-500' };
            case CrisisLevel.HIGH:
                return { color: 'orange', severity: 'HIGH', gradient: 'from-orange-500 to-yellow-500' };
            case CrisisLevel.MEDIUM:
                return { color: 'yellow', severity: 'MEDIUM', gradient: 'from-yellow-500 to-amber-500' };
            case CrisisLevel.LOW:
                return { color: 'blue', severity: 'LOW', gradient: 'from-blue-500 to-cyan-500' };
            default:
                return { color: 'gray', severity: 'NONE', gradient: 'from-gray-500 to-slate-500' };
        }
    };

    const config = getLevelConfig(level);
    const isCriticalOrHigh = level === CrisisLevel.CRITICAL || level === CrisisLevel.HIGH;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                <motion.div
                    className="w-full max-w-2xl glass-card p-8 border-2 border-red-500/50 relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                    {/* Warning Icon */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 animate-pulse`}>
                            <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Safety Alert - {config.severity} Priority
                            </h2>
                            <div className="flex items-center gap-2 text-white/60">
                                <span className="text-sm">Confidence: {(confidence * 100).toFixed(0)}%</span>
                                {detectedKeywords.length > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-sm">{detectedKeywords.length} indicator{detectedKeywords.length !== 1 ? 's' : ''} detected</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-lg">
                        <p className="text-white/90 leading-relaxed">
                            {recommendedAction}
                        </p>
                    </div>

                    {/* Emergency Resources */}
                    {emergencyResources.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-3">
                                🆘 Emergency Resources
                            </h3>
                            <div className="space-y-3">
                                {emergencyResources.map((resource, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-white font-semibold flex items-center gap-2">
                                                {resource.phone.includes('Text') ? (
                                                    <MessageCircle className="w-4 h-4" />
                                                ) : (
                                                    <Phone className="w-4 h-4" />
                                                )}
                                                {resource.name}
                                            </h4>
                                            {resource.available24h && (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-semibold">
                                                    24/7
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/70 text-sm mb-2">{resource.description}</p>
                                        <a
                                            href={resource.phone.includes('Text') ? undefined : `tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                                            className="text-cyan-400 font-mono font-semibold hover:text-cyan-300 transition-colors"
                                        >
                                            {resource.phone}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Important Notice */}
                    <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-purple-200 text-sm">
                            <strong>⚠️ Important:</strong> Smart Care is NOT a replacement for professional mental health care.
                            If you&apos;re in crisis, please reach out to one of the resources above or call emergency services (911).
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {isCriticalOrHigh ? (
                            <>
                                <button
                                    onClick={onSeekHelp}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all"
                                >
                                    I&apos;ll Seek Help Now
                                </button>
                                <button
                                    onClick={onAcknowledge}
                                    className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                >
                                    Continue Session
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={onSeekHelp}
                                    className="flex-1 px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg font-medium transition-colors"
                                >
                                    View Resources
                                </button>
                                <button
                                    onClick={onAcknowledge}
                                    className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                                >
                                    Continue
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
