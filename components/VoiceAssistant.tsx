'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Volume2, Loader, Send, Globe } from 'lucide-react';
import { processVoiceQuery, speak, startListening, Language } from '@/lib/voiceAssistant';
import { VoiceQuery, VoiceResponse } from '@/lib/types';
import { getLocalStorage, setLocalStorage } from '@/lib/utils/storage';

export default function VoiceAssistant() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [textInput, setTextInput] = useState('');
    const [response, setResponse] = useState<VoiceResponse | null>(null);
    const [error, setError] = useState('');
    const [conversationHistory, setConversationHistory] = useState<{ query: string; response: string }[]>([]);

    // Load language preference on mount
    useEffect(() => {
        const savedLang = getLocalStorage('voiceAssistantLanguage') as Language;
        if (savedLang) {
            setSelectedLanguage(savedLang);
        }
    }, []);

    // Show language modal on first open
    useEffect(() => {
        if (isOpen) {
            const hasSeenModal = getLocalStorage('voiceAssistantLanguageSet');
            if (!hasSeenModal) {
                setShowLanguageModal(true);
            }
        }
    }, [isOpen]);

    const handleLanguageSelect = (lang: Language) => {
        setSelectedLanguage(lang);
        setLocalStorage('voiceAssistantLanguage', lang);
        setLocalStorage('voiceAssistantLanguageSet', 'true');
        setShowLanguageModal(false);
    };

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
                setError(selectedLanguage === 'te'
                    ? 'మిమ్మల్ని వినలేకపోయాను. దయచేసి మళ్లీ ప్రయత్నించండి.'
                    : 'Could not hear you. Please try again.');
                setIsListening(false);
            },
            selectedLanguage
        );

        if (!recognition) {
            setError(selectedLanguage === 'te'
                ? 'మీ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ మద్దతు లేదు'
                : 'Speech recognition is not supported in your browser');
            setIsListening(false);
        }
    };

    const handleTextSubmit = () => {
        if (!textInput.trim()) return;

        setTranscript(textInput);
        handleProcessQuery(textInput);
        setTextInput('');
    };

    const handleProcessQuery = async (text: string) => {
        setIsProcessing(true);

        const query: VoiceQuery = {
            text,
            timestamp: new Date(),
        };

        try {
            const res = await processVoiceQuery(query, selectedLanguage, (path) => {
                // Navigation callback
                router.push(path);
            });

            setResponse(res);
            setConversationHistory(prev => [...prev, { query: text, response: res.text }]);

            // Speak response
            setIsSpeaking(true);
            speak(res.text, selectedLanguage);

            // Speech ends after some time (approximate)
            setTimeout(() => {
                setIsSpeaking(false);
            }, res.text.length * 50);

        } catch (err) {
            setError(selectedLanguage === 'te'
                ? 'ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
                : 'Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                transition={isListening ? { duration: 1, repeat: Infinity } : {}}
                data-voice-assistant-trigger
            >
                {isOpen ? (
                    <X className="w-8 h-8 text-white" />
                ) : (
                    <Mic className="w-8 h-8 text-white" />
                )}
            </motion.button>

            {/* Language Selection Modal */}
            <AnimatePresence>
                {showLanguageModal && (
                    <motion.div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLanguageModal(false)} />

                        <motion.div
                            className="glass-card p-8 max-w-md w-full relative z-10"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <div className="text-center mb-6">
                                <Globe className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Select Language / భాషను ఎంచుకోండి
                                </h2>
                                <p className="text-white/60">
                                    Choose your preferred language for voice assistant
                                </p>
                            </div>

                            <div className="space-y-3">
                                <motion.button
                                    onClick={() => handleLanguageSelect('en')}
                                    className="w-full btn-primary py-4 text-lg"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    🇬🇧 English
                                </motion.button>

                                <motion.button
                                    onClick={() => handleLanguageSelect('te')}
                                    className="w-full btn-primary py-4 text-lg"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    🇮🇳 తెలుగు (Telugu)
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assistant Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-28 right-8 z-50 w-96 glass-card p-6 max-h-[600px] flex flex-col"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                                <h3 className="text-lg font-semibold text-white">
                                    {selectedLanguage === 'te' ? 'AI అసిస్టెంట్' : 'AI Assistant'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowLanguageModal(true)}
                                className="text-white/60 hover:text-white/90 transition-colors"
                                title="Change Language"
                            >
                                <Globe className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Conversation History */}
                        <div className="flex-1 overflow-y-auto mb-4 space-y-3 custom-scrollbar">
                            {conversationHistory.length === 0 && !transcript && (
                                <div className="text-center text-white/60 py-8">
                                    <Mic className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                                    <p className="text-sm">
                                        {selectedLanguage === 'te'
                                            ? 'మీ ప్రశ్నను అడగడానికి మైక్రోఫోన్ నొక్కండి లేదా టైప్ చేయండి'
                                            : 'Tap the microphone or type your question'}
                                    </p>
                                </div>
                            )}

                            {conversationHistory.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="bg-purple-500/20 rounded-lg p-3 ml-8">
                                        <p className="text-white text-sm">{item.query}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 mr-8">
                                        <p className="text-white/90 text-sm whitespace-pre-line">{item.response}</p>
                                    </div>
                                </div>
                            ))}

                            {transcript && (
                                <div className="bg-purple-500/20 rounded-lg p-3 ml-8">
                                    <p className="text-white text-sm">{transcript}</p>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="flex items-center gap-2 text-white/60">
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">
                                        {selectedLanguage === 'te' ? 'ప్రాసెస్ చేస్తోంది...' : 'Processing...'}
                                    </span>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="space-y-3">
                            {/* Text Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                                    placeholder={selectedLanguage === 'te'
                                        ? 'మీ ప్రశ్నను టైప్ చేయండి...'
                                        : 'Type your question...'}
                                    className="flex-1 input-field py-2"
                                    disabled={isListening || isProcessing}
                                />
                                <motion.button
                                    onClick={handleTextSubmit}
                                    className="btn-primary px-4"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!textInput.trim() || isProcessing}
                                >
                                    <Send className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* Voice Button */}
                            <motion.button
                                onClick={handleStartListening}
                                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${isListening
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isProcessing}
                            >
                                {isListening ? (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-white">
                                            {selectedLanguage === 'te' ? 'వింటోంది...' : 'Listening...'}
                                        </span>
                                    </>
                                ) : isSpeaking ? (
                                    <>
                                        <Volume2 className="w-5 h-5 text-white" />
                                        <span className="text-white">
                                            {selectedLanguage === 'te' ? 'మాట్లాడుతోంది...' : 'Speaking...'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-5 h-5 text-white" />
                                        <span className="text-white">
                                            {selectedLanguage === 'te' ? 'మైక్రోఫోన్ నొక్కండి' : 'Tap to Speak'}
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
