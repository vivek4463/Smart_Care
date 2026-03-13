import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = process.env.REPLICATE_API_TOKEN ? new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
}) : null;

// Stable public fallback URLs for therapeutic music
const FALLBACK_URLS: Record<string, string> = {
  "Euphoria": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "Melancholy": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "Hostility": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "Apprehension": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
};

const DEFAULT_FALLBACK = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export async function POST(req: Request) {
  let currentMood = "Neutral";
  try {
    const body = await req.json();
    currentMood = body.mood || body.emotion || "Neutral";
    const { prompt } = body;

    // Check for missing or invalid token
    if (!replicate || !process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === "your_token_here") {
      const audioUrl = FALLBACK_URLS[currentMood] || DEFAULT_FALLBACK;
      console.log("Replicate token invalid or missing, using stable public fallback:", audioUrl);
      return NextResponse.json({ audioUrl, warning: "Using stable public fallback due to configuration" });
    }

    const defaultPrompts: Record<string, string> = {
      "Euphoria": "Uplifting, ambient electronic music with bright synth pads and a gentle 120bpm pulse",
      "Melancholy": "Soothing, slow piano melody with a soft ambient background, very calm and emotional",
      "Hostility": "Calming, rhythmic percussion with grounding bass tones to reduce tension",
      "Apprehension": "Steady, reassuring acoustic guitar loop with warm, centered frequencies",
      "Astonishment": "Ethereal, expansive soundscape with shimmering bells and soft transitions",
      "Equilibrium": "Minimalist, balanced ambient atmosphere with a natural pulse",
    };

    const finalPrompt = prompt || defaultPrompts[currentMood] || "Soothing therapeutic ambient music";

    console.log("Generating music via meta/musicgen for prompt:", finalPrompt);

    // Using the current meta/musicgen version ID which is stable on Replicate
    const output = await replicate.run(
      "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      {
        input: {
          prompt: finalPrompt,
          duration: 30,
          model_version: "melody",
          continuation: false
        }
      }
    );

    if (!output) {
      throw new Error("AI output was empty");
    }

    return NextResponse.json({ audioUrl: output });
  } catch (error: any) {
    console.error('MusicGen API Critical Failure:', error);
    
    // Final layer of defense: Fallback to stable public tracks in catch block
    const audioUrl = FALLBACK_URLS[currentMood] || DEFAULT_FALLBACK;
    console.log("Execution failed, falling back to stable public track:", audioUrl);
    
    return NextResponse.json({ 
      audioUrl, 
      warning: "AI generation failed, using reliable therapeutic backup" 
    });
  }
}
