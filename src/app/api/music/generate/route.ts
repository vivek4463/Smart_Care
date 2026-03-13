import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = process.env.REPLICATE_API_TOKEN ? new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
}) : null;

export async function POST(req: Request) {
  try {
    const { mood, prompt } = await req.json();

    if (!replicate) {
      return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }

    const defaultPrompts: Record<string, string> = {
      "Euphoria": "Uplifting, ambient electronic music with bright synth pads and a gentle 120bpm pulse",
      "Melancholy": "Soothing, slow piano melody with a soft ambient background, very calm and emotional",
      "Hostility": "Calming, rhythmic percussion with grounding bass tones to reduce tension",
      "Apprehension": "Steady, reassuring acoustic guitar loop with warm, centered frequencies",
      "Astonishment": "Ethereal, expansive soundscape with shimmering bells and soft transitions",
      "Equilibrium": "Minimalist, balanced ambient atmosphere with a natural pulse",
    };

    const finalPrompt = prompt || defaultPrompts[mood] || "Soothing therapeutic ambient music";

    console.log("Generating music for prompt:", finalPrompt);

    const output = await replicate.run(
      "facebookresearch/musicgen:7a76a8258a299f66c0ce9a900985c545089e5a8726bc59bf6a9603e339f972b9",
      {
        input: {
          prompt: finalPrompt,
          duration: 30,
          model_version: "melody",
          continuation: false
        }
      }
    );

    return NextResponse.json({ audioUrl: output });
  } catch (error: any) {
    console.error('MusicGen API Error:', error);
    return NextResponse.json({ error: 'Failed to generate music' }, { status: 500 });
  }
}
