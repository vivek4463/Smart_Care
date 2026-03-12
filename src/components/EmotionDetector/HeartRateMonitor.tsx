"use client";

import { useState } from "react";
import { Watch, Bluetooth, Activity, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeartRateMonitor({ onHeartRateDetected }: { onHeartRateDetected?: (bpm: number) => void }) {
  const [bpm, setBpm] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const connectWatch = async () => {
    setIsSearching(true);
    // Simulate Web Bluetooth API interaction
    setTimeout(() => {
      setBpm(72);
      setIsConnected(true);
      setIsSearching(false);
      if (onHeartRateDetected) onHeartRateDetected(72);
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        const newBpm = 70 + Math.floor(Math.random() * 15);
        setBpm(newBpm);
        if (onHeartRateDetected) onHeartRateDetected(newBpm);
      }, 5000);
      
      return () => clearInterval(interval);
    }, 2000);
  };

  return (
    <div className="p-6 glass-morphism border border-white/10 w-full max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Watch className="w-5 h-5 text-brand-cyan" />
          Biometric Sync
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand-mint shadow-[0_0_8px_#00ffcc]' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold text-white/40 tracking-widest">{isConnected ? 'PAIRED' : 'DISCONNECTED'}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-8 relative">
        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.button
              key="connect"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={connectWatch}
              disabled={isSearching}
              className="group relative"
            >
              <div className="absolute inset-0 bg-brand-cyan/20 rounded-full blur-2xl group-hover:bg-brand-cyan/40 transition-all" />
              <div className="relative p-10 rounded-full glass-morphism border-brand-cyan/30 flex flex-col items-center gap-3">
                {isSearching ? <Bluetooth className="w-10 h-10 text-brand-cyan animate-spin" /> : <Bluetooth className="w-10 h-10 text-brand-cyan" />}
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{isSearching ? 'Searching...' : 'Connect Device'}</span>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="text-7xl font-black text-brand-cyan flex items-baseline gap-2">
                {bpm}
                <span className="text-sm font-medium text-white/40 uppercase tracking-widest">BPM</span>
              </div>
              <Activity className="w-12 h-12 text-brand-mint animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Device Type</span>
          <span className="text-sm font-bold text-white flex items-center gap-2"><Smartphone className="w-3 h-3 text-brand-cyan" /> Apple Watch Pro</span>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Signal Strength</span>
          <span className="text-sm font-bold text-brand-mint flex items-center gap-1">
            <div className="w-1 h-2 bg-brand-mint rounded-full" />
            <div className="w-1 h-3 bg-brand-mint rounded-full" />
            <div className="w-1 h-4 bg-brand-mint rounded-full" />
            Stable
          </span>
        </div>
      </div>

      <p className="text-center text-[10px] text-white/20 italic">
        * Optional step. Heart rate variability helps us refine music tempo and intensity.
      </p>
    </div>
  );
}
