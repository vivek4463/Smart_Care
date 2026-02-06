'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Scan, Music, MessageCircle, History, Settings, LogOut, Sparkles } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
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
                            Welcome, {user.name}! 👋
                        </h1>
                        <p className="text-xl text-white/60">
                            Ready to enhance your emotional well-being?
                        </p>
                    </div>

                    <motion.button
                        onClick={() => {
                            localStorage.removeItem('user');
                            router.push('/login');
                        }}
                        className="glass-card p-4 hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut className="w-6 h-6 text-white/80" />
                    </motion.button>
                </motion.div>

                {/* Main Actions */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                    variants={staggerContainer}
                >
                    <ActionCard
                        icon={<Scan className="w-12 h-12" />}
                        title="Start Emotion Detection"
                        description="Begin your emotion analysis journey through multiple modalities"
                        gradient="from-purple-500 to-pink-500"
                        onClick={() => router.push('/detect-emotion')}
                        primary
                    />

                    <ActionCard
                        icon={<Music className="w-12 h-12" />}
                        title="Music Library"
                        description="Access your personalized therapeutic music collection"
                        gradient="from-blue-500 to-cyan-500"
                        onClick={() => router.push('/music')}
                    />
                </motion.div>

                {/* Secondary Actions */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={staggerContainer}
                >
                    <ActionCard
                        icon={<History className="w-8 h-8" />}
                        title="Session History"
                        description="Review past sessions and progress"
                        gradient="from-orange-500 to-yellow-500"
                        onClick={() => router.push('/history')}
                        small
                    />

                    <ActionCard
                        icon={<MessageCircle className="w-8 h-8" />}
                        title="Voice Assistant"
                        description="Chat with your AI wellness guide"
                        gradient="from-pink-500 to-rose-500"
                        onClick={() => {
                            // Trigger voice assistant by clicking the floating button
                            const voiceButton = document.querySelector('[data-voice-assistant-trigger]');
                            if (voiceButton instanceof HTMLElement) {
                                voiceButton.click();
                            }
                        }}
                        small
                    />

                    <ActionCard
                        icon={<Settings className="w-8 h-8" />}
                        title="Preferences"
                        description="Customize your experience"
                        gradient="from-indigo-500 to-purple-500"
                        onClick={() => router.push('/preferences')}
                        small
                    />
                </motion.div>

                {/* Info Section */}
                <motion.div
                    className="mt-12 glass-card p-8"
                    variants={fadeIn}
                >
                    <div className="flex items-start gap-4">
                        <Sparkles className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                How Smart Care Works
                            </h3>
                            <p className="text-white/70 leading-relaxed">
                                Our AI-powered system analyzes your emotions through multiple channels - facial expressions,
                                voice patterns, text input, and optional heart rate data. Based on this comprehensive analysis,
                                we generate personalized therapeutic music designed to support your emotional well-being.
                                Your feedback helps our system continuously improve and better serve your needs.
                            </p>
                        </div>
                    </div>
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
