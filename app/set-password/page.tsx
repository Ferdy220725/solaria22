"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LupaPassword() {
  const [step, setStep] = useState<"email" | "verify" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const supabase = createClient();
  const router = useRouter();

  // ── Step 1: kirim kode reset ke email ──────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/lupa-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg("Gagal mengirim kode. Pastikan email sudah benar dan terdaftar.");
      return;
    }

    setInfoMsg(`Kode verifikasi sudah dikirim ke ${email}. Cek inbox (atau folder spam) email kamu.`);
    setStep("verify");
  };

  // ── Step 2: verifikasi kode ─────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });

    setLoading(false);

    if (error) {
      setErrorMsg("Kode salah atau sudah kadaluarsa. Coba kirim ulang kode.");
      return;
    }

    setStep("password");
  };

  // ── Step 3: atur password baru ──────────────────────────────────────────
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
      alert("Password berhasil diubah! Silakan login dengan password baru.");
      router.push("/login");
    }
  };

  // ── UI: Step 1 - input email ────────────────────────────────────────────
  if (step === "email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <form onSubmit={handleSendCode} className="bg-white p-8 rounded-[30px] shadow-xl max-w-md w-full space-y-4 border border-slate-200">
          <h2 className="text-2xl font-black text-center uppercase tracking-tighter text-[#800020]">
            Lupa Password
          </h2>
          <p className="text-xs text-slate-500 text-center">
            Masukkan email kampus kamu, kami akan kirim kode verifikasi.
          </p>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Email Kampus</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="npm@student.upnjatim.ac.id"
              className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm focus:border-[#800020] outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#800020] text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm border-b-4 border-[#5a0016] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Kode"}
          </button>
          <Link href="/login" className="block text-center text-xs text-slate-400 hover:text-[#800020]">
            Kembali ke login
          </Link>
        </form>
      </div>
    );
  }

  // ── UI: Step 2 - input kode ──────────────────────────────────────────────
  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <form onSubmit={handleVerify} className="bg-white p-8 rounded-[30px] shadow-xl max-w-md w-full space-y-4 border border-slate-200">
          <h2 className="text-2xl font-black text-center uppercase tracking-tighter text-[#800020]">
            Masukkan Kode
          </h2>

          {infoMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl text-center">
              {infoMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Kode Verifikasi</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="12345678"
              className="w-full p-3 rounded-xl border-2 border-slate-200 text-center text-2xl tracking-[0.3em] font-bold focus:border-[#800020] outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#800020] text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm border-b-4 border-[#5a0016] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Memeriksa..." : "Verifikasi"}
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-center text-xs text-slate-400 hover:text-[#800020]"
          >
            Salah email? Ulangi
          </button>
        </form>
      </div>
    );
  }

  // ── UI: Step 3 - password baru ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[30px] shadow-xl max-w-md w-full space-y-4 border border-slate-200">
        <h2 className="text-2xl font-black text-center uppercase tracking-tighter text-[#800020]">
          Password Baru
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
