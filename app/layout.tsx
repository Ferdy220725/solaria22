import "./globals.css";
import Navbar from '../components/Navbar';
import { Toaster } from 'sonner'; 
import NotificationHandler from '../components/NotificationHandler';

export const metadata = {
  title: 'Manajemen Kelas C',
  description: 'Sistem Informasi Akademik Kelas C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {/* Tambahkan dua baris ini */}
        <Toaster position="top-right" richColors closeButton />
        <NotificationHandler />
        
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}