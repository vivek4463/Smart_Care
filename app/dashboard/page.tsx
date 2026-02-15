'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Scan, Music, MessageCircle, History, Settings, LogOut, Sparkles } from 'lucide-react';
import { useMood } from '@/context/MoodContext';
import { getLocalStorage, removeLocalStorage } from '@/lib/utils/storage';

export default function DashboardPage() {
    const router = useRouter();
    const { currentMood } = useMood();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    // Mood-based greeting emojis
    const moodGreeting: Record<string, { emoji: string; message: string }> = {
        happy: { emoji: '😊✨', message: 'You\'re radiating positivity!' },
        sad: { emoji: '💙🌧️', message: 'Let\'s lift your spirits together' },
        angry: { emoji: '🔥💪', message: 'Channel that energy positively' },
        fearful: { emoji: '🌟💜', message: 'You\'re safe and supported here' },
        neutral: { emoji: '👋🌈', message: 'Ready to enhance your emotional well-being?' },
        surprised: { emoji: '⚡✨', message: 'Exciting things ahead!' },
        disgusted: { emoji: '🌿💚', message: 'Let\'s find your balance' }
    };

    const greeting = currentMood ? moodGreeting[currentMood] : moodGreeting.neutral;

    useEffect(() => {
        const userData = getLocalStorage('user');
        if (!userData) {
            router.push('/login');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.div
                className="max-w-7xl mx-auto relative z-10"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {/* Header */}
                <motion.div
                    className="flex justify-between items-start mb-12"
                    variants={fadeIn}
                >
                    <div>
                        <h1 className="text-5xl font-bold mb-2 text-gradient">
                            Welcome, {user.name}! {greeting.emoji}
                        </h1>
                        <p className="text-xl text-white/60">
                            {greeting.message}
                        </p>
                    </div>

                    <motion.button
                        onClick={() => {
                            removeLocalStorage('user');
                            router.push('/login');
                        }}
                        className="glass-card p-4 hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut className="w-6 h-6 text-white/80" />
                    </motion.button>
                </motion.div>

                {/* Main Action - New Therapy Session */}
                <motion.div variants={fadeIn} className="mb-8">
                    <motion.button
                        onClick={() => router.push('/therapy')}
                        className="w-full glass-card p-12 text-left group hover:scale-[1.01] transition-all duration-300 relative overflow-hidden"
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative">
                            <div className="flex items-start justify-between mb-6">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>
                            </div>

                            <h2 className="text-4xl font-bold text-gradient mb-3">
                                Start AI Therapy Session ✨
                            </h2>

                            <p className="text-xl text-white/70 mb-4">
                                Complete therapy session with emotion detection, personalized music, and progress tracking
                            </p>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Settings Action */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={staggerContainer}
                >
                    <ActionCard
                        icon={<History className="w-8 h-8" />}
                        title="Session History 📊"
                        description="Review past sessions and progress"
                        gradient="from-orange-500 to-yellow-500"
                        onClick={() => router.push('/history')}
                        small
                    />

                    <ActionCard
                        icon={<Settings className="w-8 h-8" />}
                        title="Privacy & Settings ⚙️"
                        description="Manage data, consent, and privacy"
                        gradient="from-indigo-500 to-purple-500"
                        onClick={() => router.push('/settings')}
                        small
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
    onClick: () => void;
    primary?: boolean;
    small?: boolean;
}

function ActionCard({ icon, title, description, gradient, onClick, primary, small }: ActionCardProps) {
    return (
        <motion.button
            onClick={onClick}
            className={`glass-card text-left ${primary ? 'p-10' : small ? 'p-6' : 'p-8'} group hover:scale-[1.02] transition-all duration-300`}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className={`inline-flex items-center justify-center ${primary ? 'w-20 h-20 mb-6' : small ? 'w-14 h-14 mb-4' : 'w-16 h-16 mb-5'} rounded-2xl bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform`}>
                <div className="text-white">
                    {icon}
                </div>
            </div>

            <h3 className={`${primary ? 'text-3xl' : small ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>
                {title}
            </h3>

            <p className={`${small ? 'text-sm' : 'text-base'} text-white/70`}>
                {description}
            </p>
        </motion.button>
    );
}
