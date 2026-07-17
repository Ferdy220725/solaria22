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
        router.replace('/dashboard');
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
      router.push('/dashboard');
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb] dark:bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb] dark:bg-[#0a0a0a] p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-[#141414] p-8 rounded-[30px] shadow-sm max-w-md w-full space-y-4 border border-slate-100 dark:border-white/10"
      >
        {/* Header ala hero card dashboard: gradient indigo-purple, rounded besar */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[22px] p-6 mb-2 text-center text-white">
          <p className="text-2xl relative z-10">👋</p>
          <h2 className="text-xl font-black uppercase tracking-tight mt-1 relative z-10">
            Login Sobat Agrotek
          </h2>
          <p className="text-xs text-indigo-100 mt-1 relative z-10">Semangat menjalani hari ini...</p>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1">
            Nama Lengkap (Sesuai SIAKAD)
          </label>
          <input
            type="text"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            placeholder="Contoh: Ahmat Choyrul Ferdyansyah"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1">
            NPM / Nomor Pokok Mahasiswa
          </label>
          <input
            type="text"
            value={npm}
            onChange={(e) => setNpm(e.target.value)}
            placeholder="Contoh: 25025010..."
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="username@email.com"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk Sistem 🚀"}
        </button>

        <Link
          href="/lupa-password"
          className="block text-center text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          Lupa kata sandi?
        </Link>
      </form>
    </div>
  );
}