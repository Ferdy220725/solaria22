"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Materi {
  id: string;
  judul: string;
  mk_nama: string;
  file_url: string;
}

export default function MateriPage() {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [hasilRangkum, setHasilRangkum] = useState<Record<string, string>>({});
  
  const supabase = createClient();

  // Load data materi dari Supabase saat mounting
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('materi')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Gagal ambil data Supabase:", error.message);
      } else if (data) {
        setMateriList(data as Materi[]);
      }
    }
    fetchData();
  }, [supabase]);

  const handleRangkumAI = async (id: string, fileUrl: string) => {
    setProcessingId(id);
    try {
      // 1. Ambil file PDF dari URL Supabase Storage
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) throw new Error("Gagal mengunduh file PDF dari storage.");
      const blob = await fileRes.blob();

      // 2. Siapkan data untuk dikirim ke API internal kita
      const formData = new FormData();
      formData.append("file", blob, "materi.pdf");

      // 3. Panggil API Route Route (/api/ai-helper)
      const res = await fetch("/api/ai-helper", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memproses AI");

      // 4. Update state dengan hasil rangkuman
      setHasilRangkum(prev => ({ ...prev, [id]: result.text }));

    } catch (err: any) {
      console.error("Error UI:", err.message);
      alert("Gagal merangkum: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const daftarMK = Array.from(new Set(materiList.map(m => m.mk_nama)));
  const filteredMateri = filter === 'Semua' ? materiList : materiList.filter(m => m.mk_nama === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl font-black text-[#800020] uppercase italic tracking-tighter">
          Materi Kuliah
        </h1>
        <select 
          className="border-2 border-gray-200 p-2 rounded-xl font-bold text-sm focus:border-[#800020] outline-none transition-all"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Semua">Semua Mata Kuliah</option>
          {daftarMK.map(mk => <option key={mk} value={mk}>{mk}</option>)}
        </select>
      </div>

      {/* Grid Materi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMateri.map((m) => (
          <div key={m.id} className="border-2 border-gray-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between bg-gray-50/30">
            <div>
              <span className="text-[10px] font-bold text-[#800020] uppercase bg-red-50 px-3 py-1 rounded-full border border-red-100">
                {m.mk_nama}
              </span>
              <h2 className="text-xl font-bold mt-3 mb-4 uppercase leading-tight text-gray-800">
                {m.judul}
              </h2>
              
              {/* Box Hasil Rangkuman AI */}
              {hasilRangkum[m.id] && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-200 text-sm whitespace-pre-wrap leading-relaxed animate-in fade-in duration-500">
                  <strong className="block mb-2 text-yellow-800">✨ Rangkuman Materi:</strong>
                  <div className="text-gray-700 italic">
                    {hasilRangkum[m.id]}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <a 
                href={m.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-[11px] tracking-widest hover:bg-gray-100 transition"
              >
                LIHAT PDF LENGKAP
              </a>
              <button 
                onClick={() => handleRangkumAI(m.id, m.file_url)}
                disabled={processingId !== null}
                className="w-full bg-[#800020] text-white py-4 rounded-xl font-bold text-[11px] tracking-widest disabled:bg-gray-300 hover:opacity-90 transition shadow-lg shadow-red-900/10"
              >
                {processingId === m.id ? "SEDANG MERANGKUM..." : "RANGKUM DENGAN AI"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMateri.length === 0 && (
        <div className="text-center py-20 text-gray-400 font-medium">
          Belum ada materi untuk mata kuliah ini.
        </div>
      )}
    </div>
  )
}