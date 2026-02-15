/**
 * TensorFlow.js Face Emotion Recognition Model Manager
 * 
 * This module handles loading and inference for face emotion recognition using TensorFlow.js.
 * Models supported:
 * - FER2013 (7 emotions: angry, disgust, fear, happy, neutral, sad, surprise)
 * - Custom lightweight models for on-device inference
 */

import * as tf from '@tensorflow/tfjs';
import { EmotionScore, EmotionType } from '../types';

// Model configuration
const FER_MODEL_URL = '/models/fer/model.json'; // Local model path
const FER_INPUT_SIZE = 48; // FER2013 standard size: 48x48 grayscale

// Emotion label mapping (FER2013 standard)
const FER_EMOTION_LABELS: EmotionType[] = [
    'angry',
    'disgusted',
    'fearful',
    'happy',
    'neutral',
    'sad',
    'surprised'
];

// Singleton model instance
let ferModel: tf.LayersModel | null = null;
let modelLoadingPromise: Promise<tf.LayersModel> | null = null;

/**
 * Load the FER model (singleton pattern)
 */
export async function loadFERModel(): Promise<tf.LayersModel> {
    // Return cached model if already loaded
    if (ferModel) {
        return ferModel;
    }

    // Wait for existing load if in progress
    if (modelLoadingPromise) {
        return modelLoadingPromise;
    }

    // Start loading
    modelLoadingPromise = (async () => {
        try {
            console.log('Loading FER model...');

            // Try loading local model first
            try {
                ferModel = await tf.loadLayersModel(FER_MODEL_URL);
                console.log('✅ FER model loaded successfully (local)');
            } catch (localError) {
                console.warn('Local model not found, using fallback...');

                // TODO: Load from HuggingFace or TensorFlow Hub
                // For now, we'll create a placeholder that uses simulation
                throw new Error('FER model not available. Please add model to /public/models/fer/');
            }

            return ferModel!;
        } catch (error) {
            console.error('Failed to load FER model:', error);
            modelLoadingPromise = null;
            throw error;
        }
    })();

    return modelLoadingPromise;
}

/**
 * Preprocess image for FER model
 * Converts image to 48x48 grayscale tensor normalized to [0, 1]
 * 
 * @param imageData Base64 encoded image data
 * @returns Preprocessed tensor ready for inference
 */
export async function preprocessImageForFER(imageData: string): Promise<tf.Tensor4D> {
    return tf.tidy(() => {
        // Decode base64 image
        const img = new Image();
        img.src = imageData;

        // Convert to tensor
        let tensor = tf.browser.fromPixels(img);

        // Convert to grayscale if RGB (FER models expect grayscale)
        if (tensor.shape[2] === 3) {
            tensor = tf.image.rgbToGrayscale(tensor);
        }

        // Resize to 48x48
        tensor = tf.image.resizeBilinear(tensor, [FER_INPUT_SIZE, FER_INPUT_SIZE]);

        // Normalize to [0, 1]
        tensor = tensor.div(255.0);

        // Expand dimensions to match model input: [1, 48, 48, 1]
        const batched = tensor.expandDims(0) as tf.Tensor4D;

        return batched;
    });
}

/**
 * Run FER inference on preprocessed image
 * 
 * @param model FER model
 * @param tensor Preprocessed image tensor
 * @returns Emotion scores with confidence from softmax
 */
async function runFERInference(model: tf.LayersModel, tensor: tf.Tensor4D): Promise<EmotionScore[]> {
    const startTime = performance.now();

    // Run inference
    const predictions = model.predict(tensor) as tf.Tensor;

    // Get softmax probabilities
    const probabilities = await predictions.data();

    // Clean up tensors
    predictions.dispose();

    const inferenceTime = performance.now() - startTime;
    console.log(`FER inference completed in ${inferenceTime.toFixed(2)}ms`);

    // Map to EmotionScore format
    const emotionScores: EmotionScore[] = FER_EMOTION_LABELS.map((emotion, idx) => ({
        emotion,
        confidence: probabilities[idx]
    })).sort((a, b) => b.confidence - a.confidence);

    return emotionScores;
}

/**
 * Detect face emotions using TensorFlow.js FER model
 * 
 * @param imageData Base64 encoded image from webcam
 * @returns Emotion scores sorted by confidence
 */
export async function detectFaceEmotionTFJS(imageData: string): Promise<EmotionScore[]> {
    try {
        // Load model (cached after first load)
        const model = await loadFERModel();

        // Preprocess image
        const tensor = await preprocessImageForFER(imageData);

        // Run inference
        const emotions = await runFERInference(model, tensor);

        // Clean up tensor
        tensor.dispose();

        return emotions;

    } catch (error) {
        console.error('FER inference failed:', error);
        throw error;
    }
}

/**
 * Check if FER model is available
 */
export function isFERModelAvailable(): boolean {
    return ferModel !== null;
}

/**
 * Unload model to free memory
 */
export function unloadFERModel(): void {
    if (ferModel) {
        ferModel.dispose();
        ferModel = null;
        modelLoadingPromise = null;
        console.log('FER model unloaded');
    }
}

/**
 * Get model information
 */
export function getFERModelInfo(): {
    loaded: boolean;
    inputSize: number;
    emotions: EmotionType[];
} {
    return {
        loaded: ferModel !== null,
        inputSize: FER_INPUT_SIZE,
        emotions: FER_EMOTION_LABELS
    };
}
