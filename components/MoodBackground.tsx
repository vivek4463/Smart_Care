'use client';

import { useMood } from '@/context/MoodContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function MoodBackground() {
    const { currentMood, moodTheme } = useMood();
    const [particles, setParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number; delay: number }>>([]);

    // Emoji mapping for different moods
    const moodEmojis: Record<string, string[]> = {
        happy: ['😊', '🌟', '✨', '💛', '🌈', '☀️', '🎉', '💫'],
        sad: ['💙', '🌧️', '💧', '🌙', '⭐', '🌊', '💤', '🕊️'],
        angry: ['🔥', '⚡', '💢', '🌪️', '💥', '⭕', '🔴', '💨'],
        fearful: ['💜', '🌌', '🔮', '💠', '🌠', '✨', '🦋', '🌙'],
        neutral: ['💜', '⚪', '🔵', '💎', '⭐', '✨', '🌟', '💫'],
        surprised: ['⚡', '💥', '🎆', '✨', '🌟', '💫', '🎊', '🎈'],
        disgusted: ['🌿', '🍃', '💚', '🌱', '🌲', '🌺', '🌸', '🦋']
    };

    useEffect(() => {
        if (!currentMood) return;

        const emojis = moodEmojis[currentMood] || moodEmojis.neutral;
        const newParticles = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 2
        }));

        setParticles(newParticles);
    }, [currentMood]);

    if (!currentMood) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    background: moodTheme.background,
                    backgroundSize: '400% 400%'
                }}
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />

            {/* Floating emoji particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute text-4xl opacity-20"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.sin(particle.id) * 20, 0],
                        rotate: [0, 360],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 8 + particle.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: particle.delay
                    }}
                >
                    {particle.emoji}
                </motion.div>
            ))}

            {/* Mood-specific gradient orbs */}
            <motion.div
                className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, ${moodTheme.primary}40, transparent)`
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />

            <motion.div
                className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, ${moodTheme.secondary}40, transparent)`
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1
                }}
            />
        </div>
    );
}
