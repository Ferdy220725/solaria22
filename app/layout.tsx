import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
import { Toaster } from 'sonner';
import Navbar from "@/components/Navbar";
import ThemeEngine from "@/components/ThemeEngine";
import ChatBot from "@/components/ChatBot"; // Asisten AI Zora

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- METADATA ZORA SYSTEM ---
export const metadata: Metadata = {
  title: "Zora - Manajemen Agroteknologi C",
  description: "Zora: Pusat informasi dan manajemen akademik mahasiswa Agroteknologi C. Dimana Bumi dan Ilmu Pengetahuan Bersatu.",
  keywords: ["Zora", "Zoraferrs", "Agroteknologi", "UPN", "Manajemen Kelas", "Pertanian"],
  verification: {
    google: "googlec0409801ae0d1598",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className="scroll-smooth" 
      data-scroll-behavior="smooth"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-500 bg-[#fafafa] dark:bg-[#0a0a0a] text-slate-900 dark:text-zinc-100 min-h-screen flex flex-col`}
      >
        {/* Kontrol Tema & Navigasi Utama */}
        <ThemeEngine />
        <Navbar />

        {/* Main Wrapper: Aman untuk Mobile & Desktop */}
        <main className="relative flex-1 w-full max-w-[100vw] overflow-x-hidden">
          {/* Kontainer Utama dengan Padding Bawah agar tidak tertutup ChatBot di HP */}
          <div className="min-h-screen pb-24 md:pb-12 transition-all duration-500">
            {children}
          </div>
        </main>

        {/* Layer Notifikasi */}
        <Toaster 
          position="top-center" 
          richColors 
          theme="system" 
          closeButton
          toastOptions={{
            style: { borderRadius: '16px' },
          }}
        />
        
        {/* ChatBot Asisten Zora Copilot */}
        <div className="fixed bottom-0 right-0 z-[60]">
           <ChatBot />
        </div>
      </body>
    </html>
  );
}