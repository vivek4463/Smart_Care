"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Music, Play, Pause, SkipForward, Info, CheckCircle2, HeartPulse, Activity } from "lucide-react";
import { musicGenerator } from "@/lib/musicGeneration";
import dynamic from "next/dynamic";
import { useBiometrics } from "@/context/BiometricContext";

const VoiceAssistant = dynamic(() => import("@/components/VoiceAssistant"), { ssr: false });

export default function TherapyPage() {
  const { bpm } = useBiometrics();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(180); // 3 minutes
  const router = useRouter();
  const displayBpm = bpm;

  useEffect(() => {
    const data = localStorage.getItem("smart_care_session");
    if (data) setSessionData(JSON.parse(data));
  }, []);

  useEffect(() => {
    let interval: any;
    if (isPlaying && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      handleFinish();
    }
    return () => clearInterval(interval);
  }, [isPlaying, timer]);

  useEffect(() => {
    if (isPlaying && displayBpm) {
      musicGenerator.updateBpm(displayBpm);
    }
  }, [displayBpm, isPlaying]);

  const togglePlayback = () => {
    if (isPlaying) {
      musicGenerator.stop();
    } else {
      musicGenerator.start(sessionData?.final_emotion || sessionData?.face || "Neutral");
    }
    setIsPlaying(!isPlaying);
  };

  const handleFinish = () => {
    musicGenerator.stop();
    router.push("/feedback");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sessionData) return null;

  return (
    <main className="screen-fit bg-gradient-main p-6 sm:p-8 lg:p-10 relative overflow-hidden">
      {/* Immersive Session Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-cyan/5 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-mint/5 rounded-full blur-[160px] animate-pulse" />

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full overflow-hidden relative z-10">
      {/* Session Header Architecture */}
      <div className="w-full flex justify-between items-end mb-10 shrink-0">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 group"
          >
            <div className="p-4 rounded-2xl glass-morphism text-brand-cyan shadow-[0_0_30px_rgba(0,242,255,0.2)] group-hover:scale-110 transition-transform">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
                <span className="font-black tracking-[0.4em] uppercase text-[10px] text-brand-cyan/60">Therapeutic Cycle</span>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mt-1">
                    Neural <span className="text-gradient">Resonance</span>
                </h1>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-4">

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[2rem] glass-morphism border-white/5 flex flex-col items-center gap-4 min-w-[180px] shadow-[0_15px_40px_rgba(0,0,0,0.4)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-brand-cyan/5" />
            <div className="relative z-10 w-full space-y-3">
              <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Temporal Flow</span>
                  <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">{formatTime(timer)} LFT</span>
              </div>
              <div className="text-5xl font-black text-white tabular-nums tracking-tighter text-center">{formatTime(timer)}</div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timer / 180) * 100}%` }}
                  className="h-full bg-gradient-to-r from-brand-cyan to-brand-mint shadow-[0_0_15px_rgba(0,242,255,0.5)]"
                  transition={{ duration: 1, ease: "linear" }}
                  />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Immersive Player Control */}
        <div className="premium-card p-10 flex flex-col items-center justify-center gap-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/5 to-transparent pointer-events-none" />
          
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* Multi-layered Visualizer */}
            <motion.div 
              animate={{ 
                scale: isPlaying ? [1, 1.3, 1] : 1,
                opacity: isPlaying ? [0.1, 0.3, 0.1] : 0.05
              }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 bg-brand-cyan rounded-full blur-[80px]"
            />
            <motion.div 
              animate={{ 
                rotate: isPlaying ? 360 : 0,
                scale: isPlaying ? [1, 1.05, 1] : 1
              }}
              transition={{ rotate: { repeat: Infinity, duration: 10, ease: "linear" }, scale: { repeat: Infinity, duration: 2 } }}
              className="absolute inset-[-10px] border border-dashed border-brand-cyan/20 rounded-full"
            />
            
            <div className="w-full h-full rounded-full border-2 border-white/5 bg-white/5 backdrop-blur-3xl flex items-center justify-center relative z-10 shadow-2xl overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/10 via-transparent to-brand-mint/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <Music className={`w-16 h-16 md:w-24 md:h-24 text-brand-cyan transition-all duration-700 ${isPlaying ? 'opacity-100 drop-shadow-[0_0_20px_rgba(0,242,255,0.6)]' : 'opacity-20'}`} />
               
               {/* Orbital Beats */}
               {isPlaying && [1, 2, 3].map(i => (
                   <motion.div 
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3 + i, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-brand-cyan/5"
                   >
                       <div className="w-2 h-2 rounded-full bg-brand-cyan absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#00f2ff]" />
                   </motion.div>
               ))}
            </div>
          </div>

          <div className="text-center z-10 space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight italic">Synthesis Alpha-1</h2>
            <div className="flex items-center justify-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-mint shadow-[0_0_10px_#00ffcc]" />
                <p className="text-brand-mint text-[10px] font-black uppercase tracking-[0.4em]">Real-time Generative Flow</p>
            </div>
          </div>

          <div className="flex items-center gap-10 md:gap-14 z-10">
            <button className="p-4 rounded-2xl glass-morphism text-white/20 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all border border-transparent">
              <SkipForward className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
            </button>
            <button 
              onClick={togglePlayback}
              className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-brand-cyan text-brand-teal flex items-center justify-center shadow-[0_20px_50px_rgba(0,242,255,0.4)] hover:scale-110 active:scale-95 transition-all group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
              {isPlaying ? <Pause className="w-8 h-8 md:w-10 md:h-10 relative z-10" /> : <Play className="w-8 h-8 md:w-10 md:h-10 ml-1 relative z-10" />}
            </button>
            <button className="p-4 rounded-2xl glass-morphism text-white/20 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all border border-transparent">
              <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* AI Assistant Core Integration */}
        <div className="overflow-hidden premium-card !p-0 border-white/5">
          <VoiceAssistant currentMood={sessionData.face || "Neutral"} />
        </div>
      </div>

      {/* Finishing / Status Infrastructure */}
      <div className="w-full flex justify-between items-center py-6 border-t border-white/5 shrink-0 mt-8">
        <div className="flex items-center gap-6 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-brand-mint animate-pulse' : 'bg-white/10'}`} />
            <span>Neural Core: {isPlaying ? 'Sustaining' : 'Stable'}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-cyan/40" />
            <span>Frequency: 44.1kHz Hi-Res</span>
          </div>
        </div>
        
        <button 
          onClick={handleFinish}
          className="group relative px-8 py-4 bg-brand-mint/5 border border-brand-mint/20 text-brand-mint font-black rounded-2xl flex items-center gap-4 hover:bg-brand-mint/10 transition-all text-xs uppercase tracking-widest overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand-mint/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          <CheckCircle2 className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Conclude Cycle</span>
        </button>
      </div>
      </div>

      {/* Floating Meta Tags */}
      <div className="fixed bottom-10 left-10 flex gap-4 z-50">
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-5 py-2.5 rounded-2xl glass-morphism text-[10px] font-black text-brand-cyan flex items-center gap-3 border-brand-cyan/20 shadow-2xl"
        >
          <div className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_10px_#00f2ff]" /> 
          <span className="tracking-[0.2em]">{sessionData.face?.toUpperCase() || "RESONANCE READY"}</span>
        </motion.div>
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="px-5 py-2.5 rounded-2xl glass-morphism text-[10px] font-black text-brand-mint flex items-center gap-3 border-brand-mint/20 shadow-2xl"
        >
          <div className={`w-2 h-2 rounded-full ${displayBpm ? 'bg-brand-mint animate-pulse shadow-[0_0_10px_#00ffcc]' : 'bg-white/10'}`} /> 
          <span className="tracking-[0.2em]">{displayBpm ? `${displayBpm} BPM LIVE SYNC` : "ADAPTIVE SYNCHRONIZATION"}</span>
        </motion.div>
      </div>
    </main>
  );
}
