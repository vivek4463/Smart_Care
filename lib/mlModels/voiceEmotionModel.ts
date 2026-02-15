/**
 * Voice Emotion Recognition
 * 
 * Implements speech emotion recognition using prosodic features:
 * - Pitch (F0) - fundamental frequency
 * - Energy/Intensity - loudness
 * - Tempo/Speech Rate - speaking speed
 * - Jitter - pitch variation
 * - Shimmer - amplitude variation
 * - Spectral features - timbre/voice quality
 * 
 * Uses Web Audio API for feature extraction
 */

import { EmotionType } from '../types';

export interface VoiceEmotionResult {
    emotion: EmotionType;
    confidence: number;
    features: ProsodicFeatures;
    timestamp: Date;
}

export interface ProsodicFeatures {
    pitch: number;           // Hz (fundamental frequency)
    energy: number;          // dB (loudness)
    speechRate: number;      // words per minute
    jitter: number;          // pitch variation (0-1)
    shimmer: number;         // amplitude variation (0-1)
    spectralCentroid: number; // Hz (timbre)
    zeroCrossingRate: number; // voice quality indicator
}

/**
 * Extract prosodic features from audio buffer
 */
export async function extractProsodicFeatures(
    audioBuffer: AudioBuffer
): Promise<ProsodicFeatures> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Calculate features
    const pitch = calculatePitch(channelData, sampleRate);
    const energy = calculateEnergy(channelData);
    const zeroCrossingRate = calculateZeroCrossingRate(channelData);
    const spectralCentroid = calculateSpectralCentroid(channelData, sampleRate);

    // Estimate jitter and shimmer (simplified)
    const jitter = calculateJitter(channelData, sampleRate, pitch);
    const shimmer = calculateShimmer(channelData);

    // Estimate speech rate (very rough approximation)
    const speechRate = estimateSpeechRate(channelData, sampleRate);

    return {
        pitch,
        energy,
        speechRate,
        jitter,
        shimmer,
        spectralCentroid,
        zeroCrossingRate
    };
}

/**
 * Calculate pitch using autocorrelation method
 */
function calculatePitch(samples: Float32Array, sampleRate: number): number {
    const minPitch = 80;  // Hz (minimum human voice)
    const maxPitch = 400; // Hz (maximum for typical speech)

    const minPeriod = Math.floor(sampleRate / maxPitch);
    const maxPeriod = Math.floor(sampleRate / minPitch);

    let maxCorrelation = 0;
    let period = minPeriod;

    // Autocorrelation
    for (let lag = minPeriod; lag <= maxPeriod && lag < samples.length / 2; lag++) {
        let correlation = 0;
        for (let i = 0; i < samples.length - lag; i++) {
            correlation += samples[i] * samples[i + lag];
        }

        if (correlation > maxCorrelation) {
            maxCorrelation = correlation;
            period = lag;
        }
    }

    return sampleRate / period;
}

/**
 * Calculate energy (RMS amplitude)
 */
function calculateEnergy(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
        sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / samples.length);

    // Convert to dB
    return 20 * Math.log10(rms + 1e-10);
}

/**
 * Calculate zero crossing rate (voice quality indicator)
 */
function calculateZeroCrossingRate(samples: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < samples.length; i++) {
        if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) {
            crossings++;
        }
    }
    return crossings / samples.length;
}

/**
 * Calculate spectral centroid (timbre)
 */
function calculateSpectralCentroid(samples: Float32Array, sampleRate: number): number {
    // Simplified spectral centroid using energy distribution
    const fftSize = 2048;
    const spectrum = new Array(fftSize / 2).fill(0);

    // Simple magnitude spectrum
    for (let i = 0; i < Math.min(samples.length, fftSize); i++) {
        const binIndex = Math.floor((i / fftSize) * (fftSize / 2));
        spectrum[binIndex] += Math.abs(samples[i]);
    }

    let weightedSum = 0;
    let sum = 0;
    for (let i = 0; i < spectrum.length; i++) {
        const freq = (i * sampleRate) / fftSize;
        weightedSum += freq * spectrum[i];
        sum += spectrum[i];
    }

    return sum > 0 ? weightedSum / sum : 0;
}

/**
 * Calculate jitter (pitch variation)
 */
function calculateJitter(samples: Float32Array, sampleRate: number, avgPitch: number): number {
    // Simplified jitter calculation
    const frameSize = Math.floor(sampleRate / avgPitch);
    const pitches: number[] = [];

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
        const frame = samples.slice(i, i + frameSize);
        const pitch = calculatePitch(frame, sampleRate);
        pitches.push(pitch);
    }

    if (pitches.length < 2) return 0;

    // Calculate variation
    let sum = 0;
    for (let i = 1; i < pitches.length; i++) {
        sum += Math.abs(pitches[i] - pitches[i - 1]);
    }

    return Math.min(sum / (pitches.length - 1) / avgPitch, 1);
}

/**
 * Calculate shimmer (amplitude variation)
 */
function calculateShimmer(samples: Float32Array): number {
    const frameSize = 512;
    const amplitudes: number[] = [];

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
        let sum = 0;
        for (let j = i; j < i + frameSize; j++) {
            sum += Math.abs(samples[j]);
        }
        amplitudes.push(sum / frameSize);
    }

    if (amplitudes.length < 2) return 0;

    let sum = 0;
    for (let i = 1; i < amplitudes.length; i++) {
        sum += Math.abs(amplitudes[i] - amplitudes[i - 1]);
    }

    const avgAmplitude = amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length;
    return avgAmplitude > 0 ? Math.min(sum / (amplitudes.length - 1) / avgAmplitude, 1) : 0;
}

/**
 * Estimate speech rate (words per minute)
 */
function estimateSpeechRate(samples: Float32Array, sampleRate: number): number {
    // Count energy peaks as syllables
    const frameSize = Math.floor(sampleRate * 0.02); // 20ms frames
    const energies: number[] = [];

    for (let i = 0; i < samples.length - frameSize; i += frameSize) {
        const frame = samples.slice(i, i + frameSize);
        energies.push(calculateEnergy(frame));
    }

    // Detect peaks
    const threshold = energies.reduce((a, b) => a + b, 0) / energies.length;
    let peaks = 0;
    for (let i = 1; i < energies.length - 1; i++) {
        if (energies[i] > energies[i - 1] && energies[i] > energies[i + 1] && energies[i] > threshold) {
            peaks++;
        }
    }

    // Rough estimate: 1.5 syllables per word, duration in seconds
    const duration = samples.length / sampleRate;
    const syllablesPerSecond = peaks / duration;
    return (syllablesPerSecond / 1.5) * 60; // words per minute
}

/**
 * Map prosodic features to emotion
 * Based on research on emotional speech characteristics
 */
export function classifyEmotionFromVoice(features: ProsodicFeatures): VoiceEmotionResult {
    const { pitch, energy, speechRate, jitter, shimmer } = features;

    // Emotion scoring based on prosodic patterns
    const scores: Record<EmotionType, number> = {
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        neutral: 0,
        surprised: 0,
        disgusted: 0
    };

    // Happy: High pitch, high energy, fast speech, moderate variation
    scores.happy =
        (pitch > 180 ? 0.3 : 0) +
        (energy > -20 ? 0.3 : 0) +
        (speechRate > 150 ? 0.2 : 0) +
        (jitter > 0.02 && jitter < 0.08 ? 0.2 : 0);

    // Sad: Low pitch, low energy, slow speech, low variation
    scores.sad =
        (pitch < 150 ? 0.3 : 0) +
        (energy < -30 ? 0.3 : 0) +
        (speechRate < 120 ? 0.3 : 0) +
        (jitter < 0.03 ? 0.1 : 0);

    // Angry: High pitch, very high energy, fast speech, high variation
    scores.angry =
        (pitch > 200 ? 0.3 : 0) +
        (energy > -15 ? 0.3 : 0) +
        (speechRate > 160 ? 0.2 : 0) +
        (jitter > 0.08 ? 0.2 : 0);

    // Fear: High pitch, moderate energy, fast speech, high variation
    scores.fearful =
        (pitch > 190 ? 0.3 : 0) +
        (energy > -25 && energy < -15 ? 0.2 : 0) +
        (speechRate > 150 ? 0.2 : 0) +
        (jitter > 0.06 ? 0.3 : 0);

    // Neutral: Moderate everything
    scores.neutral =
        (pitch >= 140 && pitch <= 180 ? 0.3 : 0) +
        (energy >= -30 && energy <= -20 ? 0.3 : 0) +
        (speechRate >= 130 && speechRate <= 150 ? 0.3 : 0) +
        (jitter >= 0.02 && jitter <= 0.05 ? 0.1 : 0);

    // Surprised: Very high pitch, high energy, varied speech
    scores.surprised =
        (pitch > 210 ? 0.4 : 0) +
        (energy > -18 ? 0.3 : 0) +
        (jitter > 0.09 ? 0.3 : 0);

    // Disgusted: Low-moderate pitch, low energy, slow-moderate speech
    scores.disgusted =
        (pitch < 160 ? 0.3 : 0) +
        (energy < -25 ? 0.3 : 0) +
        (speechRate < 140 ? 0.2 : 0) +
        (shimmer > 0.05 ? 0.2 : 0);

    // Find highest scoring emotion
    let maxEmotion: EmotionType = 'neutral';
    let maxScore = scores.neutral;

    for (const [emotion, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            maxEmotion = emotion as EmotionType;
        }
    }

    // Normalize confidence to 0-1
    const confidence = Math.min(maxScore, 1.0);

    return {
        emotion: maxEmotion,
        confidence,
        features,
        timestamp: new Date()
    };
}

/**
 * Record and analyze voice emotion from microphone
 */
export async function recordAndAnalyzeVoice(durationMs: number = 5000): Promise<VoiceEmotionResult> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);

        // Create recorder
        const recorder = audioContext.createScriptProcessor(4096, 1, 1);
        const chunks: Float32Array[] = [];

        recorder.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            chunks.push(new Float32Array(inputData));
        };

        source.connect(recorder);
        recorder.connect(audioContext.destination);

        // Record for specified duration
        await new Promise(resolve => setTimeout(resolve, durationMs));

        // Stop recording
        recorder.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());

        // Combine chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combinedData = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            combinedData.set(chunk, offset);
            offset += chunk.length;
        }

        // Create audio buffer
        const audioBuffer = audioContext.createBuffer(1, combinedData.length, audioContext.sampleRate);
        audioBuffer.copyToChannel(combinedData, 0);

        // Extract features and classify
        const features = await extractProsodicFeatures(audioBuffer);
        const result = classifyEmotionFromVoice(features);

        await audioContext.close();

        return result;
    } catch (error) {
        console.error('Voice recording error:', error);

        // Return fallback neutral result
        return {
            emotion: 'neutral',
            confidence: 0,
            features: {
                pitch: 0,
                energy: 0,
                speechRate: 0,
                jitter: 0,
                shimmer: 0,
                spectralCentroid: 0,
                zeroCrossingRate: 0
            },
            timestamp: new Date()
        };
    }
}
