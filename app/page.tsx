"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      setCheckingSession(false);
    });
  }, []);

  const handleMasuk = () => {
    router.push(isLoggedIn ? '/dashboard' : '/login');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 60% at 50% -10%, #EAF1E3 0%, #FBF7ED 45%, #FBF7ED 100%)' }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,900;1,600;1,700&family=Manrope:wght@500;700;800&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>

      {/* Aksen gradasi lembut di pojok, kesan "cahaya ladang" */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #0B3D2E, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7A1128, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center font-body">
        <img
          src="/logo-zora.jpg"
          alt="Logo Zora"
          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-2xl mb-6"
        />

        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#7A1128]/70 mb-3">
          Kelas C Agroteknologi
        </p>

        <h1 className="font-display italic font-bold text-3xl md:text-5xl tracking-tight text-[#0B3D2E] mb-4">
          Selamat Datang di <span className="not-italic font-black uppercase text-[#7A1128]">Zora</span>
        </h1>

        <p className="max-w-md text-sm md:text-base text-slate-600 font-medium mb-10 leading-relaxed">
          Zora adalah sistem manajemen Kelas C Agroteknologi — pantau tugas, deadline,
          absensi, dan jadwal Zoom kelas dalam satu tempat.
        </p>

        <button
          onClick={handleMasuk}
          disabled={checkingSession}
          className="text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7A1128, #5a0016)' }}
        >
          {checkingSession ? 'Memuat...' : 'Masuk'}
        </button>
      </div>
    </div>
  );
}