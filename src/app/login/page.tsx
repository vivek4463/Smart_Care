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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const { error: authError } = await authService.signInWithGoogle();
    
    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    }
    // Supabase will handle the redirect
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
            <div className="inline-flex w-24 h-24 rounded-3xl bg-brand-cyan/10 overflow-hidden p-2 shadow-[0_10px_30px_rgba(0,242,255,0.2)] border border-brand-cyan/20">
              <img src="/logo.png" alt="Smart Care Logo" className="w-full h-full object-cover scale-110" />
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

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="bg-[#0A0F14] px-4 text-white/20">OR CONTINUE WITH</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative w-full py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-4 hover:bg-white/10 hover:border-brand-cyan/30 transition-all disabled:opacity-50 overflow-hidden"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="relative z-10 tracking-tight">
                Continue with Gmail
              </span>
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
