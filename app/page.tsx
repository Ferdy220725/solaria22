"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Lottie from "lottie-react";
import catAnimation from "../public/cat.json";

// --- INTERFACE ---
interface Tugas {
  id: string;
  judul_tugas: string;
  mk_nama: string;
  deadline: string; // ISO format
  deskripsi?: string;
  link_pengumpulan?: string;
}

interface Leader {
  nama_user: string;
  tugas_selesai: number;
}

export default function Dashboard() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayName, setDisplayName] = useState('Hallo, Sobat Agrotek 🍃');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'perlu dikerjakan' | 'sudah selesai'>('perlu dikerjakan');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [topThree, setTopThree] = useState<Leader[]>([]);

  // --- LOGIKA BARU: ZOOM STATE ---
  const [zoomMeetings, setZoomMeetings] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const supabase = createClient();
  const router = useRouter();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const todayName = days[today.getDay()];

  const rangeETS = { start: "2026-04-06", end: "2026-04-17" };
  const rangeEAS = { start: "2026-06-08", end: "2026-06-19" };
  const isETS = todayStr >= rangeETS.start && todayStr <= rangeETS.end;
  const isEAS = todayStr >= rangeEAS.start && todayStr <= rangeEAS.end;

  useEffect(() => {
    fetchDataAndSync();
    checkDeadlineTrigger();

    // Timer untuk update status tombol Zoom (Time-Lock)
    const zoomTimer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(zoomTimer);
  }, []);

  useEffect(() => {
    if (showLeaderboard) {
      const timer = setTimeout(() => { setShowLeaderboard(false); }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showLeaderboard]);

  const fetchDataAndSync = async () => {
    const { data } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
    if (data) setTugas(data as Tugas[]);

    // Ambil Data Zoom
    const { data: zData } = await supabase.from('zoom_meetings').select('*').eq('is_active', true).order('waktu_mulai', { ascending: true });
    if (zData) setZoomMeetings(zData);

    const savedName = localStorage.getItem('nama_user_solaria') || 'Hallo, Sobat Agrotek';
    setDisplayName(`${savedName.trim().split(' ')[0]} 🍃`);
    
    const savedCompleted = JSON.parse(localStorage.getItem('agrotek_completed_tasks') || '[]');
    setCompletedTaskIds(savedCompleted);

    await supabase.from('user_progress').upsert({
      nama_user: savedName, tugas_selesai: savedCompleted.length, last_update: new Date()
    }, { onConflict: 'nama_user' });
  };

  const checkDeadlineTrigger = async () => {
    const lastShowed = localStorage.getItem('last_leaderboard_show');
    const now = new Date();
    if (lastShowed && (now.getTime() - new Date(lastShowed).getTime()) / (1000 * 60 * 60) < 24) return;
    
    const isMomentOfTruth = tugas.some(t => {
      const diff = (now.getTime() - new Date(t.deadline).getTime()) / (1000 * 60);
      return diff > 0 && diff < 60;
    });

    if (isMomentOfTruth) {
      const { data: leaders } = await supabase.from('user_progress').select('nama_user, tugas_selesai').order('tugas_selesai', { ascending: false }).limit(3);
      if (leaders) { setTopThree(leaders); setShowLeaderboard(true); localStorage.setItem('last_leaderboard_show', now.toISOString()); }
    }
  };

  const handleToggleDone = async (id: string, isCurrentlyDone: boolean) => {
    const willBeDone = !isCurrentlyDone;
    const newCompleted = willBeDone
      ? [...completedTaskIds, id]
      : completedTaskIds.filter(tid => tid !== id);

    setCompletedTaskIds(newCompleted);
    localStorage.setItem('agrotek_completed_tasks', JSON.stringify(newCompleted));
    const rawName = localStorage.getItem('nama_user_solaria') || 'Sobat Agrotek';
    
    await supabase.from('user_progress').upsert({
      nama_user: rawName,
      tugas_selesai: newCompleted.length,
      last_update: new Date()
    }, { onConflict: 'nama_user' });

    if (willBeDone) {
      const { data: leaders } = await supabase.from('user_progress').select('nama_user, tugas_selesai').order('tugas_selesai', { ascending: false }).limit(3);
      if (leaders) { setTopThree(leaders); setShowLeaderboard(true); }
    }
  };

  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayName = days[d.getDay()];
    const date = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${dayName}, ${date}/${month}/${year} pukul ${hours}:${minutes} WIB`;
  };

  const isMepet = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return diff > 0 && diff < (6 * 60 * 60 * 1000);
  };

  const persentase = tugas.length > 0 ? (completedTaskIds.length / tugas.length) * 100 : 0;
  
  const getPlant = () => {
    if (persentase === 0) return { e: "🟫", t: "Lahan Kosong", c: "text-amber-900" };
    if (persentase >= 100) return { e: "🧺", t: "Siap Panen!", c: "text-orange-600" };
    if (persentase <= 30) return { e: "🌱", t: "Baru Tumbuh", c: "text-green-700" };
    if (persentase <= 70) return { e: "🌿", t: "Mulai Rimbun", c: "text-green-800" };
    return { e: "🌳", t: "Hampir Panen", c: "text-green-900" };
  };
  const plant = getPlant();

  const displayedTugas = tugas.filter(t => activeTab === 'perlu dikerjakan' ? !completedTaskIds.includes(t.id) : completedTaskIds.includes(t.id));

  if (!showDashboard) {
    return (
      <div className="h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center p-6">
        <div className="w-48 h-48 md:w-64 md:h-64 mb-2"><Lottie animationData={catAnimation} loop={true} /></div>
        <div className="text-center bg-white p-8 rounded-[35px] shadow-2xl border-b-[8px] border-[#800020] w-full max-w-sm border-2 border-slate-200">
          <h1 className="text-2xl font-black text-[#800020] uppercase leading-tight italic">HALLO, {displayName}</h1>
          <button onClick={() => setShowDashboard(true)} className="w-full mt-6 bg-[#800020] text-white py-4 rounded-xl font-black uppercase shadow-lg active:scale-95 transition-all">Buka Dashboard →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans pb-20 overflow-x-hidden">
      {showLeaderboard && (
        <div className="fixed inset-0 z-[999] bg-[#800020] flex items-center justify-center p-6 text-white animate-in fade-in duration-500">
          <div className="max-w-2xl w-full text-center">
            <h2 className="text-4xl md:text-7xl font-black mb-8 uppercase italic leading-none">THE HARVEST KINGS 👑</h2>
            <div className="grid grid-cols-1 gap-4">
              {topThree.map((user, i) => (
                <div key={i} className={`flex items-center justify-between p-6 rounded-[30px] border-b-8 ${i === 0 ? 'bg-orange-500 border-orange-700' : 'bg-white/10'}`}>
                  <div className="flex items-center gap-5">
                    <span className="text-4xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <p className="font-black text-xl uppercase">{user.nama_user}</p>
                  </div>
                  <span className="font-black text-2xl">{user.tugas_selesai}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(isETS || isEAS) && (
        <div className="sticky top-0 z-[60] bg-red-600 text-white py-3 border-b-4 border-yellow-400 text-center font-black uppercase text-xs md:text-sm tracking-widest shadow-xl px-4">
          🚨 MINGGU {isETS ? 'ETS' : 'EAS'} SEDANG BERLANGSUNG! SEMANGAT! 🚨
        </div>
      )}

      <div className={`p-4 md:p-10 max-w-7xl mx-auto transition-all ${showLeaderboard ? 'blur-2xl' : ''}`}>
        
        <div className="mb-10 flex flex-col items-center text-center border-b-4 border-slate-300 pb-8">
          <h1 className="text-3xl md:text-6xl font-black text-[#800020] uppercase leading-none italic mb-3 tracking-tighter">SISTEM MANAJEMEN KELAS C</h1>
          <p className="text-[11px] md:text-sm font-black text-slate-800 uppercase tracking-[0.2em] italic mb-1">Uni Terra Et Scienta Coniunguntur</p>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Dimana Bumi dan Ilmu Pengetahuan Bersatu</p>
          <div className="mt-6 bg-slate-800 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
            {todayName}, {todayStr}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border-t-[10px] border-green-800 text-center border-2 border-slate-200">
              <div className="text-8xl mb-4">{plant.e}</div>
              <h3 className={`font-black uppercase text-sm ${plant.c}`}>{plant.t}</h3>
              <div className="w-full bg-slate-100 h-4 rounded-full mt-6 border-slate-300 border-2 overflow-hidden">
                <div className="bg-green-700 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(21,128,61,0.5)]" style={{ width: `${persentase}%` }}></div>
              </div>
              <p className="text-[11px] font-black text-slate-700 mt-3 uppercase tracking-widest">{Math.round(persentase)}% Selesai</p>
            </div>

            {/* LIVE ZOOM SECTION (TAMBAHAN) */}
            {zoomMeetings.length > 0 && (
              <div className="bg-white p-6 rounded-[40px] shadow-xl border-l-[10px] border-blue-600 border-2 border-slate-200">
                <h3 className="font-black uppercase text-[10px] text-blue-600 mb-4 tracking-widest flex items-center gap-2">
                  <span className="animate-pulse">🔴</span> LIVE ZOOM CLASS
                </h3>
                <div className="space-y-4">
                  {zoomMeetings.map((zoom) => {
                    const start = new Date(zoom.waktu_mulai);
                    const isLocked = currentTime < start;
                    return (
                      <div key={zoom.id} className="p-4 bg-slate-50 rounded-3xl border-2 border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">{zoom.mk_nama || 'AGENDA'}</p>
                            <h4 className="font-black text-slate-800 text-sm uppercase leading-tight">{zoom.judul}</h4>
                          </div>
                          <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                            {start.getHours().toString().padStart(2,'0')}:{start.getMinutes().toString().padStart(2,'0')} WIB
                          </span>
                        </div>
                        {isLocked ? (
                          <div className="mt-3 p-3 bg-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase text-center border-2 border-dashed border-slate-300">
                            🔒 Terkunci s/d Jam {start.getHours().toString().padStart(2,'0')}:00
                          </div>
                        ) : (
                          <a href={zoom.link} target="_blank" rel="noopener noreferrer" className="block mt-3 p-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase text-center shadow-lg active:scale-95 transition-all">
                            🎥 Gabung Zoom Sekarang
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-[35px] shadow-xl border-l-[10px] border-[#800020] border-2 border-slate-200">
               <p className="text-[10px] font-black text-slate-400 uppercase italic mb-3">Status Akademik Saat Ini:</p>
               <div className={`p-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 border-2 shadow-inner ${isETS || isEAS ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                  <span className="text-xl">{isETS || isEAS ? '⚡' : '📖'}</span>
                  {isETS || isEAS ? 'Evaluasi Semester Aktif' : 'Masa Perkuliahan Aktif'}
               </div>
            </div>
            
            <button onClick={() => router.push('/absensi')} className="w-full bg-[#800020] text-white p-6 rounded-[35px] font-black uppercase text-2xl border-b-8 border-[#5a0016] italic active:scale-95 transition-all shadow-xl">📝 Isi Absensi</button>
            <button onClick={() => setShowDashboard(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-700 transition-colors">← Kembali ke Intro</button>
          </div>

          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[40px] shadow-xl border-t-[10px] border-[#004d40] border-2 border-slate-200">
            <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button onClick={() => setActiveTab('perlu dikerjakan')} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'perlu dikerjakan' ? 'bg-[#004d40] text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:bg-slate-200'}`}>Daftar Tugas</button>
              <button onClick={() => setActiveTab('sudah selesai')} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'sudah selesai' ? 'bg-green-800 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:bg-slate-200'}`}>Selesai</button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {displayedTugas.length > 0 ? displayedTugas.map((t) => {
                const isLewat = new Date().getTime() > new Date(t.deadline).getTime();
                
                return (
                <div key={t.id} className={`p-6 md:p-8 rounded-[35px] border-2 transition-all flex flex-col gap-4 ${isMepet(t.deadline) && activeTab === 'perlu dikerjakan' ? 'bg-red-50 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'bg-[#fdfdfd] border-slate-200 hover:border-[#004d40]'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <span className="px-3 py-1 bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg italic tracking-tighter">{t.mk_nama}</span>
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${isLewat && activeTab === 'perlu dikerjakan' ? 'text-red-600' : isMepet(t.deadline) && activeTab === 'perlu dikerjakan' ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
                      <span>⏱️ DEADLINE:</span>
                      <span>{formatDeadline(t.deadline)}</span>
                    </div>
                  </div>

                  {isLewat && activeTab === 'perlu dikerjakan' ? (
                    <div className="bg-red-700 text-white text-[9px] font-black py-1 px-3 rounded-md self-start uppercase tracking-widest">
                      WAKTU HABIS! AKSES DITUTUP
                    </div>
                  ) : isMepet(t.deadline) && activeTab === 'perlu dikerjakan' && (
                    <div className="bg-red-600 text-white text-[9px] font-black py-1 px-3 rounded-md self-start uppercase tracking-widest animate-bounce">
                      DEADLINE MEPET! SEGERA SELESAIKAN!
                    </div>
                  )}

                  <h3 className={`font-black text-2xl md:text-3xl uppercase leading-none tracking-tighter ${activeTab === 'sudah selesai' ? 'line-through text-slate-300' : 'text-slate-900'}`}>{t.judul_tugas}</h3>
                  
                  {t.deskripsi && (
                    <details className="group cursor-pointer">
                      <summary className="text-[10px] font-black text-[#004d40] uppercase tracking-widest list-none flex items-center gap-1 group-open:mb-3">
                        {activeTab === 'sudah selesai' ? '' : 'Baca Selengkapnya...'}
                      </summary>
                      <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-[13px] text-slate-700 font-medium leading-relaxed whitespace-pre-line">{t.deskripsi}</p>
                      </div>
                    </details>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    {t.link_pengumpulan && activeTab === 'perlu dikerjakan' && !isLewat && (
                      <a href={t.link_pengumpulan} target="_blank" rel="noopener noreferrer" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs text-center shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                        🚀 Kumpulkan Sekarang
                      </a>
                    )}
                    
                    {activeTab === 'perlu dikerjakan' ? (
                      isLewat ? (
                        <div className="flex-1 py-4 rounded-2xl font-black uppercase text-xs border-4 border-red-200 text-red-400 text-center bg-red-50 opacity-60 cursor-not-allowed">
                          ❌ Deadline Berakhir
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleDone(t.id, false)}
                          className="flex-1 py-4 rounded-2xl font-black uppercase text-xs border-4 border-green-700 text-green-800 hover:bg-green-50 active:scale-95 transition-all"
                        >
                          Selesai ✓
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleToggleDone(t.id, true)}
                        className="flex-1 py-4 rounded-2xl font-black uppercase text-xs border-4 border-slate-300 text-slate-400 hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        Batal Selesai
                      </button>
                    )}
                  </div>
                </div>
              )}) : (
                <div className="py-24 text-center">
                  <div className="text-6xl mb-4 grayscale opacity-30">📦</div>
                  <p className="text-slate-300 font-black uppercase italic text-2xl tracking-[0.2em]">Tidak Ada Tugas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}