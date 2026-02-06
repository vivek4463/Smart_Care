'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, Music, TrendingUp, ArrowLeft, Trash2 } from 'lucide-react';

interface SessionData {
    id: string;
    date: Date;
    emotion: string;
    musicGenerated: boolean;
    satisfaction?: number;
}

export default function SessionHistoryPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<SessionData[]>([]);

    useEffect(() => {
        // Load sessions from localStorage
        const storedSessions = localStorage.getItem('sessionHistory');
        if (storedSessions) {
            const parsed = JSON.parse(storedSessions);
            setSessions(parsed.map((s: any) => ({ ...s, date: new Date(s.date) })));
        } else {
            // Create sample data if none exists
            const sampleSessions: SessionData[] = [
                {
                    id: '1',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    emotion: 'Happy',
                    musicGenerated: true,
                    satisfaction: 5
                },
                {
                    id: '2',
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    emotion: 'Calm',
                    musicGenerated: true,
                    satisfaction: 4
                },
            ];
            localStorage.setItem('sessionHistory', JSON.stringify(sampleSessions));
            setSessions(sampleSessions);
        }
    }, []);

    const deleteSession = (id: string) => {
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        localStorage.setItem('sessionHistory', JSON.stringify(updated));
    };

    const getEmotionColor = (emotion: string) => {
        const colors: Record<string, string> = {
            Happy: 'from-yellow-500 to-orange-500',
            Sad: 'from-blue-500 to-indigo-500',
            Calm: 'from-green-500 to-teal-500',
            Angry: 'from-red-500 to-pink-500',
            Neutral: 'from-gray-500 to-slate-500',
        };
        return colors[emotion] || 'from-purple-500 to-pink-500';
    };

    return (
        <div className="min-h-screen p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, -50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.div
                className="max-w-6xl mx-auto relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <motion.button
                        onClick={() => router.push('/dashboard')}
                        className="glass-card p-3 hover:bg-white/10"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </motion.button>

                    <div>
                        <h1 className="text-4xl font-bold text-gradient mb-2">
                            Session History
                        </h1>
                        <p className="text-white/60">
                            Track your progress and previous sessions
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">{sessions.length}</div>
                                <div className="text-sm text-white/60">Total Sessions</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">
                                    {sessions.filter(s => s.musicGenerated).length}
                                </div>
                                <div className="text-sm text-white/60">Music Generated</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">
                                    {sessions.filter(s => s.satisfaction && s.satisfaction >= 4).length}
                                </div>
                                <div className="text-sm text-white/60">Positive Sessions</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Sessions Yet</h3>
                            <p className="text-white/60 mb-6">
                                Start your first emotion detection session to see your history here
                            </p>
                            <motion.button
                                onClick={() => router.push('/detect-emotion')}
                                className="btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Session
                            </motion.button>
                        </div>
                    ) : (
                        sessions.map((session, index) => (
                            <motion.div
                                key={session.id}
                                className="glass-card p-6"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getEmotionColor(session.emotion)} flex items-center justify-center text-2xl`}>
                                            {session.emotion === 'Happy' ? '😊' :
                                                session.emotion === 'Sad' ? '😔' :
                                                    session.emotion === 'Calm' ? '😌' :
                                                        session.emotion === 'Angry' ? '😠' : '😐'}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-1">
                                                {session.emotion} Session
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                {session.date.toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                {session.musicGenerated && (
                                                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        Music Generated
                                                    </span>
                                                )}
                                                {session.satisfaction && (
                                                    <span className="text-xs text-yellow-400">
                                                        {'⭐'.repeat(session.satisfaction)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        onClick={() => deleteSession(session.id)}
                                        className="glass-card p-3 hover:bg-red-500/20 transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Trash2 className="w-5 h-5 text-red-400" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
