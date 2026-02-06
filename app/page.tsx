'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Music, Heart, Brain, Mic } from 'lucide-react';

export default function WelcomePage() {
    const router = useRouter();

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            <motion.div
                className="max-w-5xl w-full relative z-10"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {/* Logo / Brand */}
                <motion.div
                    className="text-center mb-12"
                    variants={fadeIn}
                >
                    <motion.div
                        className="inline-flex items-center justify-center mb-6"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="relative">
                            <Heart className="w-20 h-20 text-pink-500" fill="currentColor" />
                            <Music className="w-10 h-10 text-purple-400 absolute top-0 right-0 animate-pulse" />
                        </div>
                    </motion.div>

                    <motion.h1
                        className="text-7xl md:text-8xl font-bold mb-4 text-gradient"
                        variants={fadeIn}
                    >
                        Smart Care
                    </motion.h1>

                    <motion.p
                        className="text-2xl md:text-3xl text-purple-300/80 font-light"
                        variants={fadeIn}
                    >
                        AI-Powered Music Therapy
                    </motion.p>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    className="glass-card p-10 md:p-16 text-center mb-8"
                    variants={fadeIn}
                >
                    <motion.p
                        className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
                        variants={fadeIn}
                    >
                        Experience the power of <span className="text-gradient-sunset font-semibold">multimodal emotion detection</span>
                        {' '}and <span className="text-gradient-ocean font-semibold">personalized AI music</span> to enhance your mental well-being
                    </motion.p>

                    {/* Features Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
                        variants={staggerContainer}
                    >
                        <FeatureCard
                            icon={<Brain className="w-8 h-8" />}
                            title="Emotion Detection"
                            description="Face, voice, text & heart rate analysis"
                            gradient="from-purple-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={<Music className="w-8 h-8" />}
                            title="AI Music"
                            description="Personalized therapeutic compositions"
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={<Mic className="w-8 h-8" />}
                            title="Voice Assistant"
                            description="Interactive voice guidance"
                            gradient="from-pink-500 to-rose-500"
                        />
                        <FeatureCard
                            icon={<Sparkles className="w-8 h-8" />}
                            title="Self-Learning"
                            description="Continuous improvement from feedback"
                            gradient="from-orange-500 to-yellow-500"
                        />
                    </motion.div>

                    <motion.button
                        onClick={() => router.push('/login')}
                        className="btn-primary text-lg px-12 py-5"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={fadeIn}
                    >
                        Get Started
                    </motion.button>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-white/40 text-sm"
                    variants={fadeIn}
                >
                    Your journey to emotional wellness begins here
                </motion.p>
            </motion.div>
        </div>
    );
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
    return (
        <motion.div
            className="glass-card p-6 text-center group cursor-pointer"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform`}>
                <div className="text-white">
                    {icon}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/60">{description}</p>
        </motion.div>
    );
}
