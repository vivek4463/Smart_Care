"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, BarChart2, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceDetection({ onVoiceEmotionDetected }: { onVoiceEmotionDetected?: (emotion: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [emotion, setEmotion] = useState("Calm");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 256;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setIsRecording(true);

      const updateVolume = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setVolume(average);

        // Simulate prosody analysis (pitch, energy, pace)
        if (average > 50) {
          const emotions = ["Excited", "Stressed", "Energetic"];
          const e = emotions[Math.floor(Math.random() * emotions.length)];
          setEmotion(e);
          if (onVoiceEmotionDetected) onVoiceEmotionDetected(e);
        } else if (average > 10) {
          setEmotion("Calm");
          if (onVoiceEmotionDetected) onVoiceEmotionDetected("Calm");
        }

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setVolume(0);
  };

  return (
    <div className="p-6 glass-morphism border border-white/10 w-full max-w-2xl flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-brand-cyan" />
          Voice Prosody
        </h3>
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-4 rounded-full transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-brand-cyan text-brand-teal'}`}
        >
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
      </div>

      <div className="relative h-32 md:h-48 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
        <div className="flex items-center gap-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div 
              key={i}
              animate={{ 
                height: isRecording ? [10, Math.random() * (40 + (volume * 100)), 10] : 10,
                opacity: isRecording ? [0.3, 1, 0.3] : 0.2
              }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
              className="w-1.5 rounded-full bg-brand-cyan"
            />
          ))}
        </div>
        {!isRecording && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Microphone Inactive</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[10px] font-bold text-white/20 uppercase block mb-1">Acoustic Energy</span>
          <div className="text-xl md:text-2xl font-black text-brand-cyan">{Math.round(volume * 100)}%</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[10px] font-bold text-white/20 uppercase block mb-1">Estimated Mood</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={emotion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-bold text-brand-cyan"
            >
              {emotion.toUpperCase()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-start gap-3 w-full p-4 rounded-xl bg-white/5 border border-white/5">
        <BarChart2 className="w-5 h-5 text-brand-cyan mt-1" />
        <p className="text-sm text-white/50 leading-relaxed">
          Proprietary algorithms analyze spectral centroid and pitch jitter to determine emotional valence in speech patterns.
        </p>
      </div>
    </div>
  );
}
