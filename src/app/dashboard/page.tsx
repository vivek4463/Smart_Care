"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/authService";

// Components
import Sidebar from "@/components/dashboard/Sidebar";
import EmotionGrid from "@/components/dashboard/EmotionGrid";
import AnalysisControl from "@/components/dashboard/AnalysisControl";
import ResultsPanel from "@/components/dashboard/ResultsPanel";
import FusionExplanation from "@/components/dashboard/FusionExplanation";
import MusicPlayer from "@/components/dashboard/MusicPlayer";
import FeedbackSection from "@/components/dashboard/FeedbackSection";
import AnalyticsOverview from "@/components/dashboard/AnalyticsOverview";
import SystemStatusPanel from "@/components/dashboard/SystemStatusPanel";
import VoiceAssistant from "@/components/VoiceAssistant";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  // Multi-modal state
  const [detectionData, setDetectionData] = useState({
    face: "",
    voice: "",
    text: "",
    heartRate: "N/A" as number | string
  });

  const [fusionResult, setFusionResult] = useState({
    finalEmotion: "Neutral",
    confidence: 85,
    probabilities: {
      "Joy": 10,
      "Sadness": 70,
      "Anger": 8,
      "Neutral": 12
    } as Record<string, number>
  });

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/login");
  };

  const updateDetection = (type: string, value: any) => {
    setDetectionData(prev => ({ ...prev, [type]: value }));
  };

  const performAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate complex multi-modal fusion logic
    setTimeout(() => {
      // Logic: Weighted average of inputs
      // For demo, we'll derive based on provided inputs or fallback to a professional mock
      const inputs = [detectionData.face, detectionData.voice, detectionData.text].filter(Boolean);
      let detected = "Calm";
      if (inputs.includes("Stress") || inputs.includes("Sadness") || inputs.includes("Sad")) {
        detected = "Sadness";
      } else if (inputs.includes("Joy") || inputs.includes("Happy")) {
        detected = "Joy";
      }

      setFusionResult({
        finalEmotion: detected,
        confidence: 87 + Math.floor(Math.random() * 8),
        probabilities: {
          "Joy": detected === "Joy" ? 75 : 10,
          "Sadness": detected === "Sadness" ? 82 : 12,
          "Anger": 8,
          "Stress": detected === "Stress" ? 65 : 15,
          "Calm": detected === "Calm" ? 90 : 20,
          "Fear": 5,
          "Neutral": 10
        }
      });
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center">
      <Loader2 className="w-16 h-16 text-brand-cyan animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <main className="flex h-screen bg-gradient-main overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Decorative Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-mint/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Gradient Header (Mobile Logo) */}
        <div className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan flex items-center justify-center text-brand-teal font-black text-xs">SC</div>
                <span className="text-lg font-black text-white italic tracking-tighter">SMART CARE</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Header Status */}
            <SystemStatusPanel />

            {/* Step 01: Multi-modal Input */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-black italic">01</span>
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Emotional Inputs</h2>
                   <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Acquisition of biological signals</p>
                </div>
              </div>
              <EmotionGrid onDetectionUpdate={updateDetection} />
            </section>

            {/* Step 02: Analysis & Fusion */}
            <section className="space-y-6">
              <AnalysisControl onAnalyze={performAnalysis} isAnalyzing={isAnalyzing} />
              
              <AnimatePresence>
                {showResults && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <ResultsPanel 
                        finalEmotion={fusionResult.finalEmotion} 
                        confidence={fusionResult.confidence}
                        probabilities={fusionResult.probabilities}
                      />
                      <div className="h-full">
                         <VoiceAssistant currentMood={fusionResult.finalEmotion} />
                      </div>
                    </div>
                    
                    <FusionExplanation 
                      inputs={detectionData} 
                      finalEmotion={fusionResult.finalEmotion} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Step 03: Therapeutic Response */}
            <AnimatePresence>
              {showResults && (
                <motion.section 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10 pt-10 border-t border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center text-brand-mint font-black italic">02</span>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Therapeutic Synthesis</h2>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Harmonic Frequency Injection</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                    <div className="xl:col-span-3">
                      <MusicPlayer emotion={fusionResult.finalEmotion} />
                    </div>
                    <div className="xl:col-span-2">
                       <FeedbackSection />
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Step 04: Analytics & Insights */}
            <section className="space-y-10 pt-10 border-t border-white/5">
                <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 font-black italic">03</span>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Analytics Hub</h2>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Long-term emotional trajectory</p>
                    </div>
                </div>
                <AnalyticsOverview />
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
