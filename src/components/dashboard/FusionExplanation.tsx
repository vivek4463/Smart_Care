"use client";

import { motion } from "framer-motion";
import { Network, ArrowRight, Camera, Mic, MessageSquare, Activity } from "lucide-react";

interface FusionExplanationProps {
  inputs: {
    face: string;
    voice: string;
    text: string;
    heartRate: number | string;
  };
  finalEmotion: string;
}

export default function FusionExplanation({ inputs, finalEmotion }: FusionExplanationProps) {
  const sources = [
    { label: "Face Visuals", value: inputs.face || "Calibrating...", icon: Camera, color: "text-brand-cyan" },
    { label: "Voice Prosody", value: inputs.voice || "Silent", icon: Mic, color: "text-brand-mint" },
    { label: "Text Sentiment", value: inputs.text || "Neutral", icon: MessageSquare, color: "text-purple-400" },
    { label: "Cardiac Rhythm", value: typeof inputs.heartRate === 'number' ? `${inputs.heartRate} BPM` : inputs.heartRate, icon: Activity, color: "text-red-400" },
  ];

  return (
    <div className="premium-card p-10 space-y-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 blur-[100px] rounded-full" />

      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20">
          <Network className="w-6 h-6 text-brand-cyan" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Emotion Fusion</h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em]">Explainable AI Decision Path</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
        <div className="lg:col-span-2 space-y-6">
          {sources.map((source, i) => (
            <motion.div
              key={source.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all"
            >
              <div className={`p-2.5 rounded-xl bg-white/5 ${source.color} group-hover:bg-white/20 transition-all`}>
                <source.icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{source.label}</span>
                <span className="text-sm font-bold text-white uppercase">{source.value}</span>
              </div>
              <div className="ml-auto w-1 h-8 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className={`w-full bg-current ${source.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="hidden lg:block"
          >
            <ArrowRight className="w-12 h-12 text-brand-cyan/20" />
          </motion.div>
          <div className="lg:hidden h-20 flex items-center justify-center">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ArrowRight className="w-12 h-12 text-brand-cyan/20 rotate-90" />
            </motion.div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="p-1 rounded-[3rem] bg-gradient-to-tr from-brand-cyan to-brand-mint shadow-[0_0_50px_rgba(0,242,255,0.2)]">
            <div className="bg-brand-teal px-12 py-16 rounded-[2.8rem] flex flex-col items-center gap-4 border border-white/10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="w-20 h-20 rounded-full border-2 border-dashed border-brand-cyan/30 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-brand-cyan/20 animate-pulse" />
              </motion.div>
              <div className="text-center space-y-2">
                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em]">Final Consensus</span>
                <h4 className="text-4xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {finalEmotion.toUpperCase()}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
