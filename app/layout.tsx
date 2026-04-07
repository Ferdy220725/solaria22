import "./globals.css";
import Navbar from '../components/Navbar';
import { Toaster } from 'sonner'; 
import NotificationHandler from '../components/NotificationHandler';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';

export const metadata = {
  title: 'Manajemen Kelas C | Solaria',
  description: 'Sistem Informasi Akademik Agroteknologi Kelas C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 min-h-screen antialiased">
        {/* 1. Mendaftarkan Service Worker untuk Notifikasi HP */}
        <ServiceWorkerRegister />

        {/* 2. Menangani Popup Notifikasi saat aplikasi terbuka (Toast) */}
        <Toaster position="top-right" richColors closeButton />
        <NotificationHandler />
        
        {/* 3. Navigasi Utama */}
        <Navbar />

        {/* 4. Konten Halaman */}
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}