"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Volume2, MessageCircle, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectCrisis } from "@/lib/clinicalSafety";
import CrisisAlertModal from "@/components/CrisisAlertModal";

export default function VoiceAssistant({ currentMood }: { currentMood: string }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("WebKitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processQuery(text);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setResponse("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const processQuery = (query: string) => {
    let aiResponse = "";
    if (query.toLowerCase().includes("how are you")) {
      aiResponse = "I am operational and synchronized with your emotional state. Currently optimizing your therapeutic environment.";
    } else if (detectCrisis(query)) {
      setIsCrisisModalOpen(true);
      aiResponse = "Protocol violation: Critical sentiment detected. I am initiating crisis support resources immediately.";
    } else if (query.toLowerCase().includes("boring") || query.toLowerCase().includes("change")) {
      aiResponse = "Understood. Re-modulating harmonic frequencies to elevate cognitive engagement.";
    } else {
      aiResponse = `Neural signal received. Given your ${currentMood} state, I am refining the synthesis to provide optimal resonance. How is your perception of the soundscape?`;
    }
    
    setResponse(aiResponse);
    speak(aiResponse);
  };

  return (
    <div className="h-full w-full flex flex-col gap-6 overflow-hidden relative group">
      <div className="p-6 md:p-8 flex-1 flex flex-col gap-8">
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl glass-morphism text-brand-cyan shadow-[0_0_20px_rgba(0,242,255,0.1)] ${isSpeaking ? 'animate-pulse' : ''}`}>
                    <Wand2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-xl font-black text-white tracking-tight">AI Co-Processor</h3>
                    <p className="text-[10px] text-brand-mint font-black uppercase tracking-[0.3em]">Adaptive Neural Core</p>
                </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase border ${isListening ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' : 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan'}`}>
                {isListening ? 'Awaiting Signal' : 'Interface Ready'}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2 relative z-10">
            <AnimatePresence mode="popLayout">
            {transcript && (
                <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex justify-end"
                >
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] rounded-tr-sm p-6 max-w-[85%] text-xs font-medium text-white/60 border border-white/5 shadow-2xl">
                    {transcript}
                </div>
                </motion.div>
            )}

            {response && (
                <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-start"
                >
                <div className="bg-brand-cyan/5 backdrop-blur-2xl rounded-[2rem] rounded-tl-sm p-6 max-w-[85%] text-xs font-bold text-brand-cyan border border-brand-cyan/20 flex gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                    <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
                    <p className="leading-relaxed tracking-tight italic">{response}</p>
                </div>
                </motion.div>
            )}
            </AnimatePresence>
            
            {!transcript && !response && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                    <MessageCircle className="w-20 h-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.6em]">Zero Signal Detected</p>
                </div>
            )}
        </div>

        <div className="flex items-center gap-4 relative z-10">
            <button 
            onClick={startListening}
            className={`group relative flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all overflow-hidden ${isListening ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-brand-cyan text-brand-teal shadow-[0_15px_40px_rgba(0,242,255,0.3)] hover:scale-[1.02] active:scale-95'}`}
            >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            <Mic className={`w-5 h-5 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
            <span className="relative z-10">{isListening ? 'Processing Audio...' : 'Initiate Inquiry'}</span>
            </button>
            <button className="p-5 rounded-2xl glass-morphism text-white/20 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all border border-transparent">
            <MessageCircle className="w-6 h-6" />
            </button>
        </div>
      </div>

      <CrisisAlertModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div>
  );
}
