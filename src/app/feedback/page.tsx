"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Star, ThumbsUp, ThumbsDown, Sparkles, ArrowRight, HeartPulse } from "lucide-react";
import { rlEngine } from "@/lib/reinforcementLearning";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [isSatisfied, setIsSatisfied] = useState<boolean | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("smart_care_session");
    if (data) setSessionData(JSON.parse(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sessionData) {
      const reward = rating > 3 ? 1 : (rating < 3 ? -1 : 0);
      const mood = sessionData.face || "Neutral";
      const style = sessionData.musicStyle || "Grounding";
      await rlEngine.update(mood, style, reward);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 4000);
  };

  return (
    <main className="min-h-screen bg-gradient-main flex items-center justify-center p-6 relative overflow-hidden">
      {/* Immersive Background Architecture */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-cyan/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-brand-mint/5 rounded-full blur-[160px]" />

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div 
            key="feedback"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.6, ease: "circOut" }}
            className="w-full max-w-3xl p-10 md:p-16 premium-card flex flex-col items-center gap-12 relative overflow-hidden"
          >
            {/* Perspective Glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-cyan/10 blur-[100px] rounded-full" />
            
            <div className="text-center space-y-6 relative z-10">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="inline-flex p-5 rounded-[2.5rem] bg-brand-cyan/10 text-brand-cyan shadow-[0_15px_40px_rgba(0,242,255,0.2)]"
              >
                <HeartPulse className="w-14 h-14" />
              </motion.div>
              <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                    Session <span className="text-gradient">Complete</span>
                </h1>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Neural Integration Assessment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-12 relative z-10">
              <div className="flex flex-col items-center gap-8">
                <div className="text-center space-y-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Resonance Accuracy</span>
                    <p className="text-sm text-white/40 font-medium italic">How well did the environment sync with your internal state?</p>
                </div>
                <div className="flex gap-4 md:gap-6 bg-white/5 p-4 rounded-[2rem] border border-white/5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      type="button"
                      key={star}
                      whileHover={{ scale: 1.3, rotate: 15 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => setRating(star)}
                      className={`p-3 transition-all duration-500 ${rating >= star ? 'text-brand-cyan drop-shadow-[0_0_15px_rgba(0,242,255,0.6)]' : 'text-white/10 grayscale'}`}
                    >
                      <Star className={`w-10 h-10 md:w-12 md:h-12 ${rating >= star ? 'fill-brand-cyan' : ''}`} />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-8">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Algorithmic Satisfaction</span>
                <div className="flex gap-8">
                  <button 
                    type="button"
                    onClick={() => setIsSatisfied(true)}
                    className={`group flex items-center gap-4 px-10 py-5 rounded-2xl border transition-all duration-500 ${isSatisfied === true ? 'bg-brand-mint text-brand-teal font-black shadow-[0_15px_40px_rgba(0,255,204,0.3)] border-transparent' : 'glass-morphism border-white/5 text-white/30 hover:border-brand-mint/30'}`}
                  >
                    <ThumbsUp className={`w-6 h-6 ${isSatisfied === true ? 'scale-125' : 'group-hover:scale-110'}`} /> 
                    <span className="uppercase tracking-widest text-xs font-black">Coherent</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsSatisfied(false)}
                    className={`group flex items-center gap-4 px-10 py-5 rounded-2xl border transition-all duration-500 ${isSatisfied === false ? 'bg-red-500 text-white font-black shadow-[0_15px_40px_rgba(239,68,68,0.3)] border-transparent' : 'glass-morphism border-white/5 text-white/30 hover:border-red-500/30'}`}
                  >
                    <ThumbsDown className={`w-6 h-6 ${isSatisfied === false ? 'scale-125' : 'group-hover:scale-110'}`} /> 
                    <span className="uppercase tracking-widest text-xs font-black">Dissonant</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={rating === 0}
                className="group relative w-full py-6 bg-brand-cyan text-brand-teal font-black rounded-2xl flex items-center justify-center gap-4 disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(0,242,255,0.4)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10 text-xl tracking-tight uppercase">Transmit Feedback</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="thankyou"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-12 text-center"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="absolute inset-[-60px] border-2 border-dashed border-brand-cyan/10 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute inset-[-30px] border border-brand-mint/20 rounded-full"
              />
              <div className="p-14 rounded-full bg-brand-cyan text-brand-teal shadow-[0_0_80px_rgba(0,242,255,0.5)] relative z-10">
                <Sparkles className="w-20 h-20 animate-pulse" />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-6xl font-black text-white italic tracking-tighter">
                Neural <span className="text-brand-cyan">Optimized</span>
              </h2>
              <div className="flex flex-col items-center gap-2">
                <p className="text-white/40 text-2xl font-light">Biological feedback integrated into core architecture.</p>
                <div className="w-24 h-1 bg-brand-cyan/20 rounded-full overflow-hidden mt-6">
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-full h-full bg-brand-cyan shadow-[0_0_20px_#00f2ff]"
                    />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
