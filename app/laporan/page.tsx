"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  ClipboardCheck,
  FileText,
  Loader2,
  PackageOpen,
  TrendingUp,
  Lock,
} from 'lucide-react';

interface Absensi {
  waktu_absen: string;
}

interface Perizinan {
  id: string;
  mk_nama?: string;
  alasan?: string;
  tgl_izin?: string;
  created_at: string;
}

interface Tugas {
  id: string;
  judul_tugas: string;
  mk_nama: string;
  deadline: string;
}

type Tab = 'kehadiran' | 'perizinan' | 'tugas';

export default function LaporanPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('kehadiran');
  const [loadingData, setLoadingData] = useState(false);
  const [namaUser, setNamaUser] = useState('');
  const [npmUser, setNpmUser] = useState('');
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [perizinan, setPerizinan] = useState<Perizinan[]>([]);
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [buktiTugasIds, setBuktiTugasIds] = useState<Set<string>>(new Set());

  const supabase = createClient();
  const router = useRouter();

  // --- AUTH GUARD: harus login dulu buat akses halaman ini ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
        return;
      }
      setCheckingSession(false);
    });
  }, []);

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (!passwordInput.trim()) {
      setVerifyError('Password wajib diisi.');
      return;
    }

    setVerifying(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setVerifyError('Sesi login tidak valid. Silakan login ulang.');
      setVerifying(false);
      router.replace('/login');
      return;
    }

    // Verifikasi ulang password dengan re-signin (Supabase tidak punya endpoint
    // "cek password" langsung, jadi cara amannya lewat signInWithPassword)
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwordInput,
    });

    if (error) {
      setVerifyError('Password salah. Coba lagi.');
      setVerifying(false);
      return;
    }

    setIsVerified(true);
    setVerifying(false);
    fetchPersonalData();
  };

  const fetchPersonalData = async () => {
    setLoadingData(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nama, npm')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.npm) {
      setLoadingData(false);
      return;
    }

    setNamaUser(profile.nama || '');
    setNpmUser(profile.npm);

    const [absensiRes, perizinanRes, tugasRes, buktiRes] = await Promise.all([
      supabase.from('absensi').select('waktu_absen').eq('npm', profile.npm).order('waktu_absen', { ascending: false }),
      supabase.from('perizinan').select('*').eq('npm', profile.npm).order('created_at', { ascending: false }),
      supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: false }),
      supabase.from('bukti_tugas').select('tugas_id').eq('user_id', user.id),
    ]);

    if (absensiRes.data) setAbsensi(absensiRes.data as Absensi[]);
    if (perizinanRes.data) setPerizinan(perizinanRes.data as Perizinan[]);
    if (tugasRes.data) setTugas(tugasRes.data as Tugas[]);
    if (buktiRes.data) setBuktiTugasIds(new Set(buktiRes.data.map((b: any) => b.tugas_id)));

    setLoadingData(false);
  };

  const formatTanggal = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { dateStyle: 'medium' });
  };

  const formatWaktu = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'kehadiran', label: 'Kehadiran', icon: <ClipboardCheck size={15} /> },
    { id: 'perizinan', label: 'Perizinan', icon: <FileText size={15} /> },
    { id: 'tugas', label: 'Tugas', icon: <ClipboardList size={15} /> },
  ];

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb] dark:bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-indigo-600" size={28} />
      </div>
    );
  }

  // --- GERBANG VERIFIKASI PASSWORD ---
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#141414] rounded-[32px] shadow-sm border border-slate-100 dark:border-white/10 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
              <Lock className="text-white" size={22} />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Verifikasi Ulang</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Laporan ini berisi data pribadi kamu. Masukkan password akunmu untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-3">
            <input
              type="password"
              placeholder="Password akun kamu"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 focus:border-indigo-500 rounded-2xl outline-none font-bold text-center transition-all text-slate-900 dark:text-white"
            />
            {verifyError && (
              <p className="text-xs font-bold text-red-600 text-center">{verifyError}</p>
            )}
            <button
              type="submit"
              disabled={verifying}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all ${
                verifying ? 'bg-slate-400' : 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {verifying ? 'Memverifikasi...' : 'Verifikasi & Lihat Laporan'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] font-sans">
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Laporan Saya</h1>
            <p className="text-xs text-slate-400 font-medium">
              {namaUser ? `${namaUser} • NPM ${npmUser}` : 'Rekap kehadiran, perizinan, dan tugas milikmu'}
            </p>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
          </div>
        ) : !npmUser ? (
          <div className="bg-white dark:bg-[#141414] rounded-[28px] py-20 text-center shadow-sm border border-slate-100 dark:border-white/10">
            <PackageOpen className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-300 font-black uppercase italic text-lg tracking-widest">Profil belum lengkap</p>
            <p className="text-xs text-slate-400 mt-2">NPM kamu belum terdaftar di sistem, hubungi admin ya.</p>
          </div>
        ) : (
          <>
            {/* TABS */}
            <div className="flex gap-2 p-1.5 bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-slate-100 dark:border-white/10">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                    activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* TAB: KEHADIRAN */}
            {activeTab === 'kehadiran' && (
              <div className="bg-white dark:bg-[#141414] rounded-[28px] p-6 shadow-sm border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">Riwayat Kehadiran</h3>
                  <span className="text-[11px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl">
                    {absensi.length}x hadir
                  </span>
                </div>
                {absensi.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {absensi.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                          <ClipboardCheck size={14} />
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatWaktu(a.waktu_absen)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <PackageOpen className="mx-auto text-slate-300 mb-2" size={36} />
                    <p className="text-sm text-slate-400 font-medium">Belum ada riwayat kehadiran</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PERIZINAN */}
            {activeTab === 'perizinan' && (
              <div className="bg-white dark:bg-[#141414] rounded-[28px] p-6 shadow-sm border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">Riwayat Perizinan</h3>
                  <span className="text-[11px] font-black bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-xl">
                    {perizinan.length}x izin
                  </span>
                </div>
                {perizinan.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {perizinan.map((p) => (
                      <div key={p.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                            {p.mk_nama || 'Tanpa mata kuliah'}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">{formatTanggal(p.created_at)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {p.alasan || 'Tidak ada alasan tercatat'}
                        </p>
                        {p.tgl_izin && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">Izin untuk tanggal: {p.tgl_izin}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <PackageOpen className="mx-auto text-slate-300 mb-2" size={36} />
                    <p className="text-sm text-slate-400 font-medium">Belum ada riwayat perizinan</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: TUGAS */}
            {activeTab === 'tugas' && (
              <div className="bg-white dark:bg-[#141414] rounded-[28px] p-6 shadow-sm border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">Status Pengumpulan Tugas</h3>
                  <span className="text-[11px] font-black bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-xl">
                    {buktiTugasIds.size}/{tugas.length} selesai
                  </span>
                </div>
                {tugas.length > 0 ? (
                  <div className="space-y-3">
                    {tugas.map((t) => {
                      const sudahKumpul = buktiTugasIds.has(t.id);
                      return (
                        <div key={t.id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            sudahKumpul ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                          }`}>
                            <ClipboardList size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{t.judul_tugas}</p>
                            <p className="text-xs text-slate-400">{t.mk_nama} • Deadline {formatTanggal(t.deadline)}</p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${
                            sudahKumpul ? 'bg-emerald-600 text-white' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>
                            {sudahKumpul ? 'Selesai' : 'Belum'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <PackageOpen className="mx-auto text-slate-300 mb-2" size={36} />
                    <p className="text-sm text-slate-400 font-medium">Belum ada tugas tercatat</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}