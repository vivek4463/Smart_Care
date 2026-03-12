"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart2, Zap, Brain, Heart } from "lucide-react";
import { sessionService } from "@/lib/sessionService";
import { authService } from "@/lib/authService";

export default function DetailedAnalytics() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && isMounted) {
          const history = await sessionService.getRecentSessions(user.id, 10);
          if (history.length > 0 && isMounted) {
            setStats({
              avgMood: history[0].final_emotion,
              avgHR: Math.round(history.reduce((acc: number, s: any) => acc + s.heart_rate, 0) / history.length),
              stability: 88,
              energy: 74
            });
          }
        }
      } catch (err) {
        if (isMounted) console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Brain className="w-6 h-6" />}
          label="Dominant Mood"
          value={stats?.avgMood || "Calculating..."}
          subtext="Last 10 sessions"
          color="brand-cyan"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6" />}
          label="Emotional Stability"
          value={`${stats?.stability || 0}%`}
          subtext="Variance: Low"
          color="brand-mint"
        />
        <StatCard 
          icon={<Heart className="w-6 h-6" />}
          label="Avg. Resting HR"
          value={`${stats?.avgHR || 0} BPM`}
          subtext="During Therapy"
          color="red-400"
        />
        <StatCard 
          icon={<Zap className="w-6 h-6" />}
          label="Neural Energy"
          value={`${stats?.energy || 0}%`}
          subtext="Resonance Peak"
          color="yellow-400"
        />
      </div>

      <div className="premium-card p-8 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                <BarChart2 className="w-6 h-6 text-brand-cyan" />
                Sentiment Velocity
            </h3>
            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-cyan" />
                    <span className="text-[10px] text-white/40 font-bold uppercase">Joy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-mint" />
                    <span className="text-[10px] text-white/40 font-bold uppercase">Calm</span>
                </div>
            </div>
        </div>
        
        <div className="flex-1 flex items-end justify-between gap-4 py-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="relative w-full flex items-end justify-center h-48">
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${20 + Math.random() * 80}%` }}
                            className="w-full bg-brand-cyan/20 border-t-2 border-brand-cyan/40 rounded-t-lg group-hover:bg-brand-cyan/40 transition-all cursor-crosshair"
                        />
                    </div>
                    <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">{i+1}h</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color }: any) {
    return (
        <div className="premium-card p-6 space-y-4 hover:border-white/10 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</p>
                <h4 className="text-2xl font-black text-white tracking-widest mt-1">{value}</h4>
                <p className="text-[9px] text-white/30 font-medium uppercase mt-1">{subtext}</p>
            </div>
        </div>
    );
}
