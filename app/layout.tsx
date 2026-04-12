import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
import { Toaster } from 'sonner';
import Navbar from "@/components/Navbar";
import ThemeEngine from "@/components/ThemeEngine";
import ChatBot from "@/components/ChatBot"; // Impor fitur Solaria Copilot

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- METADATA TERBARU UNTUK SEO GOOGLE ---
export const metadata: Metadata = {
  title: "Solaria - Manajemen Agroteknologi C",
  description: "Pusat informasi dan manajemen akademik mahasiswa Agroteknologi C. Dimana Bumi dan Ilmu Pengetahuan Bersatu.",
  keywords: ["Agroteknologi", "UPN", "Manajemen Kelas", "Solaria", "Pertanian"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-700 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white`}
      >
        {/* Komponen Inti Solaria */}
        <ThemeEngine />
        <Navbar />

        <main className="relative z-10">
          {children}
        </main>

        <Toaster position="top-center" richColors theme="system" />
        
        {/* Fitur Asisten AI Solaria Copilot (Zora) */}
        <ChatBot />
      </body>
    </html>
  );
}