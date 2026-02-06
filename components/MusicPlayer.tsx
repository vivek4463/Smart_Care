'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { GeneratedMusic } from '@/lib/types';

interface MusicPlayerProps {
    music: GeneratedMusic;
    onPlaybackComplete?: () => void;
}

export default function MusicPlayer({ music, onPlaybackComplete }: MusicPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const duration = music.duration;

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentTime((prev) => {
                    const newTime = prev + 0.1;
                    if (newTime >= duration) {
                        setIsPlaying(false);
                        if (onPlaybackComplete) {
                            onPlaybackComplete();
                        }
                        return duration;
                    }
                    return newTime;
                });
                setProgress((prev) => {
                    const newProgress = prev + (100 / (duration * 10));
                    return Math.min(newProgress, 100);
                });
            }, 100);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, duration, onPlaybackComplete]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="glass-card p-8">
            {/* Visualizer */}
            <div className="relative h-32 mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20">
                <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                            animate={
                                isPlaying
                                    ? {
                                        height: [
                                            `${20 + Math.random() * 60}%`,
                                            `${20 + Math.random() * 60}%`,
                                            `${20 + Math.random() * 60}%`,
                                        ],
                                    }
                                    : { height: '20%' }
                            }
                            transition={{
                                duration: 0.5,
                                repeat: isPlaying ? Infinity : 0,
                                delay: i * 0.05,
                            }}
                        />
                    ))}
                </div>

                {/* Progress overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-transparent transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex justify-between text-sm text-white/60">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <motion.button
                    onClick={toggleMute}
                    className="glass-card p-4 hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isMuted ? (
                        <VolumeX className="w-6 h-6 text-white/60" />
                    ) : (
                        <Volume2 className="w-6 h-6 text-white/80" />
                    )}
                </motion.button>

                <motion.button
                    onClick={togglePlay}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" fill="white" />
                    ) : (
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    )}
                </motion.button>

                <div className="w-16" /> {/* Spacer for symmetry */}
            </div>

            {/* Music Info */}
            <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                    {music.config.tempo} BPM • {music.config.key} {music.config.mode} • {music.config.instruments.join(', ')}
                </p>
            </div>
        </div>
    );
}
