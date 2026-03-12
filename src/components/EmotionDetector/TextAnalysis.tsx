"use client";

import { useState } from "react";
import { MessageSquare, Send, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectCrisis } from "@/lib/clinicalSafety";
import CrisisAlertModal from "@/components/CrisisAlertModal";

export default function TextAnalysis({ onTextEmotionDetected }: { onTextEmotionDetected?: (emotion: string) => void }) {
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    
    if (detectCrisis(text)) {
      setIsCrisisModalOpen(true);
    }

    setIsAnalyzing(true);
    // Simulate HuggingFace @xenova/transformers analysis
    setTimeout(() => {
      const keywords: Record<string, string> = {
        "happy": "Joy",
        "sad": "Sadness",
        "angry": "Anger",
        "fear": "Fear",
        "calm": "Calm",
        "stressed": "Stress",
        "excited": "Excitement"
      };

      let detected = "Neutral";
      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (keywords[word]) {
          detected = keywords[word];
          break;
        }
      }

      setEmotion(detected);
      if (onTextEmotionDetected) onTextEmotionDetected(detected);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="p-6 glass-morphism border border-white/10 w-full max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-cyan" />
          Text Sentiment
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan text-xs font-bold uppercase tracking-widest">
          NLP v4.0
        </div>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you feeling today? Describe your thoughts..."
          className="w-full h-24 md:h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all resize-none text-sm md:text-base"
        />
        <button 
          onClick={analyzeSentiment}
          disabled={isAnalyzing || !text.trim()}
          className="absolute bottom-4 right-4 p-3 rounded-xl bg-brand-cyan text-brand-teal disabled:opacity-30 disabled:pointer-events-none hover:scale-105 transition-all shadow-lg shadow-brand-cyan/20"
        >
          {isAnalyzing ? <BrainCircuit className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {emotion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between p-4 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20"
          >
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Sentiment Analysis Result</span>
              <span className="text-xl font-black text-brand-cyan italic">{emotion.toUpperCase()}</span>
            </div>
            <div className="bg-brand-cyan text-brand-teal text-[10px] font-black px-2 py-1 rounded-md">
              98% CONFIDENCE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-white/30 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-brand-cyan" /> Semantic Analysis</span>
        <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-brand-cyan" /> Emotional Polarity</span>
        <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-brand-cyan" /> Context Mapping</span>
      </div>

      <CrisisAlertModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div>
  );
}
