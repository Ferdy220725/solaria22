"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Lottie from "lottie-react";
import catAnimation from "../public/cat.json";

export default function Dashboard() {
  // --- STATE ---
  const [tugas, setTugas] = useState<any[]>([]);
  const [beasiswa, setBeasiswa] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayName, setDisplayName] = useState('Sobat Agrotek 🍃');
  const [isScholarshipOpen, setIsScholarshipOpen] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [activeRoom, setActiveRoom] = useState("");
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ judul: '', tanggal_jam: '', room_id: '', passcode: '' });

  const supabase = createClient();
  const router = useRouter();

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
    const savedName = localStorage.getItem('nama_user_solaria');
    if (savedName) { setDisplayName(savedName.split(' ')[0]); }
  }, []);

  const fetchData = async () => {
    const { data: dataTugas } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
    if (dataTugas) setTugas(dataTugas);

    const { data: dataMeetings } = await supabase.from('jadwal_meeting').select('*').order('tanggal_jam', { ascending: true });
    if (dataMeetings) setMeetings(dataMeetings);

    try {
      const response = await fetch('/scholarships.json');
      const dataB = await response.json();
      setBeasiswa(dataB);
    } catch (err) { console.error(err); }
  };

  // --- HELPERS ---
  const formatKeWIB = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
    });
  };

  const isExpired = (deadline: string) => {
    return new Date() > new Date(deadline);
  };

  const handleShareDosen = (m: any) => {
    const linkAsli = `https://meet.jit.si/${m.room_id}`;
    const formatWaktu = formatKeWIB(m.tanggal_jam);
    const teks = `Permisi Pak/Bu maaf mengganggu waktunya mohon izin mengirimkan informasi kegiatan perkuliahan secara online untuk mata kuliah [.....],%0A%0AAgenda: ${m.judul}%0AWaktu: ${formatWaktu} WIB%0ALink Meeting: ${linkAsli}%0APasscode: ${m.passcode || '-'}%0A%0ATerima kasih`;
    window.open(`https://wa.me/?text=${teks}`, '_blank');
  };

  const handleSaveMeeting = async () => {
    if (!newMeeting.judul || !newMeeting.tanggal_jam) return alert("Isi Judul dan Waktu!");
    const waktuISO_WIB = `${newMeeting.tanggal_jam}:00+07:00`;
    const finalRoomId = newMeeting.room_id || `Solaria-${newMeeting.judul.replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;

    const { error } = await supabase.from('jadwal_meeting').insert([{ 
      judul: newMeeting.judul, tanggal_jam: waktuISO_WIB, room_id: finalRoomId, passcode: newMeeting.passcode 
    }]);

    if (error) alert("Gagal: " + error.message);
    else {
      alert("Jadwal Berhasil Ditambahkan!");
      setShowAdminForm(false); setIsAdminVerified(false); setAdminPass(""); fetchData();
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!isAdminVerified) { setShowAdminForm(true); return; }
    if (confirm("Yakin ingin menghapus jadwal ini?")) {
      await supabase.from('jadwal_meeting').delete().eq('id', id);
      fetchData();
    }
  };

  if (!showDashboard) {
    return (
      <div className="relative h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80"><Lottie animationData={catAnimation} loop={true} /></div>
        <div className="relative z-10 text-center px-6 -mt-10">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border-b-8 border-[#800020]">
            <h1 className="text-3xl md:text-5xl font-black text-[#800020] uppercase tracking-tighter">Hallo, <span className="text-orange-500">{displayName}</span></h1>
            <p className="text-lg md:text-xl font-bold text-slate-600 mt-2">Apa kabar? Salam dari Solaria! 👋</p>
            <button onClick={() => setShowDashboard(true)} className="mt-8 bg-[#800020] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:scale-110 transition-all shadow-lg">Masuk Dashboard →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 font-sans text-slate-800 animate-in fade-in duration-700">
      
      {/* MODAL MEETING JITSI */}
      {showMeeting && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col">
          <div className="p-4 bg-[#800020] flex justify-between items-center text-white">
            <span className="font-black text-[10px] uppercase tracking-widest text-orange-400">Solaria Meet Live</span>
            <button onClick={() => setShowMeeting(false)} className="bg-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all">Tutup</button>
          </div>
          <iframe allow="camera; microphone; display-capture; fullscreen" src={`https://meet.jit.si/${activeRoom}`} style={{ width: '100%', height: '100%', border: '0' }} />
        </div>
      )}

      {/* MODAL ADMIN PANEL */}
      {showAdminForm && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-slate-800">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl border-b-8 border-blue-600">
            {!isAdminVerified ? (
              <div className="text-center">
                <h2 className="font-black text-[#800020] uppercase mb-4 tracking-tighter">Verifikasi Admin</h2>
                <input type="password" placeholder="Password Admin..." className="w-full p-4 rounded-2xl border-2 border-slate-100 mb-4 focus:border-blue-500 outline-none text-center font-bold" value={adminPass} onChange={(e) => setAdminPass(e.target.value)}/>
                <div className="flex gap-2">
                  <button onClick={() => setShowAdminForm(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400">Batal</button>
                  <button onClick={() => adminPass === "solaria2026" ? setIsAdminVerified(true) : alert("Salah!")} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-200">Masuk</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-black text-blue-600 uppercase text-center mb-2 tracking-tighter text-xl">Atur Jadwal Meeting</h2>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nama Agenda</label>
                  <input type="text" className="w-full p-3 rounded-xl border border-slate-200 text-[11px] font-bold" onChange={e => setNewMeeting({...newMeeting, judul: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Waktu (WIB)</label>
                  <input type="datetime-local" className="w-full p-3 rounded-xl border border-slate-200 text-[11px] font-bold uppercase" onChange={e => setNewMeeting({...newMeeting, tanggal_jam: e.target.value})}/>
                </div>
                <button onClick={handleSaveMeeting} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-200 mt-2 hover:bg-black transition-all">Simpan Jadwal →</button>
                <button onClick={() => {setShowAdminForm(false); setIsAdminVerified(false);}} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Selesai</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#800020] mb-2 uppercase tracking-tighter">Dashboard Agrotek C</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pusat Informasi & Manajemen Kelas</p>
        </div>
        <button onClick={() => setShowDashboard(false)} className="text-[10px] font-black text-slate-400 hover:text-[#800020] uppercase border-b border-transparent hover:border-[#800020] pb-1 transition-all">← Kembali</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-blue-600">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">📅 Agenda Meeting</h2>
              <button onClick={() => setShowAdminForm(true)} className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <span className="font-bold text-lg">{isAdminVerified ? '✓' : '+'}</span>
              </button>
            </div>
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.id} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 group transition-all relative">
                  {isAdminVerified && (
                    <button onClick={() => handleDeleteMeeting(m.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20">✕</button>
                  )}
                  <p className="font-black text-blue-900 text-[11px] uppercase mb-1">{m.judul}</p>
                  <p className="text-[9px] font-bold text-blue-600/70 mb-3 uppercase">{formatKeWIB(m.tanggal_jam)} WIB</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setActiveRoom(m.room_id); setShowMeeting(true); }} className="bg-blue-600 text-white py-2 rounded-lg text-[9px] font-black uppercase hover:bg-black transition-all">Join</button>
                    <button onClick={() => handleShareDosen(m)} className="bg-white border border-blue-200 text-blue-600 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-blue-50 transition-all text-center">Dosen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#800020]">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-4 border-b pb-2 tracking-widest">Jadwal Kuliah</h2>
            <ul className="space-y-4">
              {["Senin (08.41 - 14.40): Genetika", "Selasa (08.41 - 10.21): DBT", "Rabu (07.00 - 08.40): Fistan", "Kamis (13.00 - 14.40): DIT", "Jumat (08.00 - 09.40): DPT"].map((j, i) => (
                <li key={i} className="text-[11px] font-bold text-slate-700 uppercase border-b pb-2">{j}</li>
              ))}
            </ul>
          </div>
          
          <button onClick={() => router.push('/absensi')} className="w-full p-8 bg-white rounded-3xl shadow-sm border-b-8 border-[#800020] hover:bg-slate-50 transition-all border border-slate-100">
            <div className="text-3xl mb-4 text-center">📝</div>
            <span className="font-black text-[#800020] text-lg uppercase block text-center">Absensi Mahasiswa</span>
          </button>
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TUGAS PERKULIAHAN (FIX DESKRIPSI) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#004d40]">
            <h2 className="text-sm font-black text-slate-800 uppercase mb-6 border-b pb-2 tracking-widest">Tugas Perkuliahan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tugas.map((t) => {
                const telat = isExpired(t.deadline);
                return (
                  <div key={t.id} className="p-5 rounded-2xl border bg-slate-50 border-slate-100 flex flex-col h-full shadow-sm text-slate-800">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${telat ? 'bg-slate-400' : 'bg-[#004d40]'} text-white w-fit mb-2`}>Kuliah</span>
                    <p className="font-black text-slate-800 text-md mb-1 uppercase leading-tight">{t.judul_tugas}</p>
                    <p className={`${telat ? 'text-slate-400' : 'text-red-600'} font-bold text-[10px] mb-3 uppercase tracking-tighter`}>
                      {telat ? '❌ DEADLINE BERAKHIR' : `⏰ Deadline: ${new Date(t.deadline).toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})}`}
                    </p>
                    
                    {/* BAGIAN DESKRIPSI YANG SEMPAT HILANG */}
                    {t.deskripsi && (
                      <div className="mb-4 p-3 bg-white rounded-xl border border-slate-200">
                        <p className="text-[11px] text-slate-600 leading-relaxed italic whitespace-pre-line">{t.deskripsi}</p>
                      </div>
                    )}
                    
                    {t.link_pengumpulan && !telat && (
                      <a href={t.link_pengumpulan} target="_blank" className="mt-auto block w-full bg-[#004d40] text-white text-center py-2.5 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-black">Kumpulkan →</a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BEASISWA */}
          <div className="bg-white rounded-2xl shadow-sm border-t-8 border-orange-500 overflow-hidden text-slate-800">
            <button onClick={() => setIsScholarshipOpen(!isScholarshipOpen)} className="w-full p-6 flex justify-between items-center hover:bg-orange-50/30 transition-all">
              <div className="flex items-center gap-4">
                <span className="text-3xl text-orange-500">{isScholarshipOpen ? "📂" : "📁"}</span>
                <div className="text-left">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Informasi Beasiswa</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{beasiswa.length} Info Tersedia</p>
                </div>
              </div>
              <span className={`text-xl transition-transform ${isScholarshipOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isScholarshipOpen && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beasiswa.map((b, index) => (
                    <div key={index} className="p-5 bg-white rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-slate-800 text-xs uppercase mb-1">{b.nama}</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase mb-4">{b.instansi}</p>
                      </div>
                      <a href={b.link || b.link_prodi || b.link_univ} target="_blank" className="block w-full bg-orange-500 text-white text-center py-2 rounded-xl text-[9px] font-black uppercase hover:bg-[#800020] transition-colors">Lihat Beasiswa →</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}