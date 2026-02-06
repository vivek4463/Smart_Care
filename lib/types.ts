// Emotion Types
export type EmotionType = 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'neutral';

export interface EmotionScore {
    emotion: EmotionType;
    confidence: number;
}

export interface EmotionResult {
    face?: EmotionScore[];
    voice?: EmotionScore[];
    text?: EmotionScore[];
    heartRate?: number;
    aggregated: EmotionScore;
    timestamp: Date;
}

// Music Types
export interface MusicConfig {
    tempo: number; // BPM
    key: string;
    mode: 'major' | 'minor';
    duration: number; // in seconds
    instruments: string[];
    intensity: number; // 0-1
}

export interface GeneratedMusic {
    id: string;
    audioUrl?: string;
    config: MusicConfig;
    baseEmotions: EmotionScore[];
    duration: number;
    createdAt: Date;
}

// Feedback Types
export type SatisfactionLevel = 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied';

export interface Feedback {
    musicId: string;
    satisfaction: SatisfactionLevel;
    rating: number; // 1-5
    comments?: string;
    emotionalImpact?: string;
    suggestions?: string;
    timestamp: Date;
}

export interface FeedbackAnalysis {
    overallSatisfaction: number; // 0-1
    improvements: string[];
    strengthAreas: string[];
}

// Voice Assistant Types
export interface VoiceQuery {
    text: string;
    audioData?: Blob;
    timestamp: Date;
}

export interface VoiceResponse {
    text: string;
    audioUrl?: string;
    action?: string;
    timestamp: Date;
}

// User Types
export interface User {
    id: string;
    name: string;
    email: string;
    preferences?: {
        musicGenres?: string[];
        instruments?: string[];
        tempo?: 'slow' | 'medium' | 'fast';
    };
}

// Detection Step
export type DetectionStep = 'face' | 'voice' | 'text' | 'heartrate' | 'analysis';

export interface DetectionProgress {
    currentStep: DetectionStep;
    completedSteps: DetectionStep[];
    results: Partial<EmotionResult>;
}
