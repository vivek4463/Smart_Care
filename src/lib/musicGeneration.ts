import * as Tone from "tone";

export interface MusicParams {
  bpm: number;
  scale: string;
  instruments: {
    lead: "sine" | "triangle" | "square" | "sawtooth";
    pad: "fatsawtooth" | "fmtriangle";
    bass: "sine" | "triangle";
  };
  intensity: number;
}

export const MOOD_MAPPINGS: Record<string, MusicParams> = {
  "Euphoria": { 
    bpm: 128, 
    scale: "C4 major", 
    instruments: { lead: "sine", pad: "fatsawtooth", bass: "triangle" },
    intensity: 0.8 
  },
  "Happy": { 
    bpm: 120, 
    scale: "C4 major", 
    instruments: { lead: "triangle", pad: "fmtriangle", bass: "sine" },
    intensity: 0.7 
  },
  "Melancholy": { 
    bpm: 65, 
    scale: "A3 minor", 
    instruments: { lead: "triangle", pad: "fmtriangle", bass: "sine" },
    intensity: 0.3 
  },
  "Sad": { 
    bpm: 60, 
    scale: "A3 minor", 
    instruments: { lead: "sine", pad: "fmtriangle", bass: "triangle" },
    intensity: 0.2 
  },
  "Hostility": { 
    bpm: 110, 
    scale: "G3 phrygian", 
    instruments: { lead: "sawtooth", pad: "fatsawtooth", bass: "triangle" },
    intensity: 0.8 
  },
  "Angry": { 
    bpm: 105, 
    scale: "G3 phrygian", 
    instruments: { lead: "square", pad: "fatsawtooth", bass: "triangle" },
    intensity: 0.9 
  },
  "Equilibrium": { 
    bpm: 90, 
    scale: "F3 lydian", 
    instruments: { lead: "triangle", pad: "fmtriangle", bass: "sine" },
    intensity: 0.5 
  },
  "Neutral": { 
    bpm: 85, 
    scale: "F3 lydian", 
    instruments: { lead: "triangle", pad: "fmtriangle", bass: "sine" },
    intensity: 0.4 
  },
  "Apprehension": { 
    bpm: 75, 
    scale: "C3 locrian", 
    instruments: { lead: "square", pad: "fatsawtooth", bass: "triangle" },
    intensity: 0.6 
  },
  "Fear": { 
    bpm: 70, 
    scale: "C3 locrian", 
    instruments: { lead: "square", pad: "fatsawtooth", bass: "triangle" },
    intensity: 0.7 
  }
};

class MusicGenerator {
  // Layers
  private leadSynth: Tone.PolySynth | null = null;
  private padSynth: Tone.PolySynth | null = null;
  private bassSynth: Tone.MonoSynth | null = null;
  
  // FX
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.PingPongDelay | null = null;
  private mainVol: Tone.Volume | null = null;

  // Control
  private loops: Tone.Loop[] = [];
  private isPlaying: boolean = false;
  private currentMood: string = "Neutral";

  constructor() {
    if (typeof window !== "undefined") {
      this.initAudioChain();
    }
  }

  private async initAudioChain() {
    this.mainVol = new Tone.Volume(-12).toDestination();
    this.reverb = new Tone.Reverb({ decay: 4, wet: 0.4 }).connect(this.mainVol);
    this.delay = new Tone.PingPongDelay("4n.", 0.2).connect(this.reverb);

    // Lead Synth (Melody)
    this.leadSynth = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1.2 }
    }).connect(this.delay);

    // Pad Synth (Atmosphere)
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 }
    }).connect(this.reverb);

    // Bass Synth (Rhythm)
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.2, decay: 0.1, sustain: 0.8, release: 1 }
    }).connect(this.mainVol);
  }

  public async start(mood: string) {
    if (this.isPlaying) this.stop();
    
    this.currentMood = mood;
    const params = MOOD_MAPPINGS[mood] || MOOD_MAPPINGS["Neutral"];
    
    await Tone.start();
    Tone.Transport.bpm.value = params.bpm;

    // Update Oscillators based on mood
    if (this.leadSynth) this.leadSynth.set({ oscillator: { type: params.instruments.lead } });
    if (this.padSynth) this.padSynth.set({ oscillator: { type: params.instruments.pad } });
    if (this.bassSynth) this.bassSynth.set({ oscillator: { type: params.instruments.bass } });

    const scale = this.getNotesForScale(params.scale);

    // 1. MELODY LOOP (Lead)
    const leadLoop = new Tone.Loop((time) => {
      if (!this.leadSynth) return;
      const note = scale[Math.floor(Math.random() * scale.length)];
      const shouldPlay = Math.random() > (1 - params.intensity);
      if (shouldPlay) {
        this.leadSynth.triggerAttackRelease(note, "4n", time, 0.4 + Math.random() * 0.2);
      }
    }, "4n");

    // 2. ATMOSPHERE LOOP (Pad)
    const padLoop = new Tone.Loop((time) => {
      if (!this.padSynth) return;
      // Play a triad
      const root = scale[0];
      const third = scale[2];
      const fifth = scale[4];
      this.padSynth.triggerAttackRelease([root, third, fifth], "2m", time, 0.2);
    }, "2m");

    // 3. BASS LOOP (Rhythm)
    const bassLoop = new Tone.Loop((time) => {
      if (!this.bassSynth) return;
      const root = scale[0].replace(/[0-9]/g, '2'); // Drop down to octave 2
      this.bassSynth.triggerAttackRelease(root, "2n", time, 0.3);
    }, "1m");

    this.loops = [leadLoop, padLoop, bassLoop];
    this.loops.forEach(l => l.start(0));
    
    Tone.Transport.start();
    this.isPlaying = true;
  }

  public updateBpm(liveBpm: number) {
    if (!this.isPlaying || !this.mainVol) return;
    
    // Smoothly adjust master volume based on stress
    if (liveBpm > 100) {
      this.mainVol.volume.rampTo(-22, 3);
      Tone.Transport.bpm.rampTo(MOOD_MAPPINGS[this.currentMood].bpm * 0.8, 4);
    } else if (liveBpm < 60) {
      this.mainVol.volume.rampTo(-10, 3);
      Tone.Transport.bpm.rampTo(MOOD_MAPPINGS[this.currentMood].bpm * 1.2, 4);
    } else {
      this.mainVol.volume.rampTo(-12, 3);
      Tone.Transport.bpm.rampTo(MOOD_MAPPINGS[this.currentMood].bpm, 4);
    }
  }

  public stop() {
    Tone.Transport.stop();
    this.loops.forEach(l => l.dispose());
    this.loops = [];
    this.isPlaying = false;
  }

  private getNotesForScale(scale: string): string[] {
    if (scale.includes("major")) return ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    if (scale.includes("minor")) return ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"];
    if (scale.includes("phrygian")) return ["G3", "Ab3", "Bb3", "C4", "D4", "Eb4", "F4", "G4"];
    if (scale.includes("lydian")) return ["F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4"];
    if (scale.includes("locrian")) return ["C3", "Db3", "Eb3", "F3", "Gb3", "Ab3", "Bb3", "C4"];
    return ["C4", "E4", "G4", "B4"];
  }
}

export const musicGenerator = new MusicGenerator();
