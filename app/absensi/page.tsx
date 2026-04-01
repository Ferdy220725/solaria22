"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';

// Daftar Mahasiswa tetap sama
const DAFTAR_MAHASISWA = [
  { npm: "25025010093", nama: "SITI NUR FADILAH" },
  { npm: "25025010094", nama: "AGNIA LAQUINTA A-ABIN" },
  { npm: "25025010095", nama: "AFIA DWI AGUSTIN" },
  { npm: "25025010096", nama: "APRILITA MASYFATAH" },
  { npm: "25025010097", nama: "SYAKILA BALQIS AL-FANEZA" },
  { npm: "25025010098", nama: "AULIA EKA SAITRI" },
  { npm: "25025010099", nama: "CALLISTA ZAHRATUNISSA" },
  { npm: "25025010100", nama: "AHMAT CHOYRUL FERDYANSYAH" },
  { npm: "25025010101", nama: "DHEA FITRI RAMADHANI" },
  { npm: "25025010102", nama: "ALIEF RAHMAT AKBARANI" },
  { npm: "25025010103", nama: "KARISMA ZAHRA LAILATUL FUADAH" },
  { npm: "25025010104", nama: "JAZZICA AZZURRA ANINDYA ZANDRA" },
  { npm: "25025010105", nama: "ENDYATMA ADRIEL FABIAN DAVID" },
  { npm: "25025010106", nama: "RIZQI SURYA PRATAMA" },
  { npm: "25025010107", nama: "ANNISA AULIA RAMADANI" },
  { npm: "25025010108", nama: "EKA RISZIANA AGUSTIN" },
  { npm: "25025010109", nama: "KHULLATUL BARIROH" },
  { npm: "25025010110", nama: "AGATHA ZULEYKA RAMDAN" },
  { npm: "25025010111", nama: "FAQIHATUN NISA’" },
  { npm: "25025010112", nama: "SALSABILLA OCTAVIA RAMADHANI" },
  { npm: "25025010113", nama: "KEYSHA AULIA AZZAHRA" },
  { npm: "25025010114", nama: "ANGEL MONICA NH" },
  { npm: "25025010115", nama: "USWATUN KHASANAH" },
  { npm: "25025010116", nama: "DHARMA AJI WISNU UTAMA" },
  { npm: "25025010117", nama: "KEIKY RESVANTI RAMADHANTI" },
  { npm: "25025010118", nama: "ANDINI SALWA INGRAINI" },
  { npm: "25025010119", nama: "TALITHA LISTYA SALSABILA" },
  { npm: "25025010120", nama: "ANDREA BENAYA PAGONGGANG" },
  { npm: "25025010121", nama: "AQDRIA YASHIRLY AMIRILA" },
  { npm: "25025010122", nama: "MOHAMMAD RIZKY HIKMAL PRAWIRA" },
  { npm: "25025010123", nama: "SAFRINA BR TINJAK" },
  { npm: "25025010124", nama: "CITRA PUTRI RAHMADANY" },
  { npm: "25025010125", nama: "ARJUNA WIRA KUSUMA" },
  { npm: "25025010126", nama: "NADIA FEBRISCA RACHMA" },
  { npm: "25025010127", nama: "KHANZA AFIFAH AMALINA" },
  { npm: "25025010128", nama: "FARINA PUTRI AURELIA" },
  { npm: "25025010129", nama: "M. FAREL AL FAHREZI" },
  { npm: "25025010130", nama: "LILIS DWI NURFADILAH" },
  { npm: "25025010131", nama: "AGNIA ALYA PUTRI" },
  { npm: "25025010132", nama: "CIKA RAHMA DWI ANJARSARI" },
  { npm: "25025010133", nama: "MARCELLY ELZA VARODIES" },
  { npm: "25025010134", nama: "MUHAMMAD DAFFA ABYANSYAH" },
  { npm: "25025010135", nama: "RAFINES AL MUSLIM" },
  { npm: "25025010137", nama: "SONYA DAMAYANTI AZ-ZAHARA" },
  { npm: "25025010138", nama: "PRATIWI CITRA OKTAVIA" }
];

export default function AbsensiMahasiswa() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [namaManual, setNamaManual] = useState('');
  const [npmManual, setNpmManual] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- STATE BARU UNTUK KODE ---
  const [inputKode, setInputKode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [kodeBenar, setKodeBenar] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Mengambil status sistem DAN kode akses sekaligus
    const { data } = await supabase
      .from('status_sistem')
      .select('is_active, kode_akses')
      .eq('id', 'absensi')
      .maybeSingle();
    
    setIsOpen(data?.is_active || false);
    setKodeBenar(data?.kode_akses || '');
    setLoading(false);
  };

  const handleVerifikasi = () => {
    if (inputKode.toUpperCase() === kodeBenar.toUpperCase()) {
      setIsVerified(true);
    } else {
      alert("Kode Absensi Salah! Silakan cek kembali.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalNama = "";
    let finalNpm = "";

    if (selectedStudent === "LAINNYA") {
      if (!namaManual || !npmManual) return alert("Mohon isi Nama dan NPM!");
      finalNama = namaManual.trim().toUpperCase();
      finalNpm = npmManual.trim();
    } else if (selectedStudent !== "") {
      const student = DAFTAR_MAHASISWA.find(s => s.npm === selectedStudent);
      finalNama = student?.nama || "";
      finalNpm = student?.npm || "";
    } else {
      return alert("Silakan pilih nama Anda!");
    }
    
    setIsSubmitting(true);

    try {
      const now = new Date();
      const wibOffset = 7 * 60 * 60 ;
      const wibTime = new Date(now.getTime() + wibOffset);
      const today = wibTime.toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('absensi')
        .select('id')
        .eq('npm', finalNpm)
        .gte('waktu_absen', `${today}T00:00:00Z`)
        .lte('waktu_absen', `${today}T23:59:59Z`)
        .maybeSingle();

      if (existing) {
        alert("NPM ini sudah melakukan presensi hari ini!");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('absensi')
        .insert([{
          nama_mahasiswa: finalNama,
          npm: finalNpm,
          waktu_absen: new Date().toISOString()
        }]);

      if (error) throw error;

      localStorage.setItem('nama_user_solaria', finalNama);
      setIsSuccess(true);
      
    } catch (err: any) {
      alert("Sistem Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-400 uppercase tracking-widest animate-pulse">LOADING...</div>;

  if (!isOpen) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 p-6">
      <div className="text-center bg-white p-10 rounded-[40px] shadow-xl border-t-[10px] border-red-600 max-w-md w-full">
        <h1 className="text-3xl font-black text-red-600 mb-4 uppercase tracking-tighter">ABSEN CLOSED</h1>
        <p className="font-bold text-slate-500 uppercase text-xs">Sistem sedang ditutup oleh Admin.</p>
      </div>
    </div>
  );

  if (isSuccess) return (
    <div className="flex h-screen items-center justify-center bg-green-50 p-6">
      <div className="text-center bg-white p-10 rounded-[40px] shadow-2xl border-t-[10px] border-green-600 max-w-md w-full">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
           <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-2xl font-black text-green-700 uppercase mb-2">Berhasil!</h1>
        <p className="font-bold text-slate-600 uppercase text-[12px]">Presensi Anda sudah direkam</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* JIKA BELUM VERIFIKASI KODE */}
      {!isVerified ? (
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border-t-[10px] border-[#800020] p-10 animate-in fade-in zoom-in duration-500">
           <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-2xl font-black text-[#800020] uppercase tracking-tighter">Kode Akses</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Masukkan kode dari Dosen atau Ketua Kelas</p>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="MASUKKAN KODE DISINI"
              value={inputKode}
              onChange={(e) => setInputKode(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 focus:border-[#800020] rounded-2xl outline-none font-black text-center uppercase tracking-widest transition-all"
            />
            <button 
              onClick={handleVerifikasi}
              className="w-full py-5 rounded-2xl bg-[#800020] text-white font-black uppercase shadow-lg hover:bg-black active:scale-95 transition-all"
            >
              Verifikasi & Absen →
            </button>
          </div>
        </div>
      ) : (
        /* TAMPILAN ASLI FORMULIR ABSENSI (TIDAK BERUBAH) */
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border-t-[10px] border-[#800020] animate-in slide-in-from-bottom-10 duration-500">
          <div className="p-10">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-black text-[#800020] uppercase">Absensi Mahasiswa</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Pilih nama atau isi manual jika tidak ada</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2">Cari Nama</label>
                <select 
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#800020] rounded-2xl outline-none font-bold appearance-none cursor-pointer transition-all"
                >
                  <option value="">-- KLIK UNTUK MEMILIH NAMA --</option>
                  {DAFTAR_MAHASISWA.map((m) => (
                    <option key={m.npm} value={m.npm}>{m.nama}</option>
                  ))}
                  <option value="LAINNYA">--- SAYA TIDAK ADA DI DAFTAR (LAINNYA) ---</option>
                </select>
              </div>

              {selectedStudent === "LAINNYA" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <input 
                    type="text" 
                    placeholder="MASUKKAN NAMA LENGKAP"
                    className="w-full p-4 bg-slate-50 border-2 border-[#800020]/20 focus:border-[#800020] rounded-2xl outline-none font-bold uppercase"
                    value={namaManual}
                    onChange={(e) => setNamaManual(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="MASUKKAN NPM"
                    className="w-full p-4 bg-slate-50 border-2 border-[#800020]/20 focus:border-[#800020] rounded-2xl outline-none font-bold"
                    value={npmManual}
                    onChange={(e) => setNpmManual(e.target.value)}
                  />
                </div>
              )}

              <button 
                disabled={isSubmitting}
                type="submit" 
                className={`w-full py-5 rounded-2xl font-black text-white uppercase shadow-lg transition-all ${isSubmitting ? 'bg-slate-400' : 'bg-[#800020] hover:bg-black active:scale-95'}`}
              >
                {isSubmitting ? 'MEMPROSES...' : 'KIRIM ABSENSI'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bagian footer tetap asli */}
      <p className="mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Satu NPM hanya diperbolehkan satu kali absen per hari</p>
    </div>
  );
}