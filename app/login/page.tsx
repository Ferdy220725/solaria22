"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const supabase = createClient();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-[#800020]">MASUK SOLARIA 🍃</h1>
          <p className="text-slate-500 text-sm">Gunakan email kampus atau pribadi</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]} // Biar simpel pakai Email & Password saja dulu
          // Ganti teks ke Bahasa Indonesia (Opsional)
          localization={{
            variables: {
              sign_up: {
                email_label: 'Alamat Email',
                password_label: 'Kata Sandi',
                button_label: 'Daftar Sekarang',
                link_text: 'Belum punya akun? Daftar',
              },
              sign_in: {
                email_label: 'Alamat Email',
                password_label: 'Kata Sandi',
                button_label: 'Masuk',
                link_text: 'Sudah punya akun? Masuk',
              },
            },
          }}
        />
      </div>
    </div>
  );
}