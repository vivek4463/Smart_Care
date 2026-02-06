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

// Text emotion analysis with improved accuracy
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

    // If no emotions detected, return neutral
    if (totalScore === 0) {
        return [
            { emotion: 'neutral', confidence: 0.7 },
            { emotion: 'happy', confidence: 0.2 },
            { emotion: 'sad', confidence: 0.1 },
        ];
    }

    // Convert scores to confidences
    const results: EmotionScore[] = Object.entries(emotionScores)
        .map(([emotion, score]) => ({
            emotion: emotion as EmotionType,
            confidence: score / totalScore
        }))
        .filter(score => score.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence);

    // Return top 3 emotions
    return results.slice(0, 3);
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
