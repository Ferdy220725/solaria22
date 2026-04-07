"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FlaskConical, FileText, UserCog, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isWelcomePage, setIsWelcomePage] = useState(true);

  useEffect(() => {
    const checkView = () => {
      // Cek apakah masih di halaman awal (yang ada tombol Masuk Dashboard)
      const welcomeElement = document.querySelector('button')?.textContent?.includes("Masuk Dashboard");
      setIsWelcomePage(!!welcomeElement);
    };
    
    checkView();
    window.addEventListener('click', checkView);
    return () => window.removeEventListener('click', checkView);
  }, []);

  // Navbar sembunyi di halaman kucing
  if (isWelcomePage && pathname === "/") return null;

  const menuItems = [
    { id: "m1", name: "Home", href: "/", icon: <LayoutDashboard size={20} /> },
    { id: "m2", name: "Materi", href: "/materi", icon: <BookOpen size={20} /> },
    { id: "m3", name: "Praktikum", href: "/praktikum", icon: <FlaskConical size={20} /> },
    { id: "m4", name: "Izin", href: "/perizinan", icon: <FileText size={20} /> },
    { id: "m5", name: "Admin", href: "/admin", icon: <UserCog size={20} /> },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[999] flex flex-col items-end gap-4">
      {/* Menu Items dengan Teks */}
      <div className={`flex flex-col gap-3 transition-all duration-500 transform ${
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-10 pointer-events-none"
      }`}>
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md transition-all hover:scale-105 ${
              pathname === item.href 
                ? "bg-[#800020] text-white" 
                : "bg-white/95 text-slate-600 border border-slate-100"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
            {item.icon}
          </Link>
        ))}
      </div>

      {/* Tombol Utama Tanpa Label "Solaria Menu" */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all duration-300 ${
          isOpen ? "bg-slate-800 rotate-90" : "bg-[#800020] hover:scale-110 active:scale-95"
        }`}
      >
        {isOpen ? <X color="white" size={28} /> : <Menu color="white" size={28} />}
      </button>
    </div>
  );
}