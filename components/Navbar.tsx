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
      // HIDE TOTAL DI HALAMAN ADMIN
      if (pathname.startsWith("/admin")) {
        setShouldShow(false);
        return;
      }

      const isIntroActive = !localStorage.getItem('show_dashboard_zora'); 
      if (pathname !== "/") {
        setShouldShow(true);
      } else {
        setShouldShow(!!document.getElementById('main-dashboard'));
      }
    };
    checkVisibility();
    const interval = setInterval(checkVisibility, 500);
    return () => clearInterval(interval);
  }, [pathname]);

  if (!shouldShow) return null;

  const menuItems = [
    { id: "m1", name: "Home", href: "/", icon: <LayoutDashboard size={20} /> },
    { id: "m2", name: "Materi", href: "/materi", icon: <BookOpen size={20} /> },
    { id: "m3", name: "Lab", href: "/praktikum", icon: <FlaskConical size={20} /> },
    { id: "m4", name: "Permit", href: "/perizinan", icon: <FileText size={20} /> },
    { id: "m5", name: "Admin", href: "/admin", icon: <UserCog size={20} /> },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR (Kiri) */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-[#D4AF37]/20 z-[100] hidden lg:flex flex-col p-8 animate-in slide-in-from-left duration-500">
        <div className="mb-12">
          <h1 className="text-[#D4AF37] text-3xl font-serif tracking-widest border-b border-[#D4AF37]/30 pb-4 italic">ZORA</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link 
              key={item.id} 
              href={item.href} 
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                pathname === item.href ? "bg-[#D4AF37] text-black" : "text-gray-400 hover:text-[#D4AF37] hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* MOBILE BOTTOM NAV (Bawah) */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-[#D4AF37]/20 z-[100] lg:hidden flex justify-around items-center p-4 pb-8">
        {menuItems.map((item) => (
          <Link 
            key={item.id} 
            href={item.href} 
            className={`flex flex-col items-center gap-1 ${
              pathname === item.href ? "text-[#D4AF37]" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-bold uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </div>
    </>
  );
}