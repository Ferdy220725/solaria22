"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nama, setNama] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Sesi sudah aktif karena diproses di auth/callback
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setNama((user.user_metadata?.nama as string) ?? null);
      } else {
        router.push("/login");
      }
    });
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return setErrorMsg("Password tidak cocok");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setErrorMsg(error.message);
    else router.push("/login");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-sm w-full p-4 space-y-4">
        <h1 className="text-xl font-bold">Halo, {nama || "User"}</h1>
        <input type="password" placeholder="Password Baru" className="w-full border p-2" onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Konfirmasi" className="w-full border p-2" onChange={(e) => setConfirmPassword(e.target.value)} />
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        <button disabled={loading} className="w-full bg-black text-white p-2">{loading ? "Menyimpan..." : "Simpan"}</button>
      </form>
    </div>
  );
}