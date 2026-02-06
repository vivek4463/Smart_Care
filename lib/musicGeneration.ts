import * as Tone from 'tone';
import { EmotionScore, MusicConfig, GeneratedMusic } from './types';

// Map emotions to musical parameters
function emotionToMusicConfig(emotion: EmotionScore): MusicConfig {
    const configs: Record<string, Partial<MusicConfig>> = {
        happy: {
            tempo: 120,
            key: 'C',
            mode: 'major' as const,
            instruments: ['synth', 'piano', 'drums'],
            intensity: 0.7,
        },
        sad: {
            tempo: 60,
            key: 'Am',
            mode: 'minor' as const,
            instruments: ['piano', 'strings'],
            intensity: 0.3,
        },
        neutral: {
            tempo: 90,
            key: 'C',
            mode: 'major' as const,
            instruments: ['synth', 'piano'],
            intensity: 0.5,
        },
        angry: {
            tempo: 140,
            key: 'Dm',
            mode: 'minor' as const,
            instruments: ['synth', 'drums', 'bass'],
            intensity: 0.9,
        },
        fearful: {
            tempo: 70,
            key: 'Em',
            mode: 'minor' as const,
            instruments: ['synth', 'strings'],
            intensity: 0.4,
        },
        surprised: {
            tempo: 110,
            key: 'G',
            mode: 'major' as const,
            instruments: ['synth', 'piano', 'drums'],
            intensity: 0.6,
        },
        disgusted: {
            tempo: 80,
            key: 'Fm',
            mode: 'minor' as const,
            instruments: ['synth'],
            intensity: 0.5,
        },
    };

    const baseConfig = configs[emotion.emotion] || configs.neutral;

    return {
        tempo: baseConfig.tempo || 90,
        key: baseConfig.key || 'C',
        mode: baseConfig.mode || 'major',
        duration: 150, // 2.5 minutes
        instruments: baseConfig.instruments || ['synth'],
        intensity: baseConfig.intensity || 0.5,
    };
}

// Generate therapeutic music based on emotion
export async function generateMusic(emotions: EmotionScore[]): Promise<GeneratedMusic> {
    const primaryEmotion = emotions[0];
    const config = emotionToMusicConfig(primaryEmotion);

    // In a production app, this would call an AI music generation API
    // For now, we'll return configuration that can be used to synthesize music

    return {
        id: `music_${Date.now()}`,
        config,
        baseEmotions: emotions,
        duration: config.duration,
        createdAt: new Date(),
    };
}

// Create a Tone.js synth based on music configuration
export function createSynth(config: MusicConfig): Tone.PolySynth {
    const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: config.mode === 'major' ? 'sine' : 'triangle',
        },
        envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 1,
        },
    }).toDestination();

    synth.volume.value = -10 + (config.intensity * 10);

    return synth;
}

// Generate a melodic sequence based on emotion
export function generateMelody(config: MusicConfig): { notes: string[], durations: string[] } {
    const scales: Record<string, string[]> = {
        C: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        Am: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
        Dm: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'],
        Em: ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
        G: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'],
        Fm: ['F4', 'G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5', 'F5'],
    };

    const scale = scales[config.key] || scales.C;
    const notes: string[] = [];
    const durations: string[] = [];

    // Generate a soothing, therapeutic melody pattern
    const patterns = [
        [0, 2, 4, 2, 0, 2, 4, 7],
        [0, 4, 7, 4, 0, 2, 4, 0],
        [4, 2, 0, 2, 4, 7, 4, 0],
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    pattern.forEach((index) => {
        notes.push(scale[index % scale.length]);
        durations.push(config.intensity > 0.6 ? '8n' : '4n');
    });

    return { notes, durations };
}

// Play generated music using Tone.js
export async function playMusic(music: GeneratedMusic, onProgress?: (progress: number) => void): Promise<void> {
    await Tone.start();

    const synth = createSynth(music.config);
    const melody = generateMelody(music.config);

    // Set tempo
    Tone.Transport.bpm.value = music.config.tempo;

    let noteIndex = 0;
    const totalNotes = melody.notes.length;
    const loopDuration = totalNotes; // measures

    const loop = new Tone.Loop((time) => {
        const note = melody.notes[noteIndex % totalNotes];
        const duration = melody.durations[noteIndex % totalNotes];

        synth.triggerAttackRelease(note, duration, time);

        noteIndex++;

        // Report progress
        if (onProgress) {
            const progress = (noteIndex / (music.duration / 2)) * 100; // Rough estimate
            onProgress(Math.min(progress, 100));
        }
    }, '4n');

    loop.start(0);
    Tone.Transport.start();

    // Play for the specified duration
    await new Promise((resolve) => {
        setTimeout(() => {
            loop.stop();
            Tone.Transport.stop();
            synth.dispose();
            resolve(true);
        }, music.duration * 1000);
    });
}

// Stop all audio
export function stopMusic() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
}

// Get a friendly description of the music
export function getMusicDescription(config: MusicConfig): string {
    const tempoDesc =
        config.tempo < 80
            ? 'slow and calming'
            : config.tempo < 110
                ? 'moderate and balanced'
                : 'upbeat and energizing';

    const moodDesc = config.mode === 'major' ? 'uplifting' : 'contemplative';

    return `A ${tempoDesc}, ${moodDesc} composition in ${config.key} ${config.mode}`;
}
