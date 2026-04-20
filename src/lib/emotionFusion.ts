export interface EmotionSignal {
  emotion: string;
  confidence: number;
}

export interface EmotionData {
  face: string | EmotionSignal;
  voice: string | EmotionSignal;
  text: string | EmotionSignal;
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

const WEIGHTS = {
  face: 0.55,
  text: 0.25,
  voice: 0.20
};

const CORE_EMOTION_MAP: Record<string, string> = {
  // Face & Core Labels
  "Happy": "Joy",
  "Sad": "Sadness",
  "Angry": "Anger",
  "Fear": "Fear",
  "Fearful": "Fear",
  "Disgusted": "Aversion",
  "Surprised": "Awe",
  "Neutral": "Neutral",
  
  // Text & Detailed Labels
  "Euphoria": "Joy",
  "Melancholy": "Sadness",
  "Hostility": "Anger",
  "Apprehension": "Anxiety",
  "Astonishment": "Awe",
  "Equilibrium": "Neutral",
  "Anxious": "Anxiety",
  "Awe": "Awe",
  "Love": "Joy",
  "Excited": "Joy",

  // Voice
  "Energetic": "Joy",
  "Passionate": "Joy",
  "Stressed": "Anxiety",
  "Unsettled": "Anxiety",
  "Whispering": "Neutral",
  "Calm": "Neutral",
  "Silence": "Neutral"
};

export function getFinalEmotion(data: EmotionData): FusionResult {
  const hr = typeof data.heartRate === 'number' ? data.heartRate : 0;
  
  // 1. Critical Biometric Alerts
  if (hr > 110) {
    return {
      finalEmotion: "Panic/Distress",
      confidence: 95,
      explanation: {
        face: getEmotionLabel(data.face),
        voice: getEmotionLabel(data.voice),
        text: getEmotionLabel(data.text),
        heartRate: "Critical (Elevated Heart Rate Detected)"
      }
    };
  }

  // 2. Weighted Scoring Logic
  const scores: Record<string, number> = {};

  const addScore = (modality: keyof typeof WEIGHTS, signal: string | EmotionSignal) => {
    const rawLabel = typeof signal === 'string' ? signal : signal.emotion;
    const signalConf = typeof signal === 'string' ? 1 : signal.confidence;
    
    const unifiedEmotion = CORE_EMOTION_MAP[rawLabel] || "Neutral";
    const weight = WEIGHTS[modality] * signalConf;
    
    scores[unifiedEmotion] = (scores[unifiedEmotion] || 0) + weight;
  };

  if (data.face) addScore("face", data.face);
  if (data.text) addScore("text", data.text);
  if (data.voice) addScore("voice", data.voice);

  let finalEmotion = "Neutral";
  let maxScore = 0;

  Object.entries(scores).forEach(([emotion, score]) => {
    if (score > maxScore) {
      maxScore = score;
      finalEmotion = emotion;
    }
  });

  let confidence = Math.round(maxScore * 100);
  if (maxScore < 0.2) confidence = 50; 

  return {
    finalEmotion,
    confidence: Math.min(confidence, 98),
    explanation: {
      face: getEmotionLabel(data.face),
      voice: getEmotionLabel(data.voice),
      text: getEmotionLabel(data.text),
      heartRate: hr > 0 ? `${hr} BPM` : "Stationary/Normal"
    }
  };
}

function getEmotionLabel(signal: string | EmotionSignal | undefined): string {
  if (!signal) return "No Signal";
  return typeof signal === 'string' ? signal : signal.emotion;
}
