"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Status = "checking" | "ready" | "invalid" | "submitting" | "success";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<Status>("checking");
  const [nama, setNama] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tunggu Supabase client selesai baca token dari URL (hash) dan bikin session
  useEffect(() => {
    // Kalau session sudah langsung ada saat mount
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setNama((data.session.user.user_metadata?.nama as string) ?? null);
        setStatus("ready");
      }
    });

    // Jaga-jaga: proses baca token dari URL kadang butuh sedikit waktu,
    // jadi kita juga dengarkan event auth langsung
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") {
        if (session) {
          setNama((session.user.user_metadata?.nama as string) ?? null);
          setStatus("ready");
        }
      }
    });

    // Kalau setelah beberapa detik tetap tidak ada session, anggap link invalid/expired
    const timeout = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "invalid" : current));
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return;
    }

    setStatus("submitting");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setStatus("ready");
      return;
    }

    setStatus("success");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">Memverifikasi link undangan...</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-2">
          <h1 className="text-lg font-semibold text-gray-900">Link tidak valid atau sudah kedaluwarsa</h1>
          <p className="text-sm text-gray-500">
            Coba buka ulang link undangan dari email kamu, atau hubungi admin kelas untuk dikirimkan ulang.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-2">
          <h1 className="text-lg font-semibold text-gray-900">Password berhasil dibuat 🎉</h1>
          <p className="text-sm text-gray-500">Mengarahkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-gray-900">
            {nama ? `Halo, ${nama}` : "Buat password kamu"}
          </h1>
          <p className="text-sm text-gray-500">
            Buat password untuk akun kamu. Password ini yang akan dipakai untuk login berikutnya.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password baru
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Konfirmasi password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Ulangi password"
          />
        </div>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-md bg-gray-900 text-white text-sm font-medium py-2 hover:bg-gray-800 disabled:opacity-50"
        >
          {status === "submitting" ? "Menyimpan..." : "Simpan password"}
        </button>
      </form>
    </div>
  );
}