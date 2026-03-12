"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, BrainCircuit, Globe, X, Check } from "lucide-react";

export default function PremiumUpgradeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const features = [
    {
      icon: <BrainCircuit className="w-5 h-5 text-brand-cyan" />,
      title: "Enhanced Context Mesh",
      desc: "Cross-session memory for longitudinal emotional tracking."
    },
    {
      icon: <Zap className="w-5 h-5 text-brand-mint" />,
      title: "Real-time Neural Sync",
      desc: "Zero-latency biometric integration with advanced cloud models."
    },
    {
      icon: <Globe className="w-5 h-5 text-purple-400" />,
      title: "Holographic Themes",
      desc: "Unlock premium visual interfaces and acoustic environments."
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl glass-morphism border-brand-cyan/20 p-10 flex flex-col items-center gap-8 overflow-hidden"
          >
            {/* Animated Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-brand-cyan/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-brand-mint/20 rounded-full blur-3xl animate-pulse" />

            <div className="relative">
              <div className="p-5 rounded-[2rem] bg-brand-cyan/10 border border-brand-cyan/20 shadow-[0_0_30px_rgba(0,242,255,0.2)]">
                <Sparkles className="w-10 h-10 text-brand-cyan" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-brand-mint" 
              />
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Evolution Protocol</h2>
              <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Upgrade to Smart Care Premium</p>
            </div>

            <div className="w-full grid grid-cols-1 gap-4">
              {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-brand-cyan/20 transition-all">
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-brand-cyan/10 transition-colors">
                    {feat.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white italic uppercase tracking-tight">{feat.title}</span>
                    <span className="text-xs text-white/40 leading-relaxed">{feat.desc}</span>
                  </div>
                  <Check className="ml-auto w-4 h-4 text-brand-mint opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>

            <div className="w-full flex flex-col gap-4">
              <button 
                className="w-full p-5 rounded-2xl bg-brand-cyan text-brand-teal font-black uppercase tracking-widest text-xs hover:shadow-[0_0_40px_rgba(0,242,255,0.5)] transition-all flex items-center justify-center gap-3"
              >
                Initiate Upgrade — $9.99/mo
              </button>
              <button 
                onClick={onClose}
                className="text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
              >
                Continue with Standard Node
              </button>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
