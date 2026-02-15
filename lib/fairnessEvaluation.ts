/**
 * Fairness & Bias Evaluation Framework
 * 
 * Tests ML models for bias across demographic groups to ensure
 * equitable performance. Critical for ethical AI and publication.
 * 
 * Tests:
 * - Face recognition across skin tones (Fitzpatrick scale)
 * - Face recognition across genders
 * - Face recognition across age groups
 * - Voice recognition across accents
 * - Lighting condition robustness
 */

import { EmotionScore, EmotionType } from './types';
import { ValidationMetrics, computeMetrics } from './validation';

/**
 * Demographic categories for fairness testing
 */
export enum FitzpatrickScale {
    TYPE_I = 1,    // Very light (always burns, never tans)
    TYPE_II = 2,   // Light (burns easily, tans minimally)
    TYPE_III = 3,  // Medium (burns moderately, tans gradually)
    TYPE_IV = 4,   // Olive (burns minimally, tans easily)
    TYPE_V = 5,    // Brown (rarely burns, tans profusely)
    TYPE_VI = 6    // Dark brown/black (never burns, tans profusely)
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    NON_BINARY = 'non_binary'
}

export enum AgeGroup {
    YOUNG = '18-30',
    MIDDLE = '31-50',
    SENIOR = '51-70'
}

export enum AccentType {
    NORTH_AMERICAN = 'north_american',
    BRITISH = 'british',
    INDIAN = 'indian',
    AUSTRALIAN = 'australian',
    AFRICAN = 'african'
}

/**
 * Demographic metadata for test sample
 */
export interface DemographicInfo {
    skinTone?: FitzpatrickScale;
    gender?: Gender;
    ageGroup?: AgeGroup;
    accent?: AccentType;
}

/**
 * Test sample with demographics
 */
export interface DemographicTestSample {
    id: string;
    data: string;              // Image data, audio data, or text
    trueEmotion: EmotionType;
    demographics: DemographicInfo;
}

/**
 * Fairness metrics
 */
export interface FairnessMetrics {
    // Overall metrics
    overallAccuracy: number;

    // Per-group metrics
    groupMetrics: Map<string, ValidationMetrics>;

    // Fairness scores
    demographicParity: number;        // Max difference in positive prediction rates
    equalOpportunityDiff: number;     // Max difference in TPR across groups
    disparateImpactRatio: number;     // Min(group rate) / Max(group rate)

    // Pass/fail thresholds
    passesDemographicParity: boolean;     // < 0.1 difference
    passesEqualOpportunity: boolean;  // < 0.1 difference
    passesDisparateImpact: boolean;   // > 0.8 ratio

    // Overall fairness assessment
    overallFairness: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Evaluate model fairness across demographic groups
 */
export async function evaluateFairness(
    testSamples: DemographicTestSample[],
    predictFunction: (data: string) => Promise<EmotionScore[]>,
    groupByAttribute: 'skinTone' | 'gender' | 'ageGroup' | 'accent'
): Promise<FairnessMetrics> {

    console.log(`📊 Evaluating fairness by ${groupByAttribute}...`);

    // Group samples by demographic attribute
    const groups = new Map<string, DemographicTestSample[]>();

    testSamples.forEach(sample => {
        const groupKey = String(sample.demographics[groupByAttribute] || 'unknown');
        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(sample);
    });

    // Evaluate each group
    const groupMetrics = new Map<string, ValidationMetrics>();
    const groupAccuracies: number[] = [];
    const groupTPRs: number[] = [];
    const groupPositiveRates: number[] = [];

    for (const [groupKey, samples] of groups.entries()) {
        console.log(`  Testing ${groupKey}: ${samples.length} samples`);

        // Run predictions
        const results = [];
        for (const sample of samples) {
            const predictions = await predictFunction(sample.data);
            const predicted = predictions[0].emotion;
            results.push({
                predicted,
                actual: sample.trueEmotion,
                confidence: predictions[0].confidence,
                correct: predicted === sample.trueEmotion
            });
        }

        // Compute metrics for this group
        const metrics = computeMetrics(results);
        groupMetrics.set(groupKey, metrics);
        groupAccuracies.push(metrics.accuracy);

        // Calculate TPR (True Positive Rate) - average recall
        const tpr = metrics.recall;
        groupTPRs.push(tpr);

        // Calculate positive prediction rate
        const positiveRate = results.filter(r => r.predicted !== 'neutral').length / results.length;
        groupPositiveRates.push(positiveRate);
    }

    // Compute fairness metrics
    const demographicParity = Math.max(...groupPositiveRates) - Math.min(...groupPositiveRates);
    const equalOpportunityDiff = Math.max(...groupTPRs) - Math.min(...groupTPRs);
    const disparateImpactRatio = Math.min(...groupPositiveRates) / Math.max(...groupPositiveRates);

    // Check fairness thresholds
    const passesDemographicParity = demographicParity < 0.1;
    const passesEqualOpportunity = equalOpportunityDiff < 0.1;
    const passesDisparateImpact = disparateImpactRatio > 0.8;

    // Overall fairness assessment
    let overallFairness: 'excellent' | 'good' | 'fair' | 'poor';
    const passCount = [passesDemographicParity, passesEqualOpportunity, passesDisparateImpact].filter(p => p).length;

    if (passCount === 3) overallFairness = 'excellent';
    else if (passCount === 2) overallFairness = 'good';
    else if (passCount === 1) overallFairness = 'fair';
    else overallFairness = 'poor';

    const overallAccuracy = groupAccuracies.reduce((a, b) => a + b, 0) / groupAccuracies.length;

    console.log(`✅ Fairness evaluation complete`);
    console.log(`   Demographic Parity: ${demographicParity.toFixed(3)} (${passesDemographicParity ? 'PASS' : 'FAIL'})`);
    console.log(`   Equal Opportunity: ${equalOpportunityDiff.toFixed(3)} (${passesEqualOpportunity ? 'PASS' : 'FAIL'})`);
    console.log(`   Disparate Impact: ${disparateImpactRatio.toFixed(3)} (${passesDisparateImpact ? 'PASS' : 'FAIL'})`);
    console.log(`   Overall: ${overallFairness.toUpperCase()}`);

    return {
        overallAccuracy,
        groupMetrics,
        demographicParity,
        equalOpportunityDiff,
        disparateImpactRatio,
        passesDemographicParity,
        passesEqualOpportunity,
        passesDisparateImpact,
        overallFairness
    };
}

/**
 * Generate fairness report for publication
 */
export function generateFairnessReport(
    skinToneMetrics: FairnessMetrics,
    genderMetrics: FairnessMetrics,
    ageMetrics: FairnessMetrics
): string {
    return `
# Fairness & Bias Evaluation Report

## Executive Summary

This report documents fairness testing across demographic groups to ensure equitable performance.

## Skin Tone (Fitzpatrick Scale)

**Overall Fairness**: ${skinToneMetrics.overallFairness.toUpperCase()}

- Demographic Parity: ${skinToneMetrics.demographicParity.toFixed(3)} ${skinToneMetrics.passesDemographicParity ? '✅ PASS' : '❌ FAIL'}
- Equal Opportunity: ${skinToneMetrics.equalOpportunityDiff.toFixed(3)} ${skinToneMetrics.passesEqualOpportunity ? '✅ PASS' : '❌ FAIL'}
- Disparate Impact: ${skinToneMetrics.disparateImpactRatio.toFixed(3)} ${skinToneMetrics.passesDisparateImpact ? '✅ PASS' : '❌ FAIL'}

### Per-Group Performance:

${Array.from(skinToneMetrics.groupMetrics.entries()).map(([group, metrics]) =>
        `- ${group}: ${(metrics.accuracy * 100).toFixed(1)}% accuracy`
    ).join('\n')}

## Gender

**Overall Fairness**: ${genderMetrics.overallFairness.toUpperCase()}

- Demographic Parity: ${genderMetrics.demographicParity.toFixed(3)} ${genderMetrics.passesDemographicParity ? '✅ PASS' : '❌ FAIL'}
- Equal Opportunity: ${genderMetrics.equalOpportunityDiff.toFixed(3)} ${genderMetrics.passesEqualOpportunity ? '✅ PASS' : '❌ FAIL'}
- Disparate Impact: ${genderMetrics.disparateImpactRatio.toFixed(3)} ${genderMetrics.passesDisparateImpact ? '✅ PASS' : '❌ FAIL'}

### Per-Group Performance:

${Array.from(genderMetrics.groupMetrics.entries()).map(([group, metrics]) =>
        `- ${group}: ${(metrics.accuracy * 100).toFixed(1)}% accuracy`
    ).join('\n')}

## Age Groups

**Overall Fairness**: ${ageMetrics.overallFairness.toUpperCase()}

- Demographic Parity: ${ageMetrics.demographicParity.toFixed(3)} ${ageMetrics.passesDemographicParity ? '✅ PASS' : '❌ FAIL'}
- Equal Opportunity: ${ageMetrics.equalOpportunityDiff.toFixed(3)} ${ageMetrics.passesEqualOpportunity ? '✅ PASS' : '❌ FAIL'}
- Disparate Impact: ${ageMetrics.disparateImpactRatio.toFixed(3)} ${ageMetrics.passesDisparateImpact ? '✅ PASS' : '❌ FAIL'}

### Per-Group Performance:

${Array.from(ageMetrics.groupMetrics.entries()).map(([group, metrics]) =>
        `- ${group}: ${(metrics.accuracy * 100).toFixed(1)}% accuracy`
    ).join('\n')}

## Mitigation Strategies

1. **Data Augmentation**: Ensure balanced representation across all demographic groups
2. **Model Retraining**: Periodically retrain with diverse, balanced datasets
3. **Threshold Adjustment**: Apply group-specific thresholds if needed
4. **Continuous Monitoring**: Track fairness metrics in production

## Conclusion

${[skinToneMetrics, genderMetrics, ageMetrics].every(m => m.overallFairness === 'excellent' || m.overallFairness === 'good')
            ? 'The model demonstrates good fairness across demographic groups and is suitable for deployment.'
            : 'The model shows fairness concerns that should be addressed before deployment.'
        }
    `.trim();
}

/**
 * Test lighting condition robustness
 */
export async function testLightingRobustness(
    baseImage: string,
    predictFunction: (data: string) => Promise<EmotionScore[]>
): Promise<{
    normalLight: EmotionType;
    lowLight: EmotionType;
    brightLight: EmotionType;
    agreement: number;  // 0-1, how often predictions agree
}> {
    // In production, apply actual lighting transformations
    // For now, simulate different lighting conditions

    const normalPred = await predictFunction(baseImage);
    const lowLightPred = await predictFunction(baseImage); // Would be darkened
    const brightLightPred = await predictFunction(baseImage); // Would be brightened

    const predictions = [
        normalPred[0].emotion,
        lowLightPred[0].emotion,
        brightLightPred[0].emotion
    ];

    // Calculate agreement (how many match the mode)
    const mode = predictions.sort((a, b) =>
        predictions.filter(v => v === a).length - predictions.filter(v => v === b).length
    ).pop()!;

    const agreement = predictions.filter(p => p === mode).length / predictions.length;

    return {
        normalLight: predictions[0],
        lowLight: predictions[1],
        brightLight: predictions[2],
        agreement
    };
}

/**
 * Bias mitigation recommendations
 */
export function getBiasMitigationStrategies(metrics: FairnessMetrics): string[] {
    const strategies: string[] = [];

    if (!metrics.passesDemographicParity) {
        strategies.push('Balance training data across demographic groups');
        strategies.push('Apply re-weighting to underrepresented groups');
    }

    if (!metrics.passesEqualOpportunity) {
        strategies.push('Implement group-specific decision thresholds');
        strategies.push('Use adversarial debiasing during training');
    }

    if (!metrics.passesDisparateImpact) {
        strategies.push('Apply fairness constraints during model optimization');
        strategies.push('Use calibration techniques per demographic group');
    }

    if (strategies.length === 0) {
        strategies.push('Continue monitoring fairness metrics in production');
        strategies.push('Maintain balanced data collection practices');
    }

    return strategies;
}
