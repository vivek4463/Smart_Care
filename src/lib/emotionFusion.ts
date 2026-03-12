export interface EmotionData {
  face: string;
  voice: string;
  text: string;
  heartRate: number | string;
}

export interface FusionResult {
  finalEmotion: string;
  confidence: number;
  explanation: {
    face: string;
    voice: string;
    text: string;
    heartRate: string;
  };
}

/**
 * Emotion Fusion Engine
 * Combines multimodal signals to derive a unified emotional state.
 * Logic aligned with the SmartCare Blueprint.
 */
export function getFinalEmotion(data: EmotionData): FusionResult {
  const hr = typeof data.heartRate === 'number' ? data.heartRate : 0;
  
  // 1. Critical Overrides (e.g. Stress detected by Heart Rate)
  if (hr > 100) {
    return {
      finalEmotion: "Stress",
      confidence: 92,
      explanation: {
        face: data.face || "Neutral",
        voice: data.voice || "Neutral",
        text: data.text || "Neutral",
        heartRate: "Elevated (>100 BPM)"
      }
    };
  }

  // 2. Blueprint Specific Logic: Sadness detection
  if (data.face.toLowerCase() === "sad" || data.text.toLowerCase() === "sad") {
    return {
      finalEmotion: "Sad",
      confidence: 88,
      explanation: {
        face: data.face || "Neutral",
        voice: data.voice || "Neutral",
        text: data.text || "Neutral",
        heartRate: hr > 0 ? `${hr} BPM` : "Normal"
      }
    };
  }

  // 3. Multimodal Convergence (e.g. Happy/Joy)
  if (data.face.toLowerCase() === "happy" || data.voice.toLowerCase() === "excited") {
    return {
      finalEmotion: "Happy",
      confidence: 85,
      explanation: {
        face: data.face || "Neutral",
        voice: data.voice || "Neutral",
        text: data.text || "Neutral",
        heartRate: hr > 0 ? `${hr} BPM` : "Normal"
      }
    };
  }

  // 4. Fallback Logic
  const primaryEmotion = data.face || data.text || data.voice || "Neutral";
  
  return {
    finalEmotion: primaryEmotion,
    confidence: 75,
    explanation: {
      face: data.face || "Not detected",
      voice: data.voice || "Not detected",
      text: data.text || "Not recorded",
      heartRate: hr > 0 ? `${hr} BPM` : "Stationary"
    }
  };
}
