"use client";

import { useState } from "react";
import { Watch, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBiometrics } from "@/context/BiometricContext";

export default function HeartRateMonitor({ onHeartRateDetected }: { onHeartRateDetected?: (bpm: number) => void }) {
  const { 
    bpm, 
    connectionType, 
    isConnected, 
    disconnect, 
    simulate,
    setBpmManual 
  } = useBiometrics();

  const [manualBpm, setManualBpm] = useState<string>("");
  const [advice, setAdvice] = useState<string>("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualBpm);
    if (!isNaN(val) && val > 30 && val < 220) {
      setBpmManual(val);
      processBpmRules(val);
      if (onHeartRateDetected) onHeartRateDetected(val);
    }
  };

  const processBpmRules = (val: number) => {
    if (val > 100) {
      setAdvice("Elevated Heart Rate Detected: High Stress Signal. Initiating calming harmonic overlay.");
    } else if (val < 60) {
      setAdvice("Low Heart Rate Detected: Deep Relaxation or Lethargy. Adjusting tempo for cognitive engagement.");
    } else {
      setAdvice("Heart Rate Nominal: Maintaining current therapeutic resonance.");
    }
  };

  return (
    <div 
      suppressHydrationWarning
      className="p-6 glass-morphism border border-white/10 w-full max-w-2xl flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Watch className="w-5 h-5 text-brand-cyan" />
          Biometric Sync
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand-mint shadow-[0_0_8px_#00ffcc]' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold text-white/40 tracking-widest">
            {connectionType === 'manual' ? 'MANUAL' : connectionType === 'simulated' ? 'SIMULATED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
        <div className="flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-brand-cyan/20 rounded-full blur-2xl transition-all" />
                <div className="relative p-10 rounded-full glass-morphism border-brand-cyan/30 flex flex-col items-center gap-3">
                  <Activity className="w-10 h-10 text-brand-cyan/40" />
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Awaiting Pulse</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="text-7xl font-black text-brand-cyan flex items-baseline gap-2">
                  {bpm || "--"}
                  <span className="text-sm font-medium text-white/40 uppercase tracking-widest">BPM</span>
                </div>
                <Activity className="w-12 h-12 text-brand-mint animate-pulse" />
                <button 
                  onClick={disconnect}
                  className="mt-4 px-4 py-2 border border-brand-cyan/30 rounded-full text-[10px] uppercase tracking-widest text-brand-cyan hover:bg-brand-cyan/10 transition-colors"
                >
                  Clear Entry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleManualSubmit} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Manual Entry</label>
            <div className="flex gap-2">
              <input 
                type="number"
                value={manualBpm}
                onChange={(e) => setManualBpm(e.target.value)}
                placeholder="BPM"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:ring-1 focus:ring-brand-cyan/50"
              />
              <button className="bg-brand-cyan text-brand-teal px-4 py-2 rounded-lg font-bold text-xs uppercase hover:scale-105 transition-all">
                Update
              </button>
            </div>
          </form>

          <AnimatePresence>
            {advice && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-[10px] font-bold text-brand-cyan leading-relaxed uppercase italic"
              >
                {advice}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Input Mode</span>
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-3 h-3 text-brand-cyan" />
            {connectionType === 'manual' ? 'Manual Pulse' : connectionType === 'simulated' ? 'Simulated' : 'None'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <button 
            onClick={simulate}
            className="text-[10px] text-white/30 hover:text-brand-cyan uppercase tracking-widest text-left transition-colors"
          >
            Launch Internal Logic
          </button>
          <span className="text-sm font-bold text-brand-mint flex items-center gap-1">
            <div className="w-1 h-2 bg-brand-mint rounded-full" />
            <div className="w-1 h-3 bg-brand-mint rounded-full" />
            <div className="w-1 h-4 bg-brand-mint rounded-full" />
            Active
          </span>
        </div>
      </div>

      <p className="text-center text-[10px] text-white/20 italic">
        * Manual heart rate entry enables cognitive rules for therapeutic intervention.
      </p>
    </div>
  );
}
