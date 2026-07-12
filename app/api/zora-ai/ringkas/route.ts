// app/api/zora-ai/ringkas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { extractText, getDocumentProxy } from "unpdf";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_CHARS = 60000;

export async function POST(req: NextRequest) {
  try {
    const { materiId } = await req.json();

    if (!materiId) {
      return NextResponse.json({ error: "materiId wajib diisi." }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: materi, error: fetchError } = await supabase
      .from("materi")
      .select("*")
      .eq("id", materiId)
      .single();

    if (fetchError || !materi) {
      return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 });
    }

    let teks = (materi.konten_teks || "").trim();

    if (!teks || teks.length < 50) {
      const fileRes = await fetch(materi.file_url);

      if (!fileRes.ok) {
        return NextResponse.json(
          { error: "Gagal mengambil file PDF materi ini dari server." },
          { status: 502 }
        );
      }

      const buffer = new Uint8Array(await fileRes.arrayBuffer());

      // --- bagian yang berubah ---
      const pdf = await getDocumentProxy(buffer);
      const { text } = await extractText(pdf, { mergePages: true });
      teks = text.trim();
      // ---------------------------

      if (!teks || teks.length < 50) {
        return NextResponse.json(
          {
            error:
              "Teks tidak berhasil diekstrak dari PDF ini. Kemungkinan file berupa hasil scan/gambar, bukan PDF berbasis teks.",
          },
          { status: 422 }
        );
      }

      await supabase.from("materi").update({ konten_teks: teks }).eq("id", materiId);
    }

    const teksUntukAI = teks.slice(0, MAX_CHARS);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Kamu adalah asisten belajar untuk mahasiswa. Ringkas materi kuliah berikut secara jelas dan terstruktur dalam Bahasa Indonesia.

Mata kuliah: ${materi.mk_nama}
Semester: ${materi.semester}
Judul materi: ${materi.judul}

Format jawaban:
1. Satu kalimat pembuka tentang topik materi ini
2. 4-8 poin utama (gunakan bullet "-"), tiap poin 1-2 kalimat, fokus pada konsep penting
3. Kesimpulan singkat 1-2 kalimat di akhir

Isi materi:
"""
${teksUntukAI}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });

    return NextResponse.json({
      summary: response.text,
      materi: {
        id: materi.id,
        judul: materi.judul,
        mk_nama: materi.mk_nama,
        semester: materi.semester,
      },
      konteks: teksUntukAI,
    });
  } catch (err) {
    console.error("Error /api/zora-ai/ringkas:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat meringkas materi. Coba lagi beberapa saat." },
      { status: 500 }
    );
  }
}