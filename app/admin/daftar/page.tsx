"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DaftarAdmin() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kelasId, setKelasId] = useState('');
  const [kelasList, setKelasList] = useState<{ id: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase
      .from('kelas')
      .select('id, nama')
      .order('nama', { ascending: true })
      .then(({ data }) => {
        if (data) setKelasList(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, password, kelasId }),
      });
      const result = await res.json();

      if (!res.ok) {
        alert(result.error || 'Gagal mendaftar.');
        setLoading(false);
        return;
      }

      alert('Pengajuan admin berhasil dikirim! Tunggu persetujuan owner sebelum bisa login.');
      router.push('/admin');
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb] dark:bg-[#0a0a0a] p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#141414] p-8 rounded-[30px] shadow-sm max-w-md w-full space-y-4 border border-slate-100 dark:border-white/10"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[22px] p-6 mb-2 text-center text-white">
          <p className="text-2xl relative z-10">🔐</p>
          <h2 className="text-xl font-black uppercase tracking-tight mt-1 relative z-10">
            Daftar Admin Kelas
          </h2>
          <p className="text-xs text-indigo-100 mt-1 relative z-10">
            Khusus untuk pengelola konten & absensi kelas
          </p>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1">Nama</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama lengkap"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1">Kelas yang dikelola</label>
          <select
            value={kelasId}
            onChange={(e) => setKelasId(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
            required
          >
            <option value="">Pilih kelas...</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@email.com"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
          Akun kamu akan berstatus <span className="font-bold">menunggu persetujuan</span> sampai owner menyetujui pengajuan ini.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Ajukan Jadi Admin"}
        </button>

        <Link
          href="/admin"
          className="block text-center text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          Sudah punya akun? Login di sini
        </Link>
      </form>
    </div>
  );
}