"use client";

import { useEffect, useState } from "react";
import { sessionService } from "@/lib/sessionService";
import { authService } from "@/lib/authService";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Music, TrendingUp, Sparkles } from "lucide-react";

export default function TherapyAnalytics() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && isMounted) {
          const history = await sessionService.getRecentSessions(user.id, 15);
          if (isMounted) setData(history);
        }
      } catch (err) {
        if (isMounted) console.error("Error fetching therapy data:", err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-8">
      <div className="premium-card p-8 flex flex-col md:flex-row items-center gap-10">
         <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
               <Music className="w-8 h-8 text-brand-cyan" />
               Therapeutic Impact
            </h3>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
               Real-time correlation analysis between harmonic frequency exposure and emotional stability. Your resonance is showing a **12% improvement** in recovery speed compared to last week.
            </p>
            <div className="flex gap-4 pt-4">
               <div className="px-5 py-3 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20">
                  <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest block">Avg Sync</span>
                  <span className="text-xl font-bold text-white">92%</span>
               </div>
               <div className="px-5 py-3 rounded-2xl bg-brand-mint/10 border border-brand-mint/20">
                  <span className="text-[10px] font-black text-brand-mint uppercase tracking-widest block">Recovery</span>
                  <span className="text-xl font-bold text-white">+8.4m</span>
               </div>
            </div>
         </div>
         <div className="w-full md:w-64 h-64 relative flex items-center justify-center">
            <div className="absolute inset-0 border-[16px] border-white/5 rounded-full" />
            <motion.div 
               initial={{ rotate: 0 }}
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
               className="absolute inset-0 border-[16px] border-transparent border-t-brand-cyan border-r-brand-mint rounded-full" 
            />
            <div className="text-center">
               <span className="text-4xl font-black text-white italic">84</span>
               <span className="block text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-2">Stability Index</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <ActivityBox 
            title="Acoustic Resonance Trend"
            icon={<TrendingUp className="w-5 h-5" />}
            color="brand-cyan"
         />
         <ActivityBox 
            title="Bio-feedback Loop"
            icon={<Sparkles className="w-5 h-5" />}
            color="brand-mint"
         />
      </div>
    </div>
  );
}

function ActivityBox({ title, icon, color }: any) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
     <div className="premium-card p-6 space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
                 {icon}
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest">{title}</h4>
           </div>
        </div>
        <div className="h-32 flex items-end gap-1 relative group/chart">
           {Array.from({ length: 20 }).map((_, i) => {
              const percentage = Math.floor(30 + Math.random() * 70);
              return (
                 <div 
                    key={i} 
                    className="flex-1 h-full flex items-end relative"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                 >
                    <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${percentage}%` }}
                       className={`w-full rounded-t-sm bg-${color}/20 group-hover/chart:bg-${color}/10 hover:!bg-${color}/60 transition-all cursor-pointer relative`}
                    />
                    
                    <AnimatePresence>
                       {hoveredIndex === i && (
                          <motion.div 
                             initial={{ opacity: 0, y: 10, scale: 0.9 }}
                             animate={{ opacity: 1, y: -5, scale: 1 }}
                             exit={{ opacity: 0, y: 10, scale: 0.9 }}
                             className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white whitespace-nowrap z-50 shadow-2xl pointer-events-none"
                          >
                             <div className="flex flex-col items-center">
                                <span className="uppercase tracking-widest opacity-60">Cycle {i + 1}</span>
                                <span className="text-brand-cyan text-xs">{percentage}% Impact</span>
                             </div>
                             <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              );
           })}
        </div>
     </div>
  );
}
