"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { FileText, Search, Loader2, ChevronRight } from 'lucide-react';

// --- KOMPONEN INTERAKTIF (PREMIUM 3D EFFECT) ---
function InteractiveCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-100, 100], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-100, 100], [-7, 7]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ perspective: 1200, rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

interface Materi {
  id: string;
  judul: string;
  mk_nama: string;
  file_url: string;
}

export default function MateriPage() {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('materi')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) setMateriList(data as Materi[]);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  const daftarMK = Array.from(new Set(materiList.map(m => m.mk_nama)));
  const filteredMateri = filter === 'Semua' ? materiList : materiList.filter(m => m.mk_nama === filter);

  return (
    <div className="min-h-screen bg-[#fafafa] lg:ml-64 transition-all pb-32 font-sans relative">
      
      {/* Cinematic Header (ZORA Style) */}
      <header className="bg-black text-white p-20 border-b border-[#D4AF37]/20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)] opacity-80"></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-4">
             <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
             <p className="text-[#D4AF37] uppercase tracking-[0.5em] text-[10px] font-bold">Academic Resources</p>
             <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-white uppercase italic leading-tight">
            Lecture <span className="text-[#D4AF37] not-italic font-light tracking-[0.1em]">Materials</span>
          </h1>
        </div>
      </header>

      {/* Content Area */}
      <main className="p-8 md:p-16 max-w-6xl mx-auto -mt-16 relative z-20">
        
        {/* Filter Section (Elegant & Minimal) */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-2 rounded-full shadow-xl border border-zinc-100 flex items-center gap-2 max-w-md w-full">
            <div className="pl-6 text-[#D4AF37]">
              <Search size={18} />
            </div>
            <select 
              className="w-full bg-transparent p-4 rounded-full font-bold text-[10px] uppercase tracking-widest text-zinc-500 outline-none cursor-pointer appearance-none"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Semua">All Subjects</option>
              {daftarMK.map(mk => <option key={mk} value={mk}>{mk}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-5 text-zinc-400 font-serif italic">
            <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
            <span className="tracking-[0.3em] uppercase text-[10px] font-bold">Accessing Archive...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredMateri.map((m) => (
              <InteractiveCard key={m.id}>
                <div className="bg-white p-10 rounded-[40px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full border border-zinc-100 hover:shadow-[0_30px_70px_-10px_rgba(212,175,55,0.12)] transition-all duration-500 group relative overflow-hidden">
                  
                  {/* Subject Badge */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-2 w-2 rounded-full bg-[#D4AF37]"></div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        {m.mk_nama}
                      </span>
                    </div>

                    <h2 className="text-2xl font-serif text-zinc-900 tracking-tight leading-tight group-hover:text-black transition-colors mb-8">
                      {m.judul}
                    </h2>
                  </div>

                  {/* Elegant Button */}
                  <a 
                    href={m.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-between group/btn"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1 group-hover/btn:border-[#D4AF37] transition-all">
                      Review File
                    </span>
                    <div className="p-3 rounded-full bg-black text-[#D4AF37] group-hover/btn:translate-x-2 transition-transform duration-300">
                      <ChevronRight size={16} />
                    </div>
                  </a>

                  {/* Watermark-like Icon */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-black group-hover:opacity-[0.07] transition-opacity">
                    <FileText size={120} />
                  </div>
                </div>
              </InteractiveCard>
            ))}
          </div>
        )}

        {!loading && filteredMateri.length === 0 && (
          <div className="py-32 text-center opacity-30 italic font-serif text-zinc-400 tracking-widest text-sm">
            No materials found in this category.
          </div>
        )}
      </main>

      {/* Aesthetic Footer */}
      <footer className="text-center py-12 opacity-40">
        <div className="h-[1px] w-20 bg-[#D4AF37] mx-auto mb-6"></div>
        <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-500">
          ZORA Academic Resource Division
        </p>
      </footer>
    </div>
  );
}