'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Bell, Moon, Sun, Palette, Save, Check } from 'lucide-react';

interface Preferences {
    theme: 'dark' | 'light';
    volume: number;
    notifications: boolean;
    autoPlayMusic: boolean;
    musicDuration: number;
}

export default function PreferencesPage() {
    const router = useRouter();
    const [preferences, setPreferences] = useState<Preferences>({
        theme: 'dark',
        volume: 80,
        notifications: true,
        autoPlayMusic: false,
        musicDuration: 150
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('preferences');
        if (stored) {
            setPreferences(JSON.parse(stored));
        }
    }, []);

    const savePreferences = () => {
        localStorage.setItem('preferences', JSON.stringify(preferences));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/3 right-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.div
                className="max-w-4xl mx-auto relative z-10"
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
                            Preferences
                        </h1>
                        <p className="text-white/60">
                            Customize your Smart Care experience
                        </p>
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-6">
                    {/* Theme */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Palette className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Theme</h3>
                                <p className="text-sm text-white/60">Choose your preferred theme</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                                className={`p-4 rounded-xl border-2 transition-all ${preferences.theme === 'dark'
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-white/10 bg-white/5'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Moon className="w-8 h-8 text-white mx-auto mb-2" />
                                <div className="text-white font-medium">Dark</div>
                            </motion.button>

                            <motion.button
                                onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                                className={`p-4 rounded-xl border-2 transition-all ${preferences.theme === 'light'
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-white/10 bg-white/5'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Sun className="w-8 h-8 text-white mx-auto mb-2" />
                                <div className="text-white font-medium">Light</div>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Volume */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Volume2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white">Music Volume</h3>
                                <p className="text-sm text-white/60">Default volume level for music playback</p>
                            </div>
                            <div className="text-2xl font-bold text-white">{preferences.volume}%</div>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={preferences.volume}
                            onChange={(e) => setPreferences({ ...preferences, volume: parseInt(e.target.value) })}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Notifications</h3>
                                    <p className="text-sm text-white/60">Receive session reminders and updates</p>
                                </div>
                            </div>

                            <motion.button
                                onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                                className={`relative w-16 h-8 rounded-full transition-colors ${preferences.notifications ? 'bg-purple-500' : 'bg-white/20'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
                                    animate={{ x: preferences.notifications ? 32 : 0 }}
                                />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Auto-play Music */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-1">Auto-play Music</h3>
                                <p className="text-sm text-white/60">Automatically play music after generation</p>
                            </div>

                            <motion.button
                                onClick={() => setPreferences({ ...preferences, autoPlayMusic: !preferences.autoPlayMusic })}
                                className={`relative w-16 h-8 rounded-full transition-colors ${preferences.autoPlayMusic ? 'bg-purple-500' : 'bg-white/20'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
                                    animate={{ x: preferences.autoPlayMusic ? 32 : 0 }}
                                />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Music Duration */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-white mb-1">Music Duration</h3>
                            <p className="text-sm text-white/60">
                                Length of generated music ({Math.floor(preferences.musicDuration / 60)} min {preferences.musicDuration % 60} sec)
                            </p>
                        </div>

                        <div className="flex gap-4">
                            {[60, 90, 120, 150, 180].map((duration) => (
                                <motion.button
                                    key={duration}
                                    onClick={() => setPreferences({ ...preferences, musicDuration: duration })}
                                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${preferences.musicDuration === duration
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-white/10 bg-white/5'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="text-white font-medium">{Math.floor(duration / 60)} min</div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Save Button */}
                <motion.button
                    onClick={savePreferences}
                    className="mt-8 w-full btn-primary flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {saved ? (
                        <>
                            <Check className="w-5 h-5" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Preferences
                        </>
                    )}
                </motion.button>
            </motion.div >

            {/* Custom Styles for Slider */}
            < style jsx > {`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    cursor: pointer;
                }

                .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    cursor: pointer;
                    border: none;
                }
            `}</style >
        </div >
    );
}
