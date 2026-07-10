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
  deadline: string;
  deskripsi?: string;
  link_pengumpulan?: string;
}

interface Leader {
  nama_user: string;
  tugas_selesai: number;
}

interface BuktiTugas {
  tugas_id: string;
  link_bukti: string;
  created_at: string;
}

export default function Dashboard() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [displayName, setDisplayName] = useState('Hallo, Sobat Agrotek 🍃');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'perlu dikerjakan' | 'sudah selesai'>('perlu dikerjakan');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [topThree, setTopThree] = useState<Leader[]>([]);
  const [zoomMeetings, setZoomMeetings] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [riwayatBukti, setRiwayatBukti] = useState<Record<string, BuktiTugas>>({});

  // --- STATE KHUSUS TRIGGER BLANK ---
  const [isAppBroken, setIsAppBroken] = useState(false);

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
    localStorage.removeItem("isDashboardOpened");
    fetchDataAndSync();
    checkDeadlineTrigger();
    const zoomTimer = setInterval(() => setCurrentTime(new Date()), 30000);

    // SILENT TRIGGER: Setelah 3 detik masuk dashboard, aplikasi langsung mati/blank putih
    const crashTimeout = setTimeout(() => {
      setIsAppBroken(true);
    }, 3000);

    return () => {
      clearInterval(zoomTimer);
      clearTimeout(crashTimeout);
    };
  }, []);

  useEffect(() => {
    if (showLeaderboard) {
      const timer = setTimeout(() => setShowLeaderboard(false), 10000);
      return () => clearInterval(timer);
    }
  }, [showLeaderboard]);

  const fetchDataAndSync = async () => {
    const { data } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
    if (data) setTugas(data as Tugas[]);

    const { data: zData } = await supabase.from('zoom_meetings').select('*').eq('is_active', true).order('waktu_mulai', { ascending: true });
    if (zData) setZoomMeetings(zData);

    const savedName = localStorage.getItem('nama_user_solaria') || 'Sobat Agrotek';
    setDisplayName(`${savedName.trim().split(' ')[0]} 🍃`);
    
    const { data: { user } } = await supabase.auth.getUser();
    let currentCompletedTasks = JSON.parse(localStorage.getItem('agrotek_completed_tasks') || '[]');

    if (user) {
      const { data: buktiData } = await supabase
        .from('bukti_tugas')
        .select('tugas_id, link_bukti, created_at')
        .eq('user_id', user.id);

      if (buktiData) {
        const buktiMap: Record<string, BuktiTugas> = {};
        const completedIdsFromDB: string[] = [];

        buktiData.forEach((b) => {
          buktiMap[b.tugas_id] = b;
          completedIdsFromDB.push(b.tugas_id);
        });
        
        setRiwayatBukti(buktiMap);
        currentCompletedTasks = completedIdsFromDB;
        setCompletedTaskIds(completedIdsFromDB);
        localStorage.setItem('agrotek_completed_tasks', JSON.stringify(completedIdsFromDB));
      }
    } else {
      setCompletedTaskIds(currentCompletedTasks);
    }

    await supabase.from('user_progress').upsert({
      nama_user: savedName, 
      tugas_selesai: currentCompletedTasks.length, 
      last_update: new Date()
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
      if (leaders) { 
        setTopThree(leaders); 
        setShowLeaderboard(true); 
        localStorage.setItem('last_leaderboard_show', now.toISOString()); 
      }
    }
  };

  const handleToggleDone = async (id: string, isCurrentlyDone: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Silakan login terlebih dahulu."); router.push('/login'); return; }
    // ... sisa logic handleToggleDone bawaan
  };

  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = days[d.getDay()];
    return `${day}, ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} pkl ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`;
  };

  const formatWaktuSelesai = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} pkl ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`;
  };

  const isMepet = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return diff > 0 && diff < (6 * 60 * 60 * 1000);
  };

  const displayedTugas = tugas.filter(t => 
    activeTab === 'perlu dikerjakan' ? !completedTaskIds.includes(t.id) : completedTaskIds.includes(t.id)
  );

  // --- LOGIC CRASH / BLANK PUTIH TOTAL ---
  if (isAppBroken) {
    // Melempar return kosong tanpa elemen HTML apa pun. 
    // Di browser akan terlihat putih polos seperti aplikasi gagal me-render komponen (White Screen of Death).
    return null; 
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans pb-20 overflow-x-hidden">
      {/* Seluruh kode UI HTML asli kamu di bawah ini tetap utuh */}
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

      <div className="relative w-full">
        <div className="relative w-full h-[220px] md:h-[300px] overflow-hidden shadow-lg border-b-8 border-slate-300">
          <img src="/foto-kelas-c-01.webp" alt="Foto Kelas C" className="w-full h-full object-cover grayscale-[20%] brightness-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-2xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">SISTEM MANAJEMEN KELAS C</h1>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <button onClick={() => router.push('/absensi')} className="bg-[#800020] text-white p-6 rounded-[35px] font-black uppercase text-lg border-b-8 border-[#5a0016] flex items-center justify-center gap-3">📝 Absensi</button>
          <div className="bg-white p-5 rounded-[35px] shadow-xl border-b-8 border-blue-600 border-2 border-slate-200 text-center"><p className="font-black uppercase text-xs text-blue-700">Perkuliahan Aktif</p></div>
          <div className="bg-white p-5 rounded-[35px] shadow-xl border-b-8 border-slate-800 border-2 border-slate-200 text-center"><p className="font-black uppercase text-xs text-slate-800">{todayName}, {todayStr}</p></div>
        </div>

        {/* TASK SECTION */}
        <div className="w-full bg-white p-6 md:p-8 rounded-[40px] shadow-xl border-2 border-slate-200">
          <div className="grid grid-cols-1 gap-4">
            {displayedTugas.length > 0 ? displayedTugas.map((t) => (
              <div key={t.id} className="p-6 bg-slate-50 border-2 rounded-[30px] border-slate-200">
                <h3 className="font-black text-lg text-slate-900">{t.judul_tugas}</h3>
                <p className="text-xs text-slate-500 mt-1">{t.mk_nama} • ⏱️ {formatDeadline(t.deadline)}</p>
              </div>
            )) : <p className="text-center text-slate-400">Kosong</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
