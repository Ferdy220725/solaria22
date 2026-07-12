// app/api/zora-ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type ChatMessage = { role: "user" | "model"; text: string };

export async function POST(req: NextRequest) {
  try {
    const { messages, materiContext } = (await req.json()) as {
      messages: ChatMessage[];
      materiContext?: string | null;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Riwayat pesan (messages) wajib diisi." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // System instruction: identitas ZORA AI + konteks materi (kalau ada)
    const systemInstruction = `Kamu adalah ZORA AI, asisten belajar untuk mahasiswa di aplikasi ZORA.
Jawab dengan ramah, jelas, dan dalam Bahasa Indonesia.
${
  materiContext
    ? `\nUser baru saja meminta ringkasan materi kuliah. Berikut isi materi tersebut sebagai konteks tambahan untuk menjawab pertanyaan lanjutan user:\n"""\n${materiContext.slice(
        0,
        30000
      )}\n"""\nGunakan konteks ini kalau pertanyaan user berkaitan dengan materi tersebut. Kalau pertanyaannya di luar topik materi, jawab seperti biasa sebagai asisten belajar umum.`
    : ""
}`;

    // Konversi riwayat chat ke format contents yang dipahami Gemini API
    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents,
      config: {
        systemInstruction,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error("Error /api/zora-ai/chat:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses chat. Coba lagi beberapa saat." },
      { status: 500 }
    );
  }
}