"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FlaskConical, FileText, UserCog } from "lucide-react"; 
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      // LOGIKA 1: Sembunyikan total jika berada di rute Admin
      if (pathname.startsWith("/admin")) {
        setShouldShow(false);
        return;
      }

      // LOGIKA 2: Logika intro Zora (tetap dipertahankan)
      const isIntroActive = !localStorage.getItem('show_dashboard_zora'); 
      if (pathname !== "/") {
        setShouldShow(true);
      } else {
        // Hanya muncul jika element dashboard sudah di-render
        setShouldShow(!!document.getElementById('main-dashboard'));
      }
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 500);
    return () => clearInterval(interval);
  }, [pathname]);

  // Jika tidak memenuhi syarat atau sedang di halaman Admin, Navbar tidak di-render
  if (!shouldShow) return null;

  const menuItems = [
    { id: "m1", name: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
    { id: "m2", name: "Resources", href: "/materi", icon: <BookOpen size={20} /> },
    { id: "m3", name: "Laboratory", href: "/praktikum", icon: <FlaskConical size={20} /> },
    { id: "m4", name: "Permit", href: "/perizinan", icon: <FileText size={20} /> },
    { id: "m5", name: "System Admin", href: "/admin", icon: <UserCog size={20} /> },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-[#D4AF37]/20 z-[100] hidden lg:flex flex-col p-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="mb-12">
        <h1 className="text-[#D4AF37] text-3xl font-serif tracking-widest border-b border-[#D4AF37]/30 pb-4 italic">ZORA</h1>
      </div>
      
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-[#D4AF37] text-black shadow-[0_0_25px_rgba(212,175,55,0.2)]" 
                  : "text-gray-400 hover:text-[#D4AF37] hover:bg-white/5"
              }`}
            >
              <div className={isActive ? "text-black" : "text-[#D4AF37] group-hover:scale-110 transition-transform"}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#D4AF37]/10 pt-6">
        <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-[#D4AF37] animate-pulse"></div>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Terminal Active</p>
        </div>
        <p className="text-[8px] text-zinc-600 uppercase tracking-[0.3em]">Agrotek Management C</p>
      </div>
    </div>
  );
}