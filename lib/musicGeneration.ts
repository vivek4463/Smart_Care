import * as Tone from 'tone';
import { EmotionScore, MusicConfig, GeneratedMusic } from './types';

// Chord progression definitions for professional sound
type ChordProgression = {
    chords: string[][];
    emotionalTone: string;
};

const CHORD_PROGRESSIONS: Record<string, ChordProgression> = {
    uplifting: {
        chords: [
            ['C4', 'E4', 'G4'], // I (C major)
            ['F4', 'A4', 'C5'], // IV (F major)
            ['G4', 'B4', 'D5'], // V (G major)
            ['C4', 'E4', 'G4'], // I (C major)
        ],
        emotionalTone: 'hopeful and positive'
    },
    calming: {
        chords: [
            ['C4', 'E4', 'G4'], // I
            ['A3', 'C4', 'E4'], // vi
            ['F4', 'A4', 'C5'], // IV
            ['C4', 'E4', 'G4'], // I
        ],
        emotionalTone: 'peaceful and soothing'
    },
    contemplative: {
        chords: [
            ['A3', 'C4', 'E4'], // Am (i)
            ['D4', 'F4', 'A4'], // Dm (iv)
            ['E4', 'G4', 'B4'], // Em (v)
            ['A3', 'C4', 'E4'], // Am (i)
        ],
        emotionalTone: 'introspective'
    },
    energizing: {
        chords: [
            ['C4', 'E4', 'G4'], // I
            ['G4', 'B4', 'D5'], // V
            ['A3', 'C4', 'E4'], // vi
            ['F4', 'A4', 'C5'], // IV
        ],
        emotionalTone: 'motivating'
    },
};

// Map emotions to therapeutic musical parameters
function emotionToMusicConfig(emotion: EmotionScore, heartRate?: number): MusicConfig {
    const configs: Record<string, Partial<MusicConfig>> = {
        sad: {
            tempo: 75,
            key: 'C',
            mode: 'major' as const,
            instruments: ['piano', 'harp', 'flute', 'pad'],
            intensity: 0.45,
        },
        angry: {
            tempo: 85,
            key: 'G',
            mode: 'major' as const,
            instruments: ['piano', 'flute', 'bell', 'pad'],
            intensity: 0.5,
        },
        fearful: {
            tempo: 70,
            key: 'C',
            mode: 'major' as const,
            instruments: ['piano', 'harp', 'bell', 'pad'],
            intensity: 0.4,
        },
        neutral: {
            tempo: 95,
            key: 'G',
            mode: 'major' as const,
            instruments: ['piano', 'guitar', 'bell', 'strings'],
            intensity: 0.55,
        },
        happy: {
            tempo: 105,
            key: 'C',
            mode: 'major' as const,
            instruments: ['piano', 'guitar', 'harp', 'strings'],
            intensity: 0.65,
        },
        surprised: {
            tempo: 90,
            key: 'G',
            mode: 'major' as const,
            instruments: ['piano', 'bell', 'harp', 'strings'],
            intensity: 0.5,
        },
        disgusted: {
            tempo: 80,
            key: 'C',
            mode: 'major' as const,
            instruments: ['flute', 'harp', 'bell', 'pad'],
            intensity: 0.45,
        },
    };

    const baseConfig = configs[emotion.emotion] || configs.neutral;
    let adjustedTempo = baseConfig.tempo || 90;

    if (heartRate) {
        if (heartRate > 90) {
            adjustedTempo = Math.max(60, adjustedTempo - 10);
        } else if (heartRate < 60) {
            adjustedTempo = Math.min(110, adjustedTempo + 5);
        }
    }

    return {
        tempo: adjustedTempo,
        key: baseConfig.key || 'C',
        mode: baseConfig.mode || 'major',
        duration: 150,
        instruments: baseConfig.instruments || ['piano', 'harp'],
        intensity: baseConfig.intensity || 0.5,
    };
}

export async function generateMusic(emotions: EmotionScore[], heartRate?: number): Promise<GeneratedMusic> {
    const primaryEmotion = emotions[0];
    const config = emotionToMusicConfig(primaryEmotion, heartRate);

    return {
        id: `music_${Date.now()}`,
        config,
        baseEmotions: emotions,
        duration: config.duration,
        createdAt: new Date(),
    };
}

type InstrumentType = 'piano' | 'guitar' | 'drums' | 'tabla' | 'violin' | 'flute' |
    'trumpet' | 'accordion' | 'harp' | 'bell' | 'tuba' | 'keyboard' | 'synth' |
    'pad' | 'strings' | 'bass';

function createInstrumentSynth(instrument: InstrumentType, config: MusicConfig): any {
    let synth: any;

    switch (instrument) {
        case 'piano':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.005,
                    decay: 0.4,
                    sustain: 0.15,
                    release: 1.5,
                },
            });
            break;

        case 'harp':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: {
                    attack: 0.001,
                    decay: 1.2,
                    sustain: 0,
                    release: 2.0,
                },
            });
            break;

        case 'flute':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.06,
                    decay: 0.1,
                    sustain: 0.65,
                    release: 0.9,
                },
            });
            break;

        case 'guitar':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: {
                    attack: 0.01,
                    decay: 0.5,
                    sustain: 0.25,
                    release: 1.8,
                },
            });
            break;

        case 'bell':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.001,
                    decay: 1.8,
                    sustain: 0,
                    release: 2.5,
                },
            });
            break;

        case 'pad':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sawtooth' },
                envelope: {
                    attack: 0.5,
                    decay: 0.3,
                    sustain: 0.8,
                    release: 2.5,
                },
            });
            break;

        case 'strings':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sawtooth' },
                envelope: {
                    attack: 0.4,
                    decay: 0.2,
                    sustain: 0.85,
                    release: 1.5,
                },
            });
            break;

        case 'bass':
            synth = new Tone.MonoSynth({
                oscillator: { type: 'square' },
                envelope: {
                    attack: 0.01,
                    decay: 0.3,
                    sustain: 0.1,
                    release: 0.6,
                },
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0.2,
                    sustain: 0.3,
                    release: 0.5,
                },
            });
            break;

        default:
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.1,
                    decay: 0.2,
                    sustain: 0.5,
                    release: 1,
                },
            });
    }

    // Add reverb for depth
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 });
    const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.2, wet: 0.15 });

    synth.chain(reverb, delay, Tone.Destination);
    synth.volume.value = -12 + (config.intensity * 10);

    return synth;
}

function selectChordProgression(emotion: string): ChordProgression {
    const emotionMap: Record<string, keyof typeof CHORD_PROGRESSIONS> = {
        happy: 'uplifting',
        sad: 'calming',
        neutral: 'contemplative',
        angry: 'calming',
        fearful: 'calming',
        surprised: 'energizing',
        disgusted: 'calming',
    };

    const progressionKey = emotionMap[emotion] || 'calming';
    return CHORD_PROGRESSIONS[progressionKey];
}

export function createSynth(config: MusicConfig, seed?: number): any {
    const instruments = config.instruments || ['piano'];
    const primaryInstrument = instruments[0] as InstrumentType;

    console.log(`🎵 Generating professional music with: ${instruments.join(', ').toUpperCase()}`);

    return {
        synth: createInstrumentSynth(primaryInstrument, config),
        harmonySynth: instruments.length > 1 ? createInstrumentSynth(instruments[1] as InstrumentType, config) : null,
        bassSynth: createInstrumentSynth('bass', config),
        instrumentName: primaryInstrument
    };
}

// Enhanced melody generation with professional patterns
export function generateMelody(config: MusicConfig, emotion: string): {
    melody: { notes: string[], durations: string[] },
    chords: { notes: string[][], durations: string[] },
    bass: { notes: string[], durations: string[] }
} {
    const scales: Record<string, string[]> = {
        C: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
        G: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5'],
        Am: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    };

    const scale = scales[config.key] || scales.C;
    const chordProg = selectChordProgression(emotion);

    // MELODY GENERATION
    const melodyPatterns = [
        [0, 2, 4, 5, 4, 2, 0, -1],
        [0, 4, 7, 4, 2, 5, 4, 0],
        [4, 5, 7, 5, 4, 2, 4, 2],
        [0, 2, 4, 7, 5, 4, 2, 0],
        [7, 5, 4, 2, 0, 2, 4, 5],
        [0, 3, 5, 7, 5, 3, 2, 0],
    ];

    const rhythmPatterns = [
        ['4n', '4n', '2n', '4n', '4n', '2n'],
        ['8n', '8n', '4n', '8n', '8n', '4n', '4n', '2n'],
        ['4n', '8n', '8n', '2n', '4n', '4n', '2n'],
        ['2n', '4n', '4n', '4n', '4n', '2n'],
    ];

    const patternIndex = Math.floor(Math.random() * melodyPatterns.length);
    const rhythmIndex = Math.floor(Math.random() * rhythmPatterns.length);

    const melodyNotes: string[] = [];
    const melodyDurations: string[] = [];

    // Generate 16-bar melody
    for (let bar = 0; bar < 16; bar++) {
        const pattern = melodyPatterns[patternIndex];
        const rhythm = rhythmPatterns[rhythmIndex];

        pattern.forEach((scaleIndex, i) => {
            const octaveVariation = (bar % 4 === 3 && Math.random() > 0.6) ? 7 : 0;
            const noteIndex = Math.max(0, Math.min(scale.length - 1, scaleIndex + octaveVariation));
            melodyNotes.push(scale[noteIndex]);
            melodyDurations.push(rhythm[i % rhythm.length]);
        });
    }

    // CHORD GENERATION
    const chordNotes: string[][] = [];
    const chordDurations: string[] = [];

    for (let i = 0; i < 16; i++) {
        chordNotes.push(chordProg.chords[i % chordProg.chords.length]);
        chordDurations.push('1n');
    }

    // BASS LINE GENERATION
    const bassNotes: string[] = [];
    const bassDurations: string[] = [];

    chordNotes.forEach(chord => {
        bassNotes.push(chord[0]);
        bassDurations.push('2n');
        bassNotes.push(chord[0]);
        bassDurations.push('2n');
    });

    return {
        melody: { notes: melodyNotes, durations: melodyDurations },
        chords: { notes: chordNotes, durations: chordDurations },
        bass: { notes: bassNotes, durations: bassDurations },
    };
}

// Enhanced playMusic with full arrangement
export async function playMusic(music: GeneratedMusic, onProgress?: (progress: number) => void): Promise<void> {
    await Tone.start();

    const { synth, harmonySynth, bassSynth } = createSynth(music.config);
    const emotionName = music.baseEmotions[0]?.emotion || 'neutral';
    const { melody, chords, bass } = generateMelody(music.config, emotionName);

    Tone.Transport.bpm.value = music.config.tempo;

    // MELODY LOOP
    let melodyIndex = 0;
    const melodyLoop = new Tone.Loop((time) => {
        const note = melody.notes[melodyIndex % melody.notes.length];
        const duration = melody.durations[melodyIndex % melody.durations.length];
        synth.triggerAttackRelease(note, duration, time);
        melodyIndex++;

        if (onProgress) {
            const progress = (melodyIndex / melody.notes.length) * 100;
            onProgress(Math.min(progress, 100));
        }
    }, '4n');

    // CHORD LOOP (harmony)
    let chordIndex = 0;
    const chordLoop = new Tone.Loop((time) => {
        const chordNotes = chords.notes[chordIndex % chords.notes.length];
        const duration = chords.durations[chordIndex % chords.durations.length];

        if (harmonySynth) {
            chordNotes.forEach(note => {
                harmonySynth.triggerAttackRelease(note, duration, time);
            });
        }
        chordIndex++;
    }, '1m');

    // BASS LOOP
    let bassIndex = 0;
    const bassLoop = new Tone.Loop((time) => {
        const note = bass.notes[bassIndex % bass.notes.length];
        const duration = bass.durations[bassIndex % bass.durations.length];
        bassSynth.triggerAttackRelease(note, duration, time);
        bassIndex++;
    }, '2n');

    melodyLoop.start(0);
    chordLoop.start(0);
    bassLoop.start(0);
    Tone.Transport.start();

    await new Promise((resolve) => {
        setTimeout(() => {
            melodyLoop.stop();
            chordLoop.stop();
            bassLoop.stop();
            Tone.Transport.stop();
            synth.dispose();
            if (harmonySynth) harmonySynth.dispose();
            bassSynth.dispose();
            resolve(true);
        }, music.duration * 1000);
    });
}

export function stopMusic() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
}

export function getMusicDescription(config: MusicConfig): string {
    const tempoDesc =
        config.tempo < 80
            ? 'slow and deeply calming'
            : config.tempo < 100
                ? 'gentle and soothing'
                : 'uplifting and energizing';

    const moodDesc = config.mode === 'major' ? 'positive and hopeful' : 'contemplative';
    const therapeuticIntent = config.tempo < 90 ? 'designed to promote relaxation and inner peace' : 'crafted to gently elevate your mood';

    return `A ${tempoDesc}, ${moodDesc} composition in ${config.key} ${config.mode}, ${therapeuticIntent}. Features rich harmonies, melodic development, and professional orchestration.`;
}
