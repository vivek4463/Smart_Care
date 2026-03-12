"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MessageSquare, X } from "lucide-react";
import { getEmergencyResources } from "@/lib/clinicalSafety";

export default function CrisisAlertModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const resources = getEmergencyResources();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass-morphism border-red-500/30 p-8 flex flex-col items-center gap-6 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400" />
            
            <div className="p-4 rounded-full bg-red-500/20 text-red-500">
              <AlertTriangle className="w-12 h-12" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">We're here for you</h2>
              <p className="text-white/60">It sounds like you're going through a very difficult time. Please know that you're not alone and there is support available right now.</p>
            </div>

            <div className="w-full space-y-4">
              {resources.map((res, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{res.name}</span>
                    <span className="text-lg font-bold text-brand-cyan">{res.contact}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 rounded-full bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-brand-teal transition-all">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-full bg-brand-mint/10 text-brand-mint hover:bg-brand-mint hover:text-brand-teal transition-all">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="mt-4 text-white/20 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Close this alert
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
