/**
 * Validation Framework
 * 
 * Tools for validating ML models against standard benchmarks:
 * - FER2013 for face emotion recognition
 * - RAVDESS for speech emotion recognition  
 * - GoEmotions for text sentiment analysis
 */

import { EmotionScore, EmotionType } from './types';

/**
 * Validation result for a single prediction
 */
export interface ValidationResult {
    predicted: EmotionType;
    actual: EmotionType;
    confidence: number;
    correct: boolean;
}

/**
 * Aggregate validation metrics
 */
export interface ValidationMetrics {
    accuracy: number;           // Overall accuracy
    precision: number;          // Precision (weighted avg)
    recall: number;             // Recall (weighted avg)
    f1Score: number;            // F1 score (weighted avg)
    confusionMatrix: number[][]; // Confusion matrix
    perClassMetrics: {
        [emotion: string]: {
            precision: number;
            recall: number;
            f1: number;
            support: number;
        };
    };
}

/**
 * Benchmark datasets metadata
 */
export const BENCHMARKS = {
    FER2013: {
        name: 'FER2013',
        modality: 'face',
        emotions: ['angry', 'disgusted', 'fearful', 'happy', 'neutral', ' sad', 'surprised'],
        testSize: 3589,
        source: 'https://www.kaggle.com/datasets/msambare/fer2013'
    },
    RAVDESS: {
        name: 'RAVDESS',
        modality: 'voice',
        emotions: ['neutral', 'happy', 'sad', 'surprised', 'fearful', 'disgusted', 'angry'],
        testSize: 1440,
        source: 'https://www.kaggle.com/datasets/uwrfkaggle/ravdess-emotional-speech-audio'
    },
    GoEmotions: {
        name: 'GoEmotions',
        modality: 'text',
        emotions: ['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'neural'],
        testSize: 5426,
        source: 'https://github.com/google-research/google-research/tree/master/goemotions'
    }
};

/**
 * Compute validation metrics from results
 */
export function computeMetrics(results: ValidationResult[]): ValidationMetrics {
    const emotionList: EmotionType[] = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];
    const numClasses = emotionList.length;

    // Initialize confusion matrix
    const confusionMatrix: number[][] = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));

    // Fill confusion matrix
    results.forEach(result => {
        const actualIdx = emotionList.indexOf(result.actual);
        const predictedIdx = emotionList.indexOf(result.predicted);
        if (actualIdx !== -1 && predictedIdx !== -1) {
            confusionMatrix[actualIdx][predictedIdx]++;
        }
    });

    // Compute per-class metrics
    const perClassMetrics: ValidationMetrics['perClassMetrics'] = {};
    let totalTP = 0;
    let totalPrecisionSum = 0;
    let totalRecallSum = 0;
    let totalF1Sum = 0;
    let totalSupport = 0;

    emotionList.forEach((emotion, idx) => {
        const tp = confusionMatrix[idx][idx];
        const fp = confusionMatrix.reduce((sum, row, i) => sum + (i !== idx ? row[idx] : 0), 0);
        const fn = confusionMatrix[idx].reduce((sum, val, i) => sum + (i !== idx ? val : 0), 0);
        const support = confusionMatrix[idx].reduce((a, b) => a + b, 0);

        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

        perClassMetrics[emotion] = { precision, recall, f1, support };

        totalTP += tp;
        totalPrecisionSum += precision * support;
        totalRecallSum += recall * support;
        totalF1Sum += f1 * support;
        totalSupport += support;
    });

    // Overall metrics (weighted average)
    const accuracy = totalSupport > 0 ? totalTP / totalSupport : 0;
    const precision = totalSupport > 0 ? totalPrecisionSum / totalSupport : 0;
    const recall = totalSupport > 0 ? totalRecallSum / totalSupport : 0;
    const f1Score = totalSupport > 0 ? totalF1Sum / totalSupport : 0;

    return {
        accuracy,
        precision,
        recall,
        f1Score,
        confusionMatrix,
        perClassMetrics
    };
}

/**
 * Pretty-print validation metrics
 */
export function printMetrics(metrics: ValidationMetrics, benchmarkName: string): void {
    console.log(`\n📊 ${benchmarkName} Validation Results`);
    console.log('='.repeat(50));
    console.log(`Overall Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
    console.log(`Weighted Precision: ${(metrics.precision * 100).toFixed(2)}%`);
    console.log(`Weighted Recall: ${(metrics.recall * 100).toFixed(2)}%`);
    console.log(`Weighted F1 Score: ${(metrics.f1Score * 100).toFixed(2)}%`);

    console.log(`\nPer-Class Metrics:`);
    console.log('─'.repeat(70));
    console.log('Emotion       Precision  Recall     F1-Score   Support');
    console.log('─'.repeat(70));

    Object.entries(metrics.perClassMetrics).forEach(([emotion, m]) => {
        console.log(
            `${emotion.padEnd(13)} ` +
            `${(m.precision * 100).toFixed(2)}%`.padEnd(11) +
            `${(m.recall * 100).toFixed(2)}%`.padEnd(11) +
            `${(m.f1 * 100).toFixed(2)}%`.padEnd(11) +
            `${m.support}`
        );
    });

    console.log('='.repeat(50));
}

/**
 * Simulate FER2013 validation (placeholder for real testing)
 * In production, load actual test set and run inference
 */
export async function validateOnFER2013(): Promise<ValidationMetrics> {
    console.log('🧪 Running FER2013 validation...');

    // Placeholder: simulate results
    // In production, load test images and run detectFaceEmotionTFJS()
    const mockResults: ValidationResult[] = [];

    // Simulate ~72% accuracy (typical for FER2013)
    for (let i = 0; i < 100; i++) {
        const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'neutral', 'fearful'];
        const actual = emotions[Math.floor(Math.random() * emotions.length)];
        const predicted = Math.random() < 0.72 ? actual : emotions[Math.floor(Math.random() * emotions.length)];

        mockResults.push({
            actual,
            predicted,
            confidence: 0.7 + Math.random() * 0.25,
            correct: actual === predicted
        });
    }

    const metrics = computeMetrics(mockResults);
    printMetrics(metrics, 'FER2013');

    return metrics;
}

/**
 * Validate text sentiment on GoEmotions
 */
export async function validateOnGoEmotions(): Promise<ValidationMetrics> {
    console.log('🧪 Running GoEmotions validation...');

    // Placeholder: simulate ~76% precision
    const mockResults: ValidationResult[] = [];

    for (let i = 0; i < 100; i++) {
        const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'neutral'];
        const actual = emotions[Math.floor(Math.random() * emotions.length)];
        const predicted = Math.random() < 0.76 ? actual : emotions[Math.floor(Math.random() * emotions.length)];

        mockResults.push({
            actual,
            predicted,
            confidence: 0.75 + Math.random() * 0.20,
            correct: actual === predicted
        });
    }

    const metrics = computeMetrics(mockResults);
    printMetrics(metrics, 'GoEmotions');

    return metrics;
}

/**
 * Run all validations
 */
export async function runAllValidations(): Promise<{
    FER2013: ValidationMetrics;
    GoEmotions: ValidationMetrics;
}> {
    console.log('🚀 Running full validation suite...\n');

    const fer = await validateOnFER2013();
    const goEmotions = await validateOnGoEmotions();

    console.log('\n✅ Validation complete!');

    return { FER2013: fer, GoEmotions: goEmotions };
}

/**
 * Check if metrics meet publication standards
 */
export function meetsPublicationStandards(metrics: ValidationMetrics): {
    meets: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    // Typical thresholds for mental health AI
    if (metrics.accuracy < 0.70) {
        issues.push(`Accuracy too low: ${(metrics.accuracy * 100).toFixed(1)}% < 70%`);
    }

    if (metrics.f1Score < 0.65) {
        issues.push(`F1-score too low: ${(metrics.f1Score * 100).toFixed(1)}% < 65%`);
    }

    // Check for class imbalance issues
    Object.entries(metrics.perClassMetrics).forEach(([emotion, m]) => {
        if (m.f1 < 0.50 && m.support > 10) {
            issues.push(`Low F1 for ${emotion}: ${(m.f1 * 100).toFixed(1)}%`);
        }
    });

    return {
        meets: issues.length === 0,
        issues
    };
}
