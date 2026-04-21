"use client";



import React, { useState, useEffect } from 'react';

import { createClient } from '@/utils/supabase/client';

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";



// --- KOMPONEN INTERAKTIF (3D EFFECT) ---

function InteractiveCard({ children }: { children: React.ReactNode }) {

  const x = useMotionValue(0);

  const y = useMotionValue(0);



  // Membuat gerakan lebih smooth seperti pegas

  const mouseXSpring = useSpring(x);

  const mouseYSpring = useSpring(y);



  const rotateX = useTransform(mouseYSpring, [-100, 100], [10, -10]);

  const rotateY = useTransform(mouseXSpring, [-100, 100], [-10, 10]);



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

      style={{ perspective: 1000, rotateX, rotateY }}

      onMouseMove={handleMouseMove}

      onMouseLeave={handleMouseLeave}

      className="w-full h-full"

    >

      {children}

    </motion.div>

  );

}



// --- HALAMAN UTAMA MATERI ---

interface Materi {

  id: string;

  judul: string;

  mk_nama: string;

  file_url: string;

}



export default function MateriPage() {

  const [materiList, setMateriList] = useState<Materi[]>([]);

  const [filter, setFilter] = useState('Semua');

 

  const supabase = createClient();



  useEffect(() => {

    async function fetchData() {

      const { data, error } = await supabase

        .from('materi')

        .select('*')

        .order('created_at', { ascending: false });

     

      if (error) {

        console.error("Gagal ambil data Supabase:", error.message);

      } else if (data) {

        setMateriList(data as Materi[]);

      }

    }

    fetchData();

  }, [supabase]);



  const daftarMK = Array.from(new Set(materiList.map(m => m.mk_nama)));

  const filteredMateri = filter === 'Semua' ? materiList : materiList.filter(m => m.mk_nama === filter);



  return (

    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#f8f9fa] pb-32">

      {/* Header & Filter */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">

        <div>

          <h1 className="text-4xl font-black text-[#800020] uppercase italic tracking-tighter">

            Materi Kuliah

          </h1>

          <p className="text-gray-400 font-medium text-sm mt-1">Eksplorasi bahan ajar Agroteknologi</p>

        </div>

       

        <select

          className="bg-white border-none shadow-[5px_5px_15px_#d1d1d1,-5px_-5px_15px_#ffffff] p-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-[#800020] outline-none cursor-pointer hover:scale-105 transition-transform"

          onChange={(e) => setFilter(e.target.value)}

        >

          <option value="Semua">Semua Mata Kuliah</option>

          {daftarMK.map(mk => <option key={mk} value={mk}>{mk}</option>)}

        </select>

      </div>



      {/* Grid Materi dengan Efek Timbul & Interaktif */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

        {filteredMateri.map((m) => (

          <InteractiveCard key={m.id}>

            <div className="bg-[#f8f9fa] p-8 rounded-[40px] flex flex-col justify-between h-full border border-white/50 shadow-[20px_20px_40px_#d1d1d1,-20px_-20px_40px_#ffffff] transition-colors hover:bg-white group">

              <div>

                <span className="text-[10px] font-black text-[#800020] uppercase bg-red-50 px-4 py-2 rounded-full border border-red-100 tracking-[0.2em]">

                  {m.mk_nama}

                </span>

                <h2 className="text-2xl font-black mt-6 mb-4 uppercase leading-[1.1] text-gray-800 tracking-tighter group-hover:text-black transition-colors">

                  {m.judul}

                </h2>

              </div>



              {/* Action Button Timbul */}

              <div className="mt-10">

                <a

                  href={m.file_url}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="block w-full text-center py-5 bg-[#800020] text-white rounded-[20px] font-black text-[11px] tracking-[0.2em] uppercase shadow-[5px_10px_20px_rgba(128,0,32,0.2)] hover:shadow-[5px_15px_30px_rgba(128,0,32,0.4)] hover:bg-black transition-all active:scale-95"

                >

                  Lihat Materi

                </a>

              </div>

            </div>

          </InteractiveCard>

        ))}

      </div>



      {filteredMateri.length === 0 && (

        <div className="text-center py-20 text-gray-400 font-black uppercase tracking-widest opacity-50">

          Kosong / Tidak ditemukan

        </div>

      )}

    </div>

  )

}