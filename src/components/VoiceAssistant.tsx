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
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript("");
        setResponse("");
        setIsListening(true);
        recognitionRef.current.start();
      } catch (err) {
        console.error("Speech Recognition Start Error:", err);
        setIsListening(false);
      }
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const processQuery = async (query: string) => {
    if (detectCrisis(query)) {
      setIsCrisisModalOpen(true);
      setResponse("Protocol violation: Critical sentiment detected. I am initiating crisis support resources immediately.");
      speak("Protocol violation: Critical sentiment detected. I am initiating crisis support resources immediately.");
      return;
    }

    try {
      setIsSpeaking(true);
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mood: currentMood }),
      });
      
      const data = await res.json();
      let aiResponse = data.response || "I am processing your signal. Connection stability is nominal.";
      
      // AI Command Detection - Robust approach
      const hasMusicCommand = /\[CMD:PLAY_MUSIC\]/i.test(aiResponse);
      if (hasMusicCommand) {
        console.log("Neural Command Protocol: Triggering Music Therapy...");
        
        // Dispatch event with a small delay to ensure listeners are ready
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('smartcare-ai-command', { 
            detail: { command: 'PLAY_MUSIC' } 
          }));
        }, 150);

        // Strip ALL occurrences (case-insensitive) and clean up extra spaces
        aiResponse = aiResponse.replace(/\[CMD:PLAY_MUSIC\]/gi, "").replace(/\s+/g, " ").trim();
      }
      
      setResponse(aiResponse);
      speak(aiResponse);
    } catch (error) {
      console.error('Assistant Sync Error:', error);
      const fallback = "Signal disrupted. Local resonance remaining active. Please continue sharing.";
      setResponse(fallback);
      speak(fallback);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col gap-6 overflow-hidden relative group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      
      <div className="p-6 md:p-8 flex-1 flex flex-col gap-8 relative z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
                <div className={`relative p-5 rounded-2xl glass-morphism text-brand-cyan shadow-[0_0_40px_rgba(0,242,255,0.15)] ${isSpeaking ? 'animate-pulse scale-105' : ''} transition-all duration-700`}>
                    <Wand2 className="w-7 h-7" />
                    {isSpeaking && <div className="absolute inset-0 rounded-2xl border-2 border-brand-cyan/50 animate-ping" />}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">AI CO-PROCESSOR</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
                        <p className="text-[9px] text-brand-mint font-black uppercase tracking-[0.4em]">NEURAL CORE v8.4.1</p>
                    </div>
                </div>
            </div>
            <div className={`px-5 py-2.5 rounded-2xl text-[9px] font-black tracking-[0.3em] uppercase border transition-all duration-500 ${isListening ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan shadow-[0_0_20px_rgba(0,242,255,0.1)]'}`}>
                {isListening ? 'AWAITING SIGNAL' : 'SIGNAL NOMINAL'}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-4">
            <AnimatePresence mode="popLayout" initial={false}>
            {transcript && (
                <motion.div 
                key="user-transcript"
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="flex justify-end"
                >
                <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] rounded-tr-[0.5rem] p-7 max-w-[85%] text-xs font-bold text-white/50 border border-white/10 shadow-2xl relative overflow-hidden group/msg">
                    <div className="absolute top-0 right-0 w-1 h-full bg-white/20" />
                    {transcript}
                </div>
                </motion.div>
            )}

            {response && (
                <motion.div 
                key="ai-response"
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex justify-start"
                >
                <div className="bg-brand-cyan/5 backdrop-blur-3xl rounded-[2.5rem] rounded-tl-[0.5rem] p-8 max-w-[85%] text-[13px] font-bold text-brand-cyan border border-brand-cyan/20 flex gap-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-cyan/40" />
                    <Sparkles className="w-6 h-6 flex-shrink-0 text-brand-mint animate-pulse" />
                    <p className="leading-relaxed tracking-tight italic font-medium">{response}</p>
                </div>
                </motion.div>
            )}
            </AnimatePresence>
            
            {!transcript && !response && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    className="h-full flex flex-col items-center justify-center space-y-6 pt-20"
                >
                    <MessageCircle className="w-24 h-24" />
                    <p className="text-[11px] font-black uppercase tracking-[0.8em]">SIGNAL ARCHIVE EMPTY</p>
                </motion.div>
            )}
        </div>

        <div className="flex items-center gap-5 pt-4">
            <button 
                onClick={startListening}
                disabled={isSpeaking}
                className={`group relative flex-1 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-5 transition-all duration-500 overflow-hidden ${isListening ? 'bg-red-500/10 text-red-500 border border-red-500/40' : 'bg-brand-cyan text-brand-teal shadow-[0_20px_50px_rgba(0,242,255,0.25)] hover:shadow-brand-cyan/40 hover:-translate-y-1 active:translate-y-0.5'}`}
            >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                <Mic className={`w-6 h-6 relative z-10 ${isListening ? 'animate-bounce' : ''}`} />
                <span className="relative z-10">{isListening ? 'TRANSCRIBING...' : 'INITIATE SYNC'}</span>
            </button>
            <button className="p-6 rounded-[2rem] glass-morphism text-white/20 hover:text-brand-cyan hover:border-brand-cyan/40 hover:bg-brand-cyan/5 transition-all duration-500 border border-white/5 shadow-xl">
                <MessageCircle className="w-7 h-7" />
            </button>
        </div>
      </div>

      <CrisisAlertModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div>
  );
}
