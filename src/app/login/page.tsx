"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Lock, Sparkles, Loader2 } from "lucide-react";
import { authService } from "@/lib/authService";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error: authError } = isSignUp 
      ? await authService.signUp(email, password)
      : await authService.signIn(email, password);

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-main flex items-center justify-center p-6 relative overflow-hidden">
      {/* Immersive Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-cyan/5 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-mint/5 rounded-full blur-[140px] animate-pulse" />

      <div className="relative z-10 w-full max-w-lg">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-10 md:p-14 space-y-10 relative overflow-hidden"
        >
          {/* Subtle Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-cyan/20 blur-[80px] rounded-full" />
          
          <div className="text-center relative z-10 space-y-6">
            <div className="inline-flex p-5 rounded-3xl bg-brand-cyan/10 text-brand-cyan mb-2 shadow-[0_10px_30px_rgba(0,242,255,0.2)]">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                    {isSignUp ? 'Initiate' : 'Synchronize'} <br />
                    <span className="text-gradient">Identity</span>
                </h1>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Integrated Intelligence Access</p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Neural ID (Email)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:bg-white/10 transition-all font-medium"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Encrypted Key (Password)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:bg-white/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black text-center uppercase tracking-widest"
                >
                  Authentication Error: {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-6 bg-brand-cyan text-brand-teal font-black rounded-2xl flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(0,242,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 text-xl tracking-tight">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (isSignUp ? 'Create Profile' : 'Authenticate Session')}
              </span>
              {!isLoading && <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>

          <div className="pt-8 border-t border-white/5 text-center relative z-10">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white/20 hover:text-brand-cyan transition-all text-[10px] font-black uppercase tracking-[0.3em]"
            >
              {isSignUp ? 'Existing Identity? Sign In' : "New Sequence? Establish Account"}
            </button>
          </div>
        </motion.div>
        
        <div className="mt-10 text-center opacity-10">
             <p className="text-[10px] text-white font-black uppercase tracking-[0.6em]">Smart Care AI • Integrated Resonance Architecture</p>
        </div>
      </div>
    </main>
  );
}
