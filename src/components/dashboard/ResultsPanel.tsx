"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, Activity } from "lucide-react";

interface ResultsPanelProps {
  finalEmotion: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export default function ResultsPanel({ finalEmotion, confidence, probabilities }: ResultsPanelProps) {
  const emotions = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 w-full h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Emotion Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card p-8 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-brand-cyan/5 blur-3xl group-hover:bg-brand-cyan/10 transition-all" />
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-24 h-24 rounded-full bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20 relative z-10"
          >
            <TrendingUp className="w-10 h-10 text-brand-cyan" />
          </motion.div>
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Detected Emotion</span>
            <h2 className="text-4xl font-black text-brand-cyan italic drop-shadow-[0_0_20px_rgba(0,242,255,0.3)]">
              {finalEmotion.toUpperCase()}
            </h2>
          </div>
        </motion.div>

        {/* Confidence Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-8 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-brand-mint/5 blur-3xl group-hover:bg-brand-mint/10 transition-all" />
          <div className="w-24 h-24 rounded-full bg-brand-mint/10 flex items-center justify-center border border-brand-mint/20 relative z-10">
            <Award className="w-10 h-10 text-brand-mint" />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Neural Confidence</span>
            <h2 className="text-4xl font-black text-brand-mint italic drop-shadow-[0_0_20px_rgba(0,255,204,0.3)]">
              {confidence}%
            </h2>
          </div>
        </motion.div>
      </div>

      {/* Probability Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-card p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-cyan" />
            Probability Distribution
          </h3>
          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Across 7 Dimensions</span>
        </div>

        <div className="space-y-4">
          {emotions.map(([emotion, prob], i) => (
            <div key={emotion} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                <span className={i === 0 ? "text-brand-cyan" : "text-white/40"}>{emotion}</span>
                <span className={i === 0 ? "text-brand-cyan" : "text-white/20"}>{prob}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${prob}%` }}
                  transition={{ duration: 1, delay: 0.3 + (i * 0.1), ease: "circOut" }}
                  className={`h-full rounded-full ${
                    i === 0 ? "bg-gradient-to-r from-brand-cyan to-brand-mint shadow-[0_0_10px_rgba(0,242,255,0.4)]" : "bg-white/10"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
