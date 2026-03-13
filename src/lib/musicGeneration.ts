import * as Tone from "tone";

export interface MusicParams {
  bpm: number;
  scale: string;
  instrument: string;
  intensity: number;
}

export const MOOD_MAPPINGS: Record<string, MusicParams> = {
  "Euphoria": { bpm: 120, scale: "C4 major", instrument: "Synth", intensity: 0.8 },
  "Melancholy": { bpm: 70, scale: "A3 minor", instrument: "Piano", intensity: 0.3 },
  "Hostility": { bpm: 90, scale: "G3 phrygian", instrument: "Pad", intensity: 0.5 },
  "Apprehension": { bpm: 80, scale: "C3 locrian", instrument: "Strings", intensity: 0.4 },
  "Equilibrium": { bpm: 95, scale: "F3 lydian", instrument: "Flute", intensity: 0.6 },
  "Astonishment": { bpm: 110, scale: "D4 mixolydian", instrument: "Bells", intensity: 0.7 },
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
  private vol: Tone.Volume | null = null;
  private loop: Tone.Loop | null = null;
  private isPlaying: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.vol = new Tone.Volume(-12).toDestination();
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 }
      }).connect(this.vol);
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
      const density = params.intensity > 0.6 ? 2 : 1;
      
      for(let i = 0; i < density; i++) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        const velocity = 0.3 + (Math.random() * 0.4);
        this.synth.triggerAttackRelease(note, "4n", time + (i * 0.2), velocity);
      }
    }, "2n").start(0);

    Tone.Transport.start();
    this.isPlaying = true;
  }

  public setVolume(val: number) {
    if (this.vol) {
      this.vol.volume.value = Tone.gainToDb(val);
    }
  }

  public stop() {
    Tone.Transport.stop();
    this.isPlaying = false;
  }

  private getNotesForScale(scale: string): string[] {
    if (scale.includes("major")) return ["C4", "E4", "G4", "B4", "C5", "D5", "G5"];
    if (scale.includes("minor")) return ["A3", "C4", "E4", "G4", "A4", "B4", "D4"];
    if (scale.includes("phrygian")) return ["G3", "Ab3", "C4", "D4", "Eb4", "G4"];
    if (scale.includes("lydian")) return ["F3", "G3", "A3", "B3", "C4", "E4"];
    if (scale.includes("pentatonic")) return ["C4", "D4", "E4", "G4", "A4", "C5"];
    return ["C4", "E4", "G4", "A4", "B4"]; // Default
  }
}

export const musicGenerator = new MusicGenerator();
