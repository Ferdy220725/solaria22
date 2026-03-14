"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';

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

  // Daftar golongan yang ditampilkan berdasarkan Mata Praktikum yang dipilih
  const getGolonganList = (mk: string) => {
    if (mk === 'DIT') return ['B1', 'B3', 'C3'];
    return ['C1', 'C2', 'C3'];
  };

  const renderGolongan = (golonganName: string) => {
    // PERBAIKAN: Filter lebih kuat (Case Insensitive & Trim Spasi)
    const filtered = tugas.filter(t => 
      t.golongan && t.golongan.trim().toUpperCase() === golonganName.toUpperCase()
    );
    
    return (
      <div key={golonganName} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="font-extrabold text-[#800020]">Golongan {golonganName}</h3>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400 uppercase font-bold">{activeTab}</span>
        </div>
        
        <div className="space-y-4 flex-grow">
          {filtered.length > 0 ? (
            filtered.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#D4AF37] transition-all group">
                <p className="font-bold text-slate-800 text-sm mb-1 group-hover:text-[#800020] transition-colors">
                  {t.judul_tugas}
                </p>
                <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                  {t.deskripsi || "Tidak ada deskripsi tugas."}
                </p>
                
                <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] mb-3 bg-red-50 p-1.5 rounded-lg w-fit">
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
                    className="block text-center bg-[#D4AF37] text-white py-2 rounded-lg text-[10px] font-bold hover:bg-[#b8952e] shadow-sm active:scale-95 transition-all"
                  >
                    Link Pengumpulan Tugas →
                  </a>
                ) : (
                  <div className="text-center text-[9px] text-slate-400 italic py-2 border border-dashed rounded-lg">
                    Link belum tersedia
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 opacity-30">
              <span className="text-3xl mb-2">☕</span>
              <p className="text-[10px] font-bold italic">Belum ada tugas untuk golongan ini.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-[#800020] mb-2 tracking-tight">Info Praktikum</h1>
        <p className="text-slate-500 text-sm font-medium">Monitoring tugas praktikum Agroteknologi per-golongan secara real-time.</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar justify-start md:justify-start">
        {praktikumList.map(mk => (
          <button 
            key={mk}
            onClick={() => setActiveTab(mk)}
            className={`px-10 py-3 rounded-2xl font-black text-xs transition-all whitespace-nowrap border-2 ${
              activeTab === mk 
              ? 'bg-[#800020] text-white border-[#800020] shadow-xl shadow-red-900/20 -translate-y-1' 
              : 'bg-white text-slate-400 border-white hover:border-slate-200 hover:text-slate-600 shadow-sm'
            }`}
          >
            {mk}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#800020] rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs animate-pulse">Menghubungkan ke Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {getGolonganList(activeTab).map(gol => renderGolongan(gol))}
        </div>
      )}

      {/* Footer info kecil */}
      <div className="mt-16 text-center text-slate-400 text-[10px] font-medium uppercase tracking-widest">
        &copy; 2026 AgrotekC Class Management System
      </div>
    </div>
  );
}