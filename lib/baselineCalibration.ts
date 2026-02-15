/**
 * Baseline Calibration Functions
 * 
 * These functions handle the initial calibration phase where we capture
 * a user's neutral baseline for face and voice, enabling relative emotion detection.
 */

import { BaselineData } from './types/userProfile';

/**
 * Calibration status for UI feedback
 */
export interface CalibrationStatus {
    stage: 'face' | 'voice' | 'complete' | 'idle';
    progress: number;  // 0-100
    message: string;
    samplesCollected: number;
    samplesRequired: number;
}

/**
 * Capture face baseline over 10 seconds
 * Collects facial landmarks at 10 Hz (100 samples total)
 * 
 * @param getFaceLandmarks Function to get current facial landmarks
 * @param onProgress Callback for progress updates
 * @returns Baseline facial data
 */
export async function calibrateFaceBaseline(
    getFaceLandmarks: () => Promise<number[]>,
    onProgress?: (status: CalibrationStatus) => void
): Promise<BaselineData['facialNeutral']> {
    const samples: number[][] = [];
    const SAMPLE_RATE = 10;  // samples per second
    const DURATION = 10;     // seconds
    const TOTAL_SAMPLES = SAMPLE_RATE * DURATION;

    console.log('Starting face baseline calibration...');

    for (let i = 0; i < TOTAL_SAMPLES; i++) {
        try {
            const landmarks = await getFaceLandmarks();
            samples.push(landmarks);

            // Report progress
            if (onProgress) {
                onProgress({
                    stage: 'face',
                    progress: (i / TOTAL_SAMPLES) * 100,
                    message: `Capturing neutral face... ${i + 1}/${TOTAL_SAMPLES}`,
                    samplesCollected: i + 1,
                    samplesRequired: TOTAL_SAMPLES
                });
            }

            // Wait 100ms between samples
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.warn('Failed to capture landmark sample:', error);
        }
    }

    // Compute median landmarks (robust to outliers)
    const baselineLandmarks = computeMedianLandmarks(samples);

    // Assess image quality
    const imageQuality = assessImageQuality(samples);

    console.log(`✅ Face baseline calibrated with ${samples.length} samples`);

    return {
        landmarks: baselineLandmarks,
        capturedAt: new Date(),
        imageQuality
    };
}

/**
 * Capture voice baseline over 10 seconds
 * Records neutral speech and extracts prosodic features
 * 
 * @param recordAudio Function to record audio
 * @param onProgress Callback for progress updates
 * @returns Baseline voice data
 */
export async function calibrateVoiceBaseline(
    recordAudio: (duration: number) => Promise<Blob>,
    onProgress?: (status: CalibrationStatus) => void
): Promise<BaselineData['voiceNeutral']> {
    const DURATION = 10; // seconds

    console.log('Starting voice baseline calibration...');

    if (onProgress) {
        onProgress({
            stage: 'voice',
            progress: 0,
            message: 'Recording neutral speech...',
            samplesCollected: 0,
            samplesRequired: 1
        });
    }

    // Record audio
    const audioBlob = await recordAudio(DURATION);

    if (onProgress) {
        onProgress({
            stage: 'voice',
            progress: 50,
            message: 'Analyzing audio features...',
            samplesCollected: 1,
            samplesRequired: 1
        });
    }

    // Extract prosodic features
    const features = await extractAudioFeatures(audioBlob);

    if (onProgress) {
        onProgress({
            stage: 'voice',
            progress: 100,
            message: 'Voice baseline complete!',
            samplesCollected: 1,
            samplesRequired: 1
        });
    }

    console.log('✅ Voice baseline calibrated');

    return {
        meanPitch: features.meanPitch,
        pitchRange: [features.minPitch, features.maxPitch],
        meanEnergy: features.meanEnergy,
        spectralCentroid: features.spectralCentroid,
        capturedAt: new Date(),
        sampleDuration: DURATION
    };
}

/**
 * Compute median of facial landmarks across samples
 * More robust to outliers than mean
 */
function computeMedianLandmarks(samples: number[][]): number[] {
    if (samples.length === 0) return [];

    const numLandmarks = samples[0].length;
    const medianLandmarks: number[] = [];

    for (let i = 0; i < numLandmarks; i++) {
        const values = samples.map(sample => sample[i]).sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);

        // Median calculation
        const median = values.length % 2 === 0
            ? (values[mid - 1] + values[mid]) / 2
            : values[mid];

        medianLandmarks.push(median);
    }

    return medianLandmarks;
}

/**
 * Assess image quality based on landmark variance
 * Higher variance = worse quality (movement, lighting changes)
 */
function assessImageQuality(samples: number[][]): number {
    if (samples.length === 0) return 0;

    const numLandmarks = samples[0].length;
    let totalVariance = 0;

    for (let i = 0; i < numLandmarks; i++) {
        const values = samples.map(sample => sample[i]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        totalVariance += variance;
    }

    // Normalize and invert (lower variance = higher quality)
    const avgVariance = totalVariance / numLandmarks;
    const quality = Math.max(0, Math.min(1, 1 - avgVariance / 100));

    return quality;
}

/**
 * Extract prosodic features from audio blob
 * Uses Web Audio API for feature extraction
 */
async function extractAudioFeatures(audioBlob: Blob): Promise<{
    meanPitch: number;
    minPitch: number;
    maxPitch: number;
    meanEnergy: number;
    spectralCentroid: number;
}> {
    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Decode audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get audio samples
    const samples = audioBuffer.getChannelData(0);

    // Compute energy (RMS)
    const energy = Math.sqrt(
        samples.reduce((sum, val) => sum + val * val, 0) / samples.length
    );

    // Estimate pitch using autocorrelation
    const pitch = estimatePitch(samples, audioBuffer.sampleRate);

    // Compute spectral centroid (simplified)
    const spectralCentroid = computeSpectralCentroid(samples, audioBuffer.sampleRate);

    await audioContext.close();

    return {
        meanPitch: pitch.mean,
        minPitch: pitch.min,
        maxPitch: pitch.max,
        meanEnergy: energy,
        spectralCentroid
    };
}

/**
 * Estimate pitch using autocorrelation method
 */
function estimatePitch(samples: Float32Array, sampleRate: number): {
    mean: number;
    min: number;
    max: number;
} {
    // Simplified pitch estimation
    // For production, use a library like Pitchy or implement YIN algorithm

    // Placeholder: return typical speech range
    return {
        mean: 150,  // Hz (typical for mixed gender)
        min: 85,    // Hz
        max: 255    // Hz
    };
}

/**
 * Compute spectral centroid (brightness of sound)
 */
function computeSpectralCentroid(samples: Float32Array, sampleRate: number): number {
    // Simplified spectral centroid
    // For production, use FFT-based analysis

    // Placeholder
    return 2000; // Hz
}

/**
 * Save baseline to localStorage (temporary, before database)
 */
export function saveBaselineToStorage(userId: string, baseline: BaselineData): void {
    const key = `smartcare_baseline_${userId}`;
    localStorage.setItem(key, JSON.stringify(baseline));
    console.log('✅ Baseline saved to localStorage');
}

/**
 * Load baseline from localStorage
 */
export function loadBaselineFromStorage(userId: string): BaselineData | null {
    const key = `smartcare_baseline_${userId}`;
    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to parse baseline data:', error);
        return null;
    }
}

/**
 * Check if baseline needs recalibration (expired or low quality)
 */
export function needsRecalibration(baseline: BaselineData): boolean {
    const MAX_AGE_DAYS = 30; // Recalibrate every 30 days

    // Check age
    const ageInDays = (Date.now() - baseline.calibratedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > MAX_AGE_DAYS) {
        console.log('Baseline expired, recalibration needed');
        return true;
    }

    // Check quality
    if (baseline.facialNeutral && baseline.facialNeutral.imageQuality < 0.5) {
        console.log('Baseline quality too low, recalibration needed');
        return true;
    }

    return false;
}
