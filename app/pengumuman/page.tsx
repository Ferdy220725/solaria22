"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Megaphone, Pin, Loader2, PackageOpen, Link2 } from 'lucide-react';

interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  link?: string | null;
  is_pinned: boolean;
  created_at: string;
}

export default function PengumumanPage() {
  const [items, setItems] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    const { data } = await supabase
      .from('pengumuman')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) setItems(data as Pengumuman[]);
    setLoading(false);
  };

  const formatTanggal = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb] dark:bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-indigo-600" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] font-sans">
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <Megaphone size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Pengumuman</h1>
            <p className="text-xs text-slate-400 font-medium">Info & pengumuman terbaru dari kelas</p>
          </div>
        </div>

        {/* LIST */}
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((p) => (
              <div
                key={p.id}
                className={`bg-white dark:bg-[#141414] rounded-[24px] p-6 shadow-sm border ${
                  p.is_pinned ? 'border-indigo-200 dark:border-indigo-500/30' : 'border-slate-100 dark:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2 flex-wrap">
                    {p.is_pinned && (
                      <span className="text-indigo-600 flex items-center gap-1 text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg shrink-0">
                        <Pin size={11} /> Disematkan
                      </span>
                    )}
                    {p.judul}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-medium mb-3">{formatTanggal(p.created_at)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{p.isi}</p>

                {p.link && (
                  
                   <a href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                  >
                    <Link2 size={14} /> Buka Link Terkait
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141414] rounded-[28px] py-20 text-center shadow-sm border border-slate-100 dark:border-white/10">
            <PackageOpen className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-300 font-black uppercase italic text-lg tracking-widest">Belum ada pengumuman</p>
          </div>
        )}
      </div>
    </div>
  );
}