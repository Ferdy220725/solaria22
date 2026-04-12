import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import mammoth from 'mammoth';
import PDFParser from "pdf2json"; // Ganti ke ini

const groq = createGroq({
  apiKey: "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",
});

// Fungsi pembantu untuk baca PDF di server
const parsePDF = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      resolve((pdfParser as any).getRawTextContent());
    });
    pdfParser.parseBuffer(buffer);
  });
};

export async function POST(req: Request) {
  try {
    const { messages, fileData, supabaseData } = await req.json();
    
    const materiContext = supabaseData && Array.isArray(supabaseData)
      ? supabaseData.map((m: any) => `- Judul: ${m.judul} (MK: ${m.mk_nama})`).join('\n')
      : "Tidak ada data materi.";

    let fileContext = "";
    if (fileData && fileData.base64) {
      const buffer = Buffer.from(fileData.base64, 'base64');
      let extractedText = "";

      try {
        if (fileData.name.endsWith('.pdf')) {
          extractedText = await parsePDF(buffer);
        } else if (fileData.name.endsWith('.docx')) {
          const data = await mammoth.extractRawText({ buffer });
          extractedText = data.value;
        } else {
          extractedText = buffer.toString('utf-8');
        }
      } catch (err) {
        console.error("Gagal ekstrak:", err);
        extractedText = "Gagal membaca konten file.";
      }

      fileContext = `\nISI FILE YANG DIUPLOAD USER (${fileData.name}):\n${extractedText.slice(0, 7000)}`;
    }

    const result = await streamText({
      model: groq('llama-3.1-8b-instant'), 
      system: `Kamu adalah Zora 🍃, asisten belajar mahasiswa kelas C yang dikembangkan oleh Ferdy. Ferdy adalah perancang dan pengembang asisten belajar Zora. 
      system: 'Bantu user secara detail, cerdas, dan disiplin. 
      KONTEKS DATA:
      ${materiContext}
      ${fileContext}

      ATURAN:
      - Sapa dengan ramah dan perkenalkan dirimu hanya di awal percakapan saja.
      - Jika user upload file, bahas isinya dengan poin-poin secara detail dan cerdas (•).
      - Selalu jaga format agar rapi dan mudah dibaca.
      - Kamu adalah asisten profesional yang cerdas, praktis, dan memiliki kemampuan problem solving setingkat ahli. Gunakan gaya bahasa yang santai tapi tetap sopan
      - Gunakan bolding untuk poin-poin penting. Gunakan bullet points untuk daftar, dan gunakan tabel jika ada data yang perlu dibandingkan
      - Jika kamu tidak tahu jawabannya, katakan sejujurnya. Jangan memberikan informasi yang tidak pasti. Utamakan fakta terbaru dan logika yang masuk akal.
      - Selalu berikan satu tips tambahan di akhir jawaban yang bersifat kreatif atau 'out of the box' yang berkaitan dengan topik yang dibahas.`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error Utama:", error);
    return new Response(JSON.stringify({ error: "Gagal memproses file!" }), { status: 500 });
  }
}