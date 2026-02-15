/**
 * Dynamic Emotion Fusion
 * 
 * Combines emotions from multiple modalities (face, voice, text, heart rate) using
 * dynamic weights based on confidence scores and data quality.
 * 
 * NEW: Upgraded from 2-modality to 4-modality fusion
 */

import { EmotionScore, EmotionType } from './types';

/**
 * Fusion weights configuration for 4 modalities
 */
interface FusionWeights {
    face: number;
    voice: number;
    text: number;
    heartRate: number;
}

/**
 * Default static weights (fallback if dynamic weighting unavailable)
 */
const DEFAULT_WEIGHTS: FusionWeights = {
    face: 0.35,      // High weight: face is very reliable
    voice: 0.30,     // Medium weight: voice prosody is good
    text: 0.20,      // Lower weight: text can be ambiguous
    heartRate: 0.15  // Supportive weight: HR indicates stress/arousal
};

/**
 * Compute dynamic fusion weights based on confidence scores
 * Higher confidence → higher weight
 * NEW: Now supports 4 modalities including heart rate
 * 
 * @param faceEmotions Face emotion scores (or null if unavailable)
 * @param voiceEmotions Voice emotion scores (or null if unavailable)
 * @param textEmotions Text emotion scores (or null if unavailable)
 * @param heartRateConfidence Heart rate detection confidence (0-1)
 * @returns Dynamic weights that sum to 1.0
 */
export function computeDynamicWeights(
    faceEmotions: EmotionScore[] | null,
    voiceEmotions: EmotionScore[] | null,
    textEmotions: EmotionScore[] | null,
    heartRateConfidence: number = 0
): FusionWeights {
    const weights: FusionWeights = { face: 0, voice: 0, text: 0, heartRate: 0 };

    // Get max confidence for each modality
    const faceConfidence = faceEmotions?.[0]?.confidence ?? 0;
    const voiceConfidence = voiceEmotions?.[0]?.confidence ?? 0;
    const textConfidence = textEmotions?.[0]?.confidence ?? 0;

    // If all modalities missing, return defaults
    const totalConfidence = faceConfidence + voiceConfidence + textConfidence + heartRateConfidence;
    if (totalConfidence === 0) {
        return DEFAULT_WEIGHTS;
    }

    // Compute raw weights proportional to confidence
    let faceWeight = faceConfidence;
    let voiceWeight = voiceConfidence;
    let textWeight = textConfidence;
    let heartRateWeight = heartRateConfidence;

    // Apply modality-specific reliability multipliers
    const RELIABILITY_MULTIPLIERS = {
        face: 1.2,        // Boost face weight (most reliable)
        voice: 1.0,       // Neutral
        text: 0.8,        // Reduce text weight (can be ambiguous)
        heartRate: 0.7    // Lower weight (indicates stress, not direct emotion)
    };

    faceWeight *= RELIABILITY_MULTIPLIERS.face;
    voiceWeight *= RELIABILITY_MULTIPLIERS.voice;
    textWeight *= RELIABILITY_MULTIPLIERS.text;
    heartRateWeight *= RELIABILITY_MULTIPLIERS.heartRate;

    // Normalize to sum to 1.0
    const totalWeight = faceWeight + voiceWeight + textWeight + heartRateWeight;

    weights.face = totalWeight > 0 ? faceWeight / totalWeight : 0;
    weights.voice = totalWeight > 0 ? voiceWeight / totalWeight : 0;
    weights.text = totalWeight > 0 ? textWeight / totalWeight : 0;
    weights.heartRate = totalWeight > 0 ? heartRateWeight / totalWeight : 0;

    console.log('📊 Dynamic Fusion Weights (4-Modality):', {
        face: `${(weights.face * 100).toFixed(1)}%`,
        voice: `${(weights.voice * 100).toFixed(1)}%`,
        text: `${(weights.text * 100).toFixed(1)}%`,
        heartRate: `${(weights.heartRate * 100).toFixed(1)}%`
    });

    return weights;
}

/**
 * Aggregate emotions from multiple modalities with dynamic fusion
 * 
 * @param faceEmotions Face emotion scores
 * @param voiceEmotions Voice emotion scores
 * @param textEmotions Text emotion scores
 * @param heartRateData Heart rate data (optional)
 * @param useDynamicWeights Whether to use dynamic or static weights
 * @returns Fused emotion with confidence
 */
export function aggregateEmotionsWithDynamicFusion(
    faceEmotions: EmotionScore[] | null,
    voiceEmotions: EmotionScore[] | null,
    textEmotions: EmotionScore[] | null,
    heartRateData: { stress: 'low' | 'medium' | 'high'; confidence: number } | null = null,
    useDynamicWeights: boolean = true
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

    // Compute weights (dynamic or static)
    const hrConfidence = heartRateData?.confidence ?? 0;
    const weights = useDynamicWeights
        ? computeDynamicWeights(faceEmotions, voiceEmotions, textEmotions, hrConfidence)
        : DEFAULT_WEIGHTS;

    let totalWeight = 0;

    // Aggregate face emotions
    if (faceEmotions && faceEmotions.length > 0) {
        faceEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * weights.face;
        });
        totalWeight += weights.face;
    }

    // Aggregate voice emotions
    if (voiceEmotions && voiceEmotions.length > 0) {
        voiceEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * weights.voice;
        });
        totalWeight += weights.voice;
    }

    // Aggregate text emotions
    if (textEmotions && textEmotions.length > 0) {
        textEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * weights.text;
        });
        totalWeight += weights.text;
    }

    // Aggregate heart rate data (map stress level to emotion influence)
    if (heartRateData && heartRateData.confidence > 0) {
        // High stress → increase negative emotions
        if (heartRateData.stress === 'high') {
            emotionMap.fearful += 0.3 * weights.heartRate;
            emotionMap.angry += 0.2 * weights.heartRate;
        } else if (heartRateData.stress === 'medium') {
            emotionMap.neutral += 0.5 * weights.heartRate;
        } else {
            // Low stress → increase positive emotions
            emotionMap.happy += 0.3 * weights.heartRate;
            emotionMap.neutral += 0.2 * weights.heartRate;
        }
        totalWeight += weights.heartRate;
    }

    // Normalize by total weight (in case some modalities missing)
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
 * Compute emotional valence (negative to positive)
 * -1 (very negative) to +1 (very positive)
 * 
 * @param emotion Detected emotion
 * @param confidence Confidence score
 * @returns Valence score
 */
export function computeValence(emotion: EmotionType, confidence: number): number {
    const VALENCE_MAP: Record<EmotionType, number> = {
        happy: 1.0,
        surprised: 0.5,
        neutral: 0.0,
        fearful: -0.6,
        sad: -0.8,
        angry: -0.9,
        disgusted: -0.7
    };

    return VALENCE_MAP[emotion] * confidence;
}

/**
 * Compute emotional arousal (calm to excited)
 * 0 (very calm) to 1 (very excited)
 * 
 * @param emotion Detected emotion
 * @param confidence Confidence score
 * @returns Arousal score
 */
export function computeArousal(emotion: EmotionType, confidence: number): number {
    const AROUSAL_MAP: Record<EmotionType, number> = {
        happy: 0.8,
        surprised: 0.9,
        angry: 0.9,
        fearful: 0.7,
        disgusted: 0.6,
        sad: 0.3,
        neutral: 0.2
    };

    return AROUSAL_MAP[emotion] * confidence;
}

/**
 * Assess overall emotion data quality
 * Considers number of modalities and average confidence
 * NEW: Now assesses 4 modalities including heart rate
 * 
 * @param faceEmotions Face emotions
 * @param voiceEmotions Voice emotions
 * @param textEmotions Text emotions
 * @param heartRateConfidence Heart rate confidence
 * @returns Quality score 0-1
 */
export function assessDataQuality(
    faceEmotions: EmotionScore[] | null,
    voiceEmotions: EmotionScore[] | null,
    textEmotions: EmotionScore[] | null,
    heartRateConfidence: number = 0
): number {
    let totalConfidence = 0;
    let modalityCount = 0;

    if (faceEmotions && faceEmotions.length > 0) {
        totalConfidence += faceEmotions[0].confidence;
        modalityCount++;
    }

    if (voiceEmotions && voiceEmotions.length > 0) {
        totalConfidence += voiceEmotions[0].confidence;
        modalityCount++;
    }

    if (textEmotions && textEmotions.length > 0) {
        totalConfidence += textEmotions[0].confidence;
        modalityCount++;
    }

    if (heartRateConfidence > 0) {
        totalConfidence += heartRateConfidence;
        modalityCount++;
    }

    if (modalityCount === 0) return 0;

    const avgConfidence = totalConfidence / modalityCount;
    const modalityCompleteness = modalityCount / 4; // 4 total modalities now

    // Quality = 70% avg confidence + 30% modality completeness
    return avgConfidence * 0.7 + modalityCompleteness * 0.3;
}
