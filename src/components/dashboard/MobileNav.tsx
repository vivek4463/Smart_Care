"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, History, BarChart2, User, Sparkles } from "lucide-react";

export default function MobileNav({ activeTab, setActiveTab }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'insights', icon: BarChart2, label: 'Insights' },
    { id: 'therapy_analytics', icon: Sparkles, label: 'Therapy' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
      <div className="glass-morphism border border-white/10 rounded-3xl p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl px-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="relative flex flex-col items-center gap-1 p-3 transition-all"
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="mobileActiveTab"
                className="absolute inset-0 bg-brand-cyan/10 rounded-2xl border border-brand-cyan/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon 
              className={`w-5 h-5 transition-colors relative z-10 ${
                activeTab === item.id ? 'text-brand-cyan' : 'text-white/40'
              }`} 
            />
            <span className={`text-[8px] font-black uppercase tracking-widest relative z-10 ${
              activeTab === item.id ? 'text-brand-cyan' : 'text-white/20'
            }`}>
              {item.label}
            </span>
            
            {activeTab === item.id && (
              <motion.div 
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f2ff]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
