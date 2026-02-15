'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EmotionType } from '@/lib/types';

export interface MoodTheme {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    gradient: string;
    glowColor: string;
    animation: 'calm' | 'energetic' | 'intense' | 'gentle' | 'balanced';
    particleColor: string;
}

interface MoodContextType {
    currentMood: EmotionType | null;
    moodTheme: MoodTheme;
    setMood: (mood: EmotionType) => void;
    clearMood: () => void;
}

// Emotion to theme mapping for therapeutic UI
const getMoodTheme = (emotion: EmotionType): MoodTheme => {
    const themes: Record<EmotionType, MoodTheme> = {
        happy: {
            primary: '#fbbf24', // Warm yellow
            secondary: '#f59e0b', // Amber
            background: 'linear-gradient(-45deg, #1a1410, #2d1f0a, #3d2a0f, #4a3416)',
            accent: '#fcd34d',
            gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            glowColor: 'rgba(251, 191, 36, 0.5)',
            animation: 'energetic',
            particleColor: '#fcd34d'
        },
        sad: {
            primary: '#60a5fa', // Soft blue
            secondary: '#818cf8', // Lavender
            background: 'linear-gradient(-45deg, #0a0e1a, #0f1629, #151d38, #1a2440)',
            accent: '#93c5fd',
            gradient: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)',
            glowColor: 'rgba(96, 165, 250, 0.4)',
            animation: 'gentle',
            particleColor: '#93c5fd'
        },
        angry: {
            primary: '#ef4444', // Deep red
            secondary: '#dc2626', // Crimson
            background: 'linear-gradient(-45deg, #1a0a0e, #2d0f16, #3d151e, #4a1a26)',
            accent: '#f87171',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            glowColor: 'rgba(239, 68, 68, 0.5)',
            animation: 'intense',
            particleColor: '#f87171'
        },
        fearful: {
            primary: '#8b5cf6', // Muted purple
            secondary: '#6366f1', // Indigo
            background: 'linear-gradient(-45deg, #0e0a1a, #16102d, #1e1640, #261c4a)',
            accent: '#a78bfa',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            glowColor: 'rgba(139, 92, 246, 0.4)',
            animation: 'gentle',
            particleColor: '#a78bfa'
        },
        neutral: {
            primary: '#667eea', // Balanced violet
            secondary: '#764ba2', // Purple
            background: 'linear-gradient(-45deg, #0a0118, #1a0a2e, #16213e, #0f3460)',
            accent: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            glowColor: 'rgba(139, 92, 246, 0.5)',
            animation: 'balanced',
            particleColor: '#8b5cf6'
        },
        surprised: {
            primary: '#06b6d4', // Electric cyan
            secondary: '#ec4899', // Bright pink
            background: 'linear-gradient(-45deg, #0a1419, #0f1e2d, #152838, #1a3440)',
            accent: '#22d3ee',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #ec4899 100%)',
            glowColor: 'rgba(6, 182, 212, 0.5)',
            animation: 'energetic',
            particleColor: '#22d3ee'
        },
        disgusted: {
            primary: '#10b981', // Fresh green
            secondary: '#059669', // Emerald
            background: 'linear-gradient(-45deg, #0a1a14, #0f2d1e, #153828, #1a4a34)',
            accent: '#34d399',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            glowColor: 'rgba(16, 185, 129, 0.4)',
            animation: 'calm',
            particleColor: '#34d399'
        }
    };

    return themes[emotion] || themes.neutral;
};

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
    const [currentMood, setCurrentMood] = useState<EmotionType | null>(null);
    const [moodTheme, setMoodTheme] = useState<MoodTheme>(getMoodTheme('neutral'));

    // Load mood from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('currentMood');
        if (stored) {
            try {
                setCurrentMood(stored as EmotionType);
            } catch (error) {
                console.error('Failed to load mood:', error);
            }
        }
    }, []);

    // Update theme when mood changes
    useEffect(() => {
        if (currentMood) {
            const newTheme = getMoodTheme(currentMood);
            setMoodTheme(newTheme);

            // Apply CSS variables to document root
            if (typeof document !== 'undefined') {
                const root = document.documentElement;
                root.style.setProperty('--mood-primary', newTheme.primary);
                root.style.setProperty('--mood-secondary', newTheme.secondary);
                root.style.setProperty('--mood-accent', newTheme.accent);
                root.style.setProperty('--mood-glow', newTheme.glowColor);
                root.style.setProperty('--mood-particle', newTheme.particleColor);

                // Save to localStorage
                localStorage.setItem('currentMood', currentMood);
            }
        }
    }, [currentMood]);

    const setMood = (mood: EmotionType) => {
        setCurrentMood(mood);
    };

    const clearMood = () => {
        setCurrentMood(null);
        setMoodTheme(getMoodTheme('neutral'));
        localStorage.removeItem('currentMood');
    };

    return (
        <MoodContext.Provider value={{ currentMood, moodTheme, setMood, clearMood }}>
            {children}
        </MoodContext.Provider>
    );
}

export function useMood() {
    const context = useContext(MoodContext);
    if (context === undefined) {
        throw new Error('useMood must be used within a MoodProvider');
    }
    return context;
}
