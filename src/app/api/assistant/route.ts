import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const groq = process.env.GROQ_API_KEY ? new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
}) : null;

export async function POST(req: Request) {
  try {
    const { query, mood } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let responseText = '';
    let success = false;

    const fallbackResponses = [
      `I understand you are feeling ${mood}. I'm processing your thoughts, but my neural link is currently in fallback mode. How can I best support you right now?`,
      `Resonating with your state of ${mood}. My primary processors are recalibrating, but I'm here to listen. What's on your mind?`,
      `Acknowledged. Feeling ${mood} is a significant signal. I'm currently operating on secondary cores, but I'm fully attentive to your needs.`,
      `Signal received. Your current resonance of ${mood} has been logged. While I optimize my connection, please tell me more about what you're experiencing.`,
      `I'm here. Even in fallback mode, I'm tuned into your ${mood}. Let's navigate this together. What do you need most at this moment?`
    ];

    if (genAI) {
      try {
        // Use Gemini if available
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `You are a sophisticated, empathic AI companion for a premium therapeutic care application called Smart Care. 
        The user is currently experiencing a state of: ${mood}. 
        
        Your goal is to provide a highly dynamic, non-repetitive, and deeply supportive response. 
        Avoid clinical cliches. Use varied sentence structures. 
        If the user is sad, be a gentle anchor. If they are happy, celebrate with them. 
        
        User query: "${query}"
        
        Response requirements:
        - Concise but meaningful (max 3 sentences).
        - Directly address the user's emotion.
        - Never repeat the exact same phrasing across different interactions.
        - If the user seems to need therapeutic music or asks for it, append the command "[CMD:PLAY_MUSIC]" (without quotes) at the end of your response. Use this sparingly used for emotional regulation.`;
        
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        success = true;
      } catch (geminiError) {
        console.error('Gemini Provider Error:', geminiError);
        // Continue to next provider
      }
    }

    if (!success && groq) {
      try {
        // Fallback to Groq
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: `You are an empathic AI companion for Smart Care. User mood: ${mood}. 
              Be dynamic, varied, and deeply supportive. Avoid repetitive sentence structures. 
              Keep it under 3 sentences. 
              If music therapy would help their ${mood}, append "[CMD:PLAY_MUSIC]" at the end.` 
            },
            { role: "user", content: query }
          ],
          temperature: 0.8,
        });
        responseText = response.choices[0].message?.content || "I am here for you.";
        success = true;
      } catch (groqError) {
        console.error('Groq Provider Error:', groqError);
        // Continue to next provider
      }
    }

    if (!success && openai) {
      try {
        // Fallback to OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `You are an empathic AI companion for Smart Care. User mood: ${mood}. 
              Be dynamic, varied, and deeply supportive. Avoid repetitive sentence structures. 
              Keep it under 3 sentences. 
              If the user needs music for therapy, append "[CMD:PLAY_MUSIC]" to your response.` 
            },
            { role: "user", content: query }
          ],
          temperature: 0.8, // Increase temperature for more variety
        });
        responseText = response.choices[0].message?.content || "I am here for you.";
        success = true;
      } catch (openaiError) {
        console.error('OpenAI Provider Error:', openaiError);
        // Continue to local fallback
      }
    }

    if (!success) {
      // Hard fallback if no keys configured or all providers failed
      responseText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('Assistant API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
