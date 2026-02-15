/**
 * Adaptive Music Generation with RL Integration
 * 
 * Generates personalized therapeutic music based on:
 * - Current emotional state
 * - Learned user preferences (via RL)
 * - Musical therapy principles
 */

import * as Tone from 'tone';
import { EmotionType } from './types';
import { MusicAction, EmotionState, selectAction, getTimeOfDay, generatePossibleActions } from './reinforcementLearning';
import { UserProfile } from './types/userProfile';

/**
 * Music configuration
 */
export interface MusicConfig {
    tempo: number;              // BPM
    key: string;               // Musical key (C, D, E, etc.)
    mode: 'major' | 'minor';   // Major (happy) or minor (sad)
    instruments: string[];     // Synthesizer types
    intensity: number;         // 0-1 (volume, complexity)
    emotionalTarget: EmotionType;
    duration: number;          // seconds
    transitionSpeed: 'slow' | 'medium' | 'fast';
}

/**
 * Map emotion to default music parameters
 * Used when RL hasn't learned user preferences yet
 */
const EMOTION_TO_MUSIC_DEFAULTS: Record<EmotionType, Partial<MusicConfig>> = {
    sad: {
        tempo: 75,
        key: 'D',
        mode: 'minor',
        instruments: ['pad', 'piano'],
        intensity: 0.4,
        emotionalTarget: 'neutral'
    },
    angry: {
        tempo: 70,
        key: 'A',
        mode: 'minor',
        instruments: ['pad', 'bell'],
        intensity: 0.3,
        emotionalTarget: 'neutral'
    },
    fearful: {
        tempo: 65,
        key: 'F',
        mode: 'major',
        instruments: ['pad', 'harp'],
        intensity: 0.35,
        emotionalTarget: 'neutral'
    },
    neutral: {
        tempo: 90,
        key: 'C',
        mode: 'major',
        instruments: ['piano', 'strings'],
        intensity: 0.5,
        emotionalTarget: 'happy'
    },
    happy: {
        tempo: 110,
        key: 'G',
        mode: 'major',
        instruments: ['piano', 'bells'],
        intensity: 0.7,
        emotionalTarget: 'happy'
    },
    surprised: {
        tempo: 85,
        key: 'E',
        mode: 'major',
        instruments: ['pad', 'piano'],
        intensity: 0.5,
        emotionalTarget: 'neutral'
    },
    disgusted: {
        tempo: 75,
        key: 'Bb',
        mode: 'minor',
        instruments: ['pad'],
        intensity: 0.4,
        emotionalTarget: 'neutral'
    }
};

/**
 * Generate music configuration using RL policy
 * 
 * @param currentEmotion Detected emotion
 * @param valence Emotional valence
 * @param arousal Emotional arousal
 * @param profile User profile (contains Q-table)
 * @param sessionDuration Current session duration in minutes
 * @returns Music configuration selected by RL
 */
export function generateAdaptiveMusicConfig(
    currentEmotion: EmotionType,
    valence: number,
    arousal: number,
    profile: UserProfile,
    sessionDuration: number = 0
): { config: MusicConfig; action: MusicAction; state: EmotionState } {

    // Construct RL state
    const state: EmotionState = {
        currentEmotion,
        valence,
        arousal,
        sessionDuration,
        timeOfDay: getTimeOfDay()
    };

    const possibleActions = generatePossibleActions(currentEmotion);

    // Select best action using ε-greedy policy
    const action = selectAction(
        state,
        possibleActions,
        profile.rl.qTable,
        profile.rl.explorationRate
    );

    // Convert RL action to music config
    const config: MusicConfig = {
        tempo: action.tempo,
        key: inferMusicalKey(action.emotionalTarget),
        mode: action.emotionalTarget === 'happy' || action.emotionalTarget === 'neutral' ? 'major' : 'minor',
        instruments: inferInstruments(action.intensity),
        intensity: action.intensity,
        emotionalTarget: action.emotionalTarget,
        duration: 120, // 2 minutes default
        transitionSpeed: action.transitionSpeed
    };

    console.log('🎵 Generated adaptive music:', {
        from: currentEmotion,
        to: config.emotionalTarget,
        tempo: config.tempo,
        intensity: config.intensity
    });

    return { config, action, state };
}

/**
 * Generate music config without RL (fallback)
 */
export function generateDefaultMusicConfig(
    currentEmotion: EmotionType,
    targetEmotion: EmotionType = 'happy'
): MusicConfig {
    const defaults = EMOTION_TO_MUSIC_DEFAULTS[currentEmotion];

    return {
        tempo: defaults.tempo || 90,
        key: defaults.key || 'C',
        mode: defaults.mode || 'major',
        instruments: defaults.instruments || ['piano'],
        intensity: defaults.intensity || 0.5,
        emotionalTarget: targetEmotion,
        duration: 120,
        transitionSpeed: 'medium'
    };
}

/**
 * Infer musical key from target emotion
 */
function inferMusicalKey(emotion: EmotionType): string {
    const keyMap: Record<EmotionType, string> = {
        happy: 'G',       // Bright, positive
        neutral: 'C',     // Balanced
        sad: 'D',         // Melancholic
        angry: 'A',       // Tension
        fearful: 'F',     // Calming
        surprised: 'E',   // Energetic
        disgusted: 'Bb'   // Somber
    };

    return keyMap[emotion] || 'C';
}

/**
 * Infer instruments from intensity
 */
function inferInstruments(intensity: number): string[] {
    if (intensity < 0.3) {
        return ['pad', 'harp'];           // Very gentle
    } else if (intensity < 0.5) {
        return ['pad', 'piano'];          // Gentle
    } else if (intensity < 0.7) {
        return ['piano', 'strings'];      // Moderate
    } else {
        return ['piano', 'bells', 'strings']; // Energetic
    }
}

/**
 * Create gradual transition between tempos
 * For smooth emotional shifts
 */
export function createTempoTransition(
    startTempo: number,
    endTempo: number,
    transitionSpeed: 'slow' | 'medium' | 'fast'
): number[] {
    const steps = transitionSpeed === 'slow' ? 8 : transitionSpeed === 'medium' ? 5 : 3;
    const tempos: number[] = [];

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const tempo = startTempo + (endTempo - startTempo) * progress;
        tempos.push(Math.round(tempo));
    }

    return tempos;
}

/**
 * Generate chord progression based on mode
 */
export function generateChordProgression(
    key: string,
    mode: 'major' | 'minor',
    length: number = 4
): string[] {
    // Common progressions in music therapy
    const PROGRESSIONS = {
        major: [
            ['C', 'G', 'Am', 'F'],      // I-V-vi-IV (very common)
            ['C', 'Am', 'F', 'G'],      // I-vi-IV-V
            ['C', 'F', 'G', 'C'],       // I-IV-V-I
        ],
        minor: [
            ['Am', 'F', 'C', 'G'],      // i-VI-III-VII
            ['Am', 'Dm', 'G', 'C'],     // i-iv-VII-III
            ['Am', 'C', 'F', 'E'],      // i-III-VI-V
        ]
    };

    const progressions = PROGRESSIONS[mode];
    const progression = progressions[Math.floor(Math.random() * progressions.length)];

    // Transpose to target key (simplified - in production use a proper music library)
    return progression;
}

/**
 * Adjust music based on real-time emotion feedback
 * Called during session if emotion changes significantly
 */
export function adjustMusicInRealTime(
    currentConfig: MusicConfig,
    newValence: number,
    oldValence: number
): Partial<MusicConfig> {
    const valenceDelta = newValence - oldValence;

    // If getting worse, slow down and reduce intensity
    if (valenceDelta < -0.2) {
        return {
            tempo: Math.max(60, currentConfig.tempo - 10),
            intensity: Math.max(0.2, currentConfig.intensity - 0.1)
        };
    }

    // If improving, maintain or slightly increase
    if (valenceDelta > 0.2) {
        return {
            tempo: Math.min(120, currentConfig.tempo + 5),
            intensity: Math.min(0.8, currentConfig.intensity + 0.05)
        };
    }

    // Stable - no change
    return {};
}

/**
 * Get music recommendation explanation for user
 */
export function getMusicExplanation(config: MusicConfig, currentEmotion: EmotionType): string {
    const explanations: Record<string, string> = {
        'sad-neutral': 'Gentle, calming music to help lift your mood gradually',
        'sad-happy': 'Uplifting music designed to brighten your emotional state',
        'angry-neutral': 'Soothing tones to help reduce tension and find calm',
        'fearful-neutral': 'Comforting melodies to create a sense of safety',
        'neutral-happy': 'Energizing music to enhance positive feelings',
        'happy-happy': 'Joyful music to maintain and celebrate your positive state'
    };

    const key = `${currentEmotion}-${config.emotionalTarget}`;
    return explanations[key] || 'Personalized music selected for your current emotional state';
}
