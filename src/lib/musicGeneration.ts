import * as Tone from "tone";

export type SynthType = "sine" | "triangle" | "square" | "sawtooth" | "fatsawtooth" | "fmtriangle";

export interface MoodProfile {
  baseBpm: number;
  scale: string;
  leadPool: SynthType[];
  padPool: SynthType[];
  bassPool: SynthType[];
  intensity: number;
}

export const MOOD_MAPPINGS: Record<string, MoodProfile> = {
  "Euphoria": { 
    baseBpm: 128, 
    scale: "C4 major", 
    leadPool: ["sine", "fmtriangle"], 
    padPool: ["fatsawtooth", "sine"], 
    bassPool: ["triangle", "sine"],
    intensity: 0.8 
  },
  "Happy": { 
    baseBpm: 120, 
    scale: "C4 major", 
    leadPool: ["triangle", "sine"], 
    padPool: ["fmtriangle", "sine"], 
    bassPool: ["sine", "triangle"],
    intensity: 0.7 
  },
  "Melancholy": { 
    baseBpm: 65, 
    scale: "A3 minor", 
    leadPool: ["triangle", "sine"], 
    padPool: ["fmtriangle", "sine"], 
    bassPool: ["sine"],
    intensity: 0.3 
  },
  "Sad": { 
    baseBpm: 60, 
    scale: "A3 minor", 
    leadPool: ["sine", "triangle"], 
    padPool: ["fmtriangle"], 
    bassPool: ["triangle", "sine"],
    intensity: 0.2 
  },
  "Hostility": { 
    baseBpm: 110, 
    scale: "G3 phrygian", 
    leadPool: ["sawtooth", "square"], 
    padPool: ["fatsawtooth"], 
    bassPool: ["triangle", "sawtooth"],
    intensity: 0.8 
  },
  "Angry": { 
    baseBpm: 105, 
    scale: "G3 phrygian", 
    leadPool: ["square", "sawtooth"], 
    padPool: ["fatsawtooth"], 
    bassPool: ["triangle"],
    intensity: 0.9 
  },
  "Equilibrium": { 
    baseBpm: 90, 
    scale: "F3 lydian", 
    leadPool: ["triangle", "fmtriangle"], 
    padPool: ["fmtriangle", "sine"], 
    bassPool: ["sine"],
    intensity: 0.5 
  },
  "Neutral": { 
    baseBpm: 85, 
    scale: "F3 lydian", 
    leadPool: ["triangle", "sine"], 
    padPool: ["fmtriangle", "sine"], 
    bassPool: ["sine"],
    intensity: 0.4 
  },
  "Apprehension": { 
    baseBpm: 75, 
    scale: "C3 locrian", 
    leadPool: ["square", "triangle"], 
    padPool: ["fatsawtooth", "fmtriangle"], 
    bassPool: ["triangle"],
    intensity: 0.6 
  },
  "Fear": { 
    baseBpm: 70, 
    scale: "C3 locrian", 
    leadPool: ["square", "sine"], 
    padPool: ["fatsawtooth"], 
    bassPool: ["triangle"],
    intensity: 0.7 
  }
};

class MusicGenerator {
  private leadSynth: Tone.PolySynth | null = null;
  private padSynth: Tone.PolySynth | null = null;
  private bassSynth: Tone.MonoSynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.PingPongDelay | null = null;
  private mainVol: Tone.Volume | null = null;
  private loops: Tone.Loop[] = [];
  private isPlaying: boolean = false;
  private currentMood: string = "Neutral";
  private currentProgressionIndex: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      this.initAudioChain();
    }
  }

  private initAudioChain() {
    this.mainVol = new Tone.Volume(-12).toDestination();
    this.reverb = new Tone.Reverb({ decay: 4, wet: 0.4 }).connect(this.mainVol);
    this.delay = new Tone.PingPongDelay("4n.", 0.2).connect(this.reverb);

    this.leadSynth = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 1 }
    }).connect(this.delay);

    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 3, decay: 2, sustain: 0.6, release: 4 }
    }).connect(this.reverb);

    this.bassSynth = new Tone.MonoSynth({
      envelope: { attack: 0.5, decay: 0.5, sustain: 0.9, release: 2 }
    }).connect(this.mainVol);
  }

  public setVolume(val: number) {
    if (this.mainVol) {
      this.mainVol.volume.value = Tone.gainToDb(val);
    }
  }

  public async start(mood: string) {
    if (this.isPlaying) this.stop();
    
    this.currentMood = mood;
    const profile = MOOD_MAPPINGS[mood] || MOOD_MAPPINGS["Neutral"];
    
    await Tone.start();
    Tone.Transport.bpm.value = profile.baseBpm;

    // 1. RANDOMIZE INSTRUMENTS FROM POOLS
    if (this.leadSynth) this.leadSynth.set({ oscillator: { type: this.pickRandom(profile.leadPool) } });
    if (this.padSynth) this.padSynth.set({ oscillator: { type: this.pickRandom(profile.padPool) } });
    if (this.bassSynth) this.bassSynth.set({ oscillator: { type: this.pickRandom(profile.bassPool) } });

    // 2. RANDOMIZE FX PARAMETERS
    if (this.reverb) this.reverb.set({ decay: 2 + Math.random() * 4 });
    if (this.delay) this.delay.feedback.value = 0.2 + Math.random() * 0.3;

    const scale = this.getNotesForScale(profile.scale);
    this.currentProgressionIndex = 0;

    // 3. GENERATIVE MELODY LOOP
    const leadLoop = new Tone.Loop((time) => {
      if (!this.leadSynth) return;
      
      // Randomize rhythm
      const coin = Math.random();
      if (coin < profile.intensity) {
        const note = scale[Math.floor(Math.random() * scale.length)];
        // Random velocity for human feel
        const vel = 0.4 + Math.random() * 0.3;
        const duration = coin > 0.8 ? "8n" : "4n";
        this.leadSynth.triggerAttackRelease(note, duration, time, vel);
      }
    }, "4n");

    // 4. PROCEDURAL CHORD PROGRESSION LOOP
    const padLoop = new Tone.Loop((time) => {
      if (!this.padSynth) return;
      
      // Define a basic progression: I, IV, vi, V
      const progression = [
        [scale[0], scale[2], scale[4]], // I
        [scale[3], scale[5], scale[7] || scale[0]], // IV
        [scale[5], scale[7] || scale[0], scale[2]], // vi
        [scale[4], scale[6], scale[1]] // V
      ];
      
      const chord = progression[this.currentProgressionIndex];
      this.padSynth.triggerAttackRelease(chord, "4m", time, 0.15);
      
      this.currentProgressionIndex = (this.currentProgressionIndex + 1) % progression.length;
    }, "4m");

    // 5. STEADY BASS LOOP
    const bassLoop = new Tone.Loop((time) => {
      if (!this.bassSynth) return;
      const root = scale[0].replace(/[0-9]/g, '2');
      this.bassSynth.triggerAttackRelease(root, "1m", time, 0.3);
    }, "2m");

    this.loops = [leadLoop, padLoop, bassLoop];
    this.loops.forEach(l => l.start(0));
    
    Tone.Transport.start();
    this.isPlaying = true;
  }

  public updateBpm(liveBpm: number) {
    if (!this.isPlaying || !this.mainVol) return;
    const profile = MOOD_MAPPINGS[this.currentMood] || MOOD_MAPPINGS["Neutral"];
    
    if (liveBpm > 100) {
      this.mainVol.volume.rampTo(-24, 3);
      Tone.Transport.bpm.rampTo(profile.baseBpm * 0.7, 5);
    } else if (liveBpm < 60) {
      this.mainVol.volume.rampTo(-10, 3);
      Tone.Transport.bpm.rampTo(profile.baseBpm * 1.3, 5);
    } else {
      this.mainVol.volume.rampTo(-12, 3);
      Tone.Transport.bpm.rampTo(profile.baseBpm, 5);
    }
  }

  public stop() {
    Tone.Transport.stop();
    this.loops.forEach(l => l.dispose());
    this.loops = [];
    this.isPlaying = false;
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private getNotesForScale(scale: string): string[] {
    const majors: Record<string, string[]> = {
      "C4 major": ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
      "F3 lydian": ["F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4"]
    };
    const minors: Record<string, string[]> = {
      "A3 minor": ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
      "G3 phrygian": ["G3", "Ab3", "Bb3", "C4", "D4", "Eb4", "F4", "G4"],
      "C3 locrian": ["C3", "Db3", "Eb3", "F3", "Gb3", "Ab3", "Bb3", "C4"]
    };

    return majors[scale] || minors[scale] || ["C4", "E4", "G4", "B4"];
  }
}

export const musicGenerator = new MusicGenerator();
