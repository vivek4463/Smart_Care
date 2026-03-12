"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Loader2 } from "lucide-react";

export default function AnalysisControl({ onAnalyze, isAnalyzing }: { 
  onAnalyze: () => void;
  isAnalyzing: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 w-full relative">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <button 
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="group relative px-16 py-8 bg-brand-cyan text-brand-teal font-black rounded-[2rem] flex items-center justify-center gap-6 text-2xl shadow-[0_20px_60px_rgba(0,242,255,0.4)] hover:scale-[1.05] active:scale-95 transition-all overflow-hidden disabled:opacity-50 disabled:scale-100"
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        {isAnalyzing ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="tracking-tighter uppercase italic">Synthesizing...</span>
          </>
        ) : (
          <>
            <Brain className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span className="tracking-tighter uppercase italic">Analyze My Emotion</span>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </>
        )}
      </button>

      <div className="flex items-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
        Multimodal Fusion Engine <div className="w-1 h-1 rounded-full bg-brand-cyan" /> Ready to process
      </div>
    </div>
  );
}
