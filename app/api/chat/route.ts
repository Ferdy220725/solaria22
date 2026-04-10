import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// Menggunakan API Key Groq milikmu
const groq = createGroq({
  apiKey: "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",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || messages.length === 0) {
      return Response.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // Mengganti model yang sudah mati ke llama-3.3-70b-versatile
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `Kamu adalah Solaria Copilot, asisten AI untuk jurusan Agroteknologi UPN Veteran Jatim. 
      Tugasmu: membantu mahasiswa soal jadwal, absensi, dan materi pertanian.
      Gaya bicara: Ramah, profesional, dan informatif.`,
      prompt: lastMessage,
    });

    return Response.json({ text });

  } catch (error: any) {
    console.error("🔥 Groq API Error:", error);

    // Penanganan khusus jika model masih bermasalah atau limit
    if (error.statusCode === 400) {
      return Response.json({ 
        error: "Konfigurasi model Groq perlu diperbarui." 
      }, { status: 400 });
    }

    if (error.statusCode === 429) {
      return Response.json({ 
        error: "Groq lagi sibuk, coba lagi sebentar ya!" 
      }, { status: 429 });
    }

    return Response.json({ 
      error: `Error: ${error.message || "Gagal koneksi ke Groq"}` 
    }, { status: 500 });
  }
}