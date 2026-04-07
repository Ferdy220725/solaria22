"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Lottie from "lottie-react";
import catAnimation from "../public/cat.json";

interface Tugas {
  id: string;
  judul_tugas: string;
  mk_nama: string;
  deadline: string;
  deskripsi?: string;
  link_pengumpulan?: string;
}

export default function Dashboard() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayName, setDisplayName] = useState('Sobat Agrotek 🍃');
  const [selectedTugas, setSelectedTugas] = useState<Tugas | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayName = days[today.getDay()];

  const rangeETS = { start: "2026-04-06", end: "2026-04-17" };
  const isETS = todayStr >= rangeETS.start && todayStr <= rangeETS.end;

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('tugas_perkuliahan')
        .select('*')
        .order('deadline', { ascending: true });
      if (data) setTugas(data as Tugas[]);
    };
    fetchData();

    const savedName = localStorage.getItem('nama_user_solaria');
    if (savedName) setDisplayName(savedName.trim().split(' ')[0]);
  }, [supabase]);

  const handleGoToAbsensi = () => router.push('/absensi');

  if (!showDashboard) {
    return (
      <div className="h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center font-sans">
        <div className="w-64 h-64 md:w-80 md:h-80 mb-6">
          <Lottie animationData={catAnimation} loop={true} />
        </div>
        <div className="text-center bg-white p-10 rounded-[40px] shadow-xl border-b-[10px] border-[#800020]">
          <h1 className="text-4xl md:text-6xl font-black text-[#800020] uppercase tracking-tighter mb-2">
            HALLO, <span className="text-orange-500">{displayName}</span>
          </h1>
          <p className="text-xl font-bold text-slate-500 mb-8">Apa kabar hari ini? 👋</p>
          <button 
            onClick={() => setShowDashboard(true)} 
            className="bg-[#800020] text-white px-12 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-all shadow-lg"
          >
            Masuk Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-[#800020] uppercase tracking-tighter">Agrotek Dashboard</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            🗓️ {todayName}, {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowDashboard(false)} className="text-[10px] font-black text-slate-400 hover:text-[#800020] uppercase border-b border-slate-200 pb-1">
          ← Sapaan Kembali
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[35px] shadow-sm border-t-[8px] border-[#800020]">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 italic">Status Akademik</h2>
            {isETS ? (
              <div className="py-10 text-center bg-red-50 rounded-3xl border-2 border-red-100">
                <span className="text-5xl block mb-4">📝</span>
                <p className="font-black text-red-700 uppercase leading-tight">Minggu ETS Berlangsung</p>
              </div>
            ) : (
              <div className="py-10 text-center bg-green-50 rounded-3xl border border-green-100">
                <span className="text-5xl block mb-4">🌿</span>
                <p className="font-black text-green-700 uppercase text-xs">Perkuliahan Aktif</p>
              </div>
            )}
          </div>

          <button onClick={handleGoToAbsensi} className="w-full bg-white p-10 rounded-[35px] shadow-sm border-b-[8px] border-[#800020] hover:bg-slate-50 transition-all flex flex-col items-center group">
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📝</span>
            <span className="font-black text-[#800020] text-2xl uppercase tracking-tighter">Absensi Online</span>
          </button>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[35px] shadow-sm border-t-[8px] border-[#004d40]">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 italic">Daftar Tugas Perkuliahan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tugas.length > 0 ? (
              tugas.map((t) => {
                const telat = new Date() > new Date(t.deadline);
                return (
                  <div key={t.id} className={`p-6 rounded-3xl border ${telat ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${telat ? 'bg-slate-300 text-white' : 'bg-[#004d40] text-white'}`}>Tugas</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[100px]">{t.mk_nama}</span>
                    </div>
                    <h3 className={`font-black text-lg leading-tight mb-2 uppercase ${telat ? 'text-slate-400' : 'text-slate-800'}`}>{t.judul_tugas}</h3>
                    <p className={`font-bold text-[10px] mb-4 uppercase ${telat ? 'text-slate-300' : 'text-red-500'}`}>
                      {telat ? '⚠️ Deadline Lewat' : `⏰ ${new Date(t.deadline).toLocaleString('id-ID')}`}
                    </p>
                    {t.deskripsi && (
                      <button onClick={() => setSelectedTugas(t)} className="text-[10px] font-black text-[#004d40] uppercase underline mb-4 block">Detail Deskripsi</button>
                    )}
                    {t.link_pengumpulan && !telat ? (
                      <a href={t.link_pengumpulan} target="_blank" className="block w-full bg-[#004d40] text-white text-center py-3 rounded-2xl font-black uppercase text-[10px] hover:bg-black transition-all">Kumpulkan Tugas</a>
                    ) : (
                      <div className="w-full bg-slate-200 text-slate-400 text-center py-3 rounded-2xl font-black uppercase text-[10px] cursor-not-allowed">Sudah Ditutup</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-10 text-center text-slate-400 italic font-bold uppercase text-xs">
                Belum ada data tugas tersedia.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 border-b-[12px] border-[#004d40]">
            <h2 className="text-2xl font-black text-slate-800 uppercase mb-4">{selectedTugas.judul_tugas}</h2>
            <div className="bg-slate-50 p-6 rounded-3xl text-sm italic text-slate-600 mb-8 border border-slate-100">
              {selectedTugas.deskripsi || "Tidak ada deskripsi tambahan."}
            </div>
            <button onClick={() => setSelectedTugas(null)} className="w-full bg-[#004d40] text-white py-4 rounded-2xl font-black uppercase">Tutup Detail</button>
          </div>
        </div>
      )}
    </div>
  );
}