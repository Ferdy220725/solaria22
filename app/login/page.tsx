"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // sesuaikan path jika perlu
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [npm, setNpm] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input tambahan
    if (!namaLengkap.trim() || !npm.trim()) {
      alert("Nama Lengkap dan NPM wajib diisi untuk sinkronisasi data kelas!");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Gagal login: " + error.message);
    } else {
      // SIMPAN DATA KE LOCALSTORAGE SAAT BERHASIL LOGIN
      localStorage.setItem('nama_user_solaria', namaLengkap.trim());
      localStorage.setItem('npm_user_solaria', npm.trim());

      alert("Login berhasil!");
      
      // FIX: Langsung diarahkan ke root dashboard utama agar tidak 404 lagi
      router.push('/'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-[30px] shadow-xl max-w-md w-full space-y-4 border border-slate-200">
        <h2 className="text-2xl font-black text-center uppercase tracking-tighter text-[#800020]">Login Sobat Agrotek</h2>
        
        {/* INPUT NAMA LENGKAP */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-1">Nama Lengkap (Sesuai SIAKAD)</label>
          <input 
            type="text" 
            value={namaLengkap} 
            onChange={(e) => setNamaLengkap(e.target.value)}
            placeholder="Contoh: Just friend kok ngambek" 
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:border-[#800020] outline-none"
            required
          />
        </div>

        {/* INPUT NPM */}
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

        {/* INPUT EMAIL */}
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

        {/* INPUT PASSWORD */}
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

        <button type="submit" className="w-full bg-[#800020] text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm border-b-4 border-[#5a0016] active:scale-95 transition-all">
          Masuk Sistem 🚀
        </button>
      </form>
    </div>
  );
}