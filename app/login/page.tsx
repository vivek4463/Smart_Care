'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For demo purposes, directly navigate to dashboard
        localStorage.setItem('user', JSON.stringify({
            name: formData.name || formData.email.split('@')[0],
            email: formData.email,
        }));
        router.push('/dashboard');
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
                    animate={{
                        y: [0, 100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
                    animate={{
                        y: [0, -100, 0],
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.div
                className="max-w-md w-full relative z-10"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
            >
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    variants={fadeIn}
                >
                    <motion.div
                        className="inline-flex items-center justify-center mb-4"
                        animate={{
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Sparkles className="w-12 h-12 text-purple-400" />
                    </motion.div>

                    <h1 className="text-5xl font-bold mb-2 text-gradient">
                        {isLogin ? 'Welcome Back' : 'Join Smart Care'}
                    </h1>
                    <p className="text-white/60">
                        {isLogin ? 'Continue your wellness journey' : 'Start your journey to emotional wellness'}
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    className="glass-card p-8"
                    variants={fadeIn}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field pl-12"
                                        placeholder="Enter your name"
                                        required={!isLogin}
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            className="w-full btn-primary flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </motion.div>

                {/* Quick Demo Access */}
                <motion.div
                    className="mt-6 text-center"
                    variants={fadeIn}
                >
                    <button
                        onClick={() => {
                            localStorage.setItem('user', JSON.stringify({
                                name: 'Demo User',
                                email: 'demo@smartcare.com',
                            }));
                            router.push('/dashboard');
                        }}
                        className="text-white/60 hover:text-white/90 transition-colors text-sm underline"
                    >
                        Continue as Guest (Demo Mode)
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
