"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Status = "checking" | "ready" | "error";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<Status>("checking");
  const [nama, setNama] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Mengecek sesi user yang sudah dibuat via auth/callback
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setNama((user.user_metadata?.nama as string) ?? "User");
        setStatus("ready");
      } else {
        // Jika tidak ada sesi, lempar kembali ke login
        router.push("/login");
      }
    });
  }, [router, supabase]);

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

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Jika berhasil, arahkan ke halaman utama/dashboard
      router.push("/");
    }
  }

  // Tampilan saat sedang memverifikasi sesi
  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Memverifikasi akses...</p>
      </div>
    );
  }

  // Tampilan utama form set password
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-gray-900">Halo, {nama}</h1>
          <p className="text-sm text-gray-500">
            Silakan buat password baru untuk akun kamu.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password baru</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Konfirmasi password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ulangi password"
          />
        </div>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 text-white text-sm font-medium py-2 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan password"}
        </button>
      </form>
    </div>
  );
}
