import * as Tone from "tone";

export interface MusicParams {
  bpm: number;
  scale: string;
  instrument: string;
  intensity: number;
}

export const MOOD_MAPPINGS: Record<string, MusicParams> = {
  "Happy": { bpm: 120, scale: "C4 major", instrument: "Synth", intensity: 0.8 },
  "Sad": { bpm: 70, scale: "A3 minor", instrument: "Piano", intensity: 0.3 },
  "Angry": { bpm: 90, scale: "G3 phrygian", instrument: "Pad", intensity: 0.5 },
  "Fear": { bpm: 80, scale: "C3 locrian", instrument: "Strings", intensity: 0.4 },
  "Neutral": { bpm: 95, scale: "F3 lydian", instrument: "Flute", intensity: 0.6 },
  "Calm": { bpm: 60, scale: "C4 pentatonic", instrument: "Harp", intensity: 0.2 },
  "Excited": { bpm: 135, scale: "D4 mixolydian", instrument: "Synth", intensity: 0.9 }
};

class MusicGenerator {
  private synth: Tone.PolySynth | null = null;
  private loop: Tone.Loop | null = null;
  private isPlaying: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
  }

  public async start(mood: string) {
    const params = MOOD_MAPPINGS[mood] || MOOD_MAPPINGS["Neutral"];
    
    await Tone.start();
    Tone.Transport.bpm.value = params.bpm;

    // Clear existing
    if (this.loop) this.loop.dispose();

    this.loop = new Tone.Loop((time) => {
      if (!this.synth) return;
      
      const notes = this.getNotesForScale(params.scale);
      const note = notes[Math.floor(Math.random() * notes.length)];
      
      this.synth.triggerAttackRelease(note, "8n", time);
    }, "4n").start(0);

    Tone.Transport.start();
    this.isPlaying = true;
  }

  public stop() {
    Tone.Transport.stop();
    this.isPlaying = false;
  }

  private getNotesForScale(scale: string): string[] {
    // Simple scale mapping
    if (scale.includes("major")) return ["C4", "E4", "G4", "B4", "C5"];
    if (scale.includes("minor")) return ["A3", "C4", "E4", "G4", "A4"];
    return ["C4", "D4", "E4", "G4", "A4"]; // Default pentatonic
  }
}

export const musicGenerator = new MusicGenerator();
