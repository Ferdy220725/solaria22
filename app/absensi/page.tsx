"use client";
import React, { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AbsensiKlik() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Daftar Mahasiswa Agrotek C
  const mahasiswaList = [
    { npm: "25025010093", nama: "Siti Nur Fadilah" },
    { npm: "25025010094", nama: "Agnia Laquinta A-Abin" },
    { npm: "25025010095", nama: "Afia Dwi Agustin" },
    { npm: "25025010096", nama: "Aprilita Masyfatah" },
    { npm: "25025010097", nama: "Syakila Balqis Al-Faneza" },
    { npm: "25025010098", nama: "Aulia Eka Saitri" },
    { npm: "25025010099", nama: "Callista Zahratunissa" },
    { npm: "25025010100", nama: "Ahmat Choyrul Ferdyansyah" },
    { npm: "25025010101", nama: "Dhea Fitri Ramadhani" },
    { npm: "25025010102", nama: "Alief Rahmat Akbarani" },
    { npm: "25025010103", nama: "Karisma Zahra Lailatul Fuadah" },
    { npm: "25025010104", nama: "Jazzica Azzurra Anindya Zandra" },
    { npm: "25025010105", nama: "Endyatma Adriel Fabian David" },
    { npm: "25025010106", nama: "Rizqi Surya Pratama" },
    { npm: "25025010107", nama: "Annisa Aulia Ramadani" },
    { npm: "25025010108", nama: "Eka Risziana Agustin" },
    { npm: "25025010109", nama: "Khullatul Bariroh" },
    { npm: "25025010110", nama: "Agatha Zuleyka Ramdan" },
    { npm: "25025010111", nama: "Faqihatun Nisa’" },
    { npm: "25025010112", nama: "Salsabilla Octavia Ramadhani" },
    { npm: "25025010113", nama: "Keysha Aulia Azzahra" },
    { npm: "25025010114", nama: "Angel Monica NH" },
    { npm: "25025010115", nama: "Uswatun Khasanah" },
    { npm: "25025010116", nama: "Dharma Aji Wisnu Utama" },
    { npm: "25025010117", nama: "Keiky Resvanti Ramadhanti" },
    { npm: "25025010118", nama: "Andini Salwa Ingraini" },
    { npm: "25025010119", nama: "Talitha Listya Salsabila" },
    { npm: "25025010120", nama: "Andrea Benaya Pagonggang" },
    { npm: "25025010121", nama: "Aqdria Yashirly Amirila" },
    { npm: "25025010122", nama: "Mohammad Rizky Hikmal Prawira" },
    { npm: "25025010123", nama: "Safrina Br Tinjka" },
    { npm: "25025010124", nama: "Citra Putri Rahmadany" },
    { npm: "25025010125", nama: "Arjuna Wira Kusuma" },
    { npm: "25025010126", nama: "Nadia Febrisca Rachma" },
    { npm: "25025010127", nama: "Khanza Afifah Amalina" },
    { npm: "25025010128", nama: "Farina Putri Aurelia" },
    { npm: "25025010129", nama: "M Farel Al Fahrezi" },
    { npm: "25025010130", nama: "Lilis Dwi Nurfadilah" },
    { npm: "25025010131", nama: "Agnia Alya Putri" },
    { npm: "25025010132", nama: "Cika Rahma Dwi Anjarsari" },
    { npm: "25025010133", nama: "Marcelly Elza Varodies" },
    { npm: "25025010134", nama: "Muhammad Daffa Abyansyah" },
    { npm: "25025010135", nama: "Rafines Al Muslim" },
    { npm: "25025010137", nama: "Sonya Damayanti Az-Zahara" },
    { npm: "25025010138", nama: "Pratiwi Citra Oktavia" }
  ];

  // Filter pencarian
  const filteredMahasiswa = mahasiswaList.filter(m => 
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.npm.includes(searchTerm)
  );

  const handleAbsen = async (mhs: { nama: string, npm: string }) => {
    const yakin = confirm(`Konfirmasi Absensi atas nama:\n${mhs.nama}\n(${mhs.npm})`);
    if (!yakin) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('absensi').insert([
        { 
          nama_mahasiswa: mhs.nama, 
          npm: mhs.npm,
          waktu_absen: new Date().toISOString() 
        }
      ]);

      if (error) throw error;

      alert("Berhasil! Kehadiran Anda telah dicatat.");
      router.push('/');
    } catch (err: any) {
      alert("Gagal absen: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button onClick={() => router.push('/')} className="text-[#800020] font-black text-xs uppercase mb-4 tracking-widest">← Kembali ke Dashboard</button>
          <h1 className="text-3xl font-black text-[#800020] uppercase tracking-tighter">Absensi Agrotek C</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Klik Nama Anda Untuk Absen</p>
        </div>

        {/* Kotak Pencarian */}
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Cari Nama atau NPM Anda..." 
            className="w-full p-5 bg-white rounded-3xl shadow-sm border-2 border-transparent focus:border-[#800020] outline-none font-bold transition-all text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-5 top-5 opacity-20">🔍</span>
        </div>

        {/* Daftar Mahasiswa */}
        <div className="grid grid-cols-1 gap-3">
          {filteredMahasiswa.map((mhs) => (
            <button
              key={mhs.npm}
              disabled={loading}
              onClick={() => handleAbsen(mhs)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group hover:border-[#800020] hover:bg-red-50 transition-all active:scale-[0.98] text-left"
            >
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-[#800020] transition-colors">{mhs.npm}</p>
                <p className="font-black text-slate-800 text-sm uppercase group-hover:text-[#800020] transition-colors">{mhs.nama}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-[#800020] group-hover:text-white transition-all text-xs font-black">
                HADIR
              </div>
            </button>
          ))}

          {filteredMahasiswa.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase text-xs">Mahasiswa Tidak Ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-black text-[#800020] text-xs uppercase animate-pulse">Sedang Mencatat Kehadiran...</p>
          </div>
        </div>
      )}
    </div>
  );
}