"use client";

import { useEffect, useState } from "react";
import { sessionService } from "@/lib/sessionService";
import { authService } from "@/lib/authService";
import { motion } from "framer-motion";
import { History, Calendar, Heart, Activity, Clock } from "lucide-react";

export default function SessionHistory() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && isMounted) {
          const data = await sessionService.getRecentSessions(user.id, 20);
          if (isMounted) setSessions(data);
        }
      } catch (err) {
        if (isMounted) console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="premium-card p-10 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <History className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No temporal logs detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="premium-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-brand-cyan/20 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white italic uppercase tracking-tight">
                  {session.final_emotion} <span className="text-white/20 not-italic text-xs ml-2">Resonance</span>
                </h4>
                <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                   <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(session.created_at).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Biometrics</span>
                  <div className="flex items-center gap-2 text-brand-mint font-black">
                     <Heart className="w-4 h-4" />
                     {session.heart_rate} BPM
                  </div>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sync</span>
                  <div className="text-brand-cyan font-black">
                     {session.confidence}%
                  </div>
               </div>
               <div className="w-1.5 h-10 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${session.confidence}%` }}
                    className="w-full bg-brand-cyan" 
                  />
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
