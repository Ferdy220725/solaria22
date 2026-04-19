"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { BookOpen, Info, Clock, ExternalLink } from 'lucide-react';

export default function PraktikumPage() {
  const [activeTab, setActiveTab] = useState('FISTAN');
  const [tugas, setTugas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const praktikumList = ['FISTAN', 'DBT', 'DPT', 'DIT'];

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
      <div key={golonganName} className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-zinc-100 flex flex-col h-full hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 group">
        <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-zinc-50 pb-6">
          <div>
            <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1">Section</p>
            <h3 className="font-serif italic text-xl md:text-2xl text-black leading-none">Golongan {golonganName}</h3>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-[#D4AF37] transition-all">
            <BookOpen size={18} />
          </div>
        </div>
        
        <div className="space-y-4 md:space-y-5 flex-grow">
          {filtered.length > 0 ? (
            filtered.map(t => (
              <div key={t.id} className="p-5 md:p-6 bg-zinc-50 rounded-[30px] border border-transparent hover:border-zinc-200 hover:bg-white transition-all duration-300">
                <h4 className="font-bold text-zinc-800 text-[12px] md:text-[13px] mb-2 uppercase tracking-tight leading-snug">
                  {t.judul_tugas}
                </h4>
                
                <div className="flex items-center gap-2 text-rose-600 font-bold text-[9px] mb-4 md:mb-5 bg-rose-50 px-3 py-1.5 rounded-full w-fit uppercase tracking-wider">
                  <Clock size={10} />
                  <span>Due: {new Date(t.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>

                {t.link_pengumpulan ? (
                  <a 
                    href={t.link_pengumpulan} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-black text-[#D4AF37] py-3 md:py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                  >
                    Submit Report <ExternalLink size={12} />
                  </a>
                ) : (
                  <div className="text-center text-[9px] font-bold text-zinc-400 uppercase py-3 md:py-4 border-2 border-dashed border-zinc-200 rounded-2xl italic">
                    Link Not Available
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 md:py-16 opacity-20">
              <Info size={32} className="mb-4 text-zinc-400" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-center">No active assignments</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] lg:ml-64 p-6 md:p-16 font-sans text-zinc-900 transition-all duration-300 overflow-x-hidden">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 md:mb-16 space-y-4">
          <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-8 md:w-12 bg-[#800020]"></div>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Practicum Dashboard</p>
          </div>
          <h1 className="text-4xl md:text-7xl font-serif italic text-black tracking-tighter leading-tight">
            Laboratory <span className="not-italic font-sans font-black text-[#800020]">REPORTS</span>
          </h1>
        </header>
        
        {/* Tab Navigation */}
        <nav className="flex gap-3 mb-10 md:mb-12 overflow-x-auto pb-4 no-scrollbar">
          {praktikumList.map(mk => (
            <button 
              key={mk}
              onClick={() => setActiveTab(mk)}
              className={`px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeTab === mk 
                ? 'bg-black text-[#D4AF37] shadow-2xl shadow-black/20 -translate-y-1' 
                : 'bg-white text-zinc-400 border border-zinc-100 hover:text-zinc-800 shadow-sm'
              }`}
            >
              {mk}
            </button>
          ))}
        </nav>

        {/* Content Section */}
        <div className="space-y-10 md:space-y-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-10 h-10 border-4 border-zinc-100 border-t-[#800020] rounded-full animate-spin"></div>
              <p className="text-zinc-400 font-bold text-[9px] uppercase tracking-[0.3em]">Syncing Archive...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {getGolonganList(activeTab).map(gol => renderGolongan(gol))}
            </div>
          )}
        </div>

        <footer className="mt-24 md:mt-32 border-t border-zinc-100 pt-10 text-center">
          <p className="text-zinc-300 text-[9px] font-bold uppercase tracking-[0.5em]">
            Zora Command Unit // Agrotechnology Division
          </p>
        </footer>
      </div>
    </div>
  );
}