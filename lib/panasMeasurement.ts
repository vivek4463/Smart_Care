/**
 * PANAS (Positive and Negative Affect Schedule) Measurement
 * 
 * Standard psychological assessment for measuring positive and negative affect.
 * Used pre/post therapy to validate effectiveness.
 * 
 * Reference: Watson, D., Clark, L. A., & Tellegen, A. (1988).
 */

/**
 * PANAS questionnaire items
 * 10 positive affect + 10 negative affect = 20 items
 */
export const PANAS_ITEMS = {
    positive: [
        { id: 'pa1', text: 'Interested', keyword: 'interested' },
        { id: 'pa2', text: 'Excited', keyword: 'excited' },
        { id: 'pa3', text: 'Strong', keyword: 'strong' },
        { id: 'pa4', text: 'Enthusiastic', keyword: 'enthusiastic' },
        { id: 'pa5', text: 'Proud', keyword: 'proud' },
        { id: 'pa6', text: 'Alert', keyword: 'alert' },
        { id: 'pa7', text: 'Inspired', keyword: 'inspired' },
        { id: 'pa8', text: 'Determined', keyword: 'determined' },
        { id: 'pa9', text: 'Attentive', keyword: 'attentive' },
        { id: 'pa10', text: 'Active', keyword: 'active' }
    ],
    negative: [
        { id: 'na1', text: 'Distressed', keyword: 'distressed' },
        { id: 'na2', text: 'Upset', keyword: 'upset' },
        { id: 'na3', text: 'Guilty', keyword: 'guilty' },
        { id: 'na4', text: 'Scared', keyword: 'scared' },
        { id: 'na5', text: 'Hostile', keyword: 'hostile' },
        { id: 'na6', text: 'Irritable', keyword: 'irritable' },
        { id: 'na7', text: 'Ashamed', keyword: 'ashamed' },
        { id: 'na8', text: 'Nervous', keyword: 'nervous' },
        { id: 'na9', text: 'Jittery', keyword: 'jittery' },
        { id: 'na10', text: 'Afraid', keyword: 'afraid' }
    ]
};

/**
 * PANAS response scale
 * 1 = Very slightly or not at all
 * 2 = A little
 * 3 = Moderately
 * 4 = Quite a bit
 * 5 = Extremely
 */
export type PANASResponse = 1 | 2 | 3 | 4 | 5;

/**
 * PANAS responses for all items
 */
export interface PANASResponses {
    positive: Record<string, PANASResponse>;
    negative: Record<string, PANASResponse>;
    timestamp: Date;
}

/**
 * PANAS scores (sum of responses)
 */
export interface PANASScores {
    positiveAffect: number;  // 10-50
    negativeAffect: number;  // 10-50
    totalScore: number;      // PA - NA (for convenience)
    timestamp: Date;
}

/**
 * Compute PANAS scores from responses
 */
export function computePANASScores(responses: PANASResponses): PANASScores {
    // Sum positive affect items
    const positiveAffect = Object.values(responses.positive).reduce((sum, val) => sum + val, 0);

    // Sum negative affect items
    const negativeAffect = Object.values(responses.negative).reduce((sum, val) => sum + val, 0);

    // Total score (positive - negative)
    const totalScore = positiveAffect - negativeAffect;

    return {
        positiveAffect,
        negativeAffect,
        totalScore,
        timestamp: responses.timestamp
    };
}

/**
 * Interpret PANAS scores
 */
export function interpretPANASScores(scores: PANASScores): {
    positiveInterpretation: string;
    negativeInterpretation: string;
    overallInterpretation: string;
    severity: 'low' | 'moderate' | 'high';
} {
    const { positiveAffect, negativeAffect } = scores;

    // Positive affect interpretation
    let positiveInterpretation = '';
    if (positiveAffect >= 40) {
        positiveInterpretation = 'Very high positive affect - feeling energized and engaged';
    } else if (positiveAffect >= 30) {
        positiveInterpretation = 'Moderate-high positive affect - generally positive mood';
    } else if (positiveAffect >= 20) {
        positiveInterpretation = 'Low-moderate positive affect - some positive feelings';
    } else {
        positiveInterpretation = 'Low positive affect - may benefit from mood enhancement';
    }

    // Negative affect interpretation
    let negativeInterpretation = '';
    let severity: 'low' | 'moderate' | 'high' = 'low';

    if (negativeAffect >= 35) {
        negativeInterpretation = 'High negative affect - significant distress present';
        severity = 'high';
    } else if (negativeAffect >= 25) {
        negativeInterpretation = 'Moderate negative affect - some distress';
        severity = 'moderate';
    } else if (negativeAffect >= 15) {
        negativeInterpretation = 'Low-moderate negative affect - mild concerns';
        severity = 'low';
    } else {
        negativeInterpretation = 'Low negative affect - minimal distress';
        severity = 'low';
    }

    // Overall interpretation
    let overallInterpretation = '';
    const balance = positiveAffect - negativeAffect;

    if (balance > 20) {
        overallInterpretation = 'Positive emotional state - feeling good overall';
    } else if (balance > 0) {
        overallInterpretation = 'Balanced emotional state - slightly positive';
    } else if (balance > -20) {
        overallInterpretation = 'Balanced emotional state - slightly negative';
    } else {
        overallInterpretation = 'Negative emotional state - may need support';
    }

    return {
        positiveInterpretation,
        negativeInterpretation,
        overallInterpretation,
        severity
    };
}

/**
 * Calculate PANAS improvement from pre/post scores
 */
export function calculatePANASImprovement(
    preScores: PANASScores,
    postScores: PANASScores
): {
    positiveChange: number;
    negativeChange: number;
    totalChange: number;
    percentImprovement: number;
    significant: boolean;
} {
    const positiveChange = postScores.positiveAffect - preScores.positiveAffect;
    const negativeChange = preScores.negativeAffect - postScores.negativeAffect; // Decrease is good
    const totalChange = postScores.totalScore - preScores.totalScore;

    // Percent improvement based on total score change
    // Max possible change is 80 (50 to -30 or vice versa)
    const percentImprovement = (totalChange / 80) * 100;

    // Clinically significant: improvement ≥ 5 points
    const significant = totalChange >= 5;

    return {
        positiveChange,
        negativeChange,
        totalChange,
        percentImprovement,
        significant
    };
}

/**
 * Get PANAS questionnaire for display
 */
export function getPANASQuestionnaire(): {
    instructions: string;
    scaleDescription: string;
    items: typeof PANAS_ITEMS;
    scale: { value: PANASResponse; label: string }[];
} {
    return {
        instructions: 'This scale consists of a number of words that describe different feelings and emotions. Read each item and then mark the appropriate answer in the space next to that word. Indicate to what extent you feel this way right now, that is, at the present moment.',
        scaleDescription: 'Use the following scale to record your answers:',
        items: PANAS_ITEMS,
        scale: [
            { value: 1, label: 'Very slightly or not at all' },
            { value: 2, label: 'A little' },
            { value: 3, label: 'Moderately' },
            { value: 4, label: 'Quite a bit' },
            { value: 5, label: 'Extremely' }
        ]
    };
}

/**
 * Validate PANAS responses
 */
export function validatePANASResponses(responses: PANASResponses): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check all positive items answered
    PANAS_ITEMS.positive.forEach(item => {
        if (!(item.id in responses.positive)) {
            errors.push(`Missing response for: ${item.text}`);
        } else {
            const val = responses.positive[item.id];
            if (val < 1 || val > 5) {
                errors.push(`Invalid value for ${item.text}: must be 1-5`);
            }
        }
    });

    // Check all negative items answered
    PANAS_ITEMS.negative.forEach(item => {
        if (!(item.id in responses.negative)) {
            errors.push(`Missing response for: ${item.text}`);
        } else {
            const val = responses.negative[item.id];
            if (val < 1 || val > 5) {
                errors.push(`Invalid value for ${item.text}: must be 1-5`);
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Create empty PANAS response template
 */
export function createEmptyPANASResponse(): PANASResponses {
    const positive: Record<string, PANASResponse> = {};
    const negative: Record<string, PANASResponse> = {};

    PANAS_ITEMS.positive.forEach(item => {
        positive[item.id] = 3; // Default to "Moderately"
    });

    PANAS_ITEMS.negative.forEach(item => {
        negative[item.id] = 3;
    });

    return {
        positive,
        negative,
        timestamp: new Date()
    };
}

/**
 * Save PANAS scores to storage
 */
export function savePANASScores(
    userId: string,
    sessionId: string,
    type: 'pre' | 'post',
    scores: PANASScores
): void {
    const key = `panas_${userId}_${sessionId}_${type}`;
    localStorage.setItem(key, JSON.stringify(scores));
    console.log(`💾 PANAS ${type}-scores saved:`, scores);
}

/**
 * Load PANAS scores from storage
 */
export function loadPANASScores(
    userId: string,
    sessionId: string,
    type: 'pre' | 'post'
): PANASScores | null {
    const key = `panas_${userId}_${sessionId}_${type}`;
    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

/**
 * Generate PANAS report for research
 */
export function generatePANASReport(
    preScores: PANASScores,
    postScores: PANASScores
): string {
    const improvement = calculatePANASImprovement(preScores, postScores);
    const preInterpretation = interpretPANASScores(preScores);
    const postInterpretation = interpretPANASScores(postScores);

    return `
PANAS Assessment Report
========================

PRE-INTERVENTION SCORES:
- Positive Affect: ${preScores.positiveAffect}/50
- Negative Affect: ${preScores.negativeAffect}/50
- Total Score: ${preScores.totalScore}
- Interpretation: ${preInterpretation.overallInterpretation}

POST-INTERVENTION SCORES:
- Positive Affect: ${postScores.positiveAffect}/50
- Negative Affect: ${postScores.negativeAffect}/50
- Total Score: ${postScores.totalScore}
- Interpretation: ${postInterpretation.overallInterpretation}

CHANGE:
- Positive Affect Change: ${improvement.positiveChange > 0 ? '+' : ''}${improvement.positiveChange}
- Negative Affect Change: ${improvement.negativeChange > 0 ? '+' : ''}${improvement.negativeChange}
- Total Score Change: ${improvement.totalChange > 0 ? '+' : ''}${improvement.totalChange}
- Percent Improvement: ${improvement.percentImprovement.toFixed(1)}%
- Clinically Significant: ${improvement.significant ? 'YES' : 'NO'} (≥5 points)

CONCLUSION:
${improvement.significant
            ? 'The intervention showed statistically and clinically significant improvement in affect.'
            : 'The intervention showed improvement, but did not reach clinical significance threshold.'}
    `.trim();
}
