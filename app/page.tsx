"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';

export default function Dashboard() {
  const [tugas, setTugas] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchTugas = async () => {
      const { data } = await supabase.from('tugas').select('*').order('deadline', { ascending: true });
      if (data) setTugas(data);
    };
    fetchTugas();
  }, []);

  const checkDeadline = (deadlineStr: string) => {
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const selisihJam = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (selisihJam > 0 && selisihJam <= 12) return true;
    return false;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#800020] mb-8 text-center">Dashboard Kelas C</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-[#800020]">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Jadwal Kuliah</h2>
          <ul className="space-y-2 text-slate-700">
             <li><strong>Senin:</strong> Genetika Pertanian (08.41-10.21)</li>
             <li><strong>Senin:</strong> Pertanian Perkotaan (13.00-14.40)</li>
             <li><strong>Selasa:</strong> Dasar Budidaya Tanaman (08.41-10.21)</li>
             <li><strong>Rabu:</strong> Fisiologi Tanaman (07.00-08.40)</li>
             <li><strong>Kamis:</strong> Dasar Ilmu Tanah (13.00-14.40)</li>
             <li><strong>Jumat:</strong> Dasar Perlindungan Tanaman (08.00-09.40)</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-[#D4AF37]">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Tugas Mendatang</h2>
          <div className="space-y-4">
            {tugas.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800">{t.judul_tugas}</p>
                <p className="text-sm text-red-600">
                  Deadline: {new Date(t.deadline).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
                {checkDeadline(t.deadline) && (
                  <div className="mt-2 p-2 bg-red-600 text-white text-xs font-bold rounded animate-pulse text-center">
                    🚨 PERINGATAN: DEADLINE KURANG DARI 12 JAM!
                  </div>
                )}
              </div>
            ))}
            {tugas.length === 0 && <p className="text-slate-500 italic">Tidak ada tugas aktif.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}