"use client";

import React from "react";
import { MessageCircle, Sparkles, Target, Users, Copy, Heart, Mail } from "lucide-react";

const NOMOR_KONTAK = "082228731431";
// Format internasional untuk link WhatsApp (62 = kode negara Indonesia, tanpa angka 0 di depan)
const NOMOR_WA = "62" + NOMOR_KONTAK.slice(1);
const EMAIL_KONTAK = "zoraferrsofficial@gmail.com";

export default function TentangPage() {
  const [copied, setCopied] = React.useState(false);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(NOMOR_KONTAK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback diam-diam jika clipboard API tidak tersedia
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_KONTAK);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // fallback diam-diam jika clipboard API tidak tersedia
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] font-sans">
      <div className="p-4 md:p-8 max-w-[1000px] mx-auto space-y-6">

        {/* HEADER BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[28px] p-8 md:p-12 text-white shadow-xl text-center">
          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 mb-5 bg-white rounded-[24px] p-2.5 shadow-2xl ring-4 ring-white/15 flex items-center justify-center">
              <img
                src="/logo-zora.jpg"
                alt="Logo Zora"
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                }}
              />
            </div>

            <span className="inline-block text-[10px] font-black text-indigo-100 uppercase tracking-[0.3em] bg-white/15 border border-white/20 px-4 py-1.5 rounded-full mb-4">
              Tentang Kami
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[1.1] mb-4">
              Kenalan Sama <br className="hidden md:block" /> Zora Yuk!
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm font-medium max-w-xl mx-auto leading-relaxed">
              Portal digital yang dibangun khusus untuk mendukung kegiatan perkuliahan Kelas C Agroteknologi.
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* APA ITU ZORA */}
        <div className="bg-white dark:bg-[#141414] rounded-[28px] p-6 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <Sparkles size={20} />
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
              Apa itu Zora?
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            <span className="font-black text-indigo-600">Zora</span> adalah nama sekaligus sebutan untuk asisten
            digital Kelas C Agroteknologi — sebuah sistem manajemen kelas yang membantu mengelola kegiatan
            perkuliahan sehari-hari. Mulai dari memantau tugas dan deadline, jadwal kuliah, sesi Zoom, materi
            kuliah, praktikum, sampai pengajuan izin, semuanya dirangkum dalam satu platform yang simpel dan bisa
            diakses kapan saja.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mt-4">
            Tujuannya sederhana: supaya informasi perkuliahan nggak lagi tercecer di berbagai grup chat, dan setiap
            orang bisa update dengan cara yang lebih rapi dan menyenangkan.
          </p>
        </div>

        {/* WHY ZORA */}
        <div className="bg-white dark:bg-[#141414] rounded-[28px] p-6 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-sm">
              Z/A
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
              Why ZORA?
            </h2>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            <p>
              ZORA dimulai dengan huruf <span className="font-black text-indigo-600">Z</span> dan berakhir dengan
              huruf <span className="font-black text-indigo-600">A</span>. Bagi kami, itu bukan sekadar nama.
            </p>
            <p>
              <span className="font-black text-slate-900 dark:text-white">Z</span> melambangkan mereka yang merasa berada di
              posisi terakhir — baru memulai, penuh keraguan, sedang berusaha keluar dari zona nyaman, atau
              merasa tertinggal dibanding orang lain.
            </p>
            <p>
              Sedangkan <span className="font-black text-slate-900 dark:text-white">A</span> melambangkan sebuah awal baru,
              keberanian untuk melangkah, dan kesempatan untuk menjadi yang terdepan.
            </p>
            <p>
              Kami percaya bahwa hidup bukanlah perlombaan tentang siapa yang memulai lebih dulu. Tidak semua
              yang berada di depan akan tetap berada di depan, dan tidak semua yang memulai dari belakang akan
              selamanya tertinggal.
            </p>
            <p>
              Selama ada niat, tekad, usaha, dan doa, setiap langkah kecil akan membawa kita semakin dekat pada
              tujuan. Karena pada akhirnya, kita tidak pernah benar-benar terlambat untuk memulai.
            </p>
            <p className="font-black text-slate-900 dark:text-white italic">
              Tidak peduli dari mana kamu memulai, semua orang punya kesempatan untuk menjadi yang terbaik.
            </p>
          </div>
        </div>

        {/* FITUR UTAMA */}
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 px-1">Kenapa Zora?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Target size={20} />, title: "Fokus & Terorganisir", desc: "Semua tugas, deadline, dan jadwal tersusun rapi di satu dashboard." },
              { icon: <Users size={20} />, title: "Dibuat oleh & untuk Kelas C", desc: "Dikembangkan langsung berdasarkan kebutuhan nyata teman-teman sekelas." },
              { icon: <Sparkles size={20} />, title: "Terus Diperbarui", desc: "Fitur terus dikembangkan dari masukan dan saran pengguna." },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-[#141414] p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-white/10 text-center">
                <div className="w-11 h-11 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-black uppercase text-xs tracking-wider text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KONTAK / KRITIK & SARAN */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[28px] p-8 md:p-12 text-white shadow-xl text-center">
          <div className="relative z-10">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 flex items-center justify-center mb-5">
              <MessageCircle size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black mb-3">
              Ada Kritik atau Saran?
            </h2>
            <p className="text-indigo-100 text-xs md:text-sm font-medium max-w-md mx-auto leading-relaxed mb-6">
              Zora masih terus dikembangkan. Kalau kamu nemu bug, punya ide fitur baru, atau sekadar mau kasih
              masukan, jangan ragu untuk menghubungi kami ya!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-center mb-3">
              
               <a href={`https://wa.me/${NOMOR_WA}?text=${encodeURIComponent("Halo, saya mau kasih kritik/saran untuk Zora:")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-indigo-700 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg active:scale-95 hover:bg-indigo-50 transition-all"
              >
                <MessageCircle size={16} />
                Chat via WhatsApp
              </a>

              
               <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=zoraferrsofficial@gmail.com}`}
                className="flex items-center gap-2 bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg active:scale-95 hover:bg-white/25 transition-all"
              >
                <Mail size={16} />
                Kirim Email
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold text-[11px] px-4 py-2.5 rounded-2xl active:scale-95 hover:bg-white/20 transition-all"
              >
                <Copy size={14} />
                {copied ? "Nomor Tersalin!" : NOMOR_KONTAK}
              </button>

              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold text-[11px] px-4 py-2.5 rounded-2xl active:scale-95 hover:bg-white/20 transition-all"
              >
                <Copy size={14} />
                {copiedEmail ? "Email Tersalin!" : EMAIL_KONTAK}
              </button>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* CREDIT PEMBUAT */}
        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pt-2 pb-4">
          Web by Ahmat Choyrul Ferdyansyah <Heart size={11} className="text-indigo-400 fill-indigo-400" />
        </p>
      </div>
    </div>
  );
}