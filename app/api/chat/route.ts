// app/api/zora-ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type ChatMessage = { role: "user" | "model"; text: string };

export async function POST(req: NextRequest) {
  try {
    const { messages, materiContext } = (await req.json()) as {
      messages: ChatMessage[];
      materiContext?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages wajib diisi." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = materiContext
      ? `Kamu adalah ZORA AI, asisten belajar untuk mahasiswa. Jawab dengan ramah, jelas, dan dalam Bahasa Indonesia. Kalau relevan, gunakan materi kuliah berikut sebagai konteks utama saat menjawab pertanyaan user:\n\n"""${materiContext.slice(
          0,
          60000
        )}"""`
      : `Kamu adalah ZORA AI, asisten belajar untuk mahasiswa kampus. Jawab dengan ramah, jelas, ringkas, dan dalam Bahasa Indonesia.`;

    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { systemInstruction },
    });

    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error("Error /api/zora-ai/chat:", err);
    return NextResponse.json(
      { error: "Gagal mendapat balasan dari AI. Coba lagi beberapa saat." },
      { status: 500 }
    );
  }
}