"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Brain, Sparkles, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic components for browser-only features
const FaceDetection = dynamic(() => import("@/components/EmotionDetector/FaceDetection"), { ssr: false });
const VoiceDetection = dynamic(() => import("@/components/EmotionDetector/VoiceDetection"), { ssr: false });
const TextAnalysis = dynamic(() => import("@/components/EmotionDetector/TextAnalysis"), { ssr: false });
const HeartRateMonitor = dynamic(() => import("@/components/EmotionDetector/HeartRateMonitor"), { ssr: false });

const STEPS = ["introduction", "face", "voice", "text", "biometric", "summary"];

export default function DetectEmotionPage() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<{
    face: string;
    voice: string;
    text: string;
    heartRate: number;
    finalEmotion: string;
  }>({
    face: "",
    voice: "",
    text: "",
    heartRate: 0,
    finalEmotion: ""
  });
  const router = useRouter();

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    localStorage.setItem("smart_care_session", JSON.stringify(results));
    router.push("/therapy");
  };

  return (
    <main className="screen-fit bg-gradient-main p-6 lg:p-10 relative overflow-hidden">
      {/* Immersive Background Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-cyan/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-brand-mint/5 rounded-full blur-[160px]" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-5xl mx-auto">
      {/* Progress Architecture */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 flex gap-0.5 p-0.5 bg-brand-teal/80 backdrop-blur-md">
        {STEPS.map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-full rounded-full transition-all duration-700 ${i <= step ? 'bg-brand-cyan shadow-[0_0_20px_rgba(0,242,255,0.6)]' : 'bg-white/5'}`} 
          />
        ))}
      </div>

      <div className="w-full h-full flex flex-col items-center py-6 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={STEPS[step]}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="flex-1 w-full flex flex-col items-center justify-center overflow-y-auto custom-scrollbar"
          >
            {step === 0 && (
              <div className="text-center space-y-10 max-w-3xl">
                <motion.div 
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    className="inline-flex p-6 rounded-[2rem] glass-morphism text-brand-cyan shadow-[0_20px_50px_rgba(0,242,255,0.15)]"
                >
                  <Brain className="w-16 h-16" />
                </motion.div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                        Neural <span className="text-gradient">Mapping</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
                        Our multimodal engine uses sub-perceptual analysis to bridge your biological state with algorithmic synthesis.
                    </p>
                </div>
                <div className="p-6 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10 flex items-center gap-4 text-left max-w-xl mx-auto backdrop-blur-lg">
                  <Sparkles className="w-8 h-8 text-brand-cyan flex-shrink-0" />
                  <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] leading-relaxed">
                    Zero-knowledge processing enabled. Your emotional signature remains locally encrypted.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-10 text-center w-full max-w-4xl">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">Step 01: Visual Resonance</h2>
                    <p className="text-[10px] text-brand-cyan font-black uppercase tracking-[0.4em]">Micro-expression calibration</p>
                </div>
                <div className="premium-card p-4 md:p-8">
                    <FaceDetection onEmotionDetected={(e) => setResults(prev => ({ ...prev, face: e.emotion }))} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 text-center w-full max-w-4xl">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">Step 02: Auditory Prosody</h2>
                    <p className="text-[10px] text-brand-cyan font-black uppercase tracking-[0.4em]">Frequency distribution analysis</p>
                </div>
                <div className="premium-card p-4 md:p-8">
                    <VoiceDetection onVoiceEmotionDetected={(e) => setResults(prev => ({ ...prev, voice: e }))} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 text-center w-full max-w-4xl">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">Step 03: Lexical Sentiment</h2>
                    <p className="text-[10px] text-brand-cyan font-black uppercase tracking-[0.4em]">Semantic core extraction</p>
                </div>
                <div className="premium-card p-4 md:p-8">
                    <TextAnalysis onTextEmotionDetected={(e) => setResults(prev => ({ ...prev, text: e }))} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-10 text-center w-full max-w-4xl">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">Step 04: Biometric Coherence</h2>
                    <p className="text-[10px] text-brand-cyan font-black uppercase tracking-[0.4em]">Cardiac rhythm synchronization</p>
                </div>
                <div className="premium-card p-4 md:p-8">
                    <HeartRateMonitor onHeartRateDetected={(bpm) => setResults(prev => ({ ...prev, heartRate: bpm }))} />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="text-center space-y-10 max-w-4xl w-full">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="inline-flex p-6 rounded-[2.5rem] glass-morphism text-brand-mint shadow-[0_20px_50px_rgba(0,255,204,0.1)]"
                >
                  <Sparkles className="w-16 h-16" />
                </motion.div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Profile <span className="text-gradient">Finalized</span></h1>
                    <p className="text-xl text-white/40 font-light italic">Your biological resonance has been successfully mapped to our neural core.</p>
                </div>
                <div className="premium-card p-10 w-full grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block">Face</span>
                      <span className="text-2xl font-black text-brand-cyan drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]">{results.face || "NO SIGNAL"}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block">Voice</span>
                      <span className="text-2xl font-black text-brand-cyan drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]">{results.voice || "NO SIGNAL"}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block">Lexical</span>
                      <span className="text-2xl font-black text-brand-cyan drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]">{results.text || "NO SIGNAL"}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block">Biometric</span>
                      <span className="text-2xl font-black text-brand-cyan drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]">{results.heartRate ? `${results.heartRate} BPM` : "ADAPTIVE"}</span>
                    </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Control Infrastructure */}
      <div className="w-full mt-10 flex flex-col sm:flex-row justify-between items-center gap-6 shrink-0 relative px-4">
        <button 
          onClick={handleBack}
          disabled={step === 0}
          className="w-full sm:w-auto px-8 py-5 rounded-2xl glass-morphism text-white/30 hover:text-white disabled:opacity-0 transition-all font-black uppercase tracking-widest text-xs border border-white/5"
        >
          Retreat to Previous
        </button>

        <div className="flex items-center gap-4 order-first sm:order-none">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-700 ${i === step ? 'bg-brand-cyan w-10 shadow-[0_0_15px_rgba(0,242,255,0.5)]' : 'bg-white/10 w-2'}`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="group relative w-full sm:w-auto px-12 py-5 bg-brand-cyan text-brand-teal font-black rounded-2xl hover:scale-[1.05] active:scale-95 transition-all shadow-[0_10px_40px_rgba(0,242,255,0.3)] flex items-center justify-center gap-4 overflow-hidden"
        >
          <span className="relative z-10">{step === STEPS.length - 1 ? 'Execute Therapy' : 'Proceed to Next'}</span>
          <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>
      </div>
      </div>

      <div className="mt-8 flex items-center gap-3 text-white/10 text-[10px] font-black uppercase tracking-[0.4em] shrink-0 border-t border-white/5 pt-6 w-full justify-center">
        <AlertCircle className="w-4 h-4 text-brand-cyan/20" /> Neural Architecture Status: Optimal
      </div>
      </div>
    </main>
  );
}
