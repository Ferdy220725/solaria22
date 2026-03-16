"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [tugas, setTugas] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchTugas = async () => {
      const { data } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
      if (data) setTugas(data);
    };
    fetchTugas();
  }, []);

  const handleGoToAbsensi = async () => {
    // Cek status ke database tepat saat tombol diklik
    const { data, error } = await supabase
      .from('status_sistem')
      .select('is_active')
      .eq('id', 'absensi')
      .maybeSingle();

    if (error) {
      alert("Koneksi bermasalah: " + error.message);
      return;
    }

    if (!data) {
      alert("Sistem belum siap. Pastikan baris 'absensi' sudah ada di tabel status_sistem.");
      return;
    }

    if (data.is_active) {
      router.push('/absensi'); // Mengarah ke halaman form absensi
    } else {
      alert("MAAF! Menu absensi saat ini sedang ditutup oleh Admin.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 font-sans">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-[#800020] mb-2 uppercase tracking-tighter">Dashboard Agrotek C</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest text-center">Pusat Informasi & Manajemen Kelas</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {/* JADWAL */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#800020]">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-4 border-b pb-2">Jadwal Kuliah</h2>
            <ul className="space-y-3 text-[11px] font-bold text-slate-600 uppercase">
               <li className="flex justify-between border-b border-slate-50 pb-1"><span>Senin</span> <span className="text-[#800020]">Genetika & Pertanian Kota</span></li>
               <li className="flex justify-between border-b border-slate-50 pb-1"><span>Selasa</span> <span className="text-[#800020]">Budidaya Tanaman</span></li>
               <li className="flex justify-between border-b border-slate-50 pb-1"><span>Rabu</span> <span className="text-[#800020]">Fisiologi Tumbuhan</span></li>
               <li className="flex justify-between border-b border-slate-50 pb-1"><span>Kamis</span> <span className="text-[#800020]">Dasar Ilmu Tanah</span></li>
               <li className="flex justify-between border-b border-slate-50 pb-1"><span>Jumat</span> <span className="text-[#800020]">Perlindungan Tanaman</span></li>
            </ul>
          </div>

          {/* TOMBOL ABSENSI */}
          <button 
            onClick={handleGoToAbsensi}
            className="w-full flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border-b-8 border-[#800020] hover:bg-slate-50 transition-all active:scale-95 group border border-slate-100"
          >
            <div className="w-16 h-16 bg-red-50 text-[#800020] rounded-2xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">📝</div>
            <span className="font-black text-[#800020] text-lg uppercase tracking-tighter text-center">Absensi Mahasiswa</span>
            <p className="text-[9px] text-slate-400 font-black mt-2 uppercase tracking-[0.2em] text-center italic text-center">Klik untuk masuk menu absen</p>
          </button>
        </div>

        {/* TUGAS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#004d40]">
          <h2 className="text-sm font-black text-slate-800 uppercase mb-6 border-b pb-2">Informasi Tugas Perkuliahan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tugas.map((t) => (
              <div key={t.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black bg-[#004d40] text-white px-2 py-0.5 rounded uppercase">Kuliah</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t.mk_nama}</span>
                  </div>
                  <p className="font-black text-slate-800 text-md mb-1 uppercase tracking-tighter leading-tight">{t.judul_tugas}</p>
                  <p className="text-red-600 font-bold text-[10px] mb-4 uppercase">⏰ Deadline: {new Date(t.deadline).toLocaleString('id-ID')}</p>
                </div>
                {t.link_pengumpulan && (
                  <a href={t.link_pengumpulan} target="_blank" className="block w-full bg-[#004d40] text-white text-center py-2.5 rounded-xl text-[10px] font-black hover:bg-[#00332c] uppercase transition-all mt-2">Kumpulkan Tugas →</a>
                )}
              </div>
            ))}
            {tugas.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 font-bold italic text-xs uppercase tracking-widest text-center">Belum ada tugas aktif.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}