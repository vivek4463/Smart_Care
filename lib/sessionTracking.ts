/**
 * Session Tracking and Feedback System
 * 
 * Tracks therapy sessions, emotion progression, and user feedback
 * for continuous learning and personalization.
 */

import { EmotionType } from './types';
import { SessionOutcome, UserProfile, EmotionTransition } from './types/userProfile';
import { updateQValue, computeReward, decayExploration } from './reinforcementLearning';
import type { EmotionState, MusicAction } from './reinforcementLearning';
import { getLocalStorage, setLocalStorage } from './utils/storage';

/**
 * Active session data (in-memory during session)
 */
export interface ActiveSession {
    sessionId: string;
    startedAt: Date;

    // Initial state
    preEmotion: EmotionType;
    preValence: number;
    preArousal: number;

    // Emotion history during session
    emotionHistory: {
        emotion: EmotionType;
        valence: number;
        arousal: number;
        confidence: number;
        timestamp: Date;
    }[];

    // RL tracking
    state: EmotionState;
    action: MusicAction;

    // Music played
    musicSegments: {
        config: any;  //MusicConfig
        playedAt: Date;
        duration: number;
    }[];
}

/**
 * Start a new therapy session
 */
export function startSession(
    initialEmotion: EmotionType,
    initialValence: number,
    initialArousal: number,
    state: EmotionState,
    action: MusicAction
): ActiveSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: ActiveSession = {
        sessionId,
        startedAt: new Date(),
        preEmotion: initialEmotion,
        preValence: initialValence,
        preArousal: initialArousal,
        emotionHistory: [{
            emotion: initialEmotion,
            valence: initialValence,
            arousal: initialArousal,
            confidence: 1.0,
            timestamp: new Date()
        }],
        state,
        action,
        musicSegments: []
    };

    console.log(`🎵 Session started: ${sessionId}`);
    console.log(`   Initial: ${initialEmotion} (valence=${initialValence.toFixed(2)})`);

    return session;
}

/**
 * Record emotion during session
 */
export function recordEmotion(
    session: ActiveSession,
    emotion: EmotionType,
    valence: number,
    arousal: number,
    confidence: number
): ActiveSession {
    session.emotionHistory.push({
        emotion,
        valence,
        arousal,
        confidence,
        timestamp: new Date()
    });

    return session;
}

/**
 * Record music segment played
 */
export function recordMusicSegment(
    session: ActiveSession,
    config: any,
    duration: number
): ActiveSession {
    session.musicSegments.push({
        config,
        playedAt: new Date(),
        duration
    });

    return session;
}

/**
 * End session and compute outcome
 */
export function endSession(
    session: ActiveSession,
    profile: UserProfile,
    panasPreScore?: number,
    panasPostScore?: number,
    userSatisfaction?: number,
    userFeedback?: string
): { outcome: SessionOutcome; updatedProfile: UserProfile } {
    const endedAt = new Date();
    const duration = (endedAt.getTime() - session.startedAt.getTime()) / 1000; // seconds

    // Get final emotion
    const finalRecord = session.emotionHistory[session.emotionHistory.length - 1];
    const postValence = finalRecord.valence;

    // Compute PANAS improvement if provided
    const panasImprovement = (panasPreScore && panasPostScore)
        ? panasPostScore - panasPreScore
        : undefined;

    // Compute valence trend (improvement)
    const valenceTrend = postValence - session.preValence;

    // Create session outcome
    const outcome: SessionOutcome = {
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        endedAt,
        duration,
        panasPreScore,
        panasPostScore,
        panasImprovement,
        emotionHistory: session.emotionHistory.map(e => ({
            emotion: e.emotion,
            confidence: e.confidence,
            timestamp: e.timestamp
        })),
        valenceTrend,
        userSatisfaction,
        userFeedback
    };

    // Update RL Q-table with reward
    const reward = computeReward(session.preValence, postValence);

    // Construct next state from final emotion
    const nextState: EmotionState = {
        currentEmotion: finalRecord.emotion,
        valence: finalRecord.valence,
        arousal: finalRecord.arousal,
        sessionDuration: duration / 60, // minutes
        timeOfDay: session.state.timeOfDay
    };

    // Generate possible actions for next state (for Q-learning update)
    const { generatePossibleActions } = require('./reinforcementLearning');
    const possibleActions = generatePossibleActions(nextState.currentEmotion);

    // Update Q-table
    const updatedQTable = updateQValue(
        profile.rl.qTable,
        session.state,
        session.action,
        reward,
        nextState,
        possibleActions
    );

    // Decay exploration rate
    const newExplorationRate = decayExploration(profile.rl.explorationRate);

    // Update profile
    const updatedProfile: UserProfile = {
        ...profile,
        history: {
            ...profile.history,
            sessionOutcomes: [...profile.history.sessionOutcomes, outcome],
            improvementScores: [...profile.history.improvementScores, valenceTrend]
        },
        rl: {
            qTable: updatedQTable,
            explorationRate: newExplorationRate,
            totalUpdates: profile.rl.totalUpdates + 1,
            lastUpdatedAt: new Date()
        },
        updatedAt: new Date(),
        lastSessionAt: endedAt
    };

    console.log(`✅ Session ended: ${session.sessionId}`);
    console.log(`   Duration: ${(duration / 60).toFixed(1)} min`);
    console.log(`   Valence change: ${session.preValence.toFixed(2)} → ${postValence.toFixed(2)} (Δ${valenceTrend.toFixed(2)})`);
    console.log(`   Reward: ${reward.toFixed(3)}`);
    console.log(`   ε: ${newExplorationRate.toFixed(3)}`);

    return { outcome, updatedProfile };
}

/**
 * Record emotion transition
 */
export function recordEmotionTransition(
    profile: UserProfile,
    from: EmotionType,
    to: EmotionType,
    duration: number,
    musicConfig: any,
    effectiveness: number
): UserProfile {
    const transition: EmotionTransition = {
        from,
        to,
        duration,
        musicConfig,
        effectiveness,
        timestamp: new Date()
    };

    profile.history.emotionTransitions.push(transition);

    return profile;
}

/**
 * Get session statistics for user
 */
export function getSessionStatistics(profile: UserProfile): {
    totalSessions: number;
    avgImprovement: number;
    avgDuration: number;
    bestSession: SessionOutcome | null;
    recentTrend: number[];
} {
    const sessions = profile.history.sessionOutcomes;

    if (sessions.length === 0) {
        return {
            totalSessions: 0,
            avgImprovement: 0,
            avgDuration: 0,
            bestSession: null,
            recentTrend: []
        };
    }

    const totalSessions = sessions.length;

    const avgImprovement = profile.history.improvementScores.reduce((a, b) => a + b, 0) / totalSessions;

    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions;

    const bestSession = sessions.reduce((best, current) =>
        current.valenceTrend > (best?.valenceTrend ?? -Infinity) ? current : best
        , sessions[0]);

    const recentTrend = profile.history.improvementScores.slice(-10); // Last 10 sessions

    return {
        totalSessions,
        avgImprovement,
        avgDuration,
        bestSession,
        recentTrend
    };
}

/**
 * Check if user is making progress
 * 
 * @param profile User profile
 * @returns True if recent trend is positive
 */
export function isUserProgressing(profile: UserProfile): boolean {
    const stats = getSessionStatistics(profile);

    if (stats.recentTrend.length < 3) {
        return false; // Not enough data
    }

    // Compute average of recent sessions
    const recentAvg = stats.recentTrend.reduce((a, b) => a + b, 0) / stats.recentTrend.length;

    return recentAvg > 0; // Positive trend
}

/**
 * Save session to localStorage (temporary before database)
 */
export function saveSessionToStorage(outcome: SessionOutcome): void {
    const key = `smartcare_session_${outcome.sessionId}`;
    localStorage.setItem(key, JSON.stringify(outcome));
    console.log(`💾 Session saved to localStorage: ${outcome.sessionId}`);
}

/**
 * Load all sessions from localStorage
 */
export function loadSessionsFromStorage(): SessionOutcome[] {
    const sessions: SessionOutcome[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('smartcare_session_')) {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    sessions.push(JSON.parse(data));
                }
            } catch (error) {
                console.error(`Failed to parse session ${key}:`, error);
            }
        }
    }

    return sessions.sort((a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
}
