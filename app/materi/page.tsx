"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';

export default function MateriPage() {
  const [materi, setMateri] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatkul, setSelectedMatkul] = useState('Semua');
  const [daftarMatkul, setDaftarMatkul] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchMateri();
  }, []);

  const fetchMateri = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('materi')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setMateri(data);
      const matkuls = data.map((item: any) => item.mk_nama).filter((v, i, a) => v && a.indexOf(v) === i);
      setDaftarMatkul(matkuls);
    }
    setLoading(false);
  };

  const filteredMateri = selectedMatkul === 'Semua' 
    ? materi 
    : materi.filter(m => m.mk_nama === selectedMatkul);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#800020]">Materi Perkuliahan</h1>
          <p className="text-slate-500">Unduh materi sesuai mata kuliah yang kamu butuhkan.</p>
        </div>

        {/* DROPDOWN FILTER - Tetap Sama */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border">
          <label className="text-sm font-bold text-slate-600 px-2">Filter:</label>
          <select 
            className="bg-transparent text-sm focus:outline-none cursor-pointer p-1"
            value={selectedMatkul}
            onChange={(e) => setSelectedMatkul(e.target.value)}
          >
            <option value="Semua">Semua Mata Kuliah</option>
            {daftarMatkul.map((mk, index) => (
              <option key={index} value={mk}>{mk}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Memuat materi...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMateri.map((item: any) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 border-l-8 border-l-[#D4AF37] hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-slate-800">{item.judul}</h2>
                <span className="bg-slate-100 text-[#800020] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                  {item.mk_nama || 'Umum'}
                </span>
              </div>
              
              {/* BAGIAN YANG DIPERBAIKI: Menampilkan waktu dalam WIB */}
              <p className="text-sm text-slate-500 mb-4">
                Diupload pada: {new Date(item.created_at).toLocaleString('id-ID', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Jakarta' 
                })} WIB
              </p>
              
              <div className="flex gap-3">
                <a 
                  href={item.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 bg-slate-50 text-slate-700 text-center py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Lihat Isi
                </a>

                <a 
                  href={`${item.file_url}?download=`} 
                  download={item.judul}
                  className="flex-1 bg-[#800020] text-white text-center py-2 rounded-lg text-sm font-bold hover:bg-[#5a0016] transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredMateri.length === 0 && (
        <div className="text-center bg-slate-50 py-20 rounded-3xl border-2 border-dashed border-slate-200 mt-4">
          <p className="text-slate-500">Belum ada materi untuk mata kuliah ini.</p>
        </div>
      )}
    </div>
  );
}