import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log("--- API START: Menerima permintaan rangkum ---");

    // Mengambil API Key dari server-side environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("ERROR: API Key tidak ditemukan di environment server!");
      return NextResponse.json(
        { error: "API Key belum terpasang di .env.local atau server perlu di-restart." }, 
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "File tidak terbaca atau kosong" }, { status: 400 });
    }

    console.log("File diterima, ukuran:", file.size, "bytes");

    // Inisialisasi Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Konversi Blob ke Base64 untuk dikirim ke Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const prompt = "Ini adalah file PDF materi kuliah. Tolong buatkan rangkuman poin-poin materi intinya dalam Bahasa Indonesia yang rapi, padat, dan jelas.";

    console.log("Mengirim data ke Gemini AI...");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log("--- API SUCCESS: Rangkuman berhasil dibuat ---");
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("--- API CRASH ---");
    console.error("Pesan Error:", error.message);
    return NextResponse.json(
      { error: "Gagal memproses AI", details: error.message }, 
      { status: 500 }
    );
  }
}