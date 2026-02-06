import { EmotionScore, EmotionType } from './types';

// Simulated face emotion detection (replace with TensorFlow.js model in production)
export async function detectFaceEmotion(imageData: string): Promise<EmotionScore[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return simulated emotion scores
    return [
        { emotion: 'happy', confidence: Math.random() * 0.5 + 0.3 },
        { emotion: 'neutral', confidence: Math.random() * 0.3 },
        { emotion: 'sad', confidence: Math.random() * 0.2 },
    ].sort((a, b) => b.confidence - a.confidence);
}

// Simulated voice emotion detection
export async function detectVoiceEmotion(audioBlob: Blob): Promise<EmotionScore[]> {
    await new Promise(resolve => setTimeout(resolve, 2500));

    return [
        { emotion: 'neutral', confidence: Math.random() * 0.4 + 0.4 },
        { emotion: 'happy', confidence: Math.random() * 0.3 },
        { emotion: 'surprised', confidence: Math.random() * 0.2 },
    ].sort((a, b) => b.confidence - a.confidence);
}

// Text emotion analysis
export async function analyzeTextEmotion(text: string): Promise<EmotionScore[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple keyword-based analysis (replace with proper NLP in production)
    const positiveWords = ['happy', 'joy', 'great', 'wonderful', 'excited', 'love', 'amazing'];
    const negativeWords = ['sad', 'angry', 'bad', 'terrible', 'hate', 'awful', 'upset'];

    const lowerText = text.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerText.includes(word));
    const hasNegative = negativeWords.some(word => lowerText.includes(word));

    if (hasPositive && !hasNegative) {
        return [
            { emotion: 'happy', confidence: 0.8 },
            { emotion: 'neutral', confidence: 0.15 },
            { emotion: 'surprised', confidence: 0.05 },
        ];
    } else if (hasNegative && !hasPositive) {
        return [
            { emotion: 'sad', confidence: 0.7 },
            { emotion: 'angry', confidence: 0.2 },
            { emotion: 'neutral', confidence: 0.1 },
        ];
    } else {
        return [
            { emotion: 'neutral', confidence: 0.6 },
            { emotion: 'happy', confidence: 0.25 },
            { emotion: 'sad', confidence: 0.15 },
        ];
    }
}

// Aggregate multiple emotion sources
export function aggregateEmotions(
    faceEmotions?: EmotionScore[],
    voiceEmotions?: EmotionScore[],
    textEmotions?: EmotionScore[]
): EmotionScore {
    const emotionMap: Record<EmotionType, number> = {
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
        neutral: 0,
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

    // Normalize by total weight
    Object.keys(emotionMap).forEach((emotion) => {
        emotionMap[emotion as EmotionType] /= totalWeight || 1;
    });

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionMap).reduce((a, b) =>
        a[1] > b[1] ? a : b
    );

    return {
        emotion: dominantEmotion[0] as EmotionType,
        confidence: dominantEmotion[1],
    };
}

// Get emotion color
export function getEmotionColor(emotion: EmotionType): string {
    const colors: Record<EmotionType, string> = {
        happy: '#22c55e', // green
        sad: '#3b82f6', // blue
        angry: '#ef4444', // red
        fearful: '#a855f7', // purple
        disgusted: '#84cc16', // lime
        surprised: '#f59e0b', // amber
        neutral: '#6b7280', // gray
    };
    return colors[emotion];
}

// Get emotion emoji
export function getEmotionEmoji(emotion: EmotionType): string {
    const emojis: Record<EmotionType, string> = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        fearful: '😨',
        disgusted: '🤢',
        surprised: '😲',
        neutral: '😐',
    };
    return emojis[emotion];
}
