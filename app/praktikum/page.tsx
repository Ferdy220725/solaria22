"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import {
  FlaskConical,
  Users,
  Clock,
  ExternalLink,
  PackageOpen,
  Loader2,
} from 'lucide-react';

export default function PraktikumPage() {
  const [activeTab, setActiveTab] = useState('FISTAN');
  const [tugas, setTugas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const praktikumList = ['FISTAN', 'DBT', 'DPT', 'DIT'];

  // --- LOGIKA: DETEKSI LINK OTOMATIS ---
  // Fungsi ini memproses teks deskripsi agar URL menjadi komponen <a> yang bisa diklik
  const renderTextWithLinks = (text: string) => {
    if (!text) return "Tidak ada deskripsi tugas.";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
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

  useEffect(() => {
    const fetchTugas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tugas_praktikum')
        .select('*')
        .eq('mk_nama', activeTab)
        .order('deadline', { ascending: true });

      if (error) {
        console.error("Error fetching:", error);
      } else {
        setTugas(data || []);
      }
      setLoading(false);
    };
    fetchTugas();
  }, [activeTab]);

  const getGolonganList = (mk: string) => {
    if (mk === 'DIT') return ['B1', 'B3', 'C3'];
    return ['C1', 'C2', 'C3'];
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
        className="bg-white dark:bg-[#141414] rounded-[28px] p-6 shadow-sm border border-slate-100 dark:border-white/10 flex flex-col h-full"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <Users size={18} />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Golongan {golonganName}
            </h3>
          </div>
          <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-1 rounded-lg shrink-0">
            {activeTab}
          </span>
        </div>

        <div className="space-y-3 flex-grow">
          {filtered.length > 0 ? (
            filtered.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border transition-all ${
                  isMepet(t.deadline)
                    ? 'border-red-300 dark:border-red-500/30'
                    : 'border-slate-100 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30'
                }`}
              >
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2 leading-tight">
                  {t.judul_tugas}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed whitespace-pre-wrap">
                  {renderTextWithLinks(t.deskripsi)}
                </p>

                <div className={`flex items-center gap-2 font-black text-[10px] mb-4 px-2.5 py-1.5 rounded-xl w-fit uppercase ${
                  isMepet(t.deadline)
                    ? 'text-red-600 bg-red-50 dark:bg-red-500/10 animate-pulse'
                    : 'text-red-600 bg-red-50 dark:bg-red-500/10'
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
                  <a
                    href={t.link_pengumpulan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-indigo-700 active:scale-95 transition-all tracking-wide"
                  >
                    Kumpulkan Tugas <ExternalLink size={12} />
                  </a>
                ) : (
                  <div className="text-center text-[10px] font-black text-slate-400 uppercase py-2.5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                    Link Belum Tersedia
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <PackageOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
              <p className="text-xs text-slate-400 font-medium">Belum ada tugas untuk golongan ini.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] font-sans">
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">

        {/* BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[28px] p-6 md:p-10 text-white shadow-xl mb-6">
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-medium text-indigo-100 mb-1">🧪 Praktikum</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">Info Praktikum</h1>
            <p className="text-sm text-indigo-100">
              Monitoring tugas praktikum per-golongan secara real-time.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute right-6 top-6 w-10 h-10 bg-white/15 rounded-2xl hidden md:flex items-center justify-center">
            <FlaskConical size={18} />
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 mb-6 p-1.5 bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 overflow-x-auto no-scrollbar">
          {praktikumList.map(mk => (
            <button
              key={mk}
              onClick={() => setActiveTab(mk)}
              className={`flex-1 min-w-[90px] py-3 rounded-xl text-xs font-black uppercase transition-all ${
                activeTab === mk
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {mk}
            </button>
          ))}
        </div>

        {/* GRID CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white dark:bg-[#141414] rounded-[28px] shadow-sm border border-slate-100 dark:border-white/10">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">
              Menghubungkan ke database...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {getGolonganList(activeTab).map(gol => renderGolongan(gol))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-10 pb-6 text-center text-slate-300 dark:text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em]">
          &copy; 2026 AgrotekC Class Management System
        </div>
      </div>
    </div>
  );
}