"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Play, 
  History, 
  Settings, 
  User, 
  LogOut, 
  Sparkles, 
  Brain, 
  Activity,
  Download,
  Trash2,
  Loader2,
  ArrowRight
} from "lucide-react";
import { exportUserData, deleteUserData } from "@/lib/privacy";
import { authService } from "@/lib/authService";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const handleExport = async () => {
    await exportUserData();
    alert("Data exported successfully!");
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      await deleteUserData();
      await authService.signOut();
      router.push("/login");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-cyan/20 blur-3xl animate-pulse" />
        <Loader2 className="w-16 h-16 text-brand-cyan animate-spin relative z-10" />
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <main className="screen-fit bg-gradient-main p-6 md:p-8 lg:p-10 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-mint/5 rounded-full blur-[120px]" />

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full overflow-hidden relative z-10">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-cyan flex items-center justify-center text-brand-teal font-black shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all duration-500 group-hover:rotate-12">
            SC
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tighter italic leading-none">SMART CARE</span>
            <span className="text-[10px] text-brand-cyan/40 font-bold tracking-[0.3em] uppercase">Intelligence Portal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-sm font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Terminate Session</span>
          </button>
          <div className="w-12 h-12 rounded-2xl border border-white/10 p-1 glass group hover:border-brand-cyan/30 transition-all cursor-pointer">
            <div className="w-full h-full rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-mint flex items-center justify-center text-brand-teal font-black">
                {user.email[0].toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Welcome Section */}
        <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 md:p-14 rounded-[3rem] glass-morphism border-white/5 relative overflow-hidden group"
          >
            <div className="absolute -inset-20 bg-brand-cyan/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-brand-cyan/10 text-brand-cyan text-[10px] font-black tracking-widest uppercase border border-brand-cyan/20">Alpha Access</span>
                <span className="text-white/20 text-[10px] font-bold tracking-widest uppercase">Since 2026</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
                Welcome back, <br />
                <span className="text-gradient drop-shadow-[0_0_30px_rgba(0,242,255,0.2)]">
                  {user.email.split('@')[0]}
                </span>
              </h1>
              
              <p className="text-xl text-white/50 max-w-xl font-light leading-relaxed">
                Your neural profile has been synchronized. Ready to explore your emotional soundscape?
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => router.push("/detect-emotion")}
                  className="group relative px-10 py-6 bg-brand-cyan text-brand-teal font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-[0_10px_40px_rgba(0,242,255,0.3)] hover:scale-[1.02] active:scale-98 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  Initiate Scan <Play className="w-6 h-6 fill-current" />
                </button>
                <button className="px-10 py-6 glass-morphism text-white/60 font-bold rounded-2xl text-xl hover:text-white transition-all border border-white/5">
                  View Insights
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatCard 
              icon={<History className="w-8 h-8" />}
              label="Sync Cycles"
              value="42"
              trend="+12% from last week"
              description="Active emotional alignment hours"
            />
            <StatCard 
              icon={<Brain className="w-8 h-8" />}
              label="Neural Stability"
              value="91.4%"
              trend="Peak Performance"
              color="text-brand-mint"
              description="Consolidated biometric coherence"
            />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-10 rounded-[2.5rem] glass-morphism border-white/5 space-y-10"
          >
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                <Settings className="w-6 h-6 text-brand-cyan" />
                Control Center
                </h3>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">System Parameters</p>
            </div>
            
            <div className="space-y-4">
              <ConfigButton icon={<User className="w-5 h-5 text-brand-cyan/50" />} label="Neural Profile" />
              <ConfigButton icon={<Activity className="w-5 h-5 text-brand-cyan/50" />} label="Resonance Data" />
            </div>

            <div className="pt-10 border-t border-white/5 space-y-6">
              <div className="space-y-2 mb-6">
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Governance</h4>
              </div>
              
              <button 
                onClick={handleExport}
                className="w-full py-5 rounded-2xl border border-white/5 flex items-center justify-between px-8 text-white/40 hover:text-brand-cyan hover:border-brand-cyan/30 hover:bg-brand-cyan/5 transition-all group"
              >
                <div className="flex items-center gap-4 transition-transform group-hover:translate-x-2">
                  <Download className="w-5 h-5 opacity-40 group-hover:opacity-100" /> 
                  <span className="text-sm font-bold tracking-tight uppercase">Archive Identity</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
              
              <button 
                onClick={handleDelete}
                className="w-full py-5 rounded-2xl border border-red-500/10 text-red-500/30 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all flex items-center justify-between px-8 group"
              >
                <div className="flex items-center gap-4 transition-transform group-hover:translate-x-2">
                  <Trash2 className="w-5 h-5 opacity-40 group-hover:opacity-100" /> 
                  <span className="text-sm font-bold tracking-tight uppercase">Purge Core</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </motion.div>

          {/* Premium Insight */}
          <div className="p-8 rounded-[2rem] bg-brand-cyan/5 border border-brand-cyan/10 flex gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/10 blur-3xl rounded-full" />
            <Sparkles className="w-10 h-10 text-brand-cyan flex-shrink-0 animate-pulse relative z-10" />
            <div className="space-y-2 relative z-10">
                <p className="text-xs font-black text-brand-cyan uppercase tracking-widest">Daily Insight</p>
                <p className="text-sm text-white/40 leading-relaxed font-medium italic">
                    "Adaptive reinforcement learning has improved your focus sessions by 18% based on last night's resonance."
                </p>
            </div>
          </div>
        </div>

      </div>
      </div>
    </main>
  );
}

function ConfigButton({ icon, label }: { icon: any, label: string }) {
    return (
        <button className="w-full p-5 rounded-2xl bg-white/5 flex items-center justify-between group hover:bg-white/10 transition-all border border-transparent hover:border-white/5 shadow-lg">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/5 transition-colors group-hover:bg-brand-cyan/10">
                    {icon}
                </div>
                <span className="text-white/60 font-bold tracking-tight group-hover:text-white transition-colors">{label}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-brand-cyan group-hover:scale-150 transition-all shadow-[0_0_10px_rgba(0,242,255,0)] group-hover:shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
        </button>
    )
}

function StatCard({ icon, label, value, trend, color = "text-brand-cyan", description }: { icon: any, label: string, value: string, trend: string, color?: string, description: string }) {
  return (
    <div className="premium-card p-10 flex flex-col gap-6 group">
      <div className="flex justify-between items-start">
        <div className="p-4 rounded-2xl bg-white/5 text-white/30 transition-all duration-500 group-hover:bg-brand-cyan/10 group-hover:text-brand-cyan">
            {icon}
        </div>
        <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] group-hover:text-brand-cyan/40 transition-colors">Real-time</div>
      </div>
      <div className="space-y-4">
        <div>
            <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">{label}</span>
            <div className={`text-5xl font-black ${color} mt-2 tracking-tighter drop-shadow-[0_0_20px_rgba(0,242,255,0.1)]`}>{value}</div>
        </div>
        <div className="pt-4 border-t border-white/5 space-y-1">
            <div className="flex items-center gap-2">
                <div className={`w-1 h-4 rounded-full ${color.includes('mint') ? 'bg-brand-mint' : 'bg-brand-cyan'} opacity-40`} />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{trend}</span>
            </div>
            <p className="text-[10px] text-white/10 font-bold uppercase tracking-tight">{description}</p>
        </div>
      </div>
    </div>
  );
}
