"use client";

import { useState } from "react";
import { Shuffle, Users, RotateCcw, Copy, Check } from "lucide-react";

interface Group {
  id: number;
  members: { nama: string; gender: "L" | "P" }[];
}

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseNames(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function AcakKelompok() {
  const [lakiText, setLakiText] = useState("");
  const [perempuanText, setPerempuanText] = useState("");
  const [mode, setMode] = useState<"jumlah_kelompok" | "orang_per_kelompok">("jumlah_kelompok");
  const [angka, setAngka] = useState<number>(5);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAcak = () => {
    setError("");
    setCopied(false);

    const lakiList = parseNames(lakiText);
    const perempuanList = parseNames(perempuanText);
    const total = lakiList.length + perempuanList.length;

    if (total === 0) {
      setError("Isi minimal satu nama dulu ya (Laki-laki atau Perempuan).");
      return;
    }
    if (!angka || angka < 1) {
      setError("Angka jumlah kelompok / orang per kelompok harus lebih dari 0.");
      return;
    }

    const jumlahKelompok =
      mode === "jumlah_kelompok" ? Math.floor(angka) : Math.max(1, Math.ceil(total / angka));

    if (jumlahKelompok > total) {
      setError("Jumlah kelompok tidak boleh lebih banyak dari jumlah orang.");
      return;
    }

    // Siapkan wadah kelompok kosong
    const newGroups: Group[] = Array.from({ length: jumlahKelompok }, (_, i) => ({
      id: i + 1,
      members: [],
    }));

    // Acak masing-masing gender secara terpisah
    const shuffledLaki = shuffleArray(lakiList);
    const shuffledPerempuan = shuffleArray(perempuanList);

    // Sebar laki-laki secara round-robin ke tiap kelompok
    shuffledLaki.forEach((nama, idx) => {
      newGroups[idx % jumlahKelompok].members.push({ nama, gender: "L" });
    });

    // Sebar perempuan secara round-robin, MULAI dari kelompok yang paling sedikit isinya
    // biar distribusi total tetap rata walau jumlah L & P beda
    shuffledPerempuan.forEach((nama) => {
      const target = newGroups.reduce((min, g) =>
        g.members.length < min.members.length ? g : min
      );
      target.members.push({ nama, gender: "P" });
    });

    setGroups(newGroups);
  };

  const handleCopy = () => {
    if (!groups) return;
    const text = groups
      .map(
        (g) =>
          `KELOMPOK ${g.id}\n` +
          g.members.map((m) => `- ${m.nama} (${m.gender})`).join("\n")
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGroups(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-32 font-sans">
      {/* HEADER */}
      <div className="bg-[#800020] pt-16 pb-10 px-6 text-center border-b-8 border-[#5a0016]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
          <Shuffle size={32} className="text-white" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black uppercase italic text-white tracking-tighter">
          Acak Kelompok Tugas
        </h1>
        <p className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">
          Pembagian kelompok cepat dan efisien
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-6">
        {/* FORM INPUT */}
        <div className="bg-white rounded-[35px] shadow-xl border-2 border-slate-200 p-6 md:p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 mb-2">
                <Users size={14} /> Nama Laki-laki (satu nama per baris)
              </label>
              <textarea
                value={lakiText}
                onChange={(e) => setLakiText(e.target.value)}
                rows={8}
                placeholder={"Contoh:\nFerdy\nAlief\nFabian"}
                className="w-full p-3 rounded-2xl border-2 border-slate-200 text-sm font-medium focus:border-[#800020] outline-none resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 mb-2">
                <Users size={14} /> Nama Perempuan (satu nama per baris)
              </label>
              <textarea
                value={perempuanText}
                onChange={(e) => setPerempuanText(e.target.value)}
                rows={8}
                placeholder={"Contoh:\nSalwa\nDhanti\nNadia"}
                className="w-full p-3 rounded-2xl border-2 border-slate-200 text-sm font-medium focus:border-[#800020] outline-none resize-none"
              />
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-100 pt-5">
            <label className="block text-xs font-black uppercase text-slate-500 mb-3">
              Cara Membagi
            </label>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={() => setMode("jumlah_kelompok")}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase border-2 transition-all ${
                  mode === "jumlah_kelompok"
                    ? "bg-[#800020] text-white border-[#800020]"
                    : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                Tentukan Jumlah Kelompok
              </button>
              <button
                onClick={() => setMode("orang_per_kelompok")}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase border-2 transition-all ${
                  mode === "orang_per_kelompok"
                    ? "bg-[#800020] text-white border-[#800020]"
                    : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                Tentukan Orang / Kelompok
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={angka}
                onChange={(e) => setAngka(parseInt(e.target.value) || 0)}
                className="w-28 p-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-center focus:border-[#800020] outline-none"
              />
              <span className="text-xs font-bold text-slate-500 uppercase">
                {mode === "jumlah_kelompok" ? "Kelompok" : "Orang per Kelompok"}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-xs font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleAcak}
            className="w-full mt-6 bg-[#800020] text-white py-4 rounded-2xl font-black uppercase text-sm tracking-wider border-b-4 border-[#5a0016] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Shuffle size={18} /> Acak Kelompok!
          </button>
        </div>

        {/* HASIL */}
        {groups && (
          <div className="bg-white rounded-[35px] shadow-xl border-2 border-slate-200 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-black uppercase text-slate-800">
                Hasil Pembagian ({groups.length} Kelompok)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleAcak}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 text-[10px] font-black uppercase active:scale-95 transition-all"
                >
                  <Shuffle size={14} /> Acak Ulang
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-[10px] font-black uppercase active:scale-95 transition-all"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Tersalin!" : "Salin Teks"}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 text-[10px] font-black uppercase active:scale-95 transition-all"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g) => {
                const jmlL = g.members.filter((m) => m.gender === "L").length;
                const jmlP = g.members.filter((m) => m.gender === "P").length;
                return (
                  <div
                    key={g.id}
                    className="bg-slate-50 rounded-[28px] border-2 border-slate-200 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black uppercase text-sm text-[#800020]">
                        Kelompok {g.id}
                      </h3>
                      <span className="text-[9px] font-black text-slate-400 uppercase">
                        L:{jmlL} · P:{jmlP}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {g.members.map((m, idx) => (
                        <li
                          key={idx}
                          className="text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 flex justify-between items-center"
                        >
                          {m.nama}
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              m.gender === "L"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {m.gender}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}