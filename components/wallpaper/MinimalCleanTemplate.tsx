"use client";

import { forwardRef } from "react";
import { JadwalWallpaperData } from "@/lib/wallpaper/types";
import ScaledWallpaperCanvas, {
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  COMPACT_DESIGN_WIDTH,
  COMPACT_DESIGN_HEIGHT,
} from "./ScaledWallpaperCanvas";
import CompactScheduleLayout, { CompactTheme } from "./CompactScheduleLayout";
import { isShareSizeId } from "@/lib/wallpaper/sizes";

interface Props {
  data: JadwalWallpaperData;
  /** Lebar hasil export (px). Kalau tidak diisi, pakai ukuran desain default. */
  width?: number;
  /** Tinggi hasil export (px). Kalau tidak diisi, pakai ukuran desain default. */
  height?: number;
  /** id ukuran yang lagi dipilih (dari WALLPAPER_SIZES / SHARE_SIZES) — nentuin mode layout */
  sizeId?: string;
}

const HARI_URUT = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// Tema warna untuk mode compact — identitas "Minimal Clean"
const MINIMAL_CLEAN_COMPACT_THEME: CompactTheme = {
  background: "bg-white",
  titleColor: "text-gray-900",
  subtitleColor: "text-gray-500",
  dayLabelColor: "text-gray-900",
  dividerColor: "bg-gray-200",
  timeColor: "text-gray-900",
  courseColor: "text-gray-900",
  courseSubColor: "text-gray-500",
};

const MinimalCleanTemplate = forwardRef<HTMLDivElement, Props>(
  ({ data, width, height, sizeId }, ref) => {
    const isCompact = sizeId ? isShareSizeId(sizeId) : false;

    if (isCompact) {
      return (
        <ScaledWallpaperCanvas
          ref={ref}
          width={width}
          height={height}
          designWidth={COMPACT_DESIGN_WIDTH}
          designHeight={COMPACT_DESIGN_HEIGHT}
          background="#ffffff"
        >
          <div style={{ width: COMPACT_DESIGN_WIDTH, height: COMPACT_DESIGN_HEIGHT }}>
            <CompactScheduleLayout data={data} theme={MINIMAL_CLEAN_COMPACT_THEME} />
          </div>
        </ScaledWallpaperCanvas>
      );
    }

    const grouped = HARI_URUT.map((hari) => ({
      hari,
      items: data.items.filter((i) => i.hari === hari),
    })).filter((g) => g.items.length > 0);

    return (
      <ScaledWallpaperCanvas ref={ref} width={width} height={height} background="#ffffff">
        <div
          style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT }}
          className="relative bg-white flex flex-col"
        >
          <div className="px-16 pt-24 pb-10 border-b-4 border-gray-900">
            <p className="text-xl font-semibold text-gray-400 tracking-[0.3em] uppercase mb-2">
              Jadwal Kuliah
            </p>
            <h1 className="text-7xl font-black text-gray-900 leading-none">
              {data.namaKelas}
            </h1>
            {data.semester && (
              <p className="text-2xl text-gray-500 mt-3">{data.semester}</p>
            )}
          </div>

          <div className="flex-1 px-16 py-10 flex flex-col gap-10 overflow-hidden">
            {grouped.map((group) => (
              <div key={group.hari}>
                <h2 className="text-3xl font-black text-gray-900 mb-4 border-l-8 border-gray-900 pl-4">
                  {group.hari}
                </h2>
                <div className="flex flex-col divide-y divide-gray-200">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{item.mataKuliah}</p>
                        <p className="text-lg text-gray-500 mt-1">
                          {item.gedung} · {item.lantai}
                          {item.dosen ? ` · ${item.dosen}` : ""}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-gray-900 shrink-0">
                        {item.jamMulai}–{item.jamSelesai}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-lg pb-12">Dibuat dengan Zora</p>
        </div>
      </ScaledWallpaperCanvas>
    );
  }
);

MinimalCleanTemplate.displayName = "MinimalCleanTemplate";
export default MinimalCleanTemplate;