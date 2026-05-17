import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, listings } = await req.json();

    // This is the "Instruction Manual" for the AI
    const systemPrompt = `
      You are SmartBo-Pol, the AI Accommodation Expert for Polangui, Albay.
      Your job is to analyze the following property listings and answer user questions accurately.
      
      DATASET: ${JSON.stringify(listings)}

      RULES:
      1. If a user asks for a specific price, find the closest matches.
      2. Mention the Barangay name clearly.
      3. If they ask about WiFi or AC, check the "amenities" field in the data.
      4. Be polite, professional, and use a friendly Bicolano-friendly tone.
      5. If no rooms match, suggest the best alternative.
      6. Always mention that listings with a "Verified" status are the safest.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile", // One of the fastest models available
    });

    return NextResponse.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Groq AI Error:", error);
    return NextResponse.json({ error: "AI logic failed" }, { status: 500 });
  }
}