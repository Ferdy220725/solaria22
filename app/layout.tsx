import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
import { Toaster } from 'sonner';
import Navbar from "@/components/Navbar";
import ThemeEngine from "@/components/ThemeEngine";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solaria - Manajemen Agroteknologi",
  description: "Aplikasi Manajemen Kelas C Agroteknologi UPN",
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
        <ThemeEngine />
        <Navbar />

        <main className="relative z-10">
          {children}
        </main>

        <Toaster position="top-center" richColors theme="system" />
      </body>
    </html>
  );
}