"use client";

import { motion } from "framer-motion";
import { Heart, Music, Sparkles, Shield, ArrowRight, Brain } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main suppressHydrationWarning className="relative min-h-screen bg-gradient-main flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Decorative Orbs */}
      <div suppressHydrationWarning className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-cyan/5 rounded-full blur-[160px]" />
      <div suppressHydrationWarning className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-mint/5 rounded-full blur-[160px]" />

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl px-6 pt-32 pb-24 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 space-y-10 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-morphism border-white/5 text-brand-mint text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">
              <Sparkles className="w-4 h-4 text-brand-cyan" /> Next-Gen Emotional Intelligence
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter">
              Aura of <br />
              <span className="text-gradient">Resonance</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/50 max-w-2xl leading-relaxed font-light">
              Deep-tissue emotional analysis powered by multimodal AI. 
              Transform your resonance into algorithmic music therapy in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,242,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-5 bg-brand-cyan text-brand-teal font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-[0_10px_30px_rgba(0,242,255,0.3)] transition-all"
                >
                  Enter Therapy <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 glass-morphism text-white/80 font-bold rounded-2xl text-xl hover:bg-white/5 transition-all border border-white/10"
              >
                The Science
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-10 flex flex-wrap justify-center lg:justify-start gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-widest">Privacy First</span></div>
               <div className="flex items-center gap-2"><Brain className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-widest">Neural Sync</span></div>
               <div className="flex items-center gap-2"><Music className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-widest">Hi-Res Audio</span></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="flex-1 w-full max-w-2xl"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-cyan/20 to-brand-mint/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700" />
              <div className="relative rounded-[2.5rem] overflow-hidden glass border border-white/10 shadow-2xl">
                <img 
                  src="/images/hero.png" 
                  alt="AI Resonance Visualization" 
                  className="w-full h-full object-cover animate-float"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-teal/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8 p-6 glass-morphism border-white/5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] text-brand-cyan font-black uppercase tracking-widest">Live Analysis</p>
                            <p className="text-sm font-bold text-white">Neural Soundscape v2.4</p>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ height: [10, 24, 10] }}
                                    transition={{ repeat: Infinity, duration: 1 + i*0.2 }}
                                    className="w-1 bg-brand-cyan rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Refined Features */}
      <section id="features" className="relative z-10 w-full max-w-7xl px-6 py-24 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Brain className="w-10 h-10" />}
            title="Multimodal Detection"
            description="Our advanced neural mesh analyzes face, voice, text, and biometrics to build a complete emotional twin."
          />
          <FeatureCard 
            icon={<Music className="w-10 h-10" />}
            title="Algorithmic Synthesis"
            description="Not just a playlist. Real-time generative compositions synthesized via deep reinforcement learning."
          />
          <FeatureCard 
            icon={<Shield className="w-10 h-10" />}
            title="Privacy Protocol"
            description="Zero-knowledge biometric processing. Your emotional data never leaves the local encryption layer."
          />
        </div>
      </section>

      <footer className="relative z-10 py-12 border-t border-white/5 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 overflow-hidden flex items-center justify-center border border-brand-cyan/20">
                <img src="/logo.png" alt="SC" className="w-full h-full object-cover scale-110" />
            </div>
            <span className="text-white font-black tracking-tighter italic">SMART CARE</span>
        </div>
        <p className="text-white/20 text-xs font-medium uppercase tracking-[0.2em]">
          &copy; 2026 Smart Care Systems • Integrated Emotional Intelligence
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-10 glass-morphism border-white/5 hover:border-brand-cyan/20 transition-all duration-500 flex flex-col items-start gap-6 group"
    >
      <div className="p-4 rounded-2xl bg-brand-cyan/5 text-brand-cyan group-hover:scale-110 group-hover:bg-brand-cyan/10 transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
        <p className="text-white/40 leading-relaxed font-medium">{description}</p>
      </div>
    </motion.div>
  );
}
