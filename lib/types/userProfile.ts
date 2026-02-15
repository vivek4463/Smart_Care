/**
 * User Profile Types for Personalization and Baseline Calibration
 */

import { EmotionType } from '../types';
import { getLocalStorage, setLocalStorage } from '../utils/storage';

/**
 * Baseline calibration data captured during initial setup
 * Used to compute relative emotion changes
 */
export interface BaselineData {
    // Face baseline (neutral expression)
    facialNeutral?: {
        landmarks: number[];  // 468 facial landmark coordinates from MediaPipe
        capturedAt: Date;
        imageQuality: number; // 0-1, lighting and clarity score
    };

    // Voice baseline (neutral speech)
    voiceNeutral?: {
        meanPitch: number;           // Hz
        pitchRange: [number, number]; // [min, max] Hz
        meanEnergy: number;          // 0-1
        spectralCentroid: number;    // Hz
        capturedAt: Date;
        sampleDuration: number;      // seconds
    };

    // Emotional baseline
    emotionalBaseline?: {
        valence: number;  // -1 (negative) to 1 (positive)
        arousal: number;  // 0 (calm) to 1 (excited)
        dominance: number; // 0 (submissive) to 1 (dominant)
    };

    calibratedAt: Date;
    expiresAt?: Date; // Optional: recalibration reminder
}

/**
 * Music preferences learned from user feedback
 */
export interface MusicPreferences {
    tempoRange: [number, number];     // [min, max] BPM
    preferredInstruments: string[];    // ['piano', 'harp', ...]
    instrumentEmbedding?: number[];    // Learned vector representation
    intensityPreference: number;       // 0 (very gentle) to 1 (very energetic)
    avoidedEmotions: EmotionType[];   // Emotions to avoid triggering
}

/**
 * Single emotion transition event
 */
export interface EmotionTransition {
    from: EmotionType;
    to: EmotionType;
    duration: number;  // seconds
    musicConfig: any;  // MusicConfig from musicGeneration.ts
    effectiveness: number;  // -1 to 1 (change in valence)
    timestamp: Date;
}

/**
 * Single session outcome data
 */
export interface SessionOutcome {
    sessionId: string;
    startedAt: Date;
    endedAt: Date;
    duration: number;  // seconds

    // PANAS scores
    panasPreScore?: number;
    panasPostScore?: number;
    panasImprovement?: number;

    // Emotion progression
    emotionHistory: {
        emotion: EmotionType;
        confidence: number;
        timestamp: Date;
    }[];

    // Effectiveness
    valenceTrend: number;  // Overall change in valence
    userSatisfaction?: number;  // 1-10 scale
    userFeedback?: string;
}

/**
 * Q-learning state-action pair for RL
 */
export interface StateActionPair {
    state: {
        currentEmotion: EmotionType;
        valenceTrend: number;
        heartRate?: number;
        sessionDuration: number;
        timeOfDay: number;  // 0-23
    };
    action: {
        musicConfig: any;  // MusicConfig
    };
}

/**
 * Reinforcement learning data
 */
export interface RLData {
    qTable: Map<string, number>;  // Serialized state-action pairs → Q-values
    weights?: number[];            // Policy network weights (if using DQN)
    explorationRate: number;       // Epsilon for ε-greedy
    totalUpdates: number;          // Number of Q-table updates
    lastUpdatedAt: Date;
}

/**
 * Complete user profile with all personalization data
 */
export interface UserProfile {
    userId: string;

    // Baseline calibration
    baseline: BaselineData;

    // Music preferences
    preferences: MusicPreferences;

    // Historical data
    history: {
        emotionTransitions: EmotionTransition[];
        sessionOutcomes: SessionOutcome[];
        improvementScores: number[];  // Δvalence per session
    };

    // Reinforcement learning
    rl: RLData;

    // Privacy & compliance
    dataRetentionDays: number;       // Days to keep data
    consentGiven: boolean;           // Explicit consent for data collection
    consentTimestamp?: Date;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    lastSessionAt?: Date;
}

/**
 * Default user profile for new users
 */
export const DEFAULT_USER_PROFILE: Partial<UserProfile> = {
    preferences: {
        tempoRange: [60, 120],
        preferredInstruments: ['piano', 'harp', 'pad'],
        intensityPreference: 0.5,
        avoidedEmotions: []
    },
    history: {
        emotionTransitions: [],
        sessionOutcomes: [],
        improvementScores: []
    },
    rl: {
        qTable: new Map(),
        explorationRate: 0.3,
        totalUpdates: 0,
        lastUpdatedAt: new Date()
    },
    dataRetentionDays: 90,
    consentGiven: false
};

/**
 * Load user profile from localStorage
 */
export function loadUserProfile(userId: string): UserProfile | null {
    try {
        const stored = getLocalStorage(`userProfile_${userId}`);
        if (!stored) return null;

        const profile = JSON.parse(stored);

        // Convert date strings back to Date objects
        if (profile.baseline?.calibratedAt) {
            profile.baseline.calibratedAt = new Date(profile.baseline.calibratedAt);
        }
        if (profile.createdAt) profile.createdAt = new Date(profile.createdAt);
        if (profile.updatedAt) profile.updatedAt = new Date(profile.updatedAt);
        if (profile.lastSessionAt) profile.lastSessionAt = new Date(profile.lastSessionAt);

        // Convert qTable Map
        if (profile.rl?.qTable) {
            profile.rl.qTable = new Map(Object.entries(profile.rl.qTable));
        }

        return profile as UserProfile;
    } catch (error) {
        console.error('Error loading user profile:', error);
        return null;
    }
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
    try {
        // Convert Map to object for serialization
        const serializable = {
            ...profile,
            rl: {
                ...profile.rl,
                qTable: Object.fromEntries(profile.rl.qTable)
            }
        };

        setLocalStorage(`userProfile_${profile.userId}`, JSON.stringify(serializable));
    } catch (error) {
        console.error('Error saving user profile:', error);
    }
}

/**
 * Create default user profile
 */
export function createDefaultProfile(userId: string): UserProfile {
    return {
        userId,
        baseline: {
            calibratedAt: new Date(),
        },
        preferences: DEFAULT_USER_PROFILE.preferences!,
        history: DEFAULT_USER_PROFILE.history!,
        rl: DEFAULT_USER_PROFILE.rl!,
        dataRetentionDays: DEFAULT_USER_PROFILE.dataRetentionDays!,
        consentGiven: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

/**
 * Load baseline data from localStorage
 */
export function loadBaselineData(userId: string): BaselineData | null {
    const profile = loadUserProfile(userId);
    return profile?.baseline || null;
}

