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

  const formatKeWIB = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
    });
  };

  const isExpired = (deadline: string) => {
    return new Date() > new Date(deadline);
  };

  const handleShareDosen = (m: any) => {
    const linkAsli = `https://meet.jit.si/${m.room_id}`;
    const formatWaktu = formatKeWIB(m.tanggal_jam);
    const teks = `Permisi Pak/Bu maaf mengganggu waktunya mohon izin mengirimkan informasi kegiatan perkuliahan secara online untuk mata kuliah,%0A%0AAgenda: ${m.judul}%0AWaktu: ${formatWaktu} WIB%0ALink Meeting: ${linkAsli}%0APasscode: ${m.passcode || '-'}%0A%0ATerima kasih atas perhatiannya`;
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
    else { alert("Berhasil!"); setShowAdminForm(false); setIsAdminVerified(false); setAdminPass(""); fetchData(); }
  };

  if (!showDashboard) {
    return (
      <div className="h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
        <div className="w-48 h-48 md:w-64 md:h-64"><Lottie animationData={catAnimation} loop={true} /></div>
        <div className="text-center w-full max-w-sm -mt-6">
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-2xl border-b-8 border-[#800020]">
            <h1 className="text-2xl md:text-3xl font-black text-[#800020] uppercase leading-none">Hallo, <br/><span className="text-orange-500">{displayName}</span></h1>
            <button onClick={() => setShowDashboard(true)} className="mt-6 w-full bg-[#800020] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all">Masuk Dashboard →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* MODAL MEETING - FULL SCREEN MOBILE */}
      {showMeeting && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col">
          <div className="p-3 bg-[#800020] flex justify-between items-center text-white">
            <span className="font-black text-[9px] uppercase tracking-widest">Solaria Live</span>
            <button onClick={() => setShowMeeting(false)} className="bg-white/20 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase">Tutup</button>
          </div>
          <iframe allow="camera; microphone; display-capture; fullscreen" src={`https://meet.jit.si/${activeRoom}`} className="flex-1 w-full border-0" />
        </div>
      )}

      {/* MODAL ADMIN - RESPONSIF */}
      {showAdminForm && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl">
            {!isAdminVerified ? (
              <div className="text-center">
                <h2 className="font-black text-[#800020] uppercase mb-4">Admin Only</h2>
                <input type="password" placeholder="Pass..." className="w-full p-4 rounded-xl border-2 mb-4 text-center font-bold" value={adminPass} onChange={(e) => setAdminPass(e.target.value)}/>
                <button onClick={() => adminPass === "solaria2026" ? setIsAdminVerified(true) : alert("Salah!")} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs">Login</button>
                <button onClick={() => setShowAdminForm(false)} className="mt-4 text-[10px] font-bold text-slate-400 uppercase">Batal</button>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="font-black text-blue-600 uppercase text-center text-lg">Buat Jadwal</h2>
                <input type="text" placeholder="Agenda..." className="w-full p-3 rounded-xl border text-sm font-bold" value={newMeeting.judul} onChange={e => setNewMeeting({...newMeeting, judul: e.target.value})}/>
                <input type="datetime-local" className="w-full p-3 rounded-xl border text-sm font-bold uppercase" onChange={e => setNewMeeting({...newMeeting, tanggal_jam: e.target.value})}/>
                <input type="text" placeholder="Passcode (Opsional)" className="w-full p-3 rounded-xl border text-sm font-bold" value={newMeeting.passcode} onChange={e => setNewMeeting({...newMeeting, passcode: e.target.value})}/>
                <button onClick={handleSaveMeeting} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">Simpan →</button>
                <button onClick={() => {setShowAdminForm(false); setIsAdminVerified(false);}} className="w-full text-[9px] font-black text-slate-400 uppercase text-center">Selesai</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WRAPPER UTAMA - PADDING RESPONSIF */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-[#800020] uppercase tracking-tighter leading-tight">Dashboard Agrotek C</h1>
            <p className="text-slate-400 font-bold text-[9px] md:text-xs uppercase tracking-widest text-left">Pusat Informasi & Manajemen Kelas</p>
          </div>
          <button onClick={() => setShowDashboard(false)} className="text-[9px] font-black text-slate-300 hover:text-[#800020] uppercase transition-all">← Logout</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI (AGENDA & JADWAL) */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="bg-white p-5 rounded-[24px] shadow-sm border-t-4 border-blue-600">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">📅 Agenda Meeting</h2>
                <button onClick={() => setShowAdminForm(true)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">{isAdminVerified ? '✓' : '+'}</button>
              </div>
              <div className="space-y-3">
                {meetings.length === 0 && <p className="text-[10px] text-center text-slate-400 font-bold py-4 uppercase">Tidak ada jadwal</p>}
                {meetings.map((m) => (
                  <div key={m.id} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 relative">
                    {isAdminVerified && (
                      <button onClick={async () => { if(confirm("Hapus?")) { await supabase.from('jadwal_meeting').delete().eq('id', m.id); fetchData(); } }} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg">✕</button>
                    )}
                    <p className="font-black text-blue-900 text-[11px] uppercase mb-1">{m.judul}</p>
                    <p className="text-[9px] font-bold text-blue-600/70 mb-3 uppercase tracking-tight">{formatKeWIB(m.tanggal_jam)} WIB</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setActiveRoom(m.room_id); setShowMeeting(true); }} className="bg-blue-600 text-white py-2.5 rounded-lg text-[9px] font-black uppercase active:scale-95 transition-all">Join</button>
                      <button onClick={() => handleShareDosen(m)} className="bg-white border border-blue-200 text-blue-600 py-2.5 rounded-lg text-[9px] font-black uppercase text-center active:scale-95 transition-all">Dosen</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-[24px] shadow-sm border-t-4 border-[#800020]">
              <h2 className="text-[10px] font-black text-slate-800 uppercase mb-4 border-b pb-2 tracking-widest">Jadwal Kuliah</h2>
              <ul className="space-y-3">
                {["Senin: Genetika", "Selasa: DBT", "Rabu: Fistan", "Kamis: DIT", "Jumat: DPT"].map((j, i) => (
                  <li key={i} className="text-[10px] font-bold text-slate-700 uppercase flex justify-between items-center border-b border-slate-50 pb-2">
                    <span>{j.split(':')[0]}</span>
                    <span className="text-[#800020]">{j.split(':')[1]}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button onClick={() => router.push('/absensi')} className="w-full p-6 bg-white rounded-[24px] shadow-sm border-b-4 border-[#800020] active:scale-95 transition-all border border-slate-100 flex items-center justify-center gap-4">
              <span className="text-2xl">📝</span>
              <span className="font-black text-[#800020] text-sm uppercase">Absensi Mahasiswa</span>
            </button>
          </div>

          {/* KOLOM KANAN (TUGAS & BEASISWA) */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            
            <div className="bg-white p-5 rounded-[24px] shadow-sm border-t-4 border-[#004d40]">
              <h2 className="text-[10px] font-black text-slate-800 uppercase mb-6 border-b pb-2 tracking-widest text-left">Tugas Perkuliahan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tugas.map((t) => {
                  const telat = isExpired(t.deadline);
                  return (
                    <div key={t.id} className="p-4 rounded-2xl border bg-slate-50 border-slate-100 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${telat ? 'bg-slate-300' : 'bg-[#004d40]'} text-white`}>Agrotek</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">#{t.id.toString().slice(0,4)}</span>
                      </div>
                      <p className="font-black text-slate-800 text-sm mb-1 uppercase leading-tight">{t.judul_tugas}</p>
                      <p className={`${telat ? 'text-slate-400' : 'text-red-600'} font-bold text-[9px] mb-3 uppercase`}>
                        {telat ? 'Selesai' : `Deadline: ${new Date(t.deadline).toLocaleDateString('id-ID')}`}
                      </p>
                      {t.deskripsi && (
                        <div className="mb-4 p-3 bg-white rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-500 leading-relaxed italic whitespace-pre-line">{t.deskripsi}</p>
                        </div>
                      )}
                      {t.link_pengumpulan && !telat && (
                        <a href={t.link_pengumpulan} target="_blank" className="mt-auto block w-full bg-[#004d40] text-white text-center py-2.5 rounded-xl text-[9px] font-black uppercase active:scale-95 transition-all">Kumpulkan →</a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border-t-4 border-orange-500 overflow-hidden">
              <button onClick={() => setIsScholarshipOpen(!isScholarshipOpen)} className="w-full p-5 flex justify-between items-center active:bg-orange-50 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📁</span>
                  <div className="text-left">
                    <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Informasi Beasiswa</h2>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{beasiswa.length} Tersedia</p>
                  </div>
                </div>
                <span className={`text-xs transition-transform ${isScholarshipOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {isScholarshipOpen && (
                <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {beasiswa.map((b, index) => (
                      <div key={index} className="p-4 bg-white rounded-xl border border-orange-100 shadow-sm flex flex-col justify-between">
                        <div className="mb-3">
                          <h3 className="font-black text-slate-800 text-[10px] uppercase mb-1">{b.nama}</h3>
                          <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">{b.instansi}</p>
                        </div>
                        <a href={b.link || b.link_prodi || b.link_univ} target="_blank" className="block w-full bg-orange-500 text-white text-center py-2 rounded-lg text-[8px] font-black uppercase active:bg-[#800020] transition-colors">Cek →</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}