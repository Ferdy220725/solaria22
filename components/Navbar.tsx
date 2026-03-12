import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-[#800020] text-white border-b-4 border-[#D4AF37] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl tracking-tighter">
          KELAS <span className="text-[#D4AF37]">C</span>
        </Link>
        <div className="space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-[#D4AF37]">Dashboard</Link>
          <Link href="/materi" className="hover:text-[#D4AF37]">Materi</Link>
          <Link href="/perizinan" className="hover:text-[#D4AF37]">Perizinan</Link>
          <Link href="/admin" className="bg-[#D4AF37] text-[#800020] px-4 py-2 rounded-md font-bold hover:bg-white">ADMIN</Link>
        </div>
      </div>
    </nav>
  );
}