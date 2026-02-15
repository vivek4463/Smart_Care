/**
 * Clinical Safety Layer
 * 
 * Detects crisis situations (suicide ideation, self-harm) and provides
 * immediate intervention resources. This is a critical safety feature
 * for any mental health application.
 */

import { EmotionScore, EmotionType } from './types';

/**
 * Crisis severity levels
 */
export enum CrisisLevel {
    NONE = 'none',
    LOW = 'low',           // Mild distress, no immediate danger
    MEDIUM = 'medium',     // Significant distress, monitor closely
    HIGH = 'high',         // Severe distress, recommend professional help
    CRITICAL = 'critical'  // Immediate danger, emergency intervention
}

/**
 * Crisis detection result
 */
export interface CrisisDetectionResult {
    level: CrisisLevel;
    confidence: number;       // 0-1
    detectedKeywords: string[];
    recommendedAction: string;
    emergencyResources: EmergencyResource[];
}

/**
 * Emergency resource information
 */
export interface EmergencyResource {
    name: string;
    phone: string;
    description: string;
    available24h: boolean;
}

/**
 * Crisis keywords database
 * Organized by severity level
 */
const CRISIS_KEYWORDS = {
    critical: [
        'kill myself',
        'end my life',
        'want to die',
        'suicide',
        'suicidal',
        'not worth living',
        'better off dead',
        'end it all',
        'take my own life'
    ],
    high: [
        'self harm',
        'cut myself',
        'hurt myself',
        'harm myself',
        'no point',
        'give up',
        'can\'t go on',
        'hopeless',
        'worthless',
        'nobody cares'
    ],
    medium: [
        'depressed',
        'very sad',
        'can\'t cope',
        'overwhelmed',
        'desperate',
        'alone',
        'isolated',
        'trapped',
        'burden'
    ],
    low: [
        'stressed',
        'anxious',
        'worried',
        'upset',
        'struggling',
        'tired of everything'
    ]
};

/**
 * Emergency resources (US-based, expand for other regions)
 */
const EMERGENCY_RESOURCES: EmergencyResource[] = [
    {
        name: '988 Suicide & Crisis Lifeline',
        phone: '988',
        description: 'Free, confidential support 24/7 for people in distress',
        available24h: true
    },
    {
        name: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        description: 'Free, 24/7 crisis support via text message',
        available24h: true
    },
    {
        name: 'SAMHSA National Helpline',
        phone: '1-800-662-4357',
        description: 'Treatment referral and information service',
        available24h: true
    },
    {
        name: 'Emergency Services',
        phone: '911',
        description: 'Immediate emergency response for life-threatening situations',
        available24h: true
    }
];

/**
 * Detect crisis level from text input
 * 
 * @param text User input text
 * @returns Crisis detection result
 */
export function detectCrisis(text: string): CrisisDetectionResult {
    const lowerText = text.toLowerCase();
    const detectedKeywords: string[] = [];
    let highestLevel: CrisisLevel = CrisisLevel.NONE;
    let confidence = 0;

    // Check critical keywords
    for (const keyword of CRISIS_KEYWORDS.critical) {
        if (lowerText.includes(keyword)) {
            detectedKeywords.push(keyword);
            highestLevel = CrisisLevel.CRITICAL;
            confidence = Math.max(confidence, 0.95);
        }
    }

    // Check high keywords (only if not already critical)
    if (highestLevel !== CrisisLevel.CRITICAL) {
        for (const keyword of CRISIS_KEYWORDS.high) {
            if (lowerText.includes(keyword)) {
                detectedKeywords.push(keyword);
                highestLevel = CrisisLevel.HIGH;
                confidence = Math.max(confidence, 0.85);
            }
        }
    }

    // Check medium keywords
    if (highestLevel === CrisisLevel.NONE) {
        for (const keyword of CRISIS_KEYWORDS.medium) {
            if (lowerText.includes(keyword)) {
                detectedKeywords.push(keyword);
                highestLevel = CrisisLevel.MEDIUM;
                confidence = Math.max(confidence, 0.70);
            }
        }
    }

    // Check low keywords
    if (highestLevel === CrisisLevel.NONE) {
        for (const keyword of CRISIS_KEYWORDS.low) {
            if (lowerText.includes(keyword)) {
                detectedKeywords.push(keyword);
                highestLevel = CrisisLevel.LOW;
                confidence = Math.max(confidence, 0.60);
            }
        }
    }

    // Determine recommended action based on level
    const recommendedAction = getRecommendedAction(highestLevel);

    // Get relevant emergency resources
    const relevantResources = highestLevel >= CrisisLevel.HIGH
        ? EMERGENCY_RESOURCES
        : EMERGENCY_RESOURCES.slice(0, 2); // Just lifeline and crisis text for lower levels

    const result: CrisisDetectionResult = {
        level: highestLevel,
        confidence,
        detectedKeywords,
        recommendedAction,
        emergencyResources: relevantResources
    };

    // Log crisis detection (for monitoring)
    if (highestLevel >= CrisisLevel.MEDIUM) {
        console.warn('⚠️ CRISIS DETECTED:', {
            level: highestLevel,
            keywords: detectedKeywords,
            confidence
        });

        // TODO: Send alert to monitoring system
        // alertClinician(result);
    }

    return result;
}

/**
 * Get recommended action message based on crisis level
 */
function getRecommendedAction(level: CrisisLevel): string {
    switch (level) {
        case CrisisLevel.CRITICAL:
            return 'IMMEDIATE ACTION NEEDED: Please reach out to a crisis counselor or call 988 right now. You are not alone, and help is available.';

        case CrisisLevel.HIGH:
            return 'Please consider talking to a mental health professional or calling the crisis hotline. Your safety is important.';

        case CrisisLevel.MEDIUM:
            return 'It sounds like you\'re going through a difficult time. Consider reaching out to a counselor or trusted friend.';

        case CrisisLevel.LOW:
            return 'Self-care and support are important. If stress continues, consider professional support.';

        default:
            return 'Continue with your session. Remember, professional help is always available if needed.';
    }
}

/**
 * Detect crisis from combined emotion data
 * Considers emotion type, confidence, and valence
 * 
 * @param emotion Detected emotion
 * @param valence Emotional valence (-1 to 1)
 * @param confidence Detection confidence
 * @returns Crisis level
 */
export function detectCrisisFromEmotion(
    emotion: EmotionType,
    valence: number,
    confidence: number
): CrisisLevel {
    // Very negative valence + high confidence = potential crisis
    if (valence < -0.8 && confidence > 0.75) {
        return emotion === 'sad' || emotion === 'fearful'
            ? CrisisLevel.MEDIUM
            : CrisisLevel.LOW;
    }

    // Moderate negative valence
    if (valence < -0.6 && confidence > 0.70) {
        return CrisisLevel.LOW;
    }

    return CrisisLevel.NONE;
}

/**
 * Override music generation in crisis situations
 * Returns calming, supportive music configuration
 */
export function getCrisisMusicOverride() {
    return {
        tempo: 60,              // Very slow, calming
        key: 'C',
        mode: 'major' as const,
        instruments: ['pad', 'harp'],
        intensity: 0.2,         // Very gentle
        emotionalTarget: 'calm and safe',
        message: 'Playing calming music. Please reach out for support.'
    };
}

/**
 * Log crisis event for clinical monitoring
 * (Would send to backend/database in production)
 */
export function logCrisisEvent(
    userId: string,
    result: CrisisDetectionResult,
    userText?: string
): void {
    const event = {
        timestamp: new Date().toISOString(),
        userId,
        level: result.level,
        confidence: result.confidence,
        keywords: result.detectedKeywords,
        userText: userText ? '[REDACTED FOR PRIVACY]' : undefined // Don't log actual text
    };

    console.warn('🚨 Crisis Event Logged:', event);

    // TODO: Send to backend monitoring system
    // await fetch('/api/crisis/log', { method: 'POST', body: JSON.stringify(event) });

    // Store locally for offline tracking
    const events = JSON.parse(localStorage.getItem('crisis_events') || '[]');
    events.push(event);
    localStorage.setItem('crisis_events', JSON.stringify(events.slice(-50))); // Keep last 50
}

/**
 * Check if user should be referred to professional help
 * Based on crisis frequency and severity over time
 */
export function shouldReferToProfessional(userId: string): {
    shouldRefer: boolean;
    reason: string;
} {
    const events = JSON.parse(localStorage.getItem('crisis_events') || '[]');
    const userEvents = events.filter((e: any) => e.userId === userId);

    // Check last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentEvents = userEvents.filter((e: any) =>
        new Date(e.timestamp) > weekAgo
    );

    // High-severity events in past week
    const criticalOrHigh = recentEvents.filter((e: any) =>
        e.level === CrisisLevel.CRITICAL || e.level === CrisisLevel.HIGH
    );

    if (criticalOrHigh.length >= 1) {
        return {
            shouldRefer: true,
            reason: 'Detected high-severity crisis indicators. Professional support strongly recommended.'
        };
    }

    // Multiple medium events
    const mediumEvents = recentEvents.filter((e: any) => e.level === CrisisLevel.MEDIUM);
    if (mediumEvents.length >= 3) {
        return {
            shouldRefer: true,
            reason: 'Persistent distress detected. Professional counseling recommended.'
        };
    }

    return {
        shouldRefer: false,
        reason: ''
    };
}
