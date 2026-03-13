import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { query, mood } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let responseText = '';

    if (genAI) {
      // Use Gemini if available
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are an empathic AI companion for a therapeutic care application called Smart Care. 
      The user's current mood is: ${mood}. 
      Provide a concise, supportive, and therapeutic response to the following query: "${query}"`;
      
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } else if (openai) {
      // Fallback to OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are an empathic AI companion for Smart Care. Current user mood: ${mood}. Be concise and supportive.` },
          { role: "user", content: query }
        ],
      });
      responseText = response.choices[0].message?.content || "I am here for you.";
    } else {
      // Hard fallback if no keys configured
      responseText = `I understand you are feeling ${mood}. I'm processing your thoughts, but my neural link is currently in fallback mode. How can I best support you right now?`;
    }

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('Assistant API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
