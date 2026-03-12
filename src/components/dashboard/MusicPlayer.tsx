"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, Volume2, Music, Sparkles, Heart } from "lucide-react";
import { musicGenerator, MOOD_MAPPINGS } from "@/lib/musicGeneration";

interface MusicPlayerProps {
  emotion: string;
}

export default function MusicPlayer({ emotion }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const params = MOOD_MAPPINGS[emotion] || MOOD_MAPPINGS["Neutral"];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayback = async () => {
    if (isPlaying) {
      musicGenerator.stop();
    } else {
      await musicGenerator.start(emotion);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="premium-card p-10 space-y-8 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-mint opacity-20 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
        {/* Album Art / Visualizer Simulation */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <div className="absolute inset-0 bg-brand-cyan/10 rounded-[2.5rem] animate-pulse" />
          <div className="absolute inset-4 rounded-[2rem] glass-morphism border-white/10 flex items-center justify-center overflow-hidden">
            <motion.div 
              animate={{ 
                scale: isPlaying ? [1, 1.1, 1] : 1,
                rotate: isPlaying ? 360 : 0
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="w-20 h-20 rounded-full border-2 border-brand-cyan/20 flex items-center justify-center p-2"
            >
              <Music className="w-10 h-10 text-brand-cyan" />
            </motion.div>
            
            {/* Visualizer Bars */}
            <div className="absolute bottom-6 flex items-end gap-1 px-4 w-full justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: isPlaying ? [4, 20, 4] : 4 }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1 bg-brand-cyan/40 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan text-[10px] font-black tracking-widest uppercase border border-brand-cyan/20">
                Recommended Therapy
              </span>
              <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter leading-tight">
              {params.instrument} Resonance for <span className="text-gradient">{emotion}</span>
            </h3>
            <p className="text-sm text-white/40 font-medium">
              Adaptive therapeutic frequency modulated at {params.bpm} BPM
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/20 tabular-nums">01:42</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-brand-cyan to-brand-mint"
                />
              </div>
              <span className="text-[10px] font-black text-white/20 tabular-nums">03:00</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8">
              <button className="text-white/20 hover:text-white transition-colors">
                <SkipForward className="w-6 h-6 rotate-180" />
              </button>
              <button 
                onClick={togglePlayback}
                className="w-20 h-20 rounded-full bg-white text-brand-teal flex items-center justify-center shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
              </button>
              <button className="text-white/20 hover:text-white transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-white/40 border-l border-white/10 pl-8 ml-4">
                <Volume2 className="w-5 h-5" />
                <div className="w-24 h-1 bg-white/10 rounded-full">
                  <div className="w-2/3 h-full bg-brand-cyan rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="absolute top-10 right-10 p-4 rounded-2xl glass-morphism border-white/5 text-white/20 hover:text-red-400 hover:border-red-400/20 transition-all group/heart">
          <Heart className="w-6 h-6 group-hover/heart:fill-current" />
        </button>
      </div>
    </div>
  );
}
