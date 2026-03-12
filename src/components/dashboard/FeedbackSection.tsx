"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, MessageSquare, Sparkles } from "lucide-react";

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      setFeedback(null);
      setComment("");
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="premium-card p-10 flex flex-col items-center gap-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-cyan/5 blur-[100px]" />
      
      <div className="text-center space-y-2 relative z-10">
        <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase underline decoration-brand-cyan underline-offset-8">
          Active Reinforcement
        </h3>
        <p className="text-sm text-white/40 font-medium pt-2">
          Did this auditory resonance improve your emotional baseline?
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full space-y-8 relative z-10"
          >
            <div className="flex justify-center gap-8">
              <button 
                onClick={() => setFeedback(true)}
                className={`p-8 rounded-[2rem] transition-all flex flex-col items-center gap-3 border ${
                  feedback === true 
                    ? 'bg-brand-mint/20 border-brand-mint text-brand-mint scale-110 shadow-[0_0_30px_rgba(0,255,204,0.3)]' 
                    : 'bg-white/5 border-white/5 text-white/20 hover:text-white/60 hover:bg-white/10'
                }`}
              >
                <ThumbsUp className={`w-10 h-10 ${feedback === true ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Resonant</span>
              </button>
              <button 
                onClick={() => setFeedback(false)}
                className={`p-8 rounded-[2rem] transition-all flex flex-col items-center gap-3 border ${
                  feedback === false 
                    ? 'bg-red-500/20 border-red-500 text-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                    : 'bg-white/5 border-white/5 text-white/20 hover:text-white/60 hover:bg-white/10'
                }`}
              >
                <ThumbsDown className={`w-10 h-10 ${feedback === false ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Dissonant</span>
              </button>
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-4">
                <MessageSquare className="w-5 h-5 text-brand-cyan/40 group-focus-within:text-brand-cyan transition-colors" />
              </div>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Elaborate on your neural response (optional)..."
                className="w-full h-24 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 transition-all resize-none text-sm"
              />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={feedback === null}
              className="w-full py-5 bg-brand-cyan text-brand-teal font-black rounded-2xl shadow-[0_10px_40px_rgba(0,242,255,0.3)] hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-[0.2em] italic"
            >
              Submit Feedback Loop
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-10"
          >
            <div className="w-20 h-20 rounded-full bg-brand-mint/10 flex items-center justify-center border border-brand-mint/20">
              <Sparkles className="w-10 h-10 text-brand-mint animate-pulse" />
            </div>
            <div className="text-center">
              <h4 className="text-xl font-black text-white tracking-tighter">Profile Updated</h4>
              <p className="text-xs text-brand-mint uppercase font-bold tracking-widest mt-1">Convergence increased by 2.4%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
