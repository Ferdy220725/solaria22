"use client";

import { forwardRef } from "react";
import { JadwalWallpaperData } from "@/lib/wallpaper/types";
import { PASTEL_PALETTE, CARD_ROTATIONS } from "@/lib/wallpaper/palette";
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

// Tema warna untuk mode compact — identitas "Pastel Soft"
const PASTEL_SOFT_COMPACT_THEME: CompactTheme = {
  background: "bg-gradient-to-b from-orange-50 via-rose-50 to-purple-50",
  titleColor: "text-gray-800",
  subtitleColor: "text-gray-500",
  dayLabelColor: "text-gray-700",
  dividerColor: "bg-gray-300/50",
  timeColor: "text-rose-500",
  courseColor: "text-gray-800",
  courseSubColor: "text-gray-400",
};

const PastelSoftTemplate = forwardRef<HTMLDivElement, Props>(
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
          background="#fff7ed"
        >
          <div style={{ width: COMPACT_DESIGN_WIDTH, height: COMPACT_DESIGN_HEIGHT }}>
            <CompactScheduleLayout data={data} theme={PASTEL_SOFT_COMPACT_THEME} />
          </div>
        </ScaledWallpaperCanvas>
      );
    }

    const grouped = HARI_URUT.map((hari) => ({
      hari,
      items: data.items.filter((i) => i.hari === hari),
    })).filter((g) => g.items.length > 0);

    return (
      <ScaledWallpaperCanvas ref={ref} width={width} height={height} background="#fff7ed">
        <div
          style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT }}
          className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-rose-50 to-purple-50"
        >
          {/* blob dekoratif */}
          <div className="absolute -top-20 -left-24 w-96 h-96 rounded-full bg-orange-200/50 blur-3xl" />
          <div className="absolute top-1/3 -right-28 w-[420px] h-[420px] rounded-full bg-purple-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative z-10 px-14 pt-20 pb-14 h-full flex flex-col">
            {/* header */}
            <div className="mb-12">
              <p className="text-2xl font-medium text-rose-400 tracking-widest uppercase mb-1">
                Jadwal Kuliah
              </p>
              <h1 className="text-6xl font-extrabold text-gray-800 leading-tight">
                {data.namaKelas}
              </h1>
              {data.semester && (
                <p className="text-2xl text-gray-500 mt-2">{data.semester}</p>
              )}
            </div>

            {/* daftar hari */}
            <div className="flex-1 flex flex-col gap-8 overflow-hidden">
              {grouped.map((group, idx) => {
                const palette = PASTEL_PALETTE[group.hari];
                const rotation = CARD_ROTATIONS[idx % CARD_ROTATIONS.length];

                return (
                  <div
                    key={group.hari}
                    className={`${palette.bg} ${rotation} rounded-[2.5rem] p-8 shadow-sm`}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <span className={`w-3 h-3 rounded-full ${palette.accent}`} />
                      <h2 className={`text-3xl font-bold ${palette.text}`}>{group.hari}</h2>
                    </div>

                    <div className="flex flex-col gap-4">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-white/70 backdrop-blur rounded-2xl px-6 py-4"
                        >
                          <div className="flex-1 pr-4">
                            <p className="text-xl font-semibold text-gray-800">
                              {item.mataKuliah}
                            </p>
                            <p className="text-base text-gray-500 mt-0.5">
                              {item.gedung} · {item.lantai}
                              {item.dosen ? ` · ${item.dosen}` : ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-lg font-bold ${palette.text}`}>
                              {item.jamMulai}
                            </p>
                            <p className="text-sm text-gray-400">{item.jamSelesai}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* footer kecil */}
            <p className="text-center text-gray-400 text-base mt-10">
              Dibuat dengan Zora
            </p>
          </div>
        </div>
      </ScaledWallpaperCanvas>
    );
  }
);

PastelSoftTemplate.displayName = "PastelSoftTemplate";
export default PastelSoftTemplate;