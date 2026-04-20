"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectCrisis } from "@/lib/clinicalSafety";
import CrisisAlertModal from "@/components/CrisisAlertModal";

export default function TextAnalysis({
  onTextEmotionDetected,
}: {
  onTextEmotionDetected?: (emotion: string) => void;
}) {

  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [engine, setEngine] = useState<string>("NEURAL NLP");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const analyzeSentiment = async () => {

    if (!text.trim()) return;

    if (detectCrisis(text)) {
      setIsCrisisModalOpen(true);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsAnalyzing(true);

    try {

      const res = await fetch("/api/emotion/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text }),
        signal: abortControllerRef.current.signal
      });

      const data = await res.json();

      console.log("API response:", data);

      if (!res.ok || data.error) {
        throw new Error(data.error || "Neural analysis failed");
      }

      const result = data.result;

      if (!result) {
        throw new Error("Incomplete result data");
      }

      const label = result.label;
      const score = result.score;

      setConfidence(Math.round(score * 100));
      setEngine(result.engine || "NEURAL NLP");

      const emotionMap: Record<string, string> = {
        POSITIVE: "Happy",
        NEGATIVE: "Sad",
        sadness: "Sad",
        joy: "Happy",
        love: "Love",
        anger: "Angry",
        fear: "Anxious",
        surprise: "Surprised"
      };

      let finalEmotion = emotionMap[label] || "Neutral";

      // Refinement: If logic is NEGATIVE but contains anger keywords, promote to Angry
      if (finalEmotion === "Sad") {
        const angerKeywords = ["angry", "mad", "hate", "frustrated", "annoyed", "furious", "stupid"];
        if (angerKeywords.some(word => text.toLowerCase().includes(word))) {
          finalEmotion = "Angry";
        }
      }

      setEmotion(finalEmotion);

      if (onTextEmotionDetected) {
        onTextEmotionDetected(finalEmotion);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Neural NLP Error. Accessing Lexical Guardrails.", err);

      const input = text.toLowerCase();
      let fallbackEmotion = "Equilibrium";

      const keywordMap: Array<{ words: string[]; emotion: string }> = [

        {
          words: [
            "happy",
            "joy",
            "wonderful",
            "great",
            "excited",
            "love",
            "good",
            "best",
            "amazing"
          ],
          emotion: "Happy"
        },

        {
          words: [
            "sad",
            "unhappy",
            "overwhelmed",
            "alone",
            "cry",
            "depressed",
            "miserable"
          ],
          emotion: "Sad"
        },

        {
          words: [
            "angry",
            "mad",
            "annoyed",
            "frustrated",
            "hate",
            "furious"
          ],
          emotion: "Angry"
        },

        {
          words: [
            "scared",
            "fear",
            "anxious",
            "worried",
            "nervous",
            "panic"
          ],
          emotion: "Anxious"
        },

        {
          words: [
            "surprise",
            "wow",
            "unbelievable"
          ],
          emotion: "Surprised"
        }
      ];

      for (const group of keywordMap) {

        if (group.words.some(word => input.includes(word))) {
          fallbackEmotion = group.emotion;
          break;
        }

      }

      setEmotion(fallbackEmotion);
      setConfidence(null);
      setEngine("LEXICAL_ENGINE_v1");

      if (onTextEmotionDetected) {
        onTextEmotionDetected(fallbackEmotion);
      }

    } finally {

      setIsAnalyzing(false);

    }

  };

  return (

    <div 
      suppressHydrationWarning
      className="p-4 md:p-6 glass-morphism border border-white/10 w-full max-w-2xl flex flex-col gap-4 md:gap-6 relative overflow-hidden"
    >

      {isAnalyzing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-cyan animate-pulse z-20" />
      )}

      <div className="flex items-center justify-between">

        <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2 italic uppercase">
          <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-brand-cyan" />
          Semantic Mapping
        </h3>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan text-[10px] font-black uppercase tracking-[0.2em] border border-brand-cyan/20">
          {engine}
        </div>

      </div>

      <div className="relative group">

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your current emotional state..."
          className="w-full h-24 md:h-28 bg-black/40 border border-white/10 rounded-xl p-3 md:p-4 text-xs md:text-base text-white placeholder:text-white/20 focus:outline-none"
        />

        <button
          onClick={analyzeSentiment}
          disabled={isAnalyzing || !text.trim()}
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 p-2.5 md:p-3 rounded-xl bg-brand-cyan text-black hover:scale-105 transition disabled:opacity-40"
        >

          {isAnalyzing
            ? <BrainCircuit className="w-5 h-5 animate-spin" />
            : <Send className="w-5 h-5" />
          }

        </button>

      </div>

      <AnimatePresence>

        {emotion && (

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2 p-5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30"
          >

            <span className="text-white/40 text-xs uppercase tracking-widest">
              Emotion Detection Result
            </span>

            <span className="text-2xl font-bold text-brand-cyan">
              Detected Emotion: {emotion}
            </span>

            {confidence !== null && (
              <span className="text-white/70 text-sm">
                Confidence: {confidence}%
              </span>
            )}

            <span className="text-white/40 text-xs">
              Source: {engine}
            </span>

          </motion.div>

        )}

      </AnimatePresence>

      <CrisisAlertModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />

    </div>

  );

}