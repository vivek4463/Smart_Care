"use client";

import { useState } from "react";
import { Watch, Bluetooth, Activity, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBiometrics } from "@/context/BiometricContext";

export default function HeartRateMonitor({ onHeartRateDetected }: { onHeartRateDetected?: (bpm: number) => void }) {
  const { 
    bpm, 
    connectionType, 
    isSearching, 
    isConnected, 
    connect, 
    disconnect, 
    simulate,
    setBpmManual 
  } = useBiometrics();

  const [manualBpm, setManualBpm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advice, setAdvice] = useState<string>("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualBpm);
    if (!isNaN(val) && val > 30 && val < 220) {
      setBpmManual(val);
      processBpmRules(val);
      if (onHeartRateDetected) onHeartRateDetected(val);
    }
  };

  const processBpmRules = (val: number) => {
    if (val > 100) {
      setAdvice("Elevated Heart Rate Detected: High Stress Signal. Initiating calming harmonic overlay.");
    } else if (val < 60) {
      setAdvice("Low Heart Rate Detected: Deep Relaxation or Lethargy. Adjusting tempo for cognitive engagement.");
    } else {
      setAdvice("Heart Rate Nominal: Maintaining current therapeutic resonance.");
    }
  };

  const openPairingModal = () => {
    setIsModalOpen(true);
  };

  const closePairingModal = () => {
    setIsModalOpen(false);
  };

  const handleConnectRequest = async () => {
    try {
      await connect();
      closePairingModal();
    } catch (error: any) {
      closePairingModal();
      const isCancellation = error.name === 'NotFoundError' || (error.message && error.message.toLowerCase().includes('cancel'));
      
      if (!isCancellation) {
        if (confirm("Bluetooth pairing failed. Enter demo mode with simulated signals?")) {
          simulate();
        }
      }
    }
  };

  return (
    <div 
      suppressHydrationWarning
      className="p-6 glass-morphism border border-white/10 w-full max-w-2xl flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Watch className="w-5 h-5 text-brand-cyan" />
          Biometric Sync
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand-mint shadow-[0_0_8px_#00ffcc]' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold text-white/40 tracking-widest">
            {connectionType === 'bluetooth' ? 'PAIRED' : connectionType === 'simulated' ? 'SIMULATED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
        <div className="flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.button
                key="connect"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={openPairingModal}
                disabled={isSearching}
                className="group relative"
              >
                <div className="absolute inset-0 bg-brand-cyan/20 rounded-full blur-2xl group-hover:bg-brand-cyan/40 transition-all" />
                <div className="relative p-10 rounded-full glass-morphism border-brand-cyan/30 flex flex-col items-center gap-3">
                  {isSearching ? <Bluetooth className="w-10 h-10 text-brand-cyan animate-spin" /> : <Bluetooth className="w-10 h-10 text-brand-cyan" />}
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{isSearching ? 'Searching...' : 'Connect Device'}</span>
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="text-7xl font-black text-brand-cyan flex items-baseline gap-2">
                  {bpm || "--"}
                  <span className="text-sm font-medium text-white/40 uppercase tracking-widest">BPM</span>
                </div>
                <Activity className="w-12 h-12 text-brand-mint animate-pulse" />
                <button 
                  onClick={disconnect}
                  className="mt-4 px-4 py-2 border border-brand-cyan/30 rounded-full text-[10px] uppercase tracking-widest text-brand-cyan hover:bg-brand-cyan/10 transition-colors"
                >
                  Disconnect
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleManualSubmit} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Manual Entry</label>
            <div className="flex gap-2">
              <input 
                type="number"
                value={manualBpm}
                onChange={(e) => setManualBpm(e.target.value)}
                placeholder="BPM"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:ring-1 focus:ring-brand-cyan/50"
              />
              <button className="bg-brand-cyan text-brand-teal px-4 py-2 rounded-lg font-bold text-xs uppercase hover:scale-105 transition-all">
                Update
              </button>
            </div>
          </form>

          <AnimatePresence>
            {advice && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-[10px] font-bold text-brand-cyan leading-relaxed uppercase italic"
              >
                {advice}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Signal Method</span>
          <span className="text-sm font-bold text-white flex items-center gap-2">
            {connectionType === 'bluetooth' ? <Bluetooth className="w-3 h-3 text-brand-cyan" /> : <Activity className="w-3 h-3 text-brand-cyan" />}
            {connectionType === 'bluetooth' ? 'BLE Protocol' : connectionType === 'simulated' ? 'Simulated' : 'Manual Rules'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">State Logic</span>
          <span className="text-sm font-bold text-brand-mint flex items-center gap-1">
            <div className="w-1 h-2 bg-brand-mint rounded-full" />
            <div className="w-1 h-3 bg-brand-mint rounded-full" />
            <div className="w-1 h-4 bg-brand-mint rounded-full" />
            Active
          </span>
        </div>
      </div>

      <p className="text-center text-[10px] text-white/20 italic">
        * Manual heart rate entry enables cognitive rules for therapeutic intervention if biometric devices are unavailable.
      </p>

      {/* Premium Pre-Pairing Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md p-8 overflow-hidden border rounded-3xl glass-morphism border-brand-cyan/20 shadow-[0_30px_60px_rgba(0,242,255,0.15)]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-cyan/20 blur-[50px]" />
              <div className="absolute bottom-0 left-0 w-32 h-32 transform -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-mint/20 blur-[50px]" />

              <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                <div className="relative flex items-center justify-center w-24 h-24 mb-2">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-brand-cyan/40"
                  />
                   <motion.div 
                    animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-brand-mint/30"
                  />
                  <div className="relative p-4 rounded-full bg-brand-cyan/10 backdrop-blur-md">
                    <Bluetooth className="w-8 h-8 text-brand-cyan" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-white uppercase font-heading">
                    Neural Link Initialization
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-white/60">
                    Entering local airspace to detect biological transponders. Ensure your device is in 
                    <span className="font-bold text-brand-cyan border-b border-brand-cyan/30 mx-1">Pairing Mode</span>.
                  </p>
                </div>

                <div className="w-full p-4 mt-2 text-left rounded-xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-brand-mint shrink-0 mt-0.5" />
                    <p className="text-xs text-white/50 leading-relaxed">
                      Due to strict Web API security protocols, your device might appear as 
                      <strong className="text-white"> "Unknown" </strong> 
                      if it uses a proprietary companion app format. 
                    </p>
                  </div>
                  <div className="pl-8">
                     <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Expect a native browser popup next.</p>
                  </div>
                </div>

                <div className="flex w-full gap-3 mt-4">
                  <button 
                    onClick={closePairingModal}
                    className="flex-1 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all border rounded-xl text-white/40 border-white/10 hover:bg-white/5 hover:text-white"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleConnectRequest}
                    className="flex-[2] relative overflow-hidden group px-4 py-3 text-xs font-black tracking-widest uppercase text-brand-teal transition-all rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.2)] bg-brand-cyan hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 transition-transform duration-500 translate-x-[-100%] bg-white/20 group-hover:translate-x-[100%]" />
                    {isSearching ? 'Scanning...' : 'Proceed to Pair'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
