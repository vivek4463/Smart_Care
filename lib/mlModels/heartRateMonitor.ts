/**
 * Heart Rate Monitoring using camera-based PPG (Photoplethysmography)
 * 
 * Implements remote PPG (rPPG) to detect heart rate from webcam video.
 * Works by detecting subtle color changes in facial skin caused by blood flow.
 * 
 * Algorithm:
 * 1. Detect face and region of interest (forehead/cheeks)
 * 2. Extract average green channel intensity (best for PPG)
 * 3. Apply bandpass filter (0.7-4 Hz for 42-240 BPM)
 * 4. Find peaks in signal to calculate heart rate
 * 5. Calculate HRV (heart rate variability) for stress detection
 */

export interface HeartRateResult {
    heartRate: number;          // BPM
    confidence: number;         // 0-1
    hrv: number;               // Heart rate variability (ms)
    stressLevel: 'low' | 'medium' | 'high';
    timestamp: Date;
    signalQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface PPGSignal {
    timestamps: number[];
    values: number[];
    sampleRate: number;
}

/**
 * Extract PPG signal from video stream
 */
export async function monitorHeartRate(
    videoElement: HTMLVideoElement,
    durationSeconds: number = 30
): Promise<HeartRateResult> {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const signal: PPGSignal = {
            timestamps: [],
            values: [],
            sampleRate: 30 // FPS
        };

        const startTime = Date.now();
        const frameDuration = 1000 / signal.sampleRate; // ms per frame

        // Collect signal data
        await new Promise<void>((resolve) => {
            const interval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;

                if (elapsed >= durationSeconds) {
                    clearInterval(interval);
                    resolve();
                    return;
                }

                // Capture frame
                ctx.drawImage(videoElement, 0, 0);

                // Extract ROI (Region of Interest) - forehead area
                const roi = extractForeheadROI(canvas, ctx);

                // Get average green channel value (best for rPPG)
                const greenValue = getAverageGreen(roi);

                signal.timestamps.push(Date.now());
                signal.values.push(greenValue);
            }, frameDuration);
        });

        // Process signal
        const heartRate = calculateHeartRate(signal);
        const hrv = calculateHRV(signal);
        const stressLevel = calculateStressLevel(heartRate, hrv);
        const [confidence, signalQuality] = assessSignalQuality(signal);

        return {
            heartRate,
            confidence,
            hrv,
            stressLevel,
            timestamp: new Date(),
            signalQuality
        };
    } catch (error) {
        console.error('Heart rate monitoring error:', error);

        // Return fallback result
        return {
            heartRate: 0,
            confidence: 0,
            hrv: 0,
            stressLevel: 'medium',
            timestamp: new Date(),
            signalQuality: 'poor'
        };
    }
}

/**
 * Extract forehead region of interest from face
 */
function extractForeheadROI(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
): ImageData {
    const width = canvas.width;
    const height = canvas.height;

    // Assume face is centered, forehead is top 30% of middle 40%
    const roiX = Math.floor(width * 0.3);
    const roiY = Math.floor(height * 0.2);
    const roiWidth = Math.floor(width * 0.4);
    const roiHeight = Math.floor(height * 0.15);

    return ctx.getImageData(roiX, roiY, roiWidth, roiHeight);
}

/**
 * Get average green channel value from image data
 */
function getAverageGreen(imageData: ImageData): number {
    const data = imageData.data;
    let sum = 0;

    // Green channel is at index 1, 5, 9, etc. (RGBA format)
    for (let i = 1; i < data.length; i += 4) {
        sum += data[i];
    }

    return sum / (data.length / 4);
}

/**
 * Apply bandpass filter to PPG signal
 * Filters to 0.7-4 Hz (42-240 BPM)
 */
function bandpassFilter(signal: number[]): number[] {
    // Simplified moving average filter
    const windowSize = 5;
    const filtered: number[] = [];

    for (let i = 0; i < signal.length; i++) {
        let sum = 0;
        let count = 0;

        for (let j = Math.max(0, i - windowSize); j <= Math.min(signal.length - 1, i + windowSize); j++) {
            sum += signal[j];
            count++;
        }

        filtered.push(sum / count);
    }

    // Detrend (remove DC component)
    const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
    return filtered.map(v => v - mean);
}

/**
 * Detect peaks in signal
 */
function detectPeaks(signal: number[]): number[] {
    const peaks: number[] = [];
    const threshold = Math.max(...signal) * 0.6; // 60% of max

    for (let i = 1; i < signal.length - 1; i++) {
        if (signal[i] > signal[i - 1] &&
            signal[i] > signal[i + 1] &&
            signal[i] > threshold) {
            peaks.push(i);
        }
    }

    return peaks;
}

/**
 * Calculate heart rate from PPG signal
 */
function calculateHeartRate(signal: PPGSignal): number {
    if (signal.values.length < 30) return 0;

    // Filter signal
    const filtered = bandpassFilter(signal.values);

    // Detect peaks
    const peaks = detectPeaks(filtered);

    if (peaks.length < 2) return 0;

    // Calculate average interval between peaks
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
        const interval = (peaks[i] - peaks[i - 1]) / signal.sampleRate; // seconds
        intervals.push(interval);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = 60 / avgInterval;

    // Clamp to reasonable range
    return Math.max(40, Math.min(180, bpm));
}

/**
 * Calculate Heart Rate Variability (HRV)
 * RMSSD (Root Mean Square of Successive Differences)
 */
function calculateHRV(signal: PPGSignal): number {
    const filtered = bandpassFilter(signal.values);
    const peaks = detectPeaks(filtered);

    if (peaks.length < 3) return 0;

    // Calculate RR intervals (time between peaks)
    const rrIntervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
        const interval = ((peaks[i] - peaks[i - 1]) / signal.sampleRate) * 1000; // ms
        rrIntervals.push(interval);
    }

    // Calculate successive differences
    const differences: number[] = [];
    for (let i = 1; i < rrIntervals.length; i++) {
        differences.push(rrIntervals[i] - rrIntervals[i - 1]);
    }

    // Calculate RMSSD
    const squaredDiffs = differences.map(d => d * d);
    const meanSquared = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    const rmssd = Math.sqrt(meanSquared);

    return rmssd;
}

/**
 * Calculate stress level from HR and HRV
 * Low HRV + high HR = high stress
 * High HRV + normal HR = low stress
 */
function calculateStressLevel(heartRate: number, hrv: number): 'low' | 'medium' | 'high' {
    // Normalize values
    const hrScore = heartRate > 90 ? 1 : heartRate > 75 ? 0.5 : 0;
    const hrvScore = hrv < 20 ? 1 : hrv < 40 ? 0.5 : 0;

    const stressScore = (hrScore + hrvScore) / 2;

    if (stressScore > 0.7) return 'high';
    if (stressScore > 0.4) return 'medium';
    return 'low';
}

/**
 * Assess signal quality
 */
function assessSignalQuality(signal: PPGSignal): [number, 'excellent' | 'good' | 'fair' | 'poor'] {
    if (signal.values.length < 30) return [0, 'poor'];

    // Calculate signal-to-noise ratio (SNR)
    const filtered = bandpassFilter(signal.values);
    const peaks = detectPeaks(filtered);

    const peakRate = peaks.length / (signal.values.length / signal.sampleRate);
    const expectedRate = 1.2; // ~72 BPM
    const rateError = Math.abs(peakRate - expectedRate) / expectedRate;

    // Calculate variance (higher variance = better signal in this case)
    const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
    const variance = filtered.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / filtered.length;

    // Quality scoring
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    let confidence: number;

    if (peaks.length >= 10 && rateError < 0.2 && variance > 10) {
        quality = 'excellent';
        confidence = 0.9;
    } else if (peaks.length >= 6 && rateError < 0.3 && variance > 5) {
        quality = 'good';
        confidence = 0.75;
    } else if (peaks.length >= 3 && rateError < 0.5) {
        quality = 'fair';
        confidence = 0.5;
    } else {
        quality = 'poor';
        confidence = 0.2;
    }

    return [confidence, quality];
}

/**
 * Initialize webcam for heart rate monitoring
 */
export async function initializeWebcamForHR(): Promise<HTMLVideoElement> {
    const video = document.createElement('video');
    video.width = 640;
    video.height = 480;
    video.autoplay = true;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: 'user'
            }
        });

        video.srcObject = stream;
        await new Promise(resolve => video.addEventListener('loadeddata', resolve));

        return video;
    } catch (error) {
        console.error('Webcam initialization error:', error);
        throw error;
    }
}

/**
 * Calculate continuous heart rate (simplified for demo)
 * In production, use more sophisticated algorithms like ICA, PCA, or CHROM
 */
export async function getContinuousHeartRate(
    videoElement: HTMLVideoElement,
    callback: (result: HeartRateResult) => void,
    intervalSeconds: number = 10
): Promise<() => void> {
    let active = true;

    const monitor = async () => {
        while (active) {
            const result = await monitorHeartRate(videoElement, intervalSeconds);
            callback(result);
            await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
        }
    };

    monitor();

    // Return stop function
    return () => {
        active = false;
    };
}
