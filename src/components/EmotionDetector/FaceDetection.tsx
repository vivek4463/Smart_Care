"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertCircle, RefreshCw } from "lucide-react";

export default function FaceDetection({ onEmotionDetected }: { onEmotionDetected?: (emotion: string) => void }) {
  const webcamRef = useRef<Webcam>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [emotion, setEmotion] = useState<string>("Detecting...");
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setIsLoaded(true);
      } catch (err) {
        console.error("Face-api models load failed:", err);
        setError("Failed to load neural models");
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video?.readyState === 4) {
        const video = webcamRef.current.video;
        
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detection) {
          // Find the expression with highest probability
          const expressions = detection.expressions;
          const bestMatch = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
          
          const rawEmotion = bestMatch[0];
          const score = bestMatch[1];

          // Map face-api emotions to our app's set
          const emotionMap: Record<string, string> = {
            neutral: "Neutral",
            happy: "Happy",
            sad: "Sad",
            angry: "Stress",
            fearful: "Stress",
            disgusted: "Stress",
            surprised: "Happy"
          };

          const mappedEmotion = emotionMap[rawEmotion] || "Neutral";
          
          setEmotion(mappedEmotion);
          setConfidence(Math.round(score * 100));
          if (onEmotionDetected) onEmotionDetected(mappedEmotion);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, onEmotionDetected]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 glass-morphism border border-white/10 w-full max-w-2xl">
      <div className="relative w-full h-[250px] md:h-[400px] bg-black rounded-2xl overflow-hidden border border-white/10 group">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-teal/50 backdrop-blur-md">
            <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
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
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <div className="absolute top-3 left-3 z-20">
              <div className="px-3 py-1 rounded-full glass-morphism text-[10px] font-bold text-brand-cyan flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                NEURAL FEED ACTIVE
              </div>
            </div>

            <div className="absolute bottom-3 right-3 z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={emotion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="px-4 py-2 rounded-xl bg-brand-cyan text-brand-teal font-extrabold text-sm shadow-lg shadow-brand-cyan/20"
                >
                  {emotion.toUpperCase()}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm z-30">
            <div className="flex items-center gap-2 text-white font-bold bg-red-600 px-4 py-2 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[10px] font-bold text-white/20 uppercase block mb-1">Signal Confidence</span>
          <div className="text-xl md:text-2xl font-black text-brand-cyan">{confidence}%</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[10px] font-bold text-white/20 uppercase block mb-1">Detected Resonance</span>
          <div className="text-xl md:text-2xl font-black text-brand-mint italic uppercase">{emotion || "Scanning..."}</div>
        </div>
      </div>

      <div className="flex items-start gap-3 w-full p-4 rounded-xl bg-white/5 border border-white/5">
        <Camera className="w-5 h-5 text-brand-cyan mt-1" />
        <p className="text-sm text-white/50 leading-relaxed">
          Real-time biometric extraction via tiny-face neural net. Expression mapping synchronized with therapeutic frequency engine.
        </p>
      </div>
    </div>
  );
}
