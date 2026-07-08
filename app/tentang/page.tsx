"use client";

import React from "react";
import { MessageCircle, Sparkles, Target, Users, Copy } from "lucide-react";

const NOMOR_KONTAK = "082228731431";
// Format internasional untuk link WhatsApp (62 = kode negara Indonesia, tanpa angka 0 di depan)
const NOMOR_WA = "62" + NOMOR_KONTAK.slice(1);

export default function TentangPage() {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(NOMOR_KONTAK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback diam-diam jika clipboard API tidak tersedia
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-32">
      {/* HEADER */}
      <div className="w-full bg-[#800020] py-16 md:py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

        {/* LOGO ZORA */}
        <div className="relative mx-auto w-24 h-24 md:w-28 md:h-28 mb-6 bg-white rounded-[28px] p-3 shadow-2xl ring-4 ring-white/15 flex items-center justify-center">
          <img
            src="/logo-zora.jpg"
            alt="Logo Zora"
            className="w-full h-full object-contain rounded-2xl"
            onError={(e) => {
              // Sembunyikan otomatis kalau file logo belum ada di /public
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
        </div>

        <span className="relative text-[10px] font-black text-white/80 uppercase tracking-[0.3em] bg-white/10 border border-white/20 px-4 py-1.5 rounded-full">
          Tentang Kami
        </span>
        <h1 className="relative text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter mt-5 leading-[1.1]">
          Kenalan Sama <br className="hidden md:block" /> Zora YUK!
        </h1>
        <p className="relative text-slate-200 text-xs md:text-sm font-bold mt-4 max-w-xl mx-auto leading-relaxed">
          Portal digital yang dibangun khusus untuk mendukung kegiatan perkuliahan Kelas C Agroteknologi.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
        {/* APA ITU ZORA */}
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border-2 border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-[#800020]">
              <Sparkles size={22} />
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              Apa itu Zora?
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            <span className="font-black text-[#800020]">Zora</span> adalah nama sekaligus sebutan untuk asisten
            digital Kelas C Agroteknologi — sebuah sistem manajemen kelas yang membantu mengelola kegiatan
            perkuliahan sehari-hari. Mulai dari memantau tugas dan deadline, jadwal kuliah, sesi Zoom, materi
            kuliah, praktikum, sampai pengajuan izin, semuanya dirangkum dalam satu platform yang simpel dan bisa
            diakses kapan saja.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed font-medium mt-4">
            Tujuannya sederhana: supaya informasi perkuliahan nggak lagi tercecer di berbagai grup chat, dan setiap
            orang bisa update dengan cara yang lebih rapi dan menyenangkan.
          </p>
        </div>

        {/* WHY ZORA */}
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border-2 border-slate-100 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-50 rounded-2xl text-[#800020] font-black text-lg w-12 h-12 flex items-center justify-center">
              Z/A
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              Why ZORA?
            </h2>
          </div>

          <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
            <p>
              ZORA dimulai dengan huruf <span className="font-black text-[#800020]">Z</span> dan berakhir dengan
              huruf <span className="font-black text-[#800020]">A</span>. Bagi kami, itu bukan sekadar nama.
            </p>
            <p>
              <span className="font-black text-slate-900">Z</span> melambangkan mereka yang merasa berada di
              posisi terakhir — baru memulai, penuh keraguan, sedang berusaha keluar dari zona nyaman, atau
              merasa tertinggal dibanding orang lain.
            </p>
            <p>
              Sedangkan <span className="font-black text-slate-900">A</span> melambangkan sebuah awal baru,
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
            <p className="font-black text-slate-900 italic">
              Tidak peduli dari mana kamu memulai, semua orang punya kesempatan untuk menjadi yang terbaik.
            </p>
          </div>
        </div>

        {/* FITUR UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            { icon: <Target size={20} />, title: "Fokus & Terorganisir", desc: "Semua tugas, deadline, dan jadwal tersusun rapi di satu dashboard." },
            { icon: <Users size={20} />, title: "Dibuat oleh & untuk Kelas C", desc: "Dikembangkan langsung berdasarkan kebutuhan nyata teman-teman sekelas." },
            { icon: <Sparkles size={20} />, title: "Terus Diperbarui", desc: "Fitur terus dikembangkan dari masukan dan saran pengguna." },
          ].map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-[30px] shadow-md border-2 border-slate-100 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-[#800020] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-black uppercase text-xs tracking-widest text-slate-900 mb-2">{f.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* KONTAK / KRITIK & SARAN */}
        <div className="bg-[#004d40] p-8 md:p-12 rounded-[40px] shadow-xl mt-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 text-white flex items-center justify-center mb-5">
            <MessageCircle size={26} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white mb-3">
            Ada Kritik atau Saran?
          </h2>
          <p className="text-emerald-100 text-xs md:text-sm font-medium max-w-md mx-auto leading-relaxed mb-6">
            Zora masih terus dikembangkan. Kalau kamu nemu bug, punya ide fitur baru, atau sekadar mau kasih
            masukan, jangan ragu untuk menghubungi kami ya!
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`https://wa.me/${NOMOR_WA}?text=${encodeURIComponent("Halo, saya mau kasih kritik/saran untuk Zora:")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-[#004d40] font-black uppercase text-[11px] tracking-widest px-6 py-4 rounded-full shadow-lg active:scale-95 hover:bg-emerald-50 transition-all"
            >
              <MessageCircle size={16} />
              Chat via WhatsApp
            </a>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-white/10 border-2 border-white/20 text-white font-black uppercase text-[11px] tracking-widest px-6 py-4 rounded-full active:scale-95 hover:bg-white/20 transition-all"
            >
              <Copy size={16} />
              {copied ? "Tersalin!" : NOMOR_KONTAK}
            </button>
          </div>
        </div>

        {/* CREDIT PEMBUAT */}
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-8">
          Web by Ahmat Choyrul Ferdyansyah
        </p>
      </div>
    </div>
  );
}