"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, User } from "lucide-react";
import { authService } from "@/lib/authService";

// Components
import Sidebar from "@/components/dashboard/Sidebar";
import SidebarSkeleton from "@/components/dashboard/Sidebar"; // Fallback
import dynamic from "next/dynamic";

// Dynamic components for browser-only features
const EmotionGrid = dynamic(() => import("@/components/dashboard/EmotionGrid"), { ssr: false });
const AnalysisControl = dynamic(() => import("@/components/dashboard/AnalysisControl"), { ssr: false });
const ResultsPanel = dynamic(() => import("@/components/dashboard/ResultsPanel"), { ssr: false });
const FusionExplanation = dynamic(() => import("@/components/dashboard/FusionExplanation"), { ssr: false });
const MusicPlayer = dynamic(() => import("@/components/dashboard/MusicPlayer"), { ssr: false });
const FeedbackSection = dynamic(() => import("@/components/dashboard/FeedbackSection"), { ssr: false });
const SystemStatusPanel = dynamic(() => import("@/components/dashboard/SystemStatusPanel"), { ssr: false });
const VoiceAssistant = dynamic(() => import("@/components/VoiceAssistant"), { ssr: false });
const QuickActions = dynamic(() => import("@/components/dashboard/QuickActions"), { ssr: false });
const MobileNav = dynamic(() => import("@/components/dashboard/MobileNav"), { ssr: false });
const SessionHistory = dynamic(() => import("@/components/dashboard/SessionHistory"), { ssr: false });
const AnalyticsOverview = dynamic(() => import("@/components/dashboard/AnalyticsOverview"), { ssr: false });
const PremiumUpgradeModal = dynamic(() => import("@/components/dashboard/PremiumUpgradeModal"), { ssr: false });
import { getFinalEmotion } from "@/lib/emotionFusion";
import { sessionService } from "@/lib/sessionService";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showTherapy, setShowTherapy] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();

  // Multi-modal state
  const [detectionData, setDetectionData] = useState({
    face: "" as any,
    voice: "" as any,
    text: "" as any,
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

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    setTimeout(async () => {
      const result = getFinalEmotion(detectionData);
      
      const emotions = ["Joy", "Sadness", "Anger", "Fear", "Anxiety", "Neutral", "Awe"];
      const probabilities: Record<string, number> = {};
      
      emotions.forEach(e => {
        if (e === result.finalEmotion) {
          probabilities[e] = result.confidence;
        } else {
          probabilities[e] = Math.floor((100 - result.confidence) / (emotions.length - 1));
        }
      });

      const finalResult = {
        finalEmotion: result.finalEmotion,
        confidence: result.confidence,
        probabilities
      };

      setFusionResult(finalResult);

      if (user?.id) {
        // Extract raw labels for Supabase for better searchability
        const faceLabel = typeof detectionData.face === 'string' ? detectionData.face : detectionData.face?.emotion || "";
        const voiceLabel = typeof detectionData.voice === 'string' ? detectionData.voice : detectionData.voice?.emotion || "";
        const textLabel = typeof detectionData.text === 'string' ? detectionData.text : detectionData.text || "";

        await sessionService.saveSession({
          user_id: user.id,
          face_emotion: faceLabel,
          voice_emotion: voiceLabel,
          text_sentiment: textLabel,
          heart_rate: Number(detectionData.heartRate) || 0,
          final_emotion: result.finalEmotion,
          confidence: result.confidence
        });
      }

      setIsAnalyzing(false);
      setShowResults(true);
    }, 600);
  };

  const startSession = () => {
    setShowTherapy(true);
    setTimeout(() => {
      scrollToAnalysis();
    }, 100);
  };

  const handleMoodBoost = () => {
    setFusionResult({
      finalEmotion: "Joy",
      confidence: 100,
      probabilities: {
        "Joy": 100,
        "Neutral": 0
      }
    });
    setShowResults(true);
    setShowTherapy(false); // Hide the detection grid if it's open
    
    // Smooth scroll to player
    setTimeout(() => {
        const element = document.getElementById("step-03-therapy");
        if (element) element.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const scrollToAnalysis = () => {
    const element = document.getElementById("step-01-acquisition");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center" suppressHydrationWarning>
      <Loader2 className="w-16 h-16 text-brand-cyan animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <main className="flex h-screen bg-gradient-main overflow-hidden" suppressHydrationWarning>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onUpgradeClick={() => setShowUpgradeModal(true)}
      />

      {/* Global Notifications Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-6 bottom-24 w-80 z-50 p-6 border-2 border-brand-cyan/30 bg-[#0a1616] shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col rounded-[2.5rem]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Alerts</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-white/20 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
               <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-1.5" />
                  <p className="text-[10px] text-white/60 font-medium leading-relaxed">Session recorded successfully. Your history has been updated.</p>
               </div>
               <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-mint mt-1.5" />
                  <p className="text-[10px] text-white/60 font-medium leading-relaxed">Weekly resonance report is now available in Analytics.</p>
               </div>
               <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                  <p className="text-[10px] text-white/60 font-medium leading-relaxed">New therapeutic frequencies available for download.</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Decorative Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-mint/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Premium Mobile Header */}
        <div className="lg:hidden px-6 py-6 border-b border-white/5 flex items-center justify-between glass-morphism sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ rotate: 15 }}
                  className="w-10 h-10 rounded-xl bg-brand-cyan flex items-center justify-center text-brand-teal font-black text-sm shadow-[0_0_20px_rgba(0,242,255,0.4)]"
                >
                  SC
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-white italic tracking-tighter leading-none">SMART CARE</span>
                  <span className="text-[8px] text-brand-cyan/60 font-bold uppercase tracking-[0.3em]">Holographic Interface</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-brand-mint animate-pulse shadow-[0_0_10px_#00ffcc]" />
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-white/20" />
              </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10">
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
            
            {activeTab === "dashboard" && (
              <>
                {/* Header Status */}
                <SystemStatusPanel />

                {/* Welcome & Quick Actions */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-tight md:leading-none">
                      Welcome Back, <span className="text-brand-cyan">{user?.email?.split('@')[0] || 'User'}</span>
                    </h1>
                    <p className="text-[10px] md:text-sm text-white/30 font-bold uppercase tracking-[0.2em] mt-2">Ready to align your neural frequency?</p>
                  </div>
                </div>

                <QuickActions 
                  onStartTherapy={startSession} 
                  onMoodBoost={handleMoodBoost}
                  setActiveTab={setActiveTab} 
                />


                {/* Step 01: Multi-modal Input - Hidden until session start */}
                <AnimatePresence>
                  {showTherapy && (
                    <motion.section 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      id="step-01-acquisition" 
                      className="space-y-6 pt-10 border-t border-white/5"
                    >
                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-black italic text-sm md:text-base">01</span>
                        <div>
                           <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Emotional Inputs</h2>
                           <p className="text-[8px] md:text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Acquisition of biological signals</p>
                        </div>
                      </div>
                      <EmotionGrid onDetectionUpdate={updateDetection} />
                      
                      <div className="pt-6">
                         <AnalysisControl onAnalyze={performAnalysis} isAnalyzing={isAnalyzing} />
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* Step 02: Analysis & Fusion */}
                <section className="space-y-6">
                  
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
                      id="step-03-therapy"
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
              </>
            )}

            {activeTab === "history" && (
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-black italic">H</span>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Emotion History</h2>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Past sessions and temporal logs</p>
                  </div>
                </div>
                <SessionHistory />
              </section>
            )}
            
            {activeTab === "insights" && (
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center text-brand-mint font-black italic">A</span>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Neural Analytics</h2>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Deep-pattern behavioral insights</p>
                  </div>
                </div>
                <AnalyticsOverview />
              </section>
            )}



            {activeTab === "profile" && (
              <section className="space-y-10">
                  <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 font-black italic">P</span>
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">User Profile</h2>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Holographic ID & Neural Sync Status</p>
                      </div>
                  </div>
                  
                  <div className="premium-card p-10 space-y-8 max-w-2xl">
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-brand-cyan/20 border-2 border-brand-cyan/40 p-1">
                           <div className="w-full h-full rounded-full bg-brand-teal flex items-center justify-center">
                              <User className="w-10 h-10 text-brand-cyan" />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{user?.email?.split('@')[0] || 'User'}</h3>
                           <p className="text-xs text-brand-cyan font-bold uppercase tracking-widest">{user?.email}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Session Count</span>
                           <span className="text-xl font-bold text-white">12 Cycles</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Sync Intensity</span>
                           <span className="text-xl font-bold text-brand-mint">High Resonance</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <button className="w-full p-4 rounded-xl bg-brand-cyan text-brand-teal font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all">
                           Update Neural signature
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full p-4 rounded-xl glass-morphism border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500/5 transition-all"
                        >
                           Terminate Session
                        </button>
                     </div>
                  </div>
              </section>
            )}
          </div>
          {/* Mobile Navigation Padding */}
          <div className="h-32 lg:hidden" />
        </div>
        
        <MobileNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
        />
      </div>

      <PremiumUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </main>
  );
}
