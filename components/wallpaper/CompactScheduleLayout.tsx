"use client";

import { JadwalWallpaperData } from "@/lib/wallpaper/types";

const HARI_URUT = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const HARI_SINGKAT: Record<string, string> = {
  Senin: "SEN",
  Selasa: "SEL",
  Rabu: "RAB",
  Kamis: "KAM",
  Jumat: "JUM",
  Sabtu: "SAB",
  Minggu: "MIN",
};

export interface CompactTheme {
  background: string; // className atau style bg utama
  titleColor: string; // className warna judul
  subtitleColor: string;
  dayLabelColor: string;
  dividerColor: string;
  timeColor: string;
  courseColor: string;
  courseSubColor: string; // warna teks gedung/lantai/dosen (di bawah nama matkul)
}

interface Props {
  data: JadwalWallpaperData;
  theme: CompactTheme;
}

export default function CompactScheduleLayout({ data, theme }: Props) {
  const grouped = HARI_URUT.map((hari) => ({
    hari,
    items: data.items.filter((i) => i.hari === hari),
  })).filter((g) => g.items.length > 0);

  return (
    <div className={`relative w-full h-full flex flex-col ${theme.background}`}>
      {/* header */}
      <div className="px-14 pt-16 pb-8">
        <h1 className={`text-6xl font-extrabold leading-tight ${theme.titleColor}`}>
          {data.namaKelas}
        </h1>
        {data.semester && (
          <p className={`text-xl tracking-[0.3em] uppercase mt-2 ${theme.subtitleColor}`}>
            {data.semester}
          </p>
        )}
      </div>

      {/* daftar hari */}
      <div className="flex-1 px-14 pb-14 flex flex-col justify-around">
        {grouped.map((group) => (
          <div key={group.hari} className="flex items-stretch gap-6">
            {/* label hari */}
            <div className="flex items-center justify-center w-16 shrink-0">
              <span className={`text-lg font-bold tracking-widest ${theme.dayLabelColor}`}>
                {HARI_SINGKAT[group.hari]}
              </span>
            </div>

            {/* garis pembatas */}
            <div className={`w-[2px] shrink-0 ${theme.dividerColor}`} />

            {/* daftar item: tiap item 1 row, kolom jam & matkul selalu sejajar */}
            <div className="flex-1 flex flex-col justify-center gap-2.5 py-1">
              {group.items.map((item) => (
                <div key={item.id} className="flex items-start gap-6">
                  <p className={`flex-[0.85] text-lg font-semibold ${theme.timeColor}`}>
                    {item.jamMulai}–{item.jamSelesai}{" "}
                    <span className="font-normal opacity-70">
                      ({item.gedung} {item.lantai})
                    </span>
                  </p>
                  <div className="flex-[1.15] min-w-0">
                    <p className={`text-lg font-semibold truncate ${theme.courseColor}`}>
                      {item.mataKuliah}
                    </p>
                    {item.dosen && (
                      <p className={`text-sm truncate ${theme.courseSubColor}`}>
                        {item.dosen}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className={`text-center text-sm pb-8 ${theme.subtitleColor}`}>Dibuat dengan Zora</p>
    </div>
  );
}