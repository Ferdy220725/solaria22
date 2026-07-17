"use client";

import { useState } from "react";
import {
  WALLPAPER_SIZES,
  SHARE_SIZES,
  DEFAULT_WALLPAPER_SIZE,
  DEFAULT_SHARE_SIZE,
  WallpaperSize,
  isShareSizeId,
} from "@/lib/wallpaper/sizes";

interface SizeSelectorProps {
  value: WallpaperSize;
  onChange: (size: WallpaperSize) => void;
}

type Tab = "wallpaper" | "share";

const CUSTOM_IDS = new Set(["custom", "share-custom"]);

export default function SizeSelector({ value, onChange }: SizeSelectorProps) {
  const [tab, setTab] = useState<Tab>(isShareSizeId(value.id) ? "share" : "wallpaper");
  const [customWidth, setCustomWidth] = useState(value.width);
  const [customHeight, setCustomHeight] = useState(value.height);

  const isCustom = CUSTOM_IDS.has(value.id);
  const activeSizes = tab === "wallpaper" ? WALLPAPER_SIZES : SHARE_SIZES;

  const handleTabChange = (nextTab: Tab) => {
    if (nextTab === tab) return;
    setTab(nextTab);

    const fallback = nextTab === "wallpaper" ? DEFAULT_WALLPAPER_SIZE : DEFAULT_SHARE_SIZE;
    const nextSizes = nextTab === "wallpaper" ? WALLPAPER_SIZES : SHARE_SIZES;
    // kalau size yang lagi aktif kebetulan ada juga di tab baru, pertahankan;
    // kalau enggak, jatuhin ke default tab itu biar `<select>` selalu punya opsi yang valid.
    const stillValid = nextSizes.find((s) => s.id === value.id);
    onChange(stillValid ?? fallback);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <label className="text-sm font-medium text-slate-700">
        Ukuran wallpaper
      </label>

      {/* tab switcher */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => handleTabChange("wallpaper")}
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            tab === "wallpaper"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Wallpaper
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("share")}
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            tab === "share"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Share
        </button>
      </div>

      <select
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
        value={value.id}
        onChange={(e) => {
          const selected = activeSizes.find((s) => s.id === e.target.value);
          if (selected) {
            onChange(selected);
            setCustomWidth(selected.width);
            setCustomHeight(selected.height);
          }
        }}
      >
        {activeSizes.map((size) => (
          <option key={size.id} value={size.id}>
            {size.label}
          </option>
        ))}
      </select>

      {isCustom && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={360}
            max={4000}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={customWidth}
            onChange={(e) => {
              const w = Number(e.target.value);
              setCustomWidth(w);
              onChange({ ...value, width: w, height: customHeight });
            }}
            placeholder="Lebar (px)"
          />
          <span className="text-slate-400 text-sm">x</span>
          <input
            type="number"
            min={360}
            max={8000}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={customHeight}
            onChange={(e) => {
              const h = Number(e.target.value);
              setCustomHeight(h);
              onChange({ ...value, width: customWidth, height: h });
            }}
            placeholder="Tinggi (px)"
          />
        </div>
      )}

      <p className="text-xs text-slate-400">
        {tab === "wallpaper"
          ? "Tips: kalau nggak tahu resolusi HP kamu, pakai salah satu preset di atas."
          : "Ukuran ini dioptimalkan buat dibagikan ke story/chat (IG, WhatsApp, dll)."}
      </p>
    </div>
  );
}