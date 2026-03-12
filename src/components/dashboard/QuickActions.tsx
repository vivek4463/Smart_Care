"use client";

import { motion } from "framer-motion";
import { Play, History, Sparkles, BarChart2 } from "lucide-react";

interface QuickActionProps {
  icon: any;
  label: string;
  sublabel: string;
  color: string;
  onClick?: () => void;
  primary?: boolean;
}

function ActionButton({ icon: Icon, label, sublabel, color, onClick, primary }: QuickActionProps) {
  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group overflow-hidden p-5 rounded-[2rem] flex flex-col items-start gap-4 transition-all duration-500 border h-full w-full ${
        primary 
          ? 'bg-brand-cyan text-brand-teal border-brand-cyan shadow-[0_15px_40px_rgba(0,242,255,0.3)]' 
          : 'glass-morphism border-white/5 hover:border-white/10 text-white shadow-xl'
      }`}
    >
      {/* Decorative Gradient Background for hover */}
      {!primary && (
        <div className={`absolute inset-0 bg-gradient-to-br from-${color}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      )}
      
      <div className={`p-3 rounded-2xl ${primary ? 'bg-brand-teal/10' : 'bg-white/5'} ${!primary && `group-hover:text-${color}`} transition-colors`}>
        <Icon className={`w-6 h-6 ${primary ? 'text-brand-teal' : 'text-white/40 group-hover:text-inherit'}`} />
      </div>
      
      <div className="flex flex-col items-start text-left space-y-1">
        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${primary ? 'text-brand-teal/60' : 'text-white/20'}`}>
          {sublabel}
        </span>
        <span className={`text-lg font-black tracking-tight leading-none ${primary ? 'text-brand-teal' : 'text-white'}`}>
          {label}
        </span>
      </div>

      {primary && (
        <div className="absolute top-4 right-4 animate-pulse">
           <div className="w-2 h-2 rounded-full bg-brand-teal" />
        </div>
      )}
    </motion.button>
  );
}

export default function QuickActions({ 
  onStartTherapy, 
  onMoodBoost,
  setActiveTab 
}: { 
  onStartTherapy: () => void;
  onMoodBoost: () => void;
  setActiveTab: (tab: string) => void;
}) {
  const actions = [
    {
      id: "start",
      icon: Play,
      label: "Start Therapy",
      sublabel: "Neural Sync",
      color: "brand-cyan",
      primary: true,
      onClick: onStartTherapy
    },
    {
      id: "history",
      icon: History,
      label: "View History",
      sublabel: "Temporal Log",
      color: "purple-400",
      onClick: () => setActiveTab("history")
    },
    {
      id: "mood",
      icon: Sparkles,
      label: "Mood Boost",
      sublabel: "Aura Repair",
      color: "brand-mint",
      onClick: onMoodBoost
    },
    {
      id: "analytics",
      icon: BarChart2,
      label: "Insights",
      sublabel: "Pattern Hub",
      color: "blue-400",
      onClick: () => setActiveTab("insights")
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2 h-8 bg-brand-cyan rounded-full shadow-[0_0_15px_#00f2ff]" />
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Quick Actions</h2>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Direct Neural Access</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {actions.map((action) => (
          <ActionButton key={action.id} {...action} />
        ))}
      </div>
    </section>
  );
}
