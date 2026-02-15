/**
 * Q-Learning Reinforcement Learning Engine
 * 
 * Implements Q-learning for adaptive music therapy selection.
 * Learns which music configurations work best for transitioning
 * between emotional states for individual users.
 */

import { EmotionType } from './types';
import { UserProfile } from './types/userProfile';

/**
 * Q-learning hyperparameters
 */
export const RL_CONFIG = {
    learningRate: 0.1,       // α: How much to update Q-values
    discountFactor: 0.95,    // γ: Future reward importance
    explorationRate: 0.3,    // ε: Probability of random action
    explorationDecay: 0.995, // Decay ε over time
    minExploration: 0.05     // Minimum ε
};

/**
 * State representation for Q-learning
 */
export interface EmotionState {
    currentEmotion: EmotionType;
    valence: number;           // -1 to 1
    arousal: number;           // 0 to 1
    sessionDuration: number;   // minutes
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Action representation (music configuration)
 */
export interface MusicAction {
    tempo: number;             // BPM
    intensity: number;         // 0-1
    emotionalTarget: EmotionType;
    transitionSpeed: 'slow' | 'medium' | 'fast';
}

/**
 * Serialize state for Q-table key
 */
function serializeState(state: EmotionState): string {
    return `${state.currentEmotion}_${Math.round(state.valence * 10)}_${Math.round(state.arousal * 10)}_${state.timeOfDay}`;
}

/**
 * Serialize action for Q-table key
 */
function serializeAction(action: MusicAction): string {
    return `${action.emotionalTarget}_${Math.round(action.tempo / 10)}_${action.transitionSpeed}`;
}

/**
 * Serialize state-action pair
 */
function serializeStateAction(state: EmotionState, action: MusicAction): string {
    return `${serializeState(state)}|${serializeAction(action)}`;
}

/**
 * Get Q-value for state-action pair
 */
export function getQValue(
    qTable: Map<string, number>,
    state: EmotionState,
    action: MusicAction
): number {
    const key = serializeStateAction(state, action);
    return qTable.get(key) ?? 0; // Default Q-value is 0
}

/**
 * Update Q-value using Q-learning update rule
 * Q(s,a) = Q(s,a) + α * [reward + γ * max(Q(s',a')) - Q(s,a)]
 */
export function updateQValue(
    qTable: Map<string, number>,
    state: EmotionState,
    action: MusicAction,
    reward: number,
    nextState: EmotionState,
    possibleActions: MusicAction[]
): Map<string, number> {
    const key = serializeStateAction(state, action);
    const currentQ = getQValue(qTable, state, action);

    // Find max Q-value for next state
    const maxNextQ = Math.max(
        ...possibleActions.map(a => getQValue(qTable, nextState, a))
    );

    // Q-learning update
    const newQ = currentQ + RL_CONFIG.learningRate * (
        reward + RL_CONFIG.discountFactor * maxNextQ - currentQ
    );

    qTable.set(key, newQ);

    console.log(`📚 Q-Learning Update: ${key} → ${newQ.toFixed(3)}`);

    return qTable;
}

/**
 * Select action using ε-greedy policy
 * 
 * @param state Current emotional state
 * @param possibleActions All possible music actions
 * @param qTable Q-value table
 * @param explorationRate Current ε
 * @returns Selected action
 */
export function selectAction(
    state: EmotionState,
    possibleActions: MusicAction[],
    qTable: Map<string, number>,
    explorationRate: number = RL_CONFIG.explorationRate
): MusicAction {
    // Exploration: random action
    if (Math.random() < explorationRate) {
        const randomIndex = Math.floor(Math.random() * possibleActions.length);
        console.log('🎲 Exploring: Random action selected');
        return possibleActions[randomIndex];
    }

    // Exploitation: best known action
    let bestAction = possibleActions[0];
    let bestQValue = getQValue(qTable, state, bestAction);

    for (const action of possibleActions.slice(1)) {
        const qValue = getQValue(qTable, state, action);
        if (qValue > bestQValue) {
            bestQValue = qValue;
            bestAction = action;
        }
    }

    console.log(`🎯 Exploiting: Best action (Q=${bestQValue.toFixed(3)})`);
    return bestAction;
}

/**
 * Compute reward based on emotional change
 * Reward = Δvalence (change in valence from pre to post)
 * 
 * @param preValence Valence before intervention
 * @param postValence Valence after intervention
 * @returns Reward score
 */
export function computeReward(preValence: number, postValence: number): number {
    const deltaValence = postValence - preValence;

    // Scale reward: +1 for perfect improvement, -1 for getting worse
    // Δvalence ranges from -2 to +2, so divide by 2
    const reward = deltaValence / 2;

    console.log(`💰 Reward: Δvalence = ${deltaValence.toFixed(3)} → ${reward.toFixed(3)}`);

    return reward;
}

/**
 * Generate possible music actions for a given emotional state
 * 
 * @param currentEmotion Current detected emotion
 * @returns Array of possible music actions
 */
export function generatePossibleActions(currentEmotion: EmotionType): MusicAction[] {
    const actions: MusicAction[] = [];

    // Emotion-specific action templates
    const ACTION_TEMPLATES: Record<EmotionType, Partial<MusicAction>[]> = {
        sad: [
            { emotionalTarget: 'neutral', tempo: 75, intensity: 0.4, transitionSpeed: 'slow' },
            { emotionalTarget: 'happy', tempo: 90, intensity: 0.5, transitionSpeed: 'medium' },
        ],
        angry: [
            { emotionalTarget: 'neutral', tempo: 70, intensity: 0.3, transitionSpeed: 'slow' },
            { emotionalTarget: 'happy', tempo: 85, intensity: 0.4, transitionSpeed: 'medium' },
        ],
        fearful: [
            { emotionalTarget: 'neutral', tempo: 65, intensity: 0.3, transitionSpeed: 'slow' },
            { emotionalTarget: 'happy', tempo: 80, intensity: 0.45, transitionSpeed: 'medium' },
        ],
        neutral: [
            { emotionalTarget: 'happy', tempo: 100, intensity: 0.6, transitionSpeed: 'medium' },
            { emotionalTarget: 'happy', tempo: 110, intensity: 0.7, transitionSpeed: 'fast' },
        ],
        happy: [
            { emotionalTarget: 'happy', tempo: 110, intensity: 0.7, transitionSpeed: 'slow' },
        ],
        surprised: [
            { emotionalTarget: 'neutral', tempo: 80, intensity: 0.5, transitionSpeed: 'medium' },
            { emotionalTarget: 'happy', tempo: 95, intensity: 0.6, transitionSpeed: 'medium' },
        ],
        disgusted: [
            { emotionalTarget: 'neutral', tempo: 70, intensity: 0.4, transitionSpeed: 'slow' },
            { emotionalTarget: 'happy', tempo: 85, intensity: 0.5, transitionSpeed: 'medium' },
        ]
    };

    const templates = ACTION_TEMPLATES[currentEmotion] || [];

    for (const template of templates) {
        actions.push({
            tempo: template.tempo!,
            intensity: template.intensity!,
            emotionalTarget: template.emotionalTarget!,
            transitionSpeed: template.transitionSpeed!
        });
    }

    // If no templates (shouldn't happen), add default
    if (actions.length === 0) {
        actions.push({
            tempo: 90,
            intensity: 0.5,
            emotionalTarget: 'happy',
            transitionSpeed: 'medium'
        });
    }

    return actions;
}

/**
 * Decay exploration rate over time (ε decay)
 */
export function decayExploration(currentRate: number): number {
    const newRate = currentRate * RL_CONFIG.explorationDecay;
    return Math.max(newRate, RL_CONFIG.minExploration);
}

/**
 * Initialize Q-table with small random values
 * Helps with exploration early on
 */
export function initializeQTable(): Map<string, number> {
    const qTable = new Map<string, number>();

    // Pre-populate with small random values for common state-action pairs
    const emotions: EmotionType[] = ['sad', 'happy', 'neutral', 'angry', 'fearful'];
    const targets: EmotionType[] = ['happy', 'neutral'];

    for (const emotion of emotions) {
        for (const target of targets) {
            const state: EmotionState = {
                currentEmotion: emotion,
                valence: 0,
                arousal: 0.5,
                sessionDuration: 5,
                timeOfDay: 'evening'
            };

            const action: MusicAction = {
                tempo: 90,
                intensity: 0.5,
                emotionalTarget: target,
                transitionSpeed: 'medium'
            };

            const key = serializeStateAction(state, action);
            qTable.set(key, Math.random() * 0.1); // Small random initial values
        }
    }

    console.log(`✅ Q-table initialized with ${qTable.size} entries`);

    return qTable;
}

/**
 * Save Q-table to user profile
 */
export function saveQTableToProfile(
    profile: UserProfile,
    qTable: Map<string, number>,
    explorationRate: number
): UserProfile {
    profile.rl = {
        qTable,
        explorationRate,
        totalUpdates: profile.rl.totalUpdates + 1,
        lastUpdatedAt: new Date()
    };

    return profile;
}

/**
 * Get current time of day category
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}
