"use client";

import { Suspense, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSession = async () => {
      // Kasus 1: link format baru pakai ?code=...
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setErrorMsg("Link tidak valid atau sudah kadaluarsa. Minta admin kirim ulang undangan.");
          return;
        }
        setReady(true);
        return;
      }

      // Kasus 2: link format lama pakai #access_token=...&refresh_token=...
      const hash = window.location.hash.substring(1); // buang tanda #
      const hashParams = new URLSearchParams(hash);
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          setErrorMsg("Link tidak valid atau sudah kadaluarsa. Minta admin kirim ulang undangan.");
          return;
        }
        setReady(true);
        return;
      }

      // Kasus 3 (fallback): mungkin session sudah ada duluan (refresh halaman)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      } else {
        setErrorMsg("Link tidak valid atau sudah kadaluarsa. Minta admin kirim ulang undangan.");
      }
    };

    handleSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Password dan konfirmasi tidak sama!");
      return;
    }
    if (password.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert("Gagal mengatur password: " + error.message);
    } else {
      alert("Password berhasil diatur! Silakan login.");
      router.push("/login");
    }
  };

  if (errorMsg) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center">{errorMsg}</div>;
  }

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[30px] shadow-xl max-w-md w-full space-y-4 border border-slate-200">
        <h2 className="text-2xl font-black text-center uppercase tracking-tighter text-[#800020]">
          Atur Password Kamu
        </h2>
        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-1">Password Baru</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm focus:border-[#800020] outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-1">Ulangi Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm focus:border-[#800020] outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#800020] text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm border-b-4 border-[#5a0016] active:scale-95 transition-all"
        >
          Simpan Password
        </button>
      </form>
    </div>
  );
}

export default function SetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
