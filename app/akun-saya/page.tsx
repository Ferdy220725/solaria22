"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, Mail, IdCard, LogOut, KeyRound, Loader2, ChevronLeft } from "lucide-react";

export default function AkunSaya() {
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [nama, setNama] = useState("");
  const [npm, setNpm] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb] dark:bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-indigo-600" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] font-sans p-4 md:p-8 pb-32">
      <div className="max-w-md mx-auto space-y-6">

        {/* TOP BAR */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#141414] border border-slate-100 dark:border-white/10 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 active:scale-95 transition-all"
            aria-label="Kembali"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Akun Saya</h1>
        </div>

        {/* PROFILE HERO */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[28px] p-8 text-white shadow-xl text-center">
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-4">
              <User size={36} color="white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              {nama}
            </h1>
            <p className="text-sm font-mono text-indigo-100 mt-1">{npm}</p>
          </div>

          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* INFORMASI AKUN */}
        <div className="bg-white dark:bg-[#141414] rounded-[28px] shadow-sm border border-slate-100 dark:border-white/10 p-6 space-y-4">
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
            Informasi Akun
          </p>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-600">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400">Email Terdaftar</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-600">
              <IdCard size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400">NPM</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{npm}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-600">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400">Bergabung Sejak</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{createdAt}</p>
            </div>
          </div>
        </div>

        {/* PENGATURAN AKUN */}
        <div className="bg-white dark:bg-[#141414] rounded-[28px] shadow-sm border border-slate-100 dark:border-white/10 p-6 space-y-3">
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">
            Pengaturan Akun
          </p>

          <button
            onClick={() => router.push(`/lupa-password?email=${encodeURIComponent(email)}`)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-100 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
              <KeyRound size={18} className="text-slate-600 dark:text-slate-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Reset Password</p>
              <p className="text-[11px] text-slate-400">Kirim kode OTP ke email kamu</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-red-100 dark:border-red-500/20 hover:border-red-300 transition-colors text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
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