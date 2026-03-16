"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertCircle, RefreshCw, Activity } from "lucide-react";

export default function FaceDetection({ onEmotionDetected }: { onEmotionDetected?: (data: { emotion: string; confidence: number }) => void }) {
  const webcamRef = useRef<Webcam>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [emotion, setEmotion] = useState<string>("Detecting...");
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      try {
        await tf.ready();
        const MODEL_URL = "/models";
        
        // Use tinyFaceDetector for better performance in browser
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        
        if (isMounted) setIsLoaded(true);
      } catch (err) {
        console.error("Face-api models load failed:", err);
        if (isMounted) setError("Neural Models Unavailable. Ensure /public/models contains required face-api data.");
      }
    };
    loadModels();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    let interval: NodeJS.Timeout;

    const runDetection = async () => {
      if (webcamRef.current && webcamRef.current.video?.readyState === 4) {
        try {
          const video = webcamRef.current.video;

          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
            .withFaceExpressions();

          if (detection) {
            const expressions = detection.expressions;
            // Filter out expressions with very low probability
            const bestMatch = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);

            const rawEmotion = bestMatch[0];
            const score = bestMatch[1];

            const emotionMap: Record<string, string> = {
              neutral: "Neutral",
              happy: "Happy",
              sad: "Sad",
              angry: "Angry",
              fearful: "Fearful",
              disgusted: "Disgusted",
              surprised: "Surprised"
            };

            const mappedEmotion = emotionMap[rawEmotion] || "Neutral";

            setEmotion(mappedEmotion);
            setConfidence(Math.round(score * 100));

            if (onEmotionDetected && score > 0.55) {
              onEmotionDetected({ emotion: mappedEmotion, confidence: score });
            }
          } else {
            setEmotion("Scanning...");
            setConfidence(0);
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      }
    };

    interval = setInterval(runDetection, 300); // Higher frequency for better responsiveness

    return () => clearInterval(interval);
  }, [isLoaded, onEmotionDetected]);

  return (
    <div 
      suppressHydrationWarning
      className="flex flex-col items-center gap-4 md:gap-6 p-4 md:p-6 glass-morphism border border-white/10 w-full max-w-2xl"
    >
      <div className="relative w-full h-[180px] md:h-[400px] bg-black rounded-2xl overflow-hidden border border-white/10 group">
        {!isLoaded && !error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-teal/50 backdrop-blur-md z-40">
            <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin mb-4" />
            <span className="text-xs font-bold text-brand-cyan tracking-widest uppercase">Initializing Bio-Scanner...</span>
          </div>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user"
              }}
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 transition-all group-hover:grayscale-0 group-hover:opacity-100"
            />

            <div className="absolute top-3 left-3 z-20">
              <div className="px-3 py-1 rounded-full glass-morphism text-[10px] font-bold text-brand-cyan flex items-center gap-1 border border-brand-cyan/20">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                NEURAL FEED ACTIVE
              </div>
            </div>

            <div className="absolute bottom-3 right-3 z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={emotion}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="px-6 py-3 rounded-2xl bg-brand-cyan text-brand-teal font-black text-xs shadow-[0_0_30px_rgba(0,242,255,0.4)] uppercase tracking-widest flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  {emotion}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-2xl">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-brand-cyan/20 shadow-[0_0_15px_rgba(0,242,255,0.2)]" style={{ animation: 'scan 4s linear infinite' }} />
            </div>
          </>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/40 backdrop-blur-md z-50 p-8 text-center">
            <div className="flex flex-col items-center gap-4 text-white">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="font-bold text-sm tracking-tight">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-600 rounded-xl text-xs font-black uppercase hover:bg-red-500 transition-all"
              >
                Retry System Initial
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-cyan/20" />
          <span className="text-[10px] font-bold text-white/20 uppercase block mb-1 tracking-tighter">Certainty index</span>
          <div className="text-2xl font-black text-brand-cyan tabular-nums tracking-tighter">{confidence}%</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-mint/20" />
          <span className="text-[10px] font-bold text-white/20 uppercase block mb-1 tracking-tighter">Dominant Mood</span>
          <div className="text-2xl font-black text-brand-mint italic uppercase truncate tracking-tighter">{emotion === "Detecting..." ? "Scanning" : emotion}</div>
        </div>
      </div>

      <div className="flex items-start gap-3 w-full p-4 rounded-xl bg-white/5 border border-white/5">
        <Camera className="w-5 h-5 text-brand-cyan mt-1" />
        <p className="text-[10px] text-white/40 leading-relaxed font-medium uppercase tracking-wider">
          Biometric extraction synchronized with Neural v2.5. Spatial mapping active. Emotion labels derived from localized neural weightings.
        </p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
      `}</style>
    </div>
  );
}
