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
  const [selectedTugas, setSelectedTugas] = useState<any>(null);
  const [showScholarships, setShowScholarships] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // --- LOGIKA WAKTU & KALENDER AKADEMIK ---
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const todayName = days[today.getDay()];

  // Data Rentang ETS & EAS (Sesuai Kalender UPN)
  const rangeETS = { start: "2026-04-06", end: "2026-04-17" };
  const rangeEAS = { start: "2026-06-08", end: "2026-06-19" };

  const isETS = (date: string) => date >= rangeETS.start && date <= rangeETS.end;
  const isEAS = (date: string) => date >= rangeEAS.start && date <= rangeEAS.end;

  const tanggalMerah = ["2026-04-03", "2026-04-05", "2026-05-01", "2026-05-14", "2026-05-19", "2026-06-01", "2026-06-17"];

  const jadwalKuliah: { [key: string]: string[] } = {
    "Senin": ["08.41 - 14.40: Genetika"],
    "Selasa": ["08.41 - 10.21: DBT"],
    "Rabu": ["07.00 - 08.40: Fistan"],
    "Kamis": ["13.00 - 14.40: DIT"],
    "Jumat": ["08.00 - 09.40: DPT"]
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: dataTugas } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
      if (dataTugas) setTugas(dataTugas);
      try {
        const response = await fetch('/scholarships.json');
        const dataBeasiswa = await response.json();
        setBeasiswa(dataBeasiswa);
      } catch (error) { console.error(error); }
    };
    fetchData();
    const savedName = localStorage.getItem('nama_user_solaria');
    if (savedName) setDisplayName(savedName.trim().split(' ')[0]);
  }, [supabase]);

  const isExpired = (deadline: string) => new Date() > new Date(deadline);

  const handleGoToAbsensi = async () => {
    const { data } = await supabase.from('status_sistem').select('is_active').eq('id', 'absensi').maybeSingle();
    if (data?.is_active) router.push('/absensi');
    else alert("Menu absensi ditutup.");
  };

  if (!showDashboard) {
    return (
      <div className="relative h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80"><Lottie animationData={catAnimation} loop={true} /></div>
        <div className="relative z-10 text-center px-6 -mt-10">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border-b-8 border-[#800020]">
            <h1 className="text-3xl md:text-5xl font-black text-[#800020] uppercase tracking-tighter leading-none mb-2">Hallo, <span className="text-orange-500">{displayName}</span></h1>
            <p className="text-lg md:text-xl font-bold text-slate-600">Dashboard Solaria Menantimu! 👋</p>
            <button onClick={() => setShowDashboard(true)} className="mt-8 bg-[#800020] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:scale-110 transition-all shadow-lg">Buka Dashboard →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 font-sans animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-[#800020] uppercase tracking-tighter leading-none">Dashboard Agrotek C</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-slate-200 inline-block px-4 py-1 rounded-full mt-2 italic">🗓️ {todayName}, {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => setShowDashboard(false)} className="text-[10px] font-black text-slate-400 hover:text-[#800020] uppercase border-b border-[#800020] transition-all">← Kembali</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SIDEBAR JADWAL CERDAS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border-t-8 border-[#800020]">
            <h2 className="text-xs font-black text-slate-800 uppercase mb-4 border-b pb-2 tracking-widest">Status Hari Ini</h2>
            
            {/* 1. NOTIFIKASI H-1 (Hanya muncul jika besok ETS/EAS) */}
            {!isETS(todayStr) && !isEAS(todayStr) && (
              <>
                {isETS(tomorrowStr) && (
                  <div className="mb-4 bg-yellow-100 p-4 rounded-2xl border-2 border-yellow-300 animate-pulse">
                    <p className="text-[10px] font-black text-yellow-800 uppercase">⚠️ PENGINGAT H-1</p>
                    <p className="text-[11px] font-bold text-yellow-700 mt-1">Besok mulai Minggu ETS. Persiapkan dirimu!</p>
                  </div>
                )}
                {isEAS(tomorrowStr) && (
                  <div className="mb-4 bg-red-100 p-4 rounded-2xl border-2 border-red-300 animate-pulse">
                    <p className="text-[10px] font-black text-red-800 uppercase">⚠️ PENGINGAT H-1</p>
                    <p className="text-[11px] font-bold text-red-700 mt-1">Besok mulai Minggu EAS. Jangan sampai telat!</p>
                  </div>
                )}
              </>
            )}

            {/* 2. TAMPILAN JADWAL DINAMIS */}
            {isETS(todayStr) || isEAS(todayStr) ? (
              <div className="py-6 text-center bg-red-50 rounded-2xl border-2 border-red-100">
                <span className="text-4xl block mb-2">📝</span>
                <p className="text-[12px] font-black text-red-700 uppercase">Minggu {isETS(todayStr) ? 'ETS' : 'EAS'} Aktif</p>
                <p className="text-[9px] font-bold text-red-400 uppercase mt-1 italic px-4 leading-tight">Jadwal Kuliah Biasa Diliburkan. Cek Jadwal Ujianmu!</p>
              </div>
            ) : todayName === "Sabtu" || todayName === "Minggu" || tanggalMerah.includes(todayStr) ? (
              <div className="py-6 text-center bg-orange-50 rounded-2xl border border-orange-100">
                <span className="text-4xl block mb-2">🏖️</span>
                <p className="text-[11px] font-black text-orange-700 uppercase italic">Libur / Akhir Pekan</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {jadwalKuliah[todayName]?.map((j, i) => (
                  <li key={i} className="bg-slate-50 p-4 rounded-2xl border-l-4 border-[#800020] font-black text-[12px] uppercase text-slate-800 shadow-sm">{j}</li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={handleGoToAbsensi} className="w-full p-8 bg-white rounded-[32px] shadow-sm border-b-8 border-[#800020] hover:scale-95 transition-all flex flex-col items-center border border-slate-100">
            <div className="text-3xl mb-4">📝</div>
            <span className="font-black text-[#800020] text-lg uppercase tracking-tighter">Absensi Mahasiswa</span>
          </button>
        </div>

        {/* MAIN AREA (Tugas & Beasiswa) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border-t-8 border-[#004d40]">
            <h2 className="text-xs font-black text-slate-800 uppercase mb-6 border-b pb-2 tracking-widest">Informasi Tugas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tugas.map((t) => {
                const telat = isExpired(t.deadline);
                return (
                  <div key={t.id} className={`p-5 rounded-2xl border flex flex-col h-full transition-all ${telat ? 'opacity-60 bg-slate-100 grayscale' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-2 text-[9px] font-black uppercase tracking-tighter">
                      <span className={`${telat ? 'bg-slate-400' : 'bg-[#004d40]'} text-white px-2 py-0.5 rounded`}>Tugas</span>
                      <span className="text-slate-400">{t.mk_nama}</span>
                    </div>
                    <p className="font-black text-slate-800 text-sm mb-1 uppercase leading-tight">{t.judul_tugas}</p>
                    <p className={`${telat ? 'text-slate-400' : 'text-red-600'} font-bold text-[9px] mb-3 uppercase`}>
                       {telat ? '⚠️ DEADLINE LEWAT' : `⏰ Deadline: ${new Date(t.deadline).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}`}
                    </p>
                    {t.deskripsi && (
                      <div className="mb-4">
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic mb-1">"{t.deskripsi}"</p>
                        <button onClick={() => setSelectedTugas(t)} className="text-[9px] font-black text-[#004d40] uppercase underline decoration-2">Detail</button>
                      </div>
                    )}
                    {t.link_pengumpulan && !telat ? (
                      <a href={t.link_pengumpulan} target="_blank" rel="noopener noreferrer" className="mt-auto block w-full bg-[#004d40] text-white text-center py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">Submit Tugas</a>
                    ) : (
                      <div className="mt-auto block w-full bg-slate-300 text-slate-500 text-center py-2.5 rounded-xl text-[10px] font-black uppercase cursor-not-allowed italic">Ditutup</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BEASISWA DROPDOWN (Rapi & Hemat Ruang) */}
          <div className="bg-white rounded-[32px] shadow-sm border-t-8 border-orange-500 overflow-hidden">
            <button 
              onClick={() => setShowScholarships(!showScholarships)}
              className="w-full p-6 flex items-center justify-between hover:bg-orange-50 transition-colors"
            >
              <div className="text-left">
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <span>🎓</span> Kabar Beasiswa Aktif
                </h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 italic">Klik untuk {showScholarships ? 'sembunyikan' : 'lihat info detail'}</p>
              </div>
              <span className={`text-xl transition-transform duration-300 ${showScholarships ? 'rotate-180' : 'rotate-0'}`}>▼</span>
            </button>

            {showScholarships && (
              <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  {beasiswa.length > 0 ? beasiswa.map((b, index) => (
                    <div key={index} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-800 text-[10px] uppercase truncate">{b.nama}</h3>
                        <p className="text-[8px] font-bold text-orange-600 uppercase tracking-widest italic">Info Baru</p>
                      </div>
                      <a href={b.link} target="_blank" rel="noopener noreferrer" className="bg-white text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-sm hover:bg-[#800020] hover:text-white transition-all shrink-0">Cek</a>
                    </div>
                  )) : <p className="text-center col-span-2 text-[10px] font-bold text-slate-400 py-4 italic uppercase">Belum ada info terbaru.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DETAIL TUGAS */}
      {selectedTugas && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl border-b-[12px] border-[#004d40] animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black bg-[#004d40] text-white px-3 py-1 rounded-full uppercase tracking-widest">Deskripsi</span>
                <button onClick={() => setSelectedTugas(null)} className="text-slate-300 hover:text-red-500 text-2xl font-black transition-colors">✕</button>
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase leading-tight mb-4">{selectedTugas.judul_tugas}</h2>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6 max-h-[250px] overflow-y-auto italic text-xs text-slate-600 leading-relaxed custom-scrollbar">
                {selectedTugas.deskripsi}
              </div>
              <button onClick={() => setSelectedTugas(null)} className="w-full bg-[#004d40] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Tutup Detail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}