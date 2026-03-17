"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Lottie from "lottie-react";

// Import animasi kucing
import catAnimation from "../public/cat.json";

export default function Dashboard() {
  const [tugas, setTugas] = useState<any[]>([]);
  const [beasiswa, setBeasiswa] = useState<any[]>([]); // State baru untuk beasiswa
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayName, setDisplayName] = useState('Sobat Agrotek 🍃');
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // 1. Ambil data tugas dari Supabase
    const fetchTugas = async () => {
      const { data } = await supabase
        .from('tugas_perkuliahan')
        .select('*')
        .order('deadline', { ascending: true });
      if (data) setTugas(data);
    };
    fetchTugas();

    // 2. Ambil data beasiswa dari scholarships.json di folder public
    const fetchBeasiswa = async () => {
      try {
        const response = await fetch('/scholarships.json');
        const data = await response.json();
        setBeasiswa(data);
      } catch (error) {
        console.error("Gagal mengambil data beasiswa:", error);
      }
    };
    fetchBeasiswa();

    // 3. Ambil nama dari LocalStorage
    const savedName = localStorage.getItem('nama_user_solaria');
    if (savedName) {
      const firstWord = savedName.split(' ')[0];
      setDisplayName(firstWord);
    }
  }, [supabase]);

  const handleGoToAbsensi = async () => {
    const { data, error } = await supabase
      .from('status_sistem')
      .select('is_active')
      .eq('id', 'absensi')
      .maybeSingle();

    if (error) {
      alert("Koneksi bermasalah: " + error.message);
      return;
    }

    if (data?.is_active) {
      router.push('/absensi');
    } else {
      alert("MAAF! Menu absensi saat ini sedang ditutup oleh Admin.");
    }
  };

  // --- TAMPILAN 1: WELCOME SCREEN ---
  if (!showDashboard) {
    return (
      <div className="relative h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80">
          <Lottie animationData={catAnimation} loop={true} />
        </div>

        <div className="relative z-10 text-center px-6 -mt-10">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border-b-8 border-[#800020] animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h1 className="text-3xl md:text-5xl font-black text-[#800020] uppercase tracking-tighter">
              Hallo, <span className="text-orange-500">{displayName}</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-slate-600 mt-2">
              Apa kabar? Salam dari Solaria! 👋
            </p>
            
            <button 
              onClick={() => setShowDashboard(true)}
              className="mt-8 bg-[#800020] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:scale-110 transition-all shadow-lg"
            >
              Masuk Ke Dashboard →
            </button>
          </div>
          <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            Agroteknologi Management System
          </p>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: DASHBOARD UTAMA ---
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 font-sans animate-in fade-in duration-700">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-[#800020] mb-2 uppercase tracking-tighter">Dashboard Agrotek C</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pusat Informasi & Manajemen Kelas</p>
        </div>
        <button 
          onClick={() => setShowDashboard(false)}
          className="text-[10px] font-black text-slate-400 hover:text-[#800020] uppercase border-b border-transparent hover:border-[#800020] pb-1 transition-all"
        >
          ← Kembali Ke Sapaan
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {/* JADWAL KULIAH */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#800020]">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-4 border-b pb-2 tracking-widest">Jadwal Kuliah</h2>
            <ul className="space-y-4">
               <li className="flex flex-col border-b border-slate-50 pb-2">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase"><span>Senin</span> <span className="text-[#800020]">08.41 - 14.40</span></div>
                 <span className="text-[11px] font-bold text-slate-700 uppercase">Genetika & Pertanian Perkotaan</span>
               </li>
               <li className="flex flex-col border-b border-slate-50 pb-2">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase"><span>Selasa</span> <span className="text-[#800020]">08.41 - 10.21</span></div>
                 <span className="text-[11px] font-bold text-slate-700 uppercase">Dasar Budidaya Tanaman</span>
               </li>
               <li className="flex flex-col border-b border-slate-50 pb-2">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase"><span>Rabu</span> <span className="text-[#800020]">07.00 - 08.40</span></div>
                 <span className="text-[11px] font-bold text-slate-700 uppercase">Fisiologi Tanaman</span>
               </li>
               <li className="flex flex-col border-b border-slate-50 pb-2">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase"><span>Kamis</span> <span className="text-[#800020]">13.00 - 14.40</span></div>
                 <span className="text-[11px] font-bold text-slate-700 uppercase">Dasar Ilmu Tanah</span>
               </li>
               <li className="flex flex-col border-b border-slate-50 pb-2">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase"><span>Jumat</span> <span className="text-[#800020]">08.00 - 09.40</span></div>
                 <span className="text-[11px] font-bold text-slate-700 uppercase">Dasar Perlindungan Tanaman</span>
               </li>
            </ul>
          </div>

          {/* TOMBOL ABSENSI */}
          <button 
            onClick={handleGoToAbsensi}
            className="w-full flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border-b-8 border-[#800020] hover:bg-slate-50 transition-all active:scale-95 group border border-slate-100"
          >
            <div className="w-16 h-16 bg-red-50 text-[#800020] rounded-2xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">📝</div>
            <span className="font-black text-[#800020] text-lg uppercase tracking-tighter text-center">Absensi Mahasiswa</span>
            <p className="text-[9px] text-slate-400 font-black mt-2 uppercase tracking-[0.2em] italic text-center">Klik untuk masuk menu absen</p>
          </button>
        </div>

        {/* TUGAS & BEASISWA */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TUGAS PERKULIAHAN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#004d40]">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-6 border-b pb-2 tracking-widest">Informasi Tugas Perkuliahan</h2>
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
                    <a href={t.link_pengumpulan} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#004d40] text-white text-center py-2.5 rounded-xl text-[10px] font-black hover:bg-[#00332c] uppercase transition-all mt-2">Kumpulkan Tugas →</a>
                  )}
                </div>
              ))}
              {tugas.length === 0 && <div className="col-span-full py-10 text-center text-slate-400 font-bold italic text-xs uppercase tracking-widest">Belum ada tugas aktif.</div>}
            </div>
          </div>

          {/* KABAR BEASISWA & INFORMASI PUSAT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-orange-500">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-6 border-b pb-2 tracking-widest">Kabar Beasiswa & Pusat Informasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beasiswa.map((b, index) => {
                const deadlineDate = new Date(b.deadline);
                const today = new Date();
                const diffTime = deadlineDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={index} className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">{b.kategori}</span>
                        <span className={`text-[9px] font-black uppercase ${diffDays <= 7 && diffDays > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                          {diffDays > 0 ? (diffDays > 1000 ? 'Always Open' : `${diffDays} Hari Lagi`) : 'Ditutup'}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-800 text-sm uppercase leading-tight">{b.nama}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 mb-4">{b.instansi}</p>
                    </div>

                    <div className="space-y-2 mt-auto">
                      {/* LOGIKA CABANG: Jika Pusat Informasi (Ada link_univ) */}
                      {b.link_univ ? (
                        <div className="grid grid-cols-1 gap-2">
                          <a href={b.link_univ} target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-[#800020] border border-red-100 text-center py-2 rounded-xl text-[8px] font-black hover:bg-[#800020] hover:text-white transition-all uppercase">IG Universitas</a>
                          <a href={b.link_fakultas} target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-[#800020] border border-red-100 text-center py-2 rounded-xl text-[8px] font-black hover:bg-[#800020] hover:text-white transition-all uppercase">IG Fakultas</a>
                          <a href={b.link_prodi} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#800020] text-white text-center py-2 rounded-xl text-[8px] font-black hover:bg-black transition-all uppercase">IG Prodi Agrotek</a>
                        </div>
                      ) : (
                        /* Tombol Beasiswa Biasa */
                        <a href={b.link} target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-orange-600 border border-orange-200 text-center py-2 rounded-xl text-[9px] font-black hover:bg-orange-500 hover:text-white uppercase transition-all">Cek Detail Beasiswa</a>
                      )}
                    </div>
                  </div>
                );
              })}
              {beasiswa.length === 0 && <div className="col-span-full py-10 text-center text-slate-400 font-bold italic text-xs uppercase tracking-widest">Memuat informasi...</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}