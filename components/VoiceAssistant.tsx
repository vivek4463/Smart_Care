'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Volume2, Loader } from 'lucide-react';
import { processVoiceQuery, speak, startListening } from '@/lib/voiceAssistant';
import { VoiceQuery, VoiceResponse } from '@/lib/types';

export default function VoiceAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState<VoiceResponse | null>(null);
    const [error, setError] = useState('');

    const handleStartListening = () => {
        setError('');
        setTranscript('');
        setResponse(null);
        setIsListening(true);

        const recognition = startListening(
            (text) => {
                setTranscript(text);
                setIsListening(false);
                handleProcessQuery(text);
            },
            (err) => {
                setError('Could not hear you. Please try again.');
                setIsListening(false);
            }
        );

        if (!recognition) {
            setError('Speech recognition is not supported in your browser');
            setIsListening(false);
        }
    };

    const handleProcessQuery = async (text: string) => {
        setIsProcessing(true);

        const query: VoiceQuery = {
            text,
            timestamp: new Date(),
        };

        try {
            const voiceResponse = await processVoiceQuery(query);
            setResponse(voiceResponse);
            setIsProcessing(false);

            // Speak the response
            setIsSpeaking(true);
            speak(voiceResponse.text);

            // Reset speaking state after a delay
            setTimeout(() => {
                setIsSpeaking(false);
            }, (voiceResponse.text.length / 10) * 1000); // Rough estimate
        } catch (err) {
            setError('Failed to process your query');
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                data-voice-assistant-trigger
                className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                transition={isListening ? { duration: 1, repeat: Infinity } : {}}
            >
                {isOpen ? (
                    <X className="w-8 h-8 text-white" />
                ) : (
                    <Mic className="w-8 h-8 text-white" />
                )}
            </motion.button>

            {/* Assistant Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-28 right-8 z-40 w-96 max-w-[calc(100vw-4rem)]"
                    >
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Mic className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Voice Assistant</h3>
                                    <p className="text-sm text-white/60">How can I help you?</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-6">
                                {isListening && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-8"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center"
                                        >
                                            <Mic className="w-8 h-8 text-white" />
                                        </motion.div>
                                        <p className="text-white">Listening...</p>
                                    </motion.div>
                                )}

                                {isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-8"
                                    >
                                        <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                                        <p className="text-white">Processing...</p>
                                    </motion.div>
                                )}

                                {isSpeaking && response && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-2 text-purple-400 mb-4"
                                    >
                                        <Volume2 className="w-5 h-5 animate-pulse" />
                                        <span className="text-sm">Speaking...</span>
                                    </motion.div>
                                )}

                                {transcript && !isProcessing && (
                                    <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                                        <div className="text-xs text-white/60 mb-1">You said:</div>
                                        <div className="text-white">{transcript}</div>
                                    </div>
                                )}

                                {response && !isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30"
                                    >
                                        <div className="text-xs text-purple-300 mb-2">Response:</div>
                                        <div className="text-white/90 text-sm leading-relaxed">{response.text}</div>
                                    </motion.div>
                                )}

                                {error && (
                                    <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                                        <div className="text-red-300 text-sm">{error}</div>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            {!isListening && !isProcessing && (
                                <motion.button
                                    onClick={handleStartListening}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Mic className="w-5 h-5" />
                                    {response ? 'Ask Again' : 'Start Speaking'}
                                </motion.button>
                            )}
                        </div>

                        {/* Example Questions */}
                        {!transcript && !response && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mt-4 text-xs text-white/40 text-center space-y-1"
                            >
                                <div>Try asking:</div>
                                <div>"How does Smart Care work?"</div>
                                <div>"Tell me about emotion detection"</div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
