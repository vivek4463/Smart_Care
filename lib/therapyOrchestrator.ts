/**
 * Therapy Session Orchestrator
 * 
 * Main controller that coordinates all components:
 * - Emotion detection (face, voice, text)
 * - Dynamic fusion
 * - RL-based music selection
 * - Session tracking
 * - Crisis detection
 * - Privacy compliance
 */

import { EmotionScore, EmotionType } from './types';
import { UserProfile } from './types/userProfile';
import { detectFaceEmotionML } from './emotionDetection';
import { analyzeTextEmotionML } from './emotionDetection';
import { aggregateEmotionsWithDynamicFusion, computeValence, computeArousal } from './emotionFusion';
import { generateAdaptiveMusicConfig } from './adaptiveMusicGeneration';
import { startSession, endSession, recordEmotion, recordMusicSegment, ActiveSession } from './sessionTracking';
import { detectCrisis, CrisisLevel, getCrisisMusicOverride } from './clinicalSafety';
import { hasConsent } from './privacy';
import type { MusicConfig } from './adaptiveMusicGeneration';

/**
 * Therapy session configuration
 */
export interface TherapyConfig {
    enableFaceDetection: boolean;
    enableVoiceDetection: boolean;
    enableTextAnalysis: boolean;
    sessionDuration: number;        // minutes
    emotionCheckInterval: number;   // seconds
    enableCrisisDetection: boolean;
    enableRLAdaptation: boolean;
}

/**
 * Default therapy configuration
 */
const DEFAULT_CONFIG: TherapyConfig = {
    enableFaceDetection: true,
    enableVoiceDetection: false,  // Not implemented yet
    enableTextAnalysis: true,
    sessionDuration: 15,           // 15 minutes
    emotionCheckInterval: 30,      // Check emotion every 30 seconds
    enableCrisisDetection: true,
    enableRLAdaptation: true
};

/**
 * Therapy session state
 */
export interface TherapySessionState {
    session: ActiveSession | null;
    config: TherapyConfig;
    currentEmotion: EmotionType;
    currentValence: number;
    currentArousal: number;
    musicConfig: MusicConfig | null;
    crisisLevel: CrisisLevel;
    isActive: boolean;
}

/**
 * Initialize therapy session
 * 
 * @param userId User identifier
 * @param profile User profile with RL data
 * @param config Session configuration
 * @returns Initial session state
 */
export async function initializeTherapySession(
    userId: string,
    profile: UserProfile,
    config: TherapyConfig = DEFAULT_CONFIG
): Promise<TherapySessionState> {

    // Check consent
    if (!hasConsent(userId)) {
        throw new Error('User consent required before starting therapy session');
    }

    console.log('🎯 Initializing therapy session for user:', userId);

    // Initial state (neutral baseline)
    const state: TherapySessionState = {
        session: null,
        config,
        currentEmotion: 'neutral',
        currentValence: 0,
        currentArousal: 0.5,
        musicConfig: null,
        crisisLevel: CrisisLevel.NONE,
        isActive: false
    };

    return state;
}

/**
 * Start therapy session
 * Captures initial emotion and selects music
 */
export async function startTherapySession(
    state: TherapySessionState,
    profile: UserProfile,
    faceImage?: string,
    voiceBlob?: Blob,
    textInput?: string
): Promise<TherapySessionState> {

    console.log('▶️ Starting therapy session...');

    // 1. Detect initial emotion from all modalities
    const { fusedEmotion, valence, arousal, crisisLevel } = await detectAllEmotions(
        faceImage,
        voiceBlob,
        textInput,
        state.config
    );

    // 2. Check for crisis
    if (crisisLevel >= CrisisLevel.HIGH && state.config.enableCrisisDetection) {
        console.warn('🚨 Crisis detected at session start!');

        // Use crisis music override
        const crisisMusic = getCrisisMusicOverride();

        state.currentEmotion = fusedEmotion;
        state.currentValence = valence;
        state.currentArousal = arousal;
        state.crisisLevel = crisisLevel;
        state.musicConfig = crisisMusic as any;
        state.isActive = true;

        return state;
    }

    // 3. Generate adaptive music config using RL
    const { config: musicConfig, action, state: rlState } = state.config.enableRLAdaptation
        ? generateAdaptiveMusicConfig(fusedEmotion, valence, arousal, profile, 0)
        : { config: null as any, action: null as any, state: null as any };

    // 4. Start session tracking
    const session = startSession(
        fusedEmotion,
        valence,
        arousal,
        rlState,
        action
    );

    // 5. Update state
    state.session = session;
    state.currentEmotion = fusedEmotion;
    state.currentValence = valence;
    state.currentArousal = arousal;
    state.musicConfig = musicConfig;
    state.crisisLevel = crisisLevel;
    state.isActive = true;

    console.log('✅ Session started successfully');
    console.log(`   Initial emotion: ${fusedEmotion} (valence=${valence.toFixed(2)})`);
    console.log(`   Music: ${musicConfig.tempo} BPM, targeting ${musicConfig.emotionalTarget}`);

    return state;
}

/**
 * Monitor emotion during session
 * Called periodically (every 30 seconds by default)
 */
export async function monitorEmotion(
    state: TherapySessionState,
    faceImage?: string,
    voiceBlob?: Blob,
    textInput?: string
): Promise<TherapySessionState> {

    if (!state.isActive || !state.session) {
        console.warn('⚠️ Cannot monitor: session not active');
        return state;
    }

    // Detect current emotion
    const { fusedEmotion, valence, arousal, crisisLevel } = await detectAllEmotions(
        faceImage,
        voiceBlob,
        textInput,
        state.config
    );

    // Record emotion in session
    const confidence = 0.8; // Placeholder
    recordEmotion(state.session, fusedEmotion, valence, arousal, confidence);

    // Check for crisis
    if (crisisLevel >= CrisisLevel.HIGH && state.config.enableCrisisDetection) {
        console.warn('🚨 Crisis detected during session!');

        // Switch to crisis music
        const crisisMusic = getCrisisMusicOverride();
        state.musicConfig = crisisMusic as any;
        state.crisisLevel = crisisLevel;
    }

    // Update state
    state.currentEmotion = fusedEmotion;
    state.currentValence = valence;
    state.currentArousal = arousal;

    console.log(`📊 Emotion updated: ${fusedEmotion} (valence=${valence.toFixed(2)})`);

    return state;
}

/**
 * End therapy session
 * Computes outcome and updates RL
 */
export async function endTherapySession(
    state: TherapySessionState,
    profile: UserProfile,
    panasPostScore?: number,
    userSatisfaction?: number,
    userFeedback?: string
): Promise<{ state: TherapySessionState; updatedProfile: UserProfile }> {

    if (!state.isActive || !state.session) {
        throw new Error('No active session to end');
    }

    console.log('⏹️ Ending therapy session...');

    // Compute PANAS pre-score from initial valence (approximation)
    const panasPreScore = valenceToPANAS(state.session.preValence);

    // End session and update RL
    const { outcome, updatedProfile } = endSession(
        state.session,
        profile,
        panasPreScore,
        panasPostScore,
        userSatisfaction,
        userFeedback
    );

    // Update state
    state.session = null;
    state.isActive = false;

    console.log('✅ Session ended successfully');
    console.log(`   Duration: ${(outcome.duration / 60).toFixed(1)} min`);
    console.log(`   Valence improvement: ${outcome.valenceTrend.toFixed(3)}`);

    return { state, updatedProfile };
}

/**
 * Detect emotions from all available modalities
 */
async function detectAllEmotions(
    faceImage?: string,
    voiceBlob?: Blob,
    textInput?: string,
    config: TherapyConfig = DEFAULT_CONFIG
): Promise<{
    fusedEmotion: EmotionType;
    valence: number;
    arousal: number;
    crisisLevel: CrisisLevel;
}> {

    let faceEmotions: EmotionScore[] | null = null;
    let voiceEmotions: EmotionScore[] | null = null;
    let textEmotions: EmotionScore[] | null = null;
    let crisisLevel: CrisisLevel = CrisisLevel.NONE;

    // Face detection
    if (config.enableFaceDetection && faceImage) {
        try {
            faceEmotions = await detectFaceEmotionML(faceImage);
        } catch (error) {
            console.error('Face detection failed:', error);
        }
    }

    // Voice detection (placeholder - not implemented)
    if (config.enableVoiceDetection && voiceBlob) {
        // voiceEmotions = await detectVoiceEmotionML(voiceBlob);
    }

    // Text analysis
    if (config.enableTextAnalysis && textInput) {
        try {
            textEmotions = await analyzeTextEmotionML(textInput);

            // Crisis detection from text
            const crisisResult = detectCrisis(textInput);
            crisisLevel = crisisResult.level;
        } catch (error) {
            console.error('Text analysis failed:', error);
        }
    }

    // Fuse emotions
    const fusedResult = aggregateEmotionsWithDynamicFusion(
        faceEmotions,
        voiceEmotions,
        textEmotions,
        null, // No heart rate data
        true // Use dynamic weights
    );

    const fusedEmotion = fusedResult.emotion;
    const valence = computeValence(fusedEmotion, fusedResult.confidence);
    const arousal = computeArousal(fusedEmotion, fusedResult.confidence);

    return { fusedEmotion, valence, arousal, crisisLevel };
}

/**
 * Convert valence to PANAS score (approximation)
 * PANAS positive affect: 10-50 scale
 */
function valenceToPANAS(valence: number): number {
    // Map valence (-1 to 1) to PANAS (10 to 50)
    return Math.round(30 + valence * 20);
}

/**
 * Convert PANAS to valence (reverse mapping)
 */
export function panasToValence(panas: number): number {
    // Map PANAS (10 to 50) to valence (-1 to 1)
    return (panas - 30) / 20;
}

/**
 * Get session progress summary
 */
export function getSessionProgress(state: TherapySessionState): {
    elapsedMinutes: number;
    emotionChanges: number;
    valenceTrend: number;
    progressPercentage: number;
} {
    if (!state.session || !state.isActive) {
        return {
            elapsedMinutes: 0,
            emotionChanges: 0,
            valenceTrend: 0,
            progressPercentage: 0
        };
    }

    const now = new Date();
    const elapsed = (now.getTime() - state.session.startedAt.getTime()) / 1000 / 60; // minutes
    const targetDuration = state.config.sessionDuration;
    const progress = Math.min(100, (elapsed / targetDuration) * 100);

    const emotionHistory = state.session.emotionHistory;
    const emotionChanges = emotionHistory.length - 1; // Number of transitions

    const initialValence = state.session.preValence;
    const currentValence = state.currentValence;
    const valenceTrend = currentValence - initialValence;

    return {
        elapsedMinutes: elapsed,
        emotionChanges,
        valenceTrend,
        progressPercentage: progress
    };
}
