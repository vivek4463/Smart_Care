"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Cpu, Zap } from "lucide-react";

export default function SystemStatusPanel() {
  const systems = [
    { name: "Visual Core", status: "Active", icon: Cpu, color: "text-brand-cyan" },
    { name: "Acoustic Engine", status: "Ready", icon: Zap, color: "text-brand-mint" },
    { name: "Neural Fusion", status: "Optimized", icon: ShieldCheck, color: "text-purple-400" },
  ];

  return (
    <div className="premium-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />
      
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center border border-brand-cyan/20">
          <CheckCircle2 className="w-6 h-6 text-brand-cyan animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-white uppercase tracking-tighter">System Integrity</span>
          <span className="text-[10px] text-brand-mint font-bold uppercase tracking-widest">All Modules Operational</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {systems.map((sys) => (
          <div key={sys.name} className="flex items-center gap-3 group">
            <div className={`p-2 rounded-lg bg-white/5 ${sys.color} group-hover:scale-110 transition-transform`}>
              <sys.icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{sys.name}</span>
              <span className="text-[10px] font-bold text-white uppercase">{sys.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping" />
        Lat: 12ms
      </div>
    </div>
  );
}
