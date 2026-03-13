"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, Volume2, Music, Sparkles, Heart, Activity } from "lucide-react";
import { musicGenerator, MOOD_MAPPINGS } from "@/lib/musicGeneration";

interface MusicPlayerProps {
  emotion: string;
}

export default function MusicPlayer({ emotion }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [duration, setDuration] = useState(30); // Default for AI, 60 for local synth
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const params = MOOD_MAPPINGS[emotion] || MOOD_MAPPINGS["Neutral"];

  const togglePlayback = useCallback(async () => {
    const newState = !isPlaying;
    
    if (newState) {
      if (aiAudioUrl && audioRef.current) {
        audioRef.current.volume = volume;
        await audioRef.current.play();
      } else {
        musicGenerator.setVolume(volume);
        await musicGenerator.start(emotion);
      }
    } else {
      if (aiAudioUrl && audioRef.current) {
        audioRef.current.pause();
      } else {
        musicGenerator.stop();
      }
    }
    setIsPlaying(newState);
  }, [isPlaying, aiAudioUrl, volume, emotion]);

  // 1. Progress Tracking Engine
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (aiAudioUrl && audioRef.current) {
            const audio = audioRef.current;
            if (audio.duration) {
              return (audio.currentTime / audio.duration) * 100;
            }
          }
          return prev >= 100 ? 0 : prev + 0.2;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, aiAudioUrl]);

  // AI Command Listener
  useEffect(() => {
    const handleAiCommand = (e: any) => {
      console.log("System Event Received:", e.detail?.command);
      if (e.detail?.command === 'PLAY_MUSIC') {
        if (!isPlaying) {
          console.log("AI Command: Initiating Harmonic Injection...");
          togglePlayback();
        } else {
          console.log("AI Command: Already Resonating. Maintaining playback.");
        }
      }
    };

    window.addEventListener('smartcare-ai-command', handleAiCommand);
    return () => window.removeEventListener('smartcare-ai-command', handleAiCommand);
  }, [isPlaying, emotion, aiAudioUrl, togglePlayback]);

  // 2. Robust Autoplay Effect
  useEffect(() => {
    if (aiAudioUrl && audioRef.current) {
      console.log("AI Audio Payload Detected, triggering sequence...");
      musicGenerator.stop();
      
      const playAudio = async () => {
        try {
          if (audioRef.current) {
            audioRef.current.volume = volume;
            await audioRef.current.play();
            setIsPlaying(true);
          }
        } catch (err) {
          console.error("Autoplay failed:", err);
          setIsPlaying(false);
        }
      };
      
      playAudio();
    }
  }, [aiAudioUrl, volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (aiAudioUrl && audioRef.current) {
      audioRef.current.volume = val;
    } else {
      musicGenerator.setVolume(val);
    }
  };

  const generateAiMusic = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion }),
      });
      const data = await res.json();
      
      console.log("Music API Response:", data);

      if (data.audioUrl) {
        setAiAudioUrl(data.audioUrl);
      } else {
        throw new Error(data.error || "Empty audio payload");
      }
    } catch (error) {
      console.error('Music generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [emotion, isGenerating]);

  const switchToLocal = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setAiAudioUrl(null);
    setIsPlaying(false);
    setProgress(0);
    console.log("Reverting to Local Synthesis");
  }, []);

  // 3. Default AI Generation Effect
  useEffect(() => {
    // Auto-generate AI music on mount or whenever emotion changes
    // But only if we don't already have an AI URL for THIS specific emotion
    console.log("Neural Core: Analyzing resonance for mood ->", emotion);
    generateAiMusic();
  }, [emotion]); // Removed generateAiMusic from deps to avoid infinite loop if it's not perfectly stable, but with useCallback it should be fine. Actually, emotion is the key trigger.

  const formatTime = (percent: number, totalSeconds: number) => {
    const currentSeconds = Math.floor((percent / 100) * totalSeconds);
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="premium-card p-6 md:p-10 space-y-6 md:space-y-8 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-mint opacity-20 group-hover:opacity-100 transition-opacity" />
      
      {aiAudioUrl && (
        <audio 
          ref={audioRef}
          src={aiAudioUrl} 
          loop 
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
        <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
          <div className="absolute inset-0 bg-brand-cyan/10 rounded-[2rem] md:rounded-[2.5rem] animate-pulse" />
          <div className="absolute inset-3 md:inset-4 rounded-[1.5rem] md:rounded-[2rem] glass-morphism border-white/10 flex items-center justify-center overflow-hidden">
            <motion.div 
              animate={{ 
                scale: isPlaying ? [1, 1.05, 1] : 1,
                rotate: isPlaying ? 360 : 0
              }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="w-full h-full p-6"
            >
              <div className="w-full h-full rounded-full border-4 border-dashed border-brand-cyan/20 flex items-center justify-center relative">
                 <Music className={`${isPlaying ? 'text-brand-mint' : 'text-brand-cyan'} w-8 h-8 md:w-12 md:h-12 transition-colors duration-500`} />
                 {isPlaying && (
                   <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-full border-2 border-brand-mint animate-ping"
                   />
                 )}
              </div>
            </motion.div>
            
            <div className="absolute bottom-4 md:bottom-6 flex items-end gap-1 px-4 w-full justify-center">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: isPlaying ? [4, 16, 4] : 4 }}
                  transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                  className={`w-0.5 md:w-1 ${aiAudioUrl ? 'bg-brand-mint/60' : 'bg-brand-cyan/40'} rounded-full`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left w-full">
          <div className="space-y-2 md:space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
              <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-brand-cyan/10 text-brand-cyan text-[8px] md:text-[10px] font-black tracking-widest uppercase border border-brand-cyan/20 flex items-center gap-2">
                {aiAudioUrl ? (
                  <>
                    <Sparkles className="w-2.5 h-2.5" />
                    Neural Composition • {formatTime(100, duration)}
                  </>
                ) : (
                  <>
                    <Activity className="w-2.5 h-2.5" />
                    Therapeutic resonance
                  </>
                )}
              </span>
              
              {aiAudioUrl ? (
                <button 
                  onClick={switchToLocal}
                  className="flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase bg-white/5 text-white/40 hover:bg-white/10 hover:text-brand-cyan border border-white/5 transition-all"
                >
                  Neural Mode Active • Switch to local
                </button>
              ) : (
                <button 
                  onClick={generateAiMusic}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,255,185,0.1)] ${isGenerating ? 'bg-brand-mint/20 text-brand-mint animate-pulse' : 'bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 border border-brand-mint/30'}`}
                >
                  <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  {isGenerating ? 'Recalibrating Neural Model...' : 'Trigger Neural Recovery'}
                </button>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight md:leading-[0.9]">
                {aiAudioUrl ? 'AI-GENERATED' : params.instrument} <span className="text-brand-cyan">SYMPHONY</span>
              </h3>
              <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-wider">
                Artist: <span className="text-white/60">Neural Core v4.5</span> • Album: <span className="text-white/60">Smart Session</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-[8px] md:text-[10px] font-black text-white/20 tabular-nums">
                  {formatTime(progress, aiAudioUrl ? duration : 60)}
                </span>
                <div className="relative flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden cursor-pointer group/progress">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full relative z-10 ${aiAudioUrl ? 'bg-brand-mint shadow-[0_0_10px_rgba(0,255,185,0.5)]' : 'bg-brand-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]'}`}
                  />
                  <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover/progress:scale-x-100 origin-left transition-transform duration-300" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-white/20 tabular-nums">
                  {aiAudioUrl ? formatTime(100, duration) : 'LIVE'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-10">
              <button 
                onClick={togglePlayback}
                disabled={isGenerating}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none border-4 ${aiAudioUrl ? 'bg-brand-mint text-brand-teal border-brand-mint/20 shadow-brand-mint/20' : 'bg-white text-brand-teal border-white/20 shadow-white/20'}`}
              >
                {isPlaying ? <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" /> : <Play className="w-6 h-6 md:w-8 md:h-8 fill-current translate-x-1" />}
              </button>
              
              <div className="flex items-center gap-6 md:gap-8 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 group/vol">
                  <Volume2 className="w-4 h-4 text-white/20 group-hover/vol:text-brand-cyan transition-colors" />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 md:w-28 accent-brand-cyan bg-white/10 rounded-full h-1 appearance-none cursor-pointer"
                  />
                </div>
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`transition-all ${isLiked ? 'text-red-500 scale-125' : 'text-white/20 hover:text-white'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
