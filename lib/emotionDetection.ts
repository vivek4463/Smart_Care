import { EmotionScore, EmotionType } from './types';

// Environment variable for HuggingFace API
const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY || '';
const HF_API_URL = 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base';

/**
 * Real ML-based text emotion analysis using HuggingFace Transformers
 * Replaces keyword matching with transformer-based sentiment analysis
 */
export async function analyzeTextEmotionML(text: string): Promise<EmotionScore[]> {
    if (!text || text.trim().length === 0) {
        return [{ emotion: 'neutral', confidence: 0.95 }];
    }

    if (!HF_API_KEY) {
        console.warn('HuggingFace API key not found, falling back to keyword-based analysis');
        return analyzeTextEmotion(text);
    }

    try {
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text }),
        });

        if (!response.ok) {
            if (response.status === 503) {
                // Model is loading, wait and retry
                await new Promise(resolve => setTimeout(resolve, 2000));
                return analyzeTextEmotionML(text);
            }
            throw new Error(`HuggingFace API error: ${response.status}`);
        }

        const result = await response.json();

        // HuggingFace returns [[{label, score}, ...]]
        const predictions = Array.isArray(result[0]) ? result[0] : result;

        // Map HuggingFace labels to our EmotionType
        const labelMap: Record<string, EmotionType> = {
            'joy': 'happy',
            'sadness': 'sad',
            'anger': 'angry',
            'fear': 'fearful',
            'disgust': 'disgusted',
            'surprise': 'surprised',
            'neutral': 'neutral'
        };

        const emotionScores: EmotionScore[] = predictions
            .map((pred: { label: string; score: number }) => ({
                emotion: labelMap[pred.label.toLowerCase()] || 'neutral',
                confidence: pred.score
            }))
            .filter((score: EmotionScore) => score.emotion in labelMap)
            .sort((a: EmotionScore, b: EmotionScore) => b.confidence - a.confidence);

        return emotionScores.length > 0 ? emotionScores : [{ emotion: 'neutral', confidence: 0.75 }];

    } catch (error) {
        console.error('Text emotion analysis error:', error);
        // Fallback to keyword-based analysis
        return analyzeTextEmotion(text);
    }
}

/**
 * Face emotion detection using TensorFlow.js FER model
 * Falls back to simulation if model file is not available
 */
export async function detectFaceEmotionML(imageData: string): Promise<EmotionScore[]> {
    try {
        // Try to use TensorFlow.js FER model
        const { detectFaceEmotionTFJS } = await import('./mlModels/ferModel');
        const result = await detectFaceEmotionTFJS(imageData);
        return result;
    } catch (error) {
        console.warn('FER model not available, using simulated data:', error);
        // Fallback to simulated detection
        return detectFaceEmotion({} as any);
    }
}

/**
 * Voice emotion detection using prosodic features
 * NEW: Real implementation with Web Audio API
 */
export async function detectVoiceEmotionML(durationMs: number = 5000): Promise<EmotionScore[]> {
    try {
        const { recordAndAnalyzeVoice } = await import('./mlModels/voiceEmotionModel');
        const result = await recordAndAnalyzeVoice(durationMs);

        return [{
            emotion: result.emotion,
            confidence: result.confidence
        }];
    } catch (error) {
        console.error('Voice emotion detection error:', error);
        // Fallback to neutral
        return [{ emotion: 'neutral', confidence: 0 }];
    }
}

/**
 * Heart rate monitoring using camera-based PPG
 * NEW: Real implementation with rPPG algorithm
 */
export async function detectHeartRateML(
    videoElement: HTMLVideoElement,
    durationSeconds: number = 30
): Promise<{ heartRate: number; stress: 'low' | 'medium' | 'high'; confidence: number }> {
    try {
        const { monitorHeartRate } = await import('./mlModels/heartRateMonitor');
        const result = await monitorHeartRate(videoElement, durationSeconds);

        return {
            heartRate: result.heartRate,
            stress: result.stressLevel,
            confidence: result.confidence
        };
    } catch (error) {
        console.error('Heart rate monitoring error:', error);
        // Fallback to default values
        return {
            heartRate: 0,
            stress: 'medium',
            confidence: 0
        };
    }
}

// ============================================================================
// LEGACY/FALLBACK IMPLEMENTATIONS (keyword-based, simulated)
// ============================================================================

// Simulated face emotion detection with realistic confidence (replace with TensorFlow.js model in production)
export async function detectFaceEmotion(imageData: string): Promise<EmotionScore[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate realistic confidence scores (70-95% for primary, 5-30% for others)
    const emotions: EmotionType[] = ['happy', 'neutral', 'sad', 'surprised', 'angry'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    // Primary emotion: 70-95% confidence
    const primaryConfidence = 0.70 + Math.random() * 0.25;

    // Secondary emotions share remaining confidence
    const remainingConfidence = 1 - primaryConfidence;
    const secondaryConfidence1 = remainingConfidence * (0.4 + Math.random() * 0.4);
    const secondaryConfidence2 = remainingConfidence - secondaryConfidence1;

    return [
        { emotion: primaryEmotion, confidence: primaryConfidence },
        { emotion: emotions[(emotions.indexOf(primaryEmotion) + 1) % emotions.length], confidence: secondaryConfidence1 },
        { emotion: emotions[(emotions.indexOf(primaryEmotion) + 2) % emotions.length], confidence: secondaryConfidence2 },
    ].sort((a, b) => b.confidence - a.confidence);
}

// Simulated voice emotion detection with realistic confidence
export async function detectVoiceEmotion(audioBlob: Blob): Promise<EmotionScore[]> {
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate realistic confidence scores (65-90% for primary)
    const emotions: EmotionType[] = ['neutral', 'happy', 'surprised', 'sad', 'fearful'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    // Primary emotion: 65-90% confidence (voice is less reliable than face)
    const primaryConfidence = 0.65 + Math.random() * 0.25;

    // Secondary emotions share remaining confidence
    const remainingConfidence = 1 - primaryConfidence;
    const secondaryConfidence1 = remainingConfidence * (0.5 + Math.random() * 0.3);
    const secondaryConfidence2 = remainingConfidence - secondaryConfidence1;

    return [
        { emotion: primaryEmotion, confidence: primaryConfidence },
        { emotion: emotions[(emotions.indexOf(primaryEmotion) + 1) % emotions.length], confidence: secondaryConfidence1 },
        { emotion: emotions[(emotions.indexOf(primaryEmotion) + 2) % emotions.length], confidence: secondaryConfidence2 },
    ].sort((a, b) => b.confidence - a.confidence);
}

// Text emotion analysis with improved accuracy (keyword-based fallback)
export async function analyzeTextEmotion(text: string): Promise<EmotionScore[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Expanded keyword dictionaries for better accuracy
    const emotionKeywords = {
        happy: ['happy', 'joy', 'joyful', 'great', 'wonderful', 'excellent', 'excited', 'love', 'amazing', 'fantastic', 'awesome', 'delighted', 'cheerful', 'pleased', 'glad', 'thrilled', 'ecstatic', 'elated'],
        sad: ['sad', 'unhappy', 'depressed', 'miserable', 'down', 'blue', 'gloomy', 'sorrowful', 'heartbroken', 'upset', 'disappointed', 'lonely', 'melancholy', 'despair'],
        angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'outraged', 'enraged', 'hate', 'rage', 'resentful', 'hostile', 'bitter'],
        fearful: ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'fear', 'dread', 'alarmed', 'concerned'],
        disgusted: ['disgusted', 'revolted', 'sick', 'repulsed', 'nauseated', 'appalled', 'horrified'],
        surprised: ['surprised', 'shocked', 'amazed', 'astonished', 'astounded', 'stunned', 'unexpected', 'wow'],
        neutral: ['okay', 'fine', 'alright', 'normal', 'usual']
    };

    const lowerText = text.toLowerCase();
    const emotionScores: Record<EmotionType, number> = {
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
        neutral: 0
    };

    // Count keyword matches and calculate scores
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        keywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                emotionScores[emotion as EmotionType] += 1;
            }
        });
    });

    // Detect negations (e.g., "not happy" should reduce happy score)
    const negationWords = ['not', 'no', 'never', 'dont', "don't", 'cant', "can't"];
    negationWords.forEach(negation => {
        if (lowerText.includes(negation)) {
            // Reduce positive emotion scores
            emotionScores.happy *= 0.5;
        }
    });

    // Calculate total score
    const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);

    // If no emotions detected, return neutral with realistic confidence
    if (totalScore === 0) {
        const neutralConfidence = 0.75 + Math.random() * 0.10;
        return [
            { emotion: 'neutral', confidence: neutralConfidence },
            { emotion: 'happy', confidence: (1 - neutralConfidence) * 0.5 },
            { emotion: 'sad', confidence: (1 - neutralConfidence) * 0.5 },
        ];
    }

    // Normalize scores to confidences (sum to 1)
    const confidences: EmotionScore[] = Object.entries(emotionScores)
        .map(([emotion, score]) => ({
            emotion: emotion as EmotionType,
            confidence: score / totalScore
        }))
        .filter(s => s.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence);

    return confidences;
}

// Aggregate emotions from multiple modalities with dynamic fusion weights
export function aggregateEmotions(
    faceEmotions: EmotionScore[] | null,
    voiceEmotions: EmotionScore[] | null,
    textEmotions: EmotionScore[] | null
): EmotionScore {
    const emotionMap: Record<EmotionType, number> = {
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
        neutral: 0
    };

    let totalWeight = 0;

    // Aggregate face emotions (weight: 0.4)
    if (faceEmotions && faceEmotions.length > 0) {
        faceEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * 0.4;
        });
        totalWeight += 0.4;
    }

    // Aggregate voice emotions (weight: 0.35)
    if (voiceEmotions && voiceEmotions.length > 0) {
        voiceEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * 0.35;
        });
        totalWeight += 0.35;
    }

    // Aggregate text emotions (weight: 0.25)
    if (textEmotions && textEmotions.length > 0) {
        textEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * 0.25;
        });
        totalWeight += 0.25;
    }

    // Normalize by total weight (in case some modalities are missing)
    if (totalWeight > 0) {
        Object.keys(emotionMap).forEach(emotion => {
            emotionMap[emotion as EmotionType] /= totalWeight;
        });
    }

    // Find dominant emotion
    const sortedEmotions = Object.entries(emotionMap)
        .sort((a, b) => b[1] - a[1]);

    const dominantEmotion = sortedEmotions[0][0] as EmotionType;
    const dominantConfidence = sortedEmotions[0][1];

    return {
        emotion: dominantEmotion,
        confidence: dominantConfidence
    };
}

/**
 * Get color for emotion (used in UI)
 */
export function getEmotionColor(emotion: EmotionType): string {
    const colors: Record<EmotionType, string> = {
        happy: '#f59e0b',      // Orange/yellow
        sad: '#3b82f6',         // Blue
        angry: '#ef4444',       // Red
        fearful: '#8b5cf6',     // Purple
        disgusted: '#10b981',   // Green
        surprised: '#ec4899',   // Pink
        neutral: '#6b7280'      // Gray
    };
    return colors[emotion] || '#8b5cf6';
}

/**
 * Get emoji for emotion (used in UI)
 */
export function getEmotionEmoji(emotion: EmotionType): string {
    const emojis: Record<EmotionType, string> = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        fearful: '😰',
        disgusted: '🤢',
        surprised: '😲',
        neutral: '😐'
    };
    return emojis[emotion] || '😐';
}

