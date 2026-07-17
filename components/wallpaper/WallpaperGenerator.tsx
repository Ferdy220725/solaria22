"use client";

import { useRef, useState } from "react";
import { exportWallpaper } from "@/lib/wallpaper/exportImage";
import { JadwalWallpaperData } from "@/lib/wallpaper/types";
import { TEMPLATES } from "@/lib/wallpaper/templates";
import { DEFAULT_WALLPAPER_SIZE, WallpaperSize } from "@/lib/wallpaper/sizes";
import SizeSelector from "./SizeSelector";

interface Props {
  data: JadwalWallpaperData;
  templateId: string;
}

// Lebar maksimum kotak preview di layar (px), biar preview selalu
// muat rapi berapapun resolusi export yang dipilih.
const PREVIEW_MAX_WIDTH = 320;

export default function WallpaperGenerator({ data, templateId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<WallpaperSize>(DEFAULT_WALLPAPER_SIZE);

  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const TemplateComponent = template.component;

  // Skala HANYA untuk preview di layar (tidak memengaruhi hasil export,
  // karena node yang di-capture sudah dibuat persis size.width x size.height).
  const previewScale = PREVIEW_MAX_WIDTH / size.width;
  const previewWidth = size.width * previewScale;
  const previewHeight = size.height * previewScale;

  const handleExport = async () => {
    if (!ref.current) return;
    await exportWallpaper(ref.current, `jadwal-${data.namaKelas}.png`, {
      width: size.width,
      height: size.height,
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        style={{ width: previewWidth, height: previewHeight }}
        className="overflow-hidden rounded-2xl shadow-lg border"
      >
        <div
          style={{ transform: `scale(${previewScale})`, transformOrigin: "top left" }}
        >
          <TemplateComponent
            ref={ref}
            data={data}
            width={size.width}
            height={size.height}
            sizeId={size.id}
          />
        </div>
      </div>

      <SizeSelector value={size} onChange={setSize} />

      <button
        onClick={handleExport}
        className="px-6 py-3 rounded-full bg-[#004d40] text-white font-semibold hover:opacity-90 transition"
      >
        Unduh Wallpaper
      </button>
    </div>
  );
}