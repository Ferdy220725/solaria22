"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';

export default function Dashboard() {
  const [tugas, setTugas] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchTugas = async () => {
      // Sekarang mengambil data dari tabel 'tugas_perkuliahan' 
      // (Pastikan kamu buat tabel ini di Supabase atau sesuaikan namanya)
      const { data } = await supabase
        .from('tugas_perkuliahan') 
        .select('*')
        .order('deadline', { ascending: true });
      
      if (data) setTugas(data);
    };
    fetchTugas();
  }, []);

  const checkDeadline = (deadlineStr: string) => {
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const selisihJam = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (selisihJam > 0 && selisihJam <= 12) return true;
    return false;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-[#800020] mb-2">Dashboard Agrotek C</h1>
        <p className="text-slate-500 font-medium">Pusat Informasi Perkuliahan & Praktikum</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM 1: JADWAL KULIAH */}
        <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-[#800020]">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <span className="text-xl">📅</span>
            <h2 className="text-xl font-bold text-slate-800">Jadwal Kuliah</h2>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
             <li className="flex justify-between border-b border-slate-50 pb-1"><strong>Senin</strong> <span>Genetika (08.41)</span></li>
             <li className="flex justify-between border-b border-slate-50 pb-1"><strong>Senin</strong> <span>Pertanian Kota (13.00)</span></li>
             <li className="flex justify-between border-b border-slate-50 pb-1"><strong>Selasa</strong> <span>Budidaya (08.41)</span></li>
             <li className="flex justify-between border-b border-slate-50 pb-1"><strong>Rabu</strong> <span>Fisiologi (07.00)</span></li>
             <li className="flex justify-between border-b border-slate-50 pb-1"><strong>Kamis</strong> <span>Ilmu Tanah (13.00)</span></li>
             <li className="flex justify-between border-b border-slate-50 pb-1"><strong>Jumat</strong> <span>Perlindungan (08.00)</span></li>
          </ul>
        </div>

        {/* KOLOM 2 & 3: TUGAS PERKULIAHAN (REVISI) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border-t-4 border-[#004d40]">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <span className="text-xl">📚</span>
            <h2 className="text-xl font-bold text-slate-800">Informasi Tugas Perkuliahan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tugas.map((t) => (
              <div key={t.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold bg-[#004d40] text-white px-2 py-0.5 rounded">KULIAH</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t.mk_nama}</span>
                  </div>
                  <p className="font-bold text-slate-800 text-lg mb-1">{t.judul_tugas}</p>
                  <p className="text-xs text-slate-500 mb-3">{t.deskripsi || "Cek instruksi pada file materi terkait."}</p>
                  
                  <div className="flex items-center gap-1 text-red-600 font-bold text-xs mb-3">
                    <span>⏰</span>
                    <span>Deadline: {new Date(t.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {checkDeadline(t.deadline) && (
                    <div className="p-2 bg-red-600 text-white text-[10px] font-bold rounded-lg animate-pulse text-center">
                      🚨 SEGERA KUMPULKAN!
                    </div>
                  )}
                  
                  {t.link_pengumpulan && (
                    <a 
                      href={t.link_pengumpulan} 
                      target="_blank" 
                      className="block w-full bg-[#004d40] text-white text-center py-2 rounded-lg text-xs font-bold hover:bg-[#00332c] transition-all"
                    >
                      Kumpulkan Tugas →
                    </a>
                  )}
                </div>
              </div>
            ))}

            {tugas.length === 0 && (
              <div className="col-span-full py-10 text-center">
                <p className="text-slate-400 italic">Alhamdulillah, belum ada tugas perkuliahan aktif.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}