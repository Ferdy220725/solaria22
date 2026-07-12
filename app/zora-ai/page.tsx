// app/zora-ai/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Send,
  Loader2,
  X,
  Bot,
  User,
  ChevronRight,
  Search,
  GraduationCap,
} from "lucide-react";

type ChatMessage = { role: "user" | "model"; text: string };
type Materi = {
  id: string;
  judul: string;
  mk_nama: string;
  semester: number;
};
type MKGroup = {
  mk_nama: string;
  semesters: number[];
  count: number;
};

export default function ZoraAI() {
  const router = useRouter();
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [ringkasLoadingId, setRingkasLoadingId] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState("");

  // Step picker: null = tampilkan daftar mata kuliah, string = mata kuliah yang dipilih
  const [selectedMK, setSelectedMK] = useState<string | null>(null);
  const [mkSemesterFilter, setMkSemesterFilter] = useState<number | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [materiContext, setMateriContext] = useState<string | null>(null);
  const [activeMateriLabel, setActiveMateriLabel] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Kunci scroll halaman belakang saat modal terbuka, supaya browser mobile
  // tidak salah fokus scroll ke halaman utama alih-alih ke dalam modal
  useEffect(() => {
    if (showPicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPicker]);

  // Ambil user yang login + riwayat chatnya saat halaman dibuka
  useEffect(() => {
    const loadHistory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingHistory(false);
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from("zora_ai_messages")
        .select("role, content, materi_context, materi_label, created_at")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(
          data.map((row) => ({
            role: row.role as "user" | "model",
            text: row.content,
          }))
        );

        // Restore konteks materi terakhir yang aktif (kalau ada)
        const lastWithContext = [...data]
          .reverse()
          .find((row) => row.materi_context);
        if (lastWithContext) {
          setMateriContext(lastWithContext.materi_context);
          setActiveMateriLabel(lastWithContext.materi_label);
        }
      }
      setLoadingHistory(false);
    };

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: simpan satu baris pesan ke Supabase (RLS otomatis pakai auth.uid())
  const saveMessage = async (
    role: "user" | "model",
    text: string,
    extra?: { materiContext?: string; materiLabel?: string }
  ) => {
    if (!userId) return; // kalau belum login, cuma simpan di state (jaga-jaga)
    const { error } = await supabase.from("zora_ai_messages").insert({
      user_id: userId,
      role,
      content: text,
      materi_context: extra?.materiContext ?? null,
      materi_label: extra?.materiLabel ?? null,
    });
    if (error) {
      console.error("Gagal menyimpan pesan:", error.message);
    }
  };

  const openPicker = async () => {
    setShowPicker(true);
    setPickerError("");
    // Selalu mulai dari daftar mata kuliah setiap kali dibuka
    setSelectedMK(null);
    setMkSemesterFilter(null);
    setSemesterFilter(null);
    setSearchQuery("");

    if (materiList.length === 0) {
      setLoadingList(true);
      const { data, error } = await supabase
        .from("materi")
        .select("id, judul, mk_nama, semester")
        .order("mk_nama", { ascending: true });

      setLoadingList(false);

      if (error) {
        setPickerError("Gagal memuat daftar materi.");
      } else {
        setMateriList(data || []);
      }
    }
  };

  const closePicker = () => {
    setShowPicker(false);
    setSelectedMK(null);
    setMkSemesterFilter(null);
    setSemesterFilter(null);
    setSearchQuery("");
  };

  const handlePilihMK = (mk_nama: string) => {
    setSelectedMK(mk_nama);
    setSemesterFilter(null);
    setSearchQuery("");
  };

  const handleBackToMK = () => {
    setSelectedMK(null);
    setSemesterFilter(null);
    setSearchQuery("");
  };

  const handlePilihMateri = async (materi: Materi) => {
    setRingkasLoadingId(materi.id);
    setPickerError("");

    try {
      const res = await fetch("/api/zora-ai/ringkas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materiId: materi.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPickerError(data.error || "Gagal meringkas materi ini.");
        setRingkasLoadingId(null);
        return;
      }

      const userText = `Ringkas materi: ${materi.judul}`;
      const label = `${materi.mk_nama} • ${materi.judul}`;

      setMateriContext(data.konteks);
      setActiveMateriLabel(label);

      setMessages((prev) => [
        ...prev,
        { role: "user", text: userText },
        { role: "model", text: data.summary },
      ]);

      // Simpan dua baris: pesan user + ringkasan (konteks materi ikut disimpan di baris ini)
      await saveMessage("user", userText);
      await saveMessage("model", data.summary, {
        materiContext: data.konteks,
        materiLabel: label,
      });

      closePicker();
    } catch (err) {
      setPickerError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setRingkasLoadingId(null);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    // Simpan pesan user duluan, tidak perlu ditunggu (non-blocking)
    saveMessage("user", text);

    try {
      const res = await fetch("/api/zora-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, materiContext }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errText = "⚠️ " + (data.error || "Terjadi kesalahan. Coba lagi.");
        setMessages((prev) => [...prev, { role: "model", text: errText }]);
        // Error juga disimpan biar riwayat konsisten dengan yang terlihat di layar
        saveMessage("model", errText);
      } else {
        setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
        saveMessage("model", data.reply);
      }
    } catch {
      const errText = "⚠️ Gagal terhubung ke server. Coba lagi.";
      setMessages((prev) => [...prev, { role: "model", text: errText }]);
      saveMessage("model", errText);
    } finally {
      setSending(false);
    }
  };

  // Semua pilihan semester yang tersedia (dari seluruh materi, dipakai untuk filter tahap 1)
  const allSemesterOptions = Array.from(
    new Set(materiList.map((m) => m.semester))
  ).sort((a, b) => a - b);

  // Kelompokkan materi berdasarkan mata kuliah, sudah disaring semester dulu (kalau ada filter)
  const materiUntukGrouping = mkSemesterFilter
    ? materiList.filter((m) => m.semester === mkSemesterFilter)
    : materiList;

  const mkGroups: MKGroup[] = Object.values(
    materiUntukGrouping.reduce((acc, m) => {
      if (!acc[m.mk_nama]) {
        acc[m.mk_nama] = { mk_nama: m.mk_nama, semesters: [], count: 0 };
      }
      if (!acc[m.mk_nama].semesters.includes(m.semester)) {
        acc[m.mk_nama].semesters.push(m.semester);
      }
      acc[m.mk_nama].count += 1;
      return acc;
    }, {} as Record<string, MKGroup>)
  ).sort((a, b) => a.mk_nama.localeCompare(b.mk_nama));

  // Materi di dalam mata kuliah yang sedang dipilih
  const materiDalamMK = materiList.filter((m) => m.mk_nama === selectedMK);

  const semesterOptionsMK = Array.from(
    new Set(materiDalamMK.map((m) => m.semester))
  ).sort((a, b) => a - b);

  const filteredMateri = materiDalamMK
    .filter((m) => (semesterFilter ? m.semester === semesterFilter : true))
    .filter((m) =>
      m.judul.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div className="w-9 h-9 rounded-full bg-[#800020] flex items-center justify-center">
          <Sparkles size={16} color="white" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 leading-none">ZORA AI</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Asisten belajar kamu</p>
        </div>
      </div>

      {/* Konteks materi aktif */}
      {activeMateriLabel && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 bg-[#800020]/5 border border-[#800020]/15 rounded-2xl px-3 py-2">
            <BookOpen size={14} className="text-[#800020] shrink-0" />
            <p className="text-[11px] text-[#800020] font-semibold truncate">
              Membahas: {activeMateriLabel}
            </p>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin text-[#800020]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center pt-10 pb-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#800020] flex items-center justify-center">
              <Sparkles size={28} color="white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800">Halo! Aku ZORA AI 👋</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Tanya apa saja seputar kuliahmu, atau minta aku ringkas materi biar belajar
                lebih efisien.
              </p>
            </div>

            <button
              onClick={openPicker}
              className="w-full max-w-sm flex items-center gap-3 bg-white border-2 border-[#800020]/15 rounded-2xl p-4 text-left hover:border-[#800020]/40 transition-colors shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-[#800020] flex items-center justify-center shrink-0">
                <BookOpen size={20} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">Ringkas Materi</p>
                <p className="text-[11px] text-slate-400">
                  Pilih mata kuliah & materi, biar aku ringkas
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-300 shrink-0" />
            </button>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "model" && (
                <div className="w-7 h-7 rounded-full bg-[#800020] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} color="white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#800020] text-white rounded-br-sm whitespace-pre-wrap"
                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm prose prose-sm prose-slate max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-headings:my-2 prose-headings:font-black prose-strong:text-slate-800 prose-hr:my-2"
                }`}
              >
                {msg.role === "model" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-slate-500" />
                </div>
              )}
            </div>
          ))
        )}

        {sending && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#800020] flex items-center justify-center shrink-0">
              <Bot size={14} color="white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <Loader2 size={14} className="animate-spin text-slate-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={openPicker}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 hover:bg-slate-200 transition-colors"
            title="Ringkas Materi"
          >
            <BookOpen size={18} className="text-[#800020]" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tanya apa saja ke ZORA AI..."
            className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#800020]/40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-[#800020] flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          >
            <Send size={16} color="white" />
          </button>
        </div>
      </div>

      {/* Modal Picker Materi */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-[30px] rounded-t-[30px] flex flex-col overflow-hidden"
            style={{
              height: "min(85dvh, 640px)",
              maxHeight: "85dvh",
            }}
          >
            {/* Header modal - tidak ikut discroll */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {selectedMK && (
                  <button
                    onClick={handleBackToMK}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 shrink-0"
                  >
                    <ArrowLeft size={16} className="text-slate-500" />
                  </button>
                )}
                <p className="text-sm font-black text-slate-800 truncate">
                  {selectedMK ? selectedMK : "Pilih Mata Kuliah"}
                </p>
              </div>
              <button
                onClick={closePicker}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 shrink-0"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* SATU wadah scroll saja untuk seluruh isi body modal.
                Sengaja tidak ditumpuk pakai flex-1 berlapis-lapis karena
                itu yang bikin scroll gagal jalan di beberapa browser mobile. */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {/* ==== TAHAP 1: DAFTAR MATA KULIAH ==== */}
              {!selectedMK && (
                <div>
                  {/* Filter semester (untuk saring mata kuliah) */}
                  {allSemesterOptions.length > 1 && (
                    <div className="flex flex-wrap gap-2 px-5 pt-3 pb-1">
                      <button
                        onClick={() => setMkSemesterFilter(null)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                          mkSemesterFilter === null
                            ? "bg-[#800020] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        Semua Semester
                      </button>
                      {allSemesterOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => setMkSemesterFilter(s)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                            mkSemesterFilter === s
                              ? "bg-[#800020] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          Semester {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-3">
                    {loadingList ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 size={22} className="animate-spin text-[#800020]" />
                      </div>
                    ) : pickerError ? (
                      <p className="text-xs text-center text-red-600 py-6">{pickerError}</p>
                    ) : mkGroups.length === 0 ? (
                      <p className="text-xs text-center text-slate-400 py-6">
                        {mkSemesterFilter
                          ? `Belum ada materi di semester ${mkSemesterFilter}.`
                          : "Belum ada materi tersedia."}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {mkGroups.map((g) => (
                          <button
                            key={g.mk_nama}
                            onClick={() => handlePilihMK(g.mk_nama)}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-[#800020]/30 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <GraduationCap size={16} className="text-[#800020]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-700 truncate">
                                {g.mk_nama}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {g.count} materi • Semester{" "}
                                {g.semesters.sort((a, b) => a - b).join(", ")}
                              </p>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==== TAHAP 2: DAFTAR MATERI DALAM MATA KULIAH ==== */}
              {selectedMK && (
                <div>
                  {/* Search box */}
                  <div className="px-5 pt-3 pb-2">
                    <div className="relative">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari judul materi..."
                        className="w-full border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-[#800020]/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Filter semester (kalau MK ini punya lebih dari 1 semester) */}
                  {semesterOptionsMK.length > 1 && (
                    <div className="flex flex-wrap gap-2 px-5 pb-3">
                      <button
                        onClick={() => setSemesterFilter(null)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                          semesterFilter === null
                            ? "bg-[#800020] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        Semua
                      </button>
                      {semesterOptionsMK.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSemesterFilter(s)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                            semesterFilter === s
                              ? "bg-[#800020] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          Semester {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-100" />

                  {/* List materi */}
                  <div className="p-3">
                    {pickerError ? (
                      <p className="text-xs text-center text-red-600 py-6">{pickerError}</p>
                    ) : filteredMateri.length === 0 ? (
                      <p className="text-xs text-center text-slate-400 py-6">
                        {searchQuery
                          ? "Materi dengan judul itu tidak ditemukan."
                          : "Belum ada materi di sini."}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredMateri.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => handlePilihMateri(m)}
                            disabled={ringkasLoadingId !== null}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-[#800020]/30 transition-colors text-left disabled:opacity-50"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              {ringkasLoadingId === m.id ? (
                                <Loader2 size={16} className="animate-spin text-[#800020]" />
                              ) : (
                                <BookOpen size={16} className="text-[#800020]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-700 truncate">
                                {m.judul}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Semester {m.semester}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}