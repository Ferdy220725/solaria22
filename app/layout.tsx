import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
import { Toaster } from 'sonner';
import Navbar from "@/components/Navbar";
import ThemeEngine from "@/components/ThemeEngine";
import ChatBot from "@/components/ChatBot"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zora - Manajemen Agroteknologi C",
  description: "Zora System: Agrotechnology Management Unit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fafafa] dark:bg-[#0a0a0a] text-slate-900 dark:text-zinc-100 min-h-screen flex flex-col`}>
        <ThemeEngine />
        <Navbar />

        {/* - pt-4 (HP): Jarak sedikit dari atas
          - lg:pt-24 (Laptop): Jarak dari Navbar atas jika ada
          - lg:pl-64 (Laptop): Memberi ruang untuk Sidebar kiri
        */}
        <main className="relative flex-1 w-full max-w-[100vw] overflow-x-hidden pt-4 lg:pt-10 lg:pl-64 transition-all duration-500">
          <div className="min-h-screen pb-32 lg:pb-12">
            {children}
          </div>
        </main>

        <Toaster position="top-center" richColors />
        
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-[60]">
           <ChatBot />
        </div>
      </body>
    </html>
  );
}