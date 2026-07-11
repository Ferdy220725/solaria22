"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  FileText,
  UserCog,
  CalendarDays,
  MonitorPlay,
  Info,
  Shuffle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  { id: "m1", name: "Home", href: "/", icon: LayoutDashboard, color: "#800020" },
  { id: "m2", name: "Materi", href: "/materi", icon: BookOpen, color: "#2563eb" },
  { id: "m3", name: "Praktikum", href: "/praktikum", icon: FlaskConical, color: "#16a34a" },
  { id: "m_jadwal", name: "Jadwal", href: "/jadwal-sistem/list", icon: CalendarDays, color: "#d97706" },
  { id: "m_presentasi", name: "Presentasi", href: "/presentasi", icon: MonitorPlay, color: "#9333ea" },
  { id: "m4", name: "Izin", href: "/perizinan", icon: FileText, color: "#0891b2" },
  { id: "m_acak", name: "Acak Kelompok", href: "/acak-kelompok", icon: Shuffle, color: "#e11d48" },
  { id: "m_tentang", name: "Tentang", href: "/tentang", icon: Info, color: "#4338ca" },
  { id: "m5", name: "Admin", href: "/admin", icon: UserCog, color: "#334155" },
];

const BASE = 44; // ukuran ikon normal (px)
const MAX = 68; // ukuran ikon saat jadi fokus (px)
const RANGE = 110; // radius pengaruh magnify (px)

export default function Navbar() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(menuItems.map(() => 1));
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => setShouldShow(true), []);

  const updateScales = () => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const center = containerRect.left + containerRect.width / 2;

    const next = itemRefs.current.map((el) => {
      if (!el) return 1;
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const dist = Math.abs(itemCenter - center);
      const t = Math.max(0, 1 - dist / RANGE);
      const size = BASE + (MAX - BASE) * t;
      return size / BASE;
    });
    setScales(next);
  };

  useEffect(() => {
    updateScales();
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", updateScales, { passive: true });
    window.addEventListener("resize", updateScales);
    return () => {
      container.removeEventListener("scroll", updateScales);
      window.removeEventListener("resize", updateScales);
    };
  }, []);

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-[9999] flex justify-center px-3 pointer-events-none">
      <div
        ref={containerRef}
        className="pointer-events-auto flex items-end gap-3 overflow-x-auto no-scrollbar px-8 py-3 rounded-[28px] bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl max-w-full snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const scale = scales[i] ?? 1;
          return (
            <Link
              key={item.id}
              href={item.href}
              ref={(el) => {
                itemRefs.current[i] = el as unknown as HTMLDivElement;
              }}
              className="flex flex-col items-center shrink-0 snap-center transition-transform duration-150 ease-out"
              style={{
                transform: `scale(${scale}) translateY(${-(scale - 1) * 18}px)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="flex items-center justify-center rounded-2xl shadow-lg transition-colors"
                style={{
                  width: BASE,
                  height: BASE,
                  backgroundColor: active ? item.color : `${item.color}CC`,
                }}
              >
                <Icon color="white" size={22} />
              </div>
              <span
                className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 transition-opacity"
                style={{ opacity: scale > 1.15 ? 1 : 0 }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}