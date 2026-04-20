"use client";

import { 
  LayoutDashboard, 
  History, 
  BarChart2, 
  User, 
  LogOut, 
  Bell,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ activeTab, setActiveTab, onLogout, onToggleNotifications, onUpgradeClick }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onToggleNotifications: () => void;
  onUpgradeClick: () => void;
}) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'insights', icon: BarChart2, label: 'Neural Insights' },
    { id: 'history', icon: History, label: 'Emotion History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="w-72 hidden lg:flex flex-col glass-morphism border-r border-white/5 p-6 space-y-8 h-full">
      <div className="flex items-center gap-4 px-2 group">
        <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.2)] group-hover:rotate-12 transition-transform border border-brand-cyan/30">
          <img src="/logo.png" alt="Smart Care Logo" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-white tracking-tighter italic leading-none">SMART CARE</span>
          <span className="text-[8px] text-brand-cyan/40 font-bold tracking-[0.3em] uppercase">Pulse Insight</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] px-2 mb-4">Main Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
              activeTab === item.id 
                ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-brand-cyan' : 'group-hover:text-brand-cyan/50 transition-colors'}`} />
            <span className="text-sm font-bold tracking-tight">{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTab"
                className="ml-auto w-1 h-4 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f2ff]" 
              />
            )}
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-4">
        <button 
          onClick={onToggleNotifications}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group"
        >
          <Bell className="w-5 h-5 group-hover:text-brand-cyan/50 transition-colors" />
          <span className="text-sm font-bold tracking-tight">Notifications</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-brand-mint" />
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold tracking-tight uppercase tracking-widest text-[10px]">Terminate Session</span>
        </button>
      </div>

      <div 
        onClick={onUpgradeClick}
        className="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10 flex items-center gap-4 group cursor-pointer hover:bg-brand-cyan/10 transition-all"
      >
        <Sparkles className="w-6 h-6 text-brand-cyan animate-pulse" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">Premium AI</span>
          <span className="text-[9px] text-white/30 font-bold uppercase">Upgrade Context</span>
        </div>
      </div>
    </aside>
  );
}
