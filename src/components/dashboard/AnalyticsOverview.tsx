"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, History, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { authService } from "@/lib/authService";
import { sessionService } from "@/lib/sessionService";

export default function AnalyticsOverview() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        const historyData = await sessionService.getRecentSessions(user.id);
        setSessions(historyData);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const getMoodColor = (mood: string) => {
    if (!mood) return 'text-white/40';
    switch(mood.toLowerCase()) {
      case 'happy': return 'text-brand-mint';
      case 'sad': return 'text-brand-cyan';
      case 'stress': return 'text-red-400';
      default: return 'text-white/40';
    }
  };

  const weeklyData = [
    { day: "Mon", value: 40, mood: "Sad" },
    { day: "Tue", value: 65, mood: "Stress" },
    { day: "Wed", value: 30, mood: "Calm" },
    { day: "Thu", value: 85, mood: "Joy" },
    { day: "Fri", value: 50, mood: "Neutral" },
    { day: "Sat", value: 90, mood: "Joy" },
    { day: "Sun", value: 75, mood: "Calm" },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* Emotion History Table */}
      <div className="premium-card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-brand-cyan" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Temporal Log</h3>
          </div>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-brand-cyan/10 text-white/20 hover:text-brand-cyan transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Session Index</th>
                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Signature</th>
                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.length > 0 ? sessions.map((item, i) => (
                <tr key={item.id || i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] text-white/20 font-medium uppercase tracking-[0.1em]">
                        {item.heart_rate} BPM Average
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getMoodColor(item.final_emotion)}`}>
                      {item.final_emotion}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-mint/10 text-brand-mint">
                      ✓
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
                    No session data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Trends Chart (Custom SVG) */}
      <div className="premium-card p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-brand-mint" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Sentiment Velocity</h3>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-white/20" />
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Last 7 Cycles</span>
          </div>
        </div>

        <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
          {weeklyData.map((data, i) => (
            <div key={data.day} className="flex-1 h-full flex flex-col items-center gap-3 group">
              <div className="w-full h-full relative flex flex-col items-center justify-end">
                 <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${data.value}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "circOut" }}
                  className={`w-full max-w-[12px] rounded-t-full relative group-hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all ${
                    data.mood === 'Joy' ? 'bg-brand-mint' : 
                    data.mood === 'Stress' ? 'bg-red-400' : 
                    data.mood === 'Sad' ? 'bg-brand-cyan' : 'bg-white/20'
                  }`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-[8px] font-black text-brand-teal opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.value}%
                  </div>
                </motion.div>
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase group-hover:text-white transition-colors">
                {data.day}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-mint" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Optimal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-cyan" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
