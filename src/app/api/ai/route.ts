import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, messages } = (await req.json()) as {
      systemPrompt: string;
      messages: Message[];
    };

    if (!messages || !messages.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json(
        { error: "No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    // Try Groq first
    if (groqKey) {
      try {
        const text = await callGroq(groqKey, systemPrompt, messages);
        return NextResponse.json({ text, provider: "groq" });
      } catch (err) {
        console.error("Groq failed, trying Gemini fallback:", err);
      }
    }

    // Fallback to Gemini
    if (geminiKey) {
      try {
        const text = await callGemini(geminiKey, systemPrompt, messages);
        return NextResponse.json({ text, provider: "gemini" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gemini failed";
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    return NextResponse.json(
      { error: "All AI providers failed. Please try again." },
      { status: 500 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });
  return completion.choices[0]?.message?.content ?? "";
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });
  // Gemini uses chat history format
  const chat = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });
  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
}
