"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, Mail, IdCard, LogOut, KeyRound, Loader2, ArrowRight } from "lucide-react";

export default function AkunSaya() {
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [nama, setNama] = useState("");
  const [npm, setNpm] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace("/login");
        return;
      }

      const user = authData.user;
      setEmail(user.email || "-");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("nama, npm, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        setNama(user.user_metadata?.nama || "-");
        setNpm(user.user_metadata?.npm || "-");
        setCreatedAt(
          user.created_at
            ? new Date(user.created_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })
            : "-"
        );
      } else {
        setNama(profile.nama || "-");
        setNpm(profile.npm || "-");
        setCreatedAt(
          profile.created_at
            ? new Date(profile.created_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })
            : "-"
        );
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleResetPassword = async () => {
    if (!email || email === "-") return;
    setResetLoading(true);
    setResetMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setResetLoading(false);

    if (error) {
      setResetMsg("❌ Gagal mengirim kode reset. Coba lagi beberapa saat lagi.");
    } else {
      setResetMsg(`✅ Kode reset sudah dikirim ke ${email}. Cek inbox kamu.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#800020]" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-32">
      <div className="max-w-md mx-auto space-y-5">
        <div className="bg-white rounded-[30px] shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#800020] flex items-center justify-center mx-auto mb-4">
            <User size={36} color="white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">
            {nama}
          </h1>
          <p className="text-sm font-mono text-slate-400 mt-1">{npm}</p>
        </div>

        <div className="bg-white rounded-[30px] shadow-xl border border-slate-200 p-6 space-y-4">
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
            Informasi Akun
          </p>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-[#800020]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400">Email Terdaftar</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <IdCard size={18} className="text-[#800020]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400">NPM</p>
              <p className="text-sm font-semibold text-slate-700">{npm}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <User size={18} className="text-[#800020]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400">Bergabung Sejak</p>
              <p className="text-sm font-semibold text-slate-700">{createdAt}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[30px] shadow-xl border border-slate-200 p-6 space-y-3">
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">
            Pengaturan Akun
          </p>

          <button
            onClick={handleResetPassword}
            disabled={resetLoading}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-100 hover:border-[#800020]/30 transition-colors text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <KeyRound size={18} className="text-slate-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-700">
                {resetLoading ? "Mengirim kode..." : "Reset Password"}
              </p>
              <p className="text-[11px] text-slate-400">Kirim kode reset ke email kamu</p>
            </div>
          </button>

          {resetMsg && (
            <div className="px-3 py-3 rounded-xl bg-slate-50 space-y-2">
              <p className="text-xs text-center text-slate-600">{resetMsg}</p>
              <button
                onClick={() => router.push("/lupa-password")}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[#800020] py-1"
              >
                Masukkan Kode OTP <ArrowRight size={14} />
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-red-100 hover:border-red-300 transition-colors text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <LogOut size={18} className="text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-red-600">
                {loggingOut ? "Keluar..." : "Log Out"}
              </p>
              <p className="text-[11px] text-slate-400">Keluar dari akun ini</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
