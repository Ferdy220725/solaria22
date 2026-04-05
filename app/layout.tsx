import "./globals.css";
import Navbar from '../components/Navbar';

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
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}