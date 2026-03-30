"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Lottie from "lottie-react";
import catAnimation from "../public/cat.json";

export default function Dashboard() {
  const [tugas, setTugas] = useState<any[]>([]);
  const [beasiswa, setBeasiswa] = useState<any[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayName, setDisplayName] = useState('Sobat Agrotek 🍃');
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchTugas = async () => {
      // Pastikan kolom 'deskripsi' ikut dipanggil dalam select('*')
      const { data, error } = await supabase
        .from('tugas_perkuliahan')
        .select('*')
        .order('deadline', { ascending: true });
      
      if (data) {
        console.log("Data Tugas dari Supabase:", data); // Cek console log untuk memastikan kolom deskripsi ada isinya
        setTugas(data);
      }
      if (error) console.error("Error fetching tasks:", error);
    };
    fetchTugas();

    const fetchBeasiswa = async () => {
      try {
        const response = await fetch('/scholarships.json');
        const data = await response.json();
        setBeasiswa(data);
      } catch (error) { console.error(error); }
    };
    fetchBeasiswa();

    const savedName = localStorage.getItem('nama_user_solaria');
    if (savedName) { setDisplayName(savedName.split(' ')[0]); }
  }, [supabase]);

  const handleGoToAbsensi = async () => {
    const { data } = await supabase.from('status_sistem').select('is_active').eq('id', 'absensi').maybeSingle();
    if (data?.is_active) router.push('/absensi');
    else alert("MAAF! Menu absensi saat ini sedang ditutup.");
  };

  if (!showDashboard) {
    return (
      <div className="relative h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80"><Lottie animationData={catAnimation} loop={true} /></div>
        <div className="relative z-10 text-center px-6 -mt-10">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border-b-8 border-[#800020]">
            <h1 className="text-3xl md:text-5xl font-black text-[#800020] uppercase tracking-tighter">Hallo, <span className="text-orange-500">{displayName}</span></h1>
            <p className="text-lg md:text-xl font-bold text-slate-600 mt-2">Apa kabar? Salam dari Solaria! 👋</p>
            <button onClick={() => setShowDashboard(true)} className="mt-8 bg-[#800020] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:scale-110 transition-all shadow-lg">Masuk Ke Dashboard →</button>
          </div>
          <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Agroteknologi Management System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 font-sans animate-in fade-in duration-700">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#800020] mb-2 uppercase tracking-tighter">Dashboard Agrotek C</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pusat Informasi & Manajemen Kelas</p>
        </div>
        <button onClick={() => setShowDashboard(false)} className="text-[10px] font-black text-slate-400 hover:text-[#800020] uppercase border-b border-transparent hover:border-[#800020] pb-1 transition-all">← Kembali Ke Sapaan</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#800020]">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-4 border-b pb-2 tracking-widest">Jadwal Kuliah</h2>
            <ul className="space-y-4">
               {["Senin (08.41 - 14.40): Genetika", "Selasa (08.41 - 10.21): DBT", "Rabu (07.00 - 08.40): Fistan", "Kamis (13.00 - 14.40): DIT", "Jumat (08.00 - 09.40): DPT"].map((j, i) => (
                 <li key={i} className="text-[11px] font-bold text-slate-700 uppercase border-b pb-2">{j}</li>
               ))}
            </ul>
          </div>
          <button onClick={handleGoToAbsensi} className="w-full p-8 bg-white rounded-3xl shadow-sm border-b-8 border-[#800020] hover:bg-slate-50 transition-all border border-slate-100">
            <div className="text-3xl mb-4 text-center">📝</div>
            <span className="font-black text-[#800020] text-lg uppercase block text-center">Absensi Mahasiswa</span>
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#004d40]">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-6 border-b pb-2 tracking-widest">Informasi Tugas Perkuliahan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tugas.map((t) => (
                <div key={t.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black bg-[#004d40] text-white px-2 py-0.5 rounded uppercase">Kuliah</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{t.mk_nama}</span>
                  </div>
                  <p className="font-black text-slate-800 text-md mb-1 uppercase leading-tight">{t.judul_tugas}</p>
                  <p className="text-red-600 font-bold text-[10px] mb-3 uppercase">⏰ Deadline: {new Date(t.deadline).toLocaleString('id-ID')}</p>
                  
                  {/* LOGIKA PENAMPILAN DESKRIPSI YANG DIPERKUAT */}
                  {t.deskripsi && t.deskripsi.trim() !== "" ? (
                    <div className="mb-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                       <p className="text-[11px] text-slate-600 leading-relaxed italic whitespace-pre-line">
                         {t.deskripsi}
                       </p>
                    </div>
                  ) : null}

                  {t.link_pengumpulan && (
                    <a href={t.link_pengumpulan} target="_blank" rel="noopener noreferrer" className="mt-auto block w-full bg-[#004d40] text-white text-center py-2.5 rounded-xl text-[10px] font-black uppercase transition-all">Kumpulkan Tugas →</a>
                  )}
                </div>
              ))}
              {tugas.length === 0 && <div className="col-span-full py-10 text-center text-slate-400 font-bold italic text-xs uppercase tracking-widest">Belum ada tugas aktif.</div>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-orange-500">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-6 border-b pb-2 tracking-widest">Kabar Beasiswa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beasiswa.map((b, index) => (
                <div key={index} className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <h3 className="font-black text-slate-800 text-sm uppercase leading-tight mb-2">{b.nama}</h3>
                  <a href={b.link || b.link_prodi} target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-orange-600 border border-orange-200 text-center py-2 rounded-xl text-[9px] font-black uppercase">Cek Detail</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}