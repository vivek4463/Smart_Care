import { NextResponse } from "next/server";
import { pipeline } from "@xenova/transformers";

export const runtime = "nodejs";

let classifier: any = null;

async function getClassifier() {
  if (!classifier) {

    console.log("🧠 Loading SmartCare NLP Model...");

    classifier = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );

    console.log("✅ Emotion model loaded");

  }

  return classifier;
}

export async function POST(req: Request) {
  try {

    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Valid text input required" },
        { status: 400 }
      );
    }

    const model = await getClassifier();

    const result = await model(text);

    console.log("📊 NLP Result:", result);

    if (!result || !result[0]) {
      throw new Error("Model returned empty result");
    }

    const sentiment = result[0];

    return NextResponse.json({
      result: {
        label: sentiment.label,
        score: sentiment.score,
        engine: "SMARTCARE_NLP_v5"
      }
    });

  } catch (error: any) {

    console.error("❌ Emotion API error:", error);

    return NextResponse.json(
      {
        error: "Neural analysis failed",
        details: error?.message
      },
      { status: 500 }
    );
  }
}