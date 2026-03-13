import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = process.env.REPLICATE_API_TOKEN ? new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
}) : null;

export async function POST(req: Request) {
  let currentMood = "Neutral";
  try {
    const body = await req.json();
    currentMood = body.mood || body.emotion || "Neutral";
    const { prompt } = body;

    if (!replicate || process.env.REPLICATE_API_TOKEN === "your_token_here") {
      const fallbackUrls: Record<string, string> = {
        "Euphoria": "/music/happy.mp3",
        "Melancholy": "/music/calm.mp3",
        "Hostility": "/music/relax.mp3",
        "Apprehension": "/music/meditation.mp3",
      };
      
      const audioUrl = fallbackUrls[currentMood] || "/music/calm.mp3";
      console.log("Replicate token invalid or missing, using fallback:", audioUrl);
      return NextResponse.json({ audioUrl });
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
    console.error('MusicGen API Critical Failure:', error);
    
    // Final layer of defense: Fallback to local files if AI generation fails
    const fallbackUrls: Record<string, string> = {
      "Euphoria": "/music/happy.mp3",
      "Melancholy": "/music/calm.mp3",
      "Hostility": "/music/relax.mp3",
      "Apprehension": "/music/meditation.mp3",
    };

    const audioUrl = fallbackUrls[currentMood] || "/music/calm.mp3";
    console.log("AI Generation failed, falling back to local:", audioUrl);
    return NextResponse.json({ audioUrl, warning: "AI generation failed, used local fallback" });
  }
}
