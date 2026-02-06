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


// Define instrument types
type InstrumentType = 'piano' | 'guitar' | 'drums' | 'tabla' | 'violin' | 'flute' |
    'trumpet' | 'accordion' | 'harp' | 'bell' | 'tuba' | 'keyboard' | 'synth';

// Create instrument-specific synth configurations
function createInstrumentSynth(instrument: InstrumentType, config: MusicConfig): Tone.PolySynth | Tone.Synth | Tone.MembraneSynth {
    let synth: any;

    switch (instrument) {
        case 'piano':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.005,
                    decay: 0.3,
                    sustain: 0.1,
                    release: 1.2,
                },
            }).toDestination();
            break;

        case 'guitar':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: {
                    attack: 0.01,
                    decay: 0.4,
                    sustain: 0.3,
                    release: 1.5,
                },
            }).toDestination();
            break;

        case 'drums':
            synth = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 6,
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.001,
                    decay: 0.4,
                    sustain: 0.01,
                    release: 1.4,
                },
            }).toDestination();
            break;

        case 'tabla':
            synth = new Tone.MembraneSynth({
                pitchDecay: 0.02,
                octaves: 8,
                oscillator: { type: 'triangle' },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0.01,
                    release: 0.8,
                },
            }).toDestination();
            break;

        case 'violin':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sawtooth' },
                envelope: {
                    attack: 0.3,
                    decay: 0.1,
                    sustain: 0.9,
                    release: 1.0,
                },
            }).toDestination();
            break;

        case 'flute':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine3' },
                envelope: {
                    attack: 0.05,
                    decay: 0.1,
                    sustain: 0.6,
                    release: 0.8,
                },
            }).toDestination();
            break;

        case 'trumpet':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'square' },
                envelope: {
                    attack: 0.05,
                    decay: 0.2,
                    sustain: 0.7,
                    release: 0.6,
                },
            }).toDestination();
            break;

        case 'accordion':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'square4' },
                envelope: {
                    attack: 0.1,
                    decay: 0.3,
                    sustain: 0.8,
                    release: 1.0,
                },
            }).toDestination();
            break;

        case 'harp':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle3' },
                envelope: {
                    attack: 0.001,
                    decay: 1.0,
                    sustain: 0.0,
                    release: 1.5,
                },
            }).toDestination();
            break;

        case 'bell':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine6' },
                envelope: {
                    attack: 0.001,
                    decay: 1.5,
                    sustain: 0.0,
                    release: 2.0,
                },
            }).toDestination();
            break;

        case 'tuba':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sawtooth4' },
                envelope: {
                    attack: 0.1,
                    decay: 0.3,
                    sustain: 0.6,
                    release: 1.2,
                },
            }).toDestination();
            break;

        case 'keyboard':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'square2' },
                envelope: {
                    attack: 0.01,
                    decay: 0.4,
                    sustain: 0.3,
                    release: 1.0,
                },
            }).toDestination();
            break;

        case 'synth':
        default:
            synth = new Tone.PolySynth(Tone.Synth, {
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
            break;
    }

    // Set volume based on intensity
    synth.volume.value = -10 + (config.intensity * 15);

    return synth;
}

// Select random instrument based on emotion and seed
function selectInstrument(config: MusicConfig, seed: number): InstrumentType {
    const instruments: Record<string, InstrumentType[]> = {
        happy: ['piano', 'guitar', 'harp', 'bell', 'flute', 'accordion'],
        sad: ['piano', 'violin', 'flute', 'harp', 'accordion'],
        neutral: ['piano', 'keyboard', 'synth', 'flute'],
        angry: ['drums', 'guitar', 'trumpet', 'keyboard'],
        fearful: ['violin', 'piano', 'synth', 'bell'],
        surprised: ['bell', 'harp', 'trumpet', 'piano'],
        disgusted: ['tuba', 'drums', 'keyboard'],
    };

    // Get instruments suitable for this emotion
    const emotionInstruments = instruments[config.key] || instruments.neutral;

    // Add tabla for variation (10% chance)
    if (Math.random() > 0.9) {
        emotionInstruments.push('tabla');
    }

    // Select based on seed for consistency within one generation but variety across generations
    const index = Math.floor(seed * emotionInstruments.length) % emotionInstruments.length;
    return emotionInstruments[index];
}

// Create a Tone.js synth based on music configuration with varied instruments
export function createSynth(config: MusicConfig, seed?: number): any {
    const generationSeed = seed || (Date.now() + Math.random());
    const instrument = selectInstrument(config, generationSeed);

    console.log(`🎵 Generating music with instrument: ${instrument.toUpperCase()}`);

    return {
        synth: createInstrumentSynth(instrument, config),
        instrumentName: instrument
    };
}


// Generate a melodic sequence with high variety
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

    // Create unique seed for this generation
    const seed = Date.now() + Math.random();

    // Multiple melodic patterns for variety
    const melodyPatterns = [
        [0, 2, 4, 2, 0, 2, 4, 7],        // Ascending pattern
        [0, 4, 7, 4, 0, 2, 4, 0],        // Arpeggio pattern
        [4, 2, 0, 2, 4, 7, 4, 0],        // Wave pattern
        [0, 2, 1, 3, 2, 4, 3, 5],        // Stepwise motion
        [7, 4, 2, 0, 2, 4, 7, 5],        // Descending pattern
        [0, 3, 5, 3, 0, 4, 7, 4],        // Chord tones
        [2, 4, 6, 4, 2, 5, 7, 5],        // Higher register
        [0, 1, 2, 3, 4, 5, 6, 7],        // Scale climb
        [7, 6, 5, 4, 3, 2, 1, 0],        // Scale descend
        [0, 4, 0, 5, 0, 7, 0, 4],        // Interval jumps
        [2, 2, 4, 4, 5, 5, 4, 2],        // Repetitive motif
        [0, 7, 2, 5, 4, 7, 2, 0],        // Wide intervals
    ];

    // Rhythm patterns for variation
    const rhythmPatterns = [
        ['4n', '4n', '4n', '4n', '4n', '4n', '4n', '4n'],           // All quarter notes
        ['8n', '8n', '4n', '8n', '8n', '4n', '4n', '4n'],           // Mixed rhythm
        ['4n', '8n', '8n', '4n', '4n', '8n', '8n', '4n'],           // Syncopated
        ['4n', '4n', '2n', '4n', '4n', '2n'],                       // Longer notes
        ['8n', '8n', '8n', '8n', '4n', '4n', '4n', '4n'],           // Fast start
        ['4n', '4n', '4n', '8n', '8n', '8n', '8n', '4n'],           // Accelerating
    ];

    // Select random pattern based on seed
    const patternIndex = Math.floor((seed * 7) % melodyPatterns.length);
    const rhythmIndex = Math.floor((seed * 13) % rhythmPatterns.length);

    let basePattern = melodyPatterns[patternIndex];
    let baseRhythm = rhythmPatterns[rhythmIndex];

    // Add variation to the pattern by randomizing some notes
    const variedPattern = basePattern.map((note, i) => {
        // 30% chance to modify the note
        if (Math.random() > 0.7) {
            // Move up or down by 1-2 steps
            const variation = Math.floor(Math.random() * 5) - 2;
            return Math.max(0, Math.min(7, note + variation));
        }
        return note;
    });

    // Generate extended pattern by combining and modifying
    const extendedPattern: number[] = [];
    for (let i = 0; i < 4; i++) {
        // Transpose pattern for each iteration
        const transpose = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        variedPattern.forEach(note => {
            const transposed = note + transpose;
            extendedPattern.push(Math.max(0, Math.min(7, transposed)));
        });
    }

    // Add melodic embellishments
    extendedPattern.forEach((index, i) => {
        // Main note
        notes.push(scale[index % scale.length]);

        // Choose rhythm based on intensity and randomization
        let duration: string;
        if (baseRhythm[i % baseRhythm.length]) {
            duration = baseRhythm[i % baseRhythm.length];
        } else if (config.intensity > 0.6) {
            duration = Math.random() > 0.5 ? '8n' : '16n'; // Faster for high intensity
        } else {
            duration = Math.random() > 0.5 ? '4n' : '2n'; // Slower for low intensity
        }
        durations.push(duration);

        // Occasionally add a harmony note (20% chance)
        if (Math.random() > 0.8 && config.intensity > 0.5) {
            const harmonyIndex = (index + 2) % scale.length; // Third above
            notes.push(scale[harmonyIndex]);
            durations.push(duration);
        }
    });

    // Add a unique signature to each melody - random ending phrase
    const endingPhrases = [
        [4, 2, 0],
        [7, 5, 4],
        [5, 4, 0],
        [7, 4, 0],
        [2, 4, 0],
    ];

    const endingIndex = Math.floor(Math.random() * endingPhrases.length);
    endingPhrases[endingIndex].forEach(index => {
        notes.push(scale[index % scale.length]);
        durations.push('2n'); // Longer notes for ending
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
