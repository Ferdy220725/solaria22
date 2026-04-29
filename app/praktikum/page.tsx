"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';

export default function PraktikumPage() {
  const [activeTab, setActiveTab] = useState('FISTAN');
  const [tugas, setTugas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const praktikumList = ['FISTAN', 'DBT', 'DPT', 'DIT'];

  // --- LOGIKA BARU: DETEKSI LINK OTOMATIS ---
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
            className="text-blue-600 hover:underline break-all font-bold"
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

  const renderGolongan = (golonganName: string) => {
    const filtered = tugas.filter(t =>
      t.golongan && t.golongan.trim().toUpperCase() === golonganName.toUpperCase()
    );
    
    return (
      <div key={golonganName} className="bg-white p-8 rounded-[35px] shadow-sm border-t-[8px] border-[#800020] flex flex-col h-full hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
          <h3 className="font-black text-xl text-[#800020] uppercase tracking-tighter">Golongan {golonganName}</h3>
          <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-400 uppercase font-black italic">{activeTab}</span>
        </div>
        
        <div className="space-y-4 flex-grow">
          {filtered.length > 0 ? (
            filtered.map(t => (
              <div key={t.id} className="p-5 bg-slate-50 rounded-[25px] border border-slate-100 hover:border-[#D4AF37] transition-all group">
                <p className="font-black text-slate-800 text-sm mb-2 group-hover:text-[#800020] transition-colors uppercase leading-tight">
                  {t.judul_tugas}
                </p>
                
                {/* LOGIKA BARU DIAPLIKASIKAN DI SINI */}
                <p className="text-[11px] font-medium text-slate-500 mb-4 leading-relaxed whitespace-pre-wrap">
                  {renderTextWithLinks(t.deskripsi)}
                </p>
                
                <div className="flex items-center gap-2 text-red-600 font-black text-[10px] mb-4 bg-red-50 p-2 rounded-xl w-fit uppercase tracking-tighter">
                  <span>⏰ Deadline:</span>
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
                    className="block text-center bg-[#D4AF37] text-white py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-black shadow-sm active:scale-95 transition-all tracking-widest"
                  >
                    Kumpulkan Tugas →
                  </a>
                ) : (
                  <div className="text-center text-[10px] font-black text-slate-400 uppercase py-3 border-2 border-dashed border-slate-200 rounded-2xl italic">
                    Link Belum Tersedia
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 opacity-30">
              <span className="text-5xl mb-3">☕</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-center leading-loose">Belum ada tugas<br/>untuk golongan ini.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-5xl font-black text-[#800020] mb-2 uppercase tracking-tighter">Info Praktikum</h1>
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] italic">Monitoring tugas praktikum per-golongan secara real-time.</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {praktikumList.map(mk => (
          <button
            key={mk}
            onClick={() => setActiveTab(mk)}
            className={`px-12 py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all border-b-4 ${
              activeTab === mk
              ? 'bg-[#800020] text-white border-red-900 shadow-xl shadow-red-900/10 -translate-y-1'
              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600 shadow-sm'
            }`}
          >
            {mk}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-12 h-12 border-[6px] border-slate-200 border-t-[#800020] rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Menghubungkan ke Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {getGolonganList(activeTab).map(gol => renderGolongan(gol))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-24 pb-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
        &copy; 2026 AgrotekC Class Management System
      </div>
    </div>
  );
}