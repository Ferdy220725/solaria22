"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  FlaskConical,
  Clock,
  ArrowUpRight,
  PackageOpen,
  Coffee,
} from 'lucide-react';

export default function PraktikumPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [allTugas, setAllTugas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [tugas, setTugas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // --- LOGIKA DETEKSI LINK OTOMATIS ---
  const renderTextWithLinks = (text: string) => {
    if (!text) return "Tidak ada deskripsi tugas.";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          
           <a key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline break-all font-bold"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Auth guard: RLS tugas_praktikum butuh login buat resolve kelas_id
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
        return;
      }
      setCheckingSession(false);
    });
  }, []);

  // Ambil semua tugas praktikum kelas sendiri (RLS otomatis nyaring per kelas_id)
  useEffect(() => {
    if (checkingSession) return;

    const fetchAllTugas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tugas_praktikum')
        .select('*')
        .order('deadline', { ascending: true });

      if (error) {
        console.error("Error fetching:", error);
      } else {
        setAllTugas(data || []);
        const mkTersedia = Array.from(new Set((data || []).map((t: any) => t.mk_nama))).filter(Boolean) as string[];
        if (mkTersedia.length > 0) setActiveTab((prev) => prev || mkTersedia[0]);
      }
      setLoading(false);
    };
    fetchAllTugas();
  }, [checkingSession]);

  const praktikumList = Array.from(new Set(allTugas.map((t) => t.mk_nama))).filter(Boolean) as string[];

  useEffect(() => {
    setTugas(allTugas.filter((t) => t.mk_nama === activeTab));
  }, [activeTab, allTugas]);

  const getGolonganList = (mk: string) => {
    return Array.from(
      new Set(
        allTugas
          .filter((t) => t.mk_nama === mk && t.golongan)
          .map((t) => t.golongan.trim().toUpperCase())
      )
    ).sort();
  };

  const isMepet = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return diff > 0 && diff < (6 * 60 * 60 * 1000);
  };

  const renderGolongan = (golonganName: string) => {
    const filtered = tugas.filter(t =>
      t.golongan && t.golongan.trim().toUpperCase() === golonganName.toUpperCase()
    );

    return (
      <div
        key={golonganName}
        className="bg-white dark:bg-[#141414] p-6 rounded-[28px] shadow-sm border border-slate-100 dark:border-white/10 flex flex-col h-full"
      >
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <FlaskConical size={16} />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
              Golongan {golonganName}
            </h3>
          </div>
          <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-1 rounded-lg">
            {activeTab}
          </span>
        </div>

        <div className="space-y-3 flex-grow">
          {filtered.length > 0 ? (
            filtered.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border transition-all ${
                  isMepet(t.deadline) ? 'border-red-300 dark:border-red-500/30' : 'border-slate-100 dark:border-white/10'
                }`}
              >
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2 leading-tight">
                  {t.judul_tugas}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 leading-relaxed whitespace-pre-wrap">
                  {renderTextWithLinks(t.deskripsi)}
                </p>

                <div className={`flex items-center gap-1.5 text-[10px] font-black mb-3 px-2.5 py-1.5 rounded-xl w-fit uppercase tracking-wide ${
                  isMepet(t.deadline)
                    ? 'text-red-600 bg-red-50 dark:bg-red-500/10 animate-pulse'
                    : 'text-slate-500 bg-slate-100 dark:bg-white/10 dark:text-slate-300'
                }`}>
                  <Clock size={12} />
                  <span>
                    {new Date(t.deadline).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>

                {t.link_pengumpulan ? (
                  
                   <a href={t.link_pengumpulan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                  >
                    Kumpulkan Tugas <ArrowUpRight size={12} />
                  </a>
                ) : (
                  <div className="text-center text-[10px] font-black text-slate-400 uppercase py-2.5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl italic">
                    Link Belum Tersedia
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-14 opacity-40">
              <Coffee size={40} className="mb-3 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center leading-loose text-slate-400">
                Belum ada tugas<br />untuk golongan ini.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb] dark:bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] font-sans">
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">

        {/* HEADER BANNER — selaras dengan welcome banner Dashboard */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[28px] p-6 md:p-10 text-white shadow-xl mb-6">
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-medium text-indigo-100 mb-1 flex items-center gap-2">
              <FlaskConical size={16} /> Info Praktikum
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">Tugas Praktikum</h1>
            <p className="text-sm text-indigo-100">
              Monitoring tugas praktikum per-golongan secara real-time.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* TAB NAVIGATION */}
        {praktikumList.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {praktikumList.map(mk => (
              <button
                key={mk}
                onClick={() => setActiveTab(mk)}
                className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all shrink-0 ${
                  activeTab === mk
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-[#141414] text-slate-400 border border-slate-100 dark:border-white/10 hover:text-slate-600'
                }`}
              >
                {mk}
              </button>
            ))}
          </div>
        )}

        {/* GRID CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-5">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
              Menghubungkan ke Database...
            </p>
          </div>
        ) : praktikumList.length === 0 ? (
          <div className="bg-white dark:bg-[#141414] rounded-[28px] shadow-sm border border-slate-100 dark:border-white/10 py-24 flex flex-col items-center justify-center">
            <PackageOpen className="text-slate-300 mb-3" size={44} />
            <p className="text-sm text-slate-400 font-medium">Belum ada tugas praktikum untuk kelasmu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {getGolonganList(activeTab).map(gol => renderGolongan(gol))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-16 pb-6 text-center text-slate-300 dark:text-white/10 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; 2026 AgrotekC Class Management System
        </div>
      </div>
    </div>
  );
}