"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { channelName, EVENT_NAME, PresentasiEvent } from "@/lib/presentasiChannel";
import { ChevronLeft, ChevronRight, Radar, NotebookPen, Check, LayoutGrid, MonitorOff, X } from "lucide-react";

export default function RemoteControl({
  params,
}: {
  params: Promise<{ kode: string; itemId: string }>;
}) {
  const { kode, itemId } = use(params);
  const supabase = createClient();

  const [slide, setSlide] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [blank, setBlank] = useState(false);
  const [showSlideList, setShowSlideList] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // --- state untuk catatan presentator ---
  const [catatan, setCatatan] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
  const tersimpanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName(kode));
    channelRef.current = channel;

    channel
      .on("broadcast", { event: EVENT_NAME }, ({ payload }) => {
        const ev = payload as PresentasiEvent;
        if (ev.type === "state_sync" || ev.type === "slide_change") {
          if ("slide" in ev) setSlide(ev.slide);
          if ("totalPages" in ev) setTotalPages(ev.totalPages);
          if ("blank" in ev && typeof ev.blank === "boolean") setBlank(ev.blank);
        }
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: EVENT_NAME,
            payload: { type: "join" },
          });
        }
      });

    return () => {
      channel.unsubscribe();
      if (tersimpanTimerRef.current) clearTimeout(tersimpanTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kode]);

  const nav = (direction: 1 | -1) => {
    channelRef.current?.send({
      type: "broadcast",
      event: EVENT_NAME,
      payload: { type: "nav", direction },
    });
  };

  const goto = (n: number) => {
    channelRef.current?.send({
      type: "broadcast",
      event: EVENT_NAME,
      payload: { type: "goto", slide: n },
    });
    setShowSlideList(false);
  };

  const toggleBlank = () => {
    const next = !blank;
    setBlank(next);
    channelRef.current?.send({
      type: "broadcast",
      event: EVENT_NAME,
      payload: { type: "blank", on: next },
    });
  };

  const sendPointer = (clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    channelRef.current?.send({
      type: "broadcast",
      event: EVENT_NAME,
      payload: { type: "pointer_move", x, y },
    });
  };

  const hidePointer = () => {
    channelRef.current?.send({
      type: "broadcast",
      event: EVENT_NAME,
      payload: { type: "pointer_hide" },
    });
  };

  // --- simpan catatan ke Supabase, tidak pernah dibroadcast ke channel ---
  const simpanCatatan = async () => {
    const isi = catatan.trim();
    if (!isi || menyimpan) return;

    setMenyimpan(true);
    const { error } = await supabase.from("presentasi_catatan").insert({
      item_id: itemId,
      slide: slide ?? 1,
      isi,
    });
    setMenyimpan(false);

    if (error) {
      alert("Gagal menyimpan catatan: " + error.message);
      return;
    }

    setCatatan("");
    setTersimpan(true);
    if (tersimpanTimerRef.current) clearTimeout(tersimpanTimerRef.current);
    tersimpanTimerRef.current = setTimeout(() => setTersimpan(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#111] text-white flex flex-col">
      <div className="p-4 text-center border-b border-white/10 relative">
        <p className="text-white/50 text-sm">Remote presentasi</p>
        <p className="font-bold text-lg">
          {slide ?? "-"} / {totalPages ?? "-"}
        </p>
        {totalPages && totalPages > 1 && (
          <button
            onClick={() => setShowSlideList(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl text-xs font-bold"
          >
            <LayoutGrid size={14} />
            Slide
          </button>
        )}
      </div>

      {/* Area laser pointer */}
      <div
        ref={padRef}
        className="flex-1 flex items-center justify-center gap-2 text-white/30 select-none touch-none"
        onTouchMove={(e) => {
          const t = e.touches[0];
          sendPointer(t.clientX, t.clientY);
        }}
        onTouchEnd={hidePointer}
        onMouseMove={(e) => {
          if (e.buttons === 1) sendPointer(e.clientX, e.clientY);
        }}
        onMouseUp={hidePointer}
        onMouseLeave={hidePointer}
      >
        <Radar size={28} />
        <span>Tahan &amp; geser di sini buat laser pointer</span>
      </div>

      {/* Panel catatan presentator — hanya ada di remote, tidak pernah tampil di layar proyeksi */}
      <div className="px-4 pb-2">
        <label className="flex items-center gap-2 text-white/50 text-xs mb-1">
          <NotebookPen size={14} />
          Catatan kritik untuk slide {slide ?? "-"} (hanya kamu yang lihat)
        </label>
        <div className="flex gap-2">
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tulis kritik/masukan dari audiens..."
            rows={2}
            className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-sm resize-none placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#800020]"
          />
          <button
            onClick={simpanCatatan}
            disabled={!catatan.trim() || menyimpan}
            className="shrink-0 w-14 rounded-xl bg-[#800020] disabled:opacity-40 flex items-center justify-center"
          >
            {tersimpan ? <Check size={20} /> : <NotebookPen size={18} />}
          </button>
        </div>
      </div>

      {/* Tombol Blank Screen */}
      <div className="px-4 pb-2">
        <button
          onClick={toggleBlank}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${
            blank ? "bg-white text-black" : "bg-white/10 text-white"
          }`}
        >
          <MonitorOff size={18} />
          {blank ? "Tampilkan Lagi Layar" : "Blank Screen"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 pb-8">
        <button
          onClick={() => nav(-1)}
          className="flex items-center justify-center gap-2 bg-white/10 py-5 rounded-2xl font-bold text-lg"
        >
          <ChevronLeft /> Sebelumnya
        </button>
        <button
          onClick={() => nav(1)}
          className="flex items-center justify-center gap-2 bg-[#800020] py-5 rounded-2xl font-bold text-lg"
        >
          Berikutnya <ChevronRight />
        </button>
      </div>

      {/* Bottom sheet: Daftar Slide (Mini Navigator) — klik langsung lompat */}
      {showSlideList && totalPages && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end"
          onClick={() => setShowSlideList(false)}
        >
          <div
            className="w-full max-h-[75vh] bg-[#1a1a1a] rounded-t-3xl p-5 pb-8 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-white/90 flex items-center gap-2">
                <LayoutGrid size={16} /> Daftar Slide
              </p>
              <button
                onClick={() => setShowSlideList(false)}
                className="p-1.5 rounded-lg bg-white/10 text-white/70"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => goto(n)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    n === slide ? "bg-[#800020] text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}