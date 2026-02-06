import { VoiceQuery, VoiceResponse } from './types';

// Simulate voice assistant query processing
export async function processVoiceQuery(query: VoiceQuery): Promise<VoiceResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerQuery = query.text.toLowerCase();

    // Simple keyword-based responses
    let responseText = '';

    if (lowerQuery.includes('how') && (lowerQuery.includes('work') || lowerQuery.includes('use'))) {
        responseText = 'Smart Care analyzes your emotions through facial expressions, voice, and text. Based on this analysis, we generate personalized therapeutic music to support your emotional well-being.';
    } else if (lowerQuery.includes('emotion') || lowerQuery.includes('detect')) {
        responseText = 'We use multiple modalities for emotion detection: facial recognition through your webcam, voice analysis through your microphone, text sentiment analysis, and optional heart rate monitoring.';
    } else if (lowerQuery.includes('music') || lowerQuery.includes('generate')) {
        responseText = 'Our AI generates personalized therapeutic music based on your detected emotions. The tempo, key, mode, and instruments are all tailored to support your current emotional state.';
    } else if (lowerQuery.includes('privacy') || lowerQuery.includes('data')) {
        responseText = 'Your privacy is our priority. All emotion detection happens locally on your device. We never upload your images, audio, or personal data to our servers.';
    } else if (lowerQuery.includes('feedback') || lowerQuery.includes('improve')) {
        responseText = 'Your feedback helps our system learn and improve. We analyze satisfaction levels and suggestions to continuously enhance the music generation quality and personalization.';
    } else if (lowerQuery.includes('start') || lowerQuery.includes('begin')) {
        responseText = 'To start, simply go to the dashboard and click "Start Emotion Detection". We\'ll guide you through each step of the process.';
    } else if (lowerQuery.includes('help') || lowerQuery.includes('assist')) {
        responseText = 'I\'m here to help! You can ask me about how Smart Care works, emotion detection, music generation, privacy, or anything else you\'d like to know.';
    } else {
        responseText = 'I\'m here to assist you with Smart Care. You can ask about emotion detection, music generation, privacy, or how to get started. How can I help you today?';
    }

    return {
        text: responseText,
        timestamp: new Date(),
    };
}

// Text-to-speech using Web Speech API
export function speak(text: string): void {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find a pleasant voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Google')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        speechSynthesis.speak(utterance);
    }
}

// Speech recognition using Web Speech API
export function startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
): { stop: () => void } | null {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        onError?.('Speech recognition is not supported in your browser');
        return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
    };

    recognition.onerror = (event: any) => {
        onError?.(event.error);
    };

    recognition.start();

    return {
        stop: () => recognition.stop(),
    };
}
