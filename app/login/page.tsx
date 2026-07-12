"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [npm, setNpm] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Kalau user sudah punya session aktif (misal baru selesai set password),
  // langsung lempar ke dashboard, nggak perlu isi form login lagi.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/');
      } else {
        setCheckingSession(false);
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaLengkap.trim() || !npm.trim()) {
      alert("Nama Lengkap dan NPM wajib diisi untuk sinkronisasi data kelas!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Gagal login: " + error.message);
      setLoading(false);
    } else {
      localStorage.setItem('nama_user_solaria', namaLengkap.trim());
      localStorage.setItem('npm_user_solaria', npm.trim());
      router.push('/');
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-[30px] shadow-xl max-w-md w-full space-y-4 border border-slate-200">
        <h2 className="text-2xl font-black text-center uppercase tracking-tighter text-[#800020]">Login Sobat Agrotek</h2>

        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-1">Nama Lengkap (Sesuai SIAKAD)</label>
          <input
            type="text"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            placeholder="Contoh: Ahmat Choyrul Ferdyansyah"
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:border-[#800020] outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-1">NPM / Nomor Pokok Mahasiswa</label>
          <input
            type="text"
            value={npm}
            onChange={(e) => setNpm(e.target.value)}
            placeholder="Contoh: 25025010..."
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-mono focus:border-[#800020] outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="username@email.com"
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm focus:border-[#800020] outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm focus:border-[#800020] outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#800020] text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm border-b-4 border-[#5a0016] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk Sistem 🚀"}
        </button>

        <Link href="/lupa-password" className="block text-center text-xs text-slate-400 hover:text-[#800020]">
          Lupa password?
        </Link>
      </form>
    </div>
  );
}
