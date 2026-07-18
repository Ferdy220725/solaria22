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
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] font-sans">
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <Shuffle size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Acak Kelompok Tugas</h1>
            <p className="text-xs text-slate-400 font-medium">Pembagian kelompok cepat, seimbang laki-laki & perempuan</p>
          </div>
        </div>

        {/* FORM INPUT */}
        <div className="bg-white dark:bg-[#141414] rounded-[28px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 tracking-wider">
                <Users size={14} /> Nama Laki-laki (satu nama per baris)
              </label>
              <textarea
                value={lakiText}
                onChange={(e) => setLakiText(e.target.value)}
                rows={8}
                placeholder={"Contoh:\nFerdy\nAlief\nFabian"}
                className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none text-sm font-medium text-slate-900 dark:text-white transition-all resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 tracking-wider">
                <Users size={14} /> Nama Perempuan (satu nama per baris)
              </label>
              <textarea
                value={perempuanText}
                onChange={(e) => setPerempuanText(e.target.value)}
                rows={8}
                placeholder={"Contoh:\nSalwa\nDhanti\nNadia"}
                className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none text-sm font-medium text-slate-900 dark:text-white transition-all resize-none"
              />
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 dark:border-white/10 pt-5">
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-wider">
              Cara Membagi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-4">
              <button
                onClick={() => setMode("jumlah_kelompok")}
                className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${
                  mode === "jumlah_kelompok"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500"
                }`}
              >
                Tentukan Jumlah Kelompok
              </button>
              <button
                onClick={() => setMode("orang_per_kelompok")}
                className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${
                  mode === "orang_per_kelompok"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500"
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
                className="w-28 p-3.5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500 rounded-xl text-sm font-black text-center text-slate-900 dark:text-white outline-none transition-all"
              />
              <span className="text-xs font-bold text-slate-400 uppercase">
                {mode === "jumlah_kelompok" ? "Kelompok" : "Orang per Kelompok"}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleAcak}
            className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-sm tracking-wider shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Shuffle size={18} /> Acak Kelompok!
          </button>
        </div>

        {/* HASIL */}
        {groups && (
          <div className="bg-white dark:bg-[#141414] rounded-[28px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Hasil Pembagian ({groups.length} Kelompok)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleAcak}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                >
                  <Shuffle size={13} /> Acak Ulang
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Tersalin!" : "Salin Teks"}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-black uppercase hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 transition-all"
                >
                  <RotateCcw size={13} /> Reset
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
                    className="bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/10 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black uppercase text-sm text-indigo-600 dark:text-indigo-400">
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
                          className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0d0d0d] px-3 py-2 rounded-xl border border-slate-100 dark:border-white/10 flex justify-between items-center"
                        >
                          {m.nama}
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              m.gender === "L"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                : "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400"
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