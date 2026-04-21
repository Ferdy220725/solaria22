"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  FileText,
  UserCog,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const isWelcomePage =
        !!document.querySelector("button")?.textContent?.includes("Access Dashboard") ||
        !!document.querySelector("button")?.textContent?.includes("Initialize");

      if (pathname !== "/") {
        setShouldShow(true);
      } else {
        setShouldShow(!isWelcomePage);
      }
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 500);

    return () => clearInterval(interval);
  }, [pathname]);

  if (!shouldShow) return null;

  const menuItems = [
    { id: "m5", name: "System Admin", href: "/admin", icon: <UserCog size={18} /> },
    { id: "m4", name: "Permit", href: "/perizinan", icon: <FileText size={18} /> },
    { id: "m3", name: "Laboratory", href: "/praktikum", icon: <FlaskConical size={18} /> },
    { id: "m2", name: "Resources", href: "/materi", icon: <BookOpen size={18} /> },
    { id: "m1", name: "Terminal", href: "/", icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4 pointer-events-none">

      {/* Menu List */}
      <div
        className={`flex flex-col gap-3 mb-4 transition-all duration-500 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        {menuItems.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: `${index * 50}ms` }}
            className={`flex items-center justify-end gap-4 px-6 py-4 rounded-[22px] shadow-2xl backdrop-blur-xl border transition-all hover:scale-105 active:scale-95 ${
              pathname === item.href
                ? "bg-white text-black border-white"
                : "bg-black/80 text-[#D4AF37] border-[#D4AF37]/20"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">
              {item.name}
            </span>

            <div
              className={`p-2 rounded-xl ${
                pathname === item.href
                  ? "bg-black text-[#D4AF37]"
                  : "bg-[#D4AF37]/10"
              }`}
            >
              {item.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 md:w-20 md:h-20 rounded-[28px] shadow-[0_20px_50px_rgba(212,175,55,0.3)] flex items-center justify-center transition-all duration-500 pointer-events-auto active:scale-90 border ${
          isOpen
            ? "bg-white border-white rotate-180"
            : "bg-black border-[#D4AF37]/40 hover:border-[#D4AF37]"
        }`}
      >
        {isOpen ? (
          <X className="text-black" size={32} strokeWidth={1.5} />
        ) : (
          <div className="flex flex-col gap-1.5 items-end px-4">
            <div className="w-8 h-[2px] bg-[#D4AF37]"></div>
            <div className="w-5 h-[2px] bg-[#D4AF37]"></div>
          </div>
        )}
      </button>
    </div>
  );
}