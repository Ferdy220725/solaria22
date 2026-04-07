"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Lottie from "lottie-react";
import catAnimation from "../public/cat.json";

// Interface untuk TypeScript
interface Tugas {
  id: string;
  judul_tugas: string;
  mk_nama: string;
  deadline: string;
  deskripsi?: string;
  link_pengumpulan?: string;
}

interface Beasiswa {
  nama: string;
  link: string;
}

export default function Dashboard() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [beasiswa, setBeasiswa] = useState<Beasiswa[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayName, setDisplayName] = useState('Sobat Agrotek 🍃');
  const [selectedTugas, setSelectedTugas] = useState<Tugas | null>(null);
  const [showScholarships, setShowScholarships] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // --- LOGIKA WAKTU & KALENDER ---
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const todayName = days[today.getDay()];

  const rangeETS = { start: "2026-04-06", end: "2026-04-17" };
  const rangeEAS = { start: "2026-06-08", end: "2026-06-19" };

  const isETS = (date: string) => date >= rangeETS.start && date <= rangeETS.end;
  const isEAS = (date: string) => date >= rangeEAS.start && date <= rangeEAS.end;

  const tanggalMerah = ["2026-04-03", "2026-04-05", "2026-05-01", "2026-05-14", "2026-05-19", "2026-06-01", "2026-06-17"];

  const jadwalKuliah: Record<string, string[]> = {
    "Senin": ["08.41 - 14.40: Genetika"],
    "Selasa": ["08.41 - 10.21: DBT"],
    "Rabu": ["07.00 - 08.40: Fistan"],
    "Kamis": ["13.00 - 14.40: DIT"],
    "Jumat": ["08.00 - 09.40: DPT"]
  };

  // --- FUNGSI DAFTAR PUSH NOTIFICATION (LOGIKA UTAMA) ---
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // PUBLIC KEY MILIKMU SUDAH TERPASANG DI SINI
      const publicKey = 'BMUls0yOcxb9iZuOls3Ko-n00ZiRXLX11_4LD3wv3Brbhj1LTmrsBHBineXervnU4Xkl3CCVIDDGhpb6SBqUNv4'; 
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      console.log("--- ALAMAT NOTIF USER (TOKEN) ---");
      console.log(JSON.stringify(subscription));
      console.log("---------------------------------");
      
      // Langkah berikutnya nanti: simpan JSON ini ke tabel Supabase 'user_subscriptions'
    } catch (error) {
      console.error("Gagal ambil izin push:", error);
    }
  };

  useEffect(() => {
    // 1. REGISTRASI SERVICE WORKER OTOMATIS
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('SW Berhasil Daftar!', reg.scope);
          // 2. MINTA IZIN NOTIFIKASI
          if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') subscribeToPush();
            });
          } else if (Notification.permission === 'granted') {
            subscribeToPush();
          }
        })
        .catch((err) => console.error('SW Gagal Daftar:', err));
    }

    const fetchData = async () => {
      const { data: dataTugas } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
      if (dataTugas) setTugas(dataTugas as Tugas[]);
      
      try {
        const response = await fetch('/scholarships.json');
        if (response.ok) {
          const dataBeasiswa = await response.json();
          setBeasiswa(dataBeasiswa);
        }
      } catch (error) { 
        console.error("Gagal load beasiswa:", error); 
      }
    };
    fetchData();
    const savedName = localStorage.getItem('nama_user_solaria');
    if (savedName) setDisplayName(savedName.trim().split(' ')[0]);
  }, [supabase]);

  const isExpired = (deadline: string) => new Date() > new Date(deadline);

  const handleGoToAbsensi = async () => {
    const { data } = await supabase.from('status_sistem').select('is_active').eq('id', 'absensi').maybeSingle();
    if (data?.is_active) {
      router.push('/absensi');
    } else {
      alert("MAAF! Menu absensi saat ini sedang ditutup.");
    }
  };

  // --- TAMPILAN AWAL (SAPAAN) ---
  if (!showDashboard) {
    return (
      <div className="relative h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80">
          <Lottie animationData={catAnimation} loop={true} />
        </div>
        <div className="relative z-10 text-center px-6 -mt-10">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border-b-8 border-[#800020]">
            <h1 className="text-3xl md:text-5xl font-black text-[#800020] uppercase tracking-tighter mb-2">
              Hallo, <span className="text-orange-500">{displayName}</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-slate-600">Apa kabar hari ini? 👋</p>
            <button onClick={() => setShowDashboard(true)} className="mt-8 bg-[#800020] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition-all shadow-lg">Masuk Dashboard →</button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN DASHBOARD UTAMA ---
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 font-sans">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#800020] uppercase tracking-tighter leading-none">Agrotek Dashboard</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-slate-200 inline-block px-3 py-1 rounded-full mt-2 italic">
            🗓️ {todayName}, {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowDashboard(false)} className="text-[10px] font-black text-slate-400 hover:text-[#800020] uppercase border-b border-transparent hover:border-[#800020] pb-1 transition-all italic">← Sapaan Kembali</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: JADWAL & ABSENSI */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-[#800020]">
            <h2 className="text-xs font-black text-slate-800 uppercase mb-4 border-b pb-2 tracking-widest italic">Status Jadwal</h2>
            
            {/* Logika ETS/EAS */}
            {!isETS(todayStr) && !isEAS(todayStr) && (
              <>
                {isETS(tomorrowStr) && (
                  <div className="mb-4 bg-yellow-100 p-4 rounded-2xl border-2 border-yellow-300 animate-pulse text-center">
                    <p className="text-[10px] font-black text-yellow-800 uppercase">⚠️ BESOK ETS DIMULAI</p>
                  </div>
                )}
                {isEAS(tomorrowStr) && (
                  <div className="mb-4 bg-red-100 p-4 rounded-2xl border-2 border-red-300 animate-pulse text-center">
                    <p className="text-[10px] font-black text-red-800 uppercase">⚠️ BESOK EAS DIMULAI</p>
                  </div>
                )}
              </>
            )}

            {isETS(todayStr) || isEAS(todayStr) ? (
              <div className="py-6 text-center bg-red-50 rounded-2xl border-2 border-red-100">
                <span className="text-4xl block mb-2">📝</span>
                <p className="text-[11px] font-black text-red-700 uppercase leading-tight">Minggu {isETS(todayStr) ? 'ETS' : 'EAS'} Sedang Berlangsung</p>
              </div>
            ) : todayName === "Sabtu" || todayName === "Minggu" || tanggalMerah.includes(todayStr) ? (
              <div className="py-6 text-center bg-orange-50 rounded-2xl border border-orange-100">
                <span className="text-3xl block mb-2">🏖️</span>
                <p className="text-[10px] font-black text-orange-700 uppercase italic">Libur Pekan</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {jadwalKuliah[todayName]?.map((j, i) => (
                  <li key={i} className="bg-slate-50 p-4 rounded-2xl border-l-4 border-[#800020] font-black text-[11px] uppercase text-slate-800">{j}</li>
                )) || <li className="text-[10px] font-bold text-slate-400 text-center py-4 uppercase italic">Tidak ada jadwal</li>}
              </ul>
            )}
          </div>

          <button onClick={handleGoToAbsensi} className="w-full p-8 bg-white rounded-3xl shadow-sm border-b-8 border-[#800020] hover:bg-slate-50 transition-all flex flex-col items-center border border-slate-100">
            <div className="text-3xl mb-4">📝</div>
            <span className="font-black text-[#800020] text-lg uppercase tracking-tighter">Absensi Online</span>
          </button>
        </div>

        {/* KOLOM TENGAH & KANAN: TUGAS & BEASISWA */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-[#004d40]">
            <h2 className="text-xs font-black text-slate-800 uppercase mb-6 border-b pb-2 tracking-widest">Informasi Tugas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tugas.map((t) => {
                const telat = isExpired(t.deadline);
                return (
                  <div key={t.id} className={`p-5 rounded-2xl border flex flex-col h-full transition-all ${telat ? 'opacity-60 bg-slate-100 grayscale' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-2 text-[9px] font-black uppercase">
                      <span className={`${telat ? 'bg-slate-400' : 'bg-[#004d40]'} text-white px-2 py-0.5 rounded`}>Tugas</span>
                      <span className="text-slate-400 truncate ml-2">{t.mk_nama}</span>
                    </div>
                    <p className="font-black text-slate-800 text-sm mb-1 uppercase leading-tight">{t.judul_tugas}</p>
                    <p className={`${telat ? 'text-slate-400' : 'text-red-600'} font-bold text-[9px] mb-3 uppercase`}>
                      {telat ? '⚠️ DEADLINE LEWAT' : `⏰ Deadline: ${new Date(t.deadline).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}`}
                    </p>
                    {t.deskripsi && (
                      <button onClick={() => setSelectedTugas(t)} className="mb-4 text-left group">
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic mb-1">"{t.deskripsi}"</p>
                        <span className="text-[9px] font-black text-[#004d40] uppercase underline group-hover:text-black">Detail</span>
                      </button>
                    )}
                    {t.link_pengumpulan && !telat ? (
                      <a href={t.link_pengumpulan} target="_blank" rel="noopener noreferrer" className="mt-auto block w-full bg-[#004d40] text-white text-center py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">Submit</a>
                    ) : (
                      <div className="mt-auto block w-full bg-slate-300 text-slate-500 text-center py-2.5 rounded-xl text-[10px] font-black uppercase cursor-not-allowed">Ditutup</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION BEASISWA */}
          <div className="bg-white rounded-3xl shadow-sm border-t-8 border-orange-500 overflow-hidden">
            <button 
              onClick={() => setShowScholarships(!showScholarships)}
              className="w-full p-6 flex items-center justify-between hover:bg-orange-50 transition-all"
            >
              <div className="text-left">
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <span>🎓</span> Kabar Beasiswa
                </h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 italic">Klik untuk {showScholarships ? 'tutup' : 'buka detail'}</p>
              </div>
              <span className={`text-xl transition-transform duration-300 ${showScholarships ? 'rotate-180' : 'rotate-0'}`}>▼</span>
            </button>

            {showScholarships && (
              <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  {beasiswa.map((b, idx) => (
                    <div key={idx} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-between gap-2 group">
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-800 text-[10px] uppercase truncate">{b.nama}</h3>
                        <p className="text-[8px] font-bold text-orange-600 uppercase">Peluang Aktif</p>
                      </div>
                      <a href={b.link} target="_blank" rel="noopener noreferrer" className="bg-white text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-sm hover:bg-[#800020] hover:text-white transition-all shrink-0">Cek</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DETAIL TUGAS */}
      {selectedTugas && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl border-b-[12px] border-[#004d40]">
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-black bg-[#004d40] text-white px-3 py-1 rounded-full uppercase tracking-widest">Detail Tugas</span>
                <button onClick={() => setSelectedTugas(null)} className="text-slate-300 hover:text-red-500 font-black">✕ CLOSE</button>
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase leading-tight mb-4">{selectedTugas.judul_tugas}</h2>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6 max-h-[200px] overflow-y-auto text-xs text-slate-600 italic">
                {selectedTugas.deskripsi}
              </div>
              <button onClick={() => setSelectedTugas(null)} className="w-full bg-[#004d40] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Selesai Membaca</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}