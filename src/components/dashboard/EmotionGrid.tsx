"use client";

import { motion } from "framer-motion";
import FaceDetection from "@/components/EmotionDetector/FaceDetection";
import VoiceDetection from "@/components/EmotionDetector/VoiceDetection";
import TextAnalysis from "@/components/EmotionDetector/TextAnalysis";
import HeartRateMonitor from "@/components/EmotionDetector/HeartRateMonitor";

export default function EmotionGrid({ onDetectionUpdate }: { 
  onDetectionUpdate: (type: string, value: any) => void 
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full h-full overflow-y-auto custom-scrollbar pr-2">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 h-fit"
      >
        <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em] px-2">Visual Resonance</span>
        <FaceDetection onEmotionDetected={(e) => onDetectionUpdate('face', e)} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2 h-fit"
      >
        <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em] px-2">Auditory Prosody</span>
        <VoiceDetection onVoiceEmotionDetected={(e) => onDetectionUpdate('voice', e)} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2 h-fit"
      >
        <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em] px-2">Lexical Sentiment</span>
        <TextAnalysis onTextEmotionDetected={(e) => onDetectionUpdate('text', e)} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2 h-fit"
      >
        <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em] px-2">Biometric Coherence</span>
        <HeartRateMonitor onHeartRateDetected={(bpm) => onDetectionUpdate('heartRate', bpm)} />
      </motion.div>
    </div>
  );
}
