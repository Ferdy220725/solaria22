"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client'; 
import { jsPDF } from "jspdf";

export default function SuperAdminPage() {
  const [role, setRole] = useState<'GUEST' | 'WEB' | 'ABSEN'>('GUEST');
  const [password, setPassword] = useState('');
  const supabase = createClient();

  // State Data
  const [izins, setIzins] = useState<any[]>([]);
  const [tugasPrak, setTugasPrak] = useState<any[]>([]);
  const [tugasKuliah, setTugasKuliah] = useState<any[]>([]);
  const [absensi, setAbsensi] = useState<any[]>([]);
  const [absensiEnabled, setAbsensiEnabled] = useState(false);
  
  // --- STATE BARU UNTUK KODE ABSEN ---
  const [kodeAbsen, setKodeAbsen] = useState('');

  // State Input
  const [judulPrak, setJudulPrak] = useState('');
  const [mkPrak, setMkPrak] = useState('FISTAN'); 
  const [golongan, setGolongan] = useState('C1');
  const [linkPrak, setLinkPrak] = useState('');
  const [deadlinePrak, setDeadlinePrak] = useState('');
  
  const [judulKuliah, setJudulKuliah] = useState('');
  const [mkKuliah, setMkKuliah] = useState('');
  const [deadlineKuliah, setDeadlineKuliah] = useState('');
  const [deskripsiKuliah, setDeskripsiKuliah] = useState(''); 
  const [linkKuliah, setLinkKuliah] = useState(''); 

  const [judulMateri, setJudulMateri] = useState('');
  const [mkMateri, setMkMateri] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const formatToWIB = (dateString: string) => {
    if (!dateString) return null;
    return `${dateString}:00+07:00`;
  };

  const fetchData = async () => {
    if (role === 'WEB') {
      const { data: dIzin } = await supabase.from('perizinan').select('*').order('created_at', { ascending: false });
      const { data: dPrak } = await supabase.from('tugas_praktikum').select('*').order('deadline', { ascending: true });
      const { data: dKuliah } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
      if (dIzin) setIzins(dIzin);
      if (dPrak) setTugasPrak(dPrak);
      if (dKuliah) setTugasKuliah(dKuliah);
    } 
    if (role === 'ABSEN') {
      const { data: dAbsen } = await supabase.from('absensi').select('*').order('waktu_absen', { ascending: false });
      const { data: sAbsen } = await supabase.from('status_sistem').select('*').eq('id', 'absensi').maybeSingle();
      if (dAbsen) setAbsensi(dAbsen);
      if (sAbsen) {
        setAbsensiEnabled(sAbsen.is_active);
        setKodeAbsen(sAbsen.kode_akses || ''); // Ambil kode yang ada di DB
      }
    }
  };

  useEffect(() => { if (role !== 'GUEST') fetchData(); }, [role]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === "admin123") setRole('WEB');
    else if (password === "absenC789") setRole('ABSEN');
    else alert("Password Salah!");
  };

  const handlePostTugasKuliah = async () => {
    const { error } = await supabase.from('tugas_perkuliahan').insert([{
      judul_tugas: judulKuliah.trim(), mk_nama: mkKuliah.trim(), 
      deadline: formatToWIB(deadlineKuliah), deskripsi: deskripsiKuliah.trim(),
      link_pengumpulan: linkKuliah.trim()
    }]);
    if (!error) { 
      alert("Tugas Kuliah Terbit!"); 
      setJudulKuliah(''); setMkKuliah(''); setDeadlineKuliah(''); setDeskripsiKuliah(''); setLinkKuliah('');
      fetchData(); 
    }
  };

  const handlePostTugasPrak = async () => {
    const { error } = await supabase.from('tugas_praktikum').insert([{
      judul_tugas: judulPrak.trim(), mk_nama: mkPrak.trim().toUpperCase(), golongan: golongan.trim().toUpperCase(),
      deadline: formatToWIB(deadlinePrak), link_pengumpulan: linkPrak.trim()
    }]);
    if (!error) { alert("Tugas Praktikum Terbit!"); fetchData(); }
  };

  const handleUploadMateri = async () => {
    if (!file) return;
    const fileName = `${Date.now()}_${file.name}`;
    await supabase.storage.from('uploads').upload(fileName, file);
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    await supabase.from('materi').insert([{ judul: judulMateri.trim(), file_url: urlData.publicUrl, mk_nama: mkMateri.trim() }]);
    alert("Materi Berhasil!");
  };

  const deleteData = async (id: string, table: string) => {
    if (confirm("Hapus?")) { await supabase.from(table).delete().eq('id', id); fetchData(); }
  };

  const downloadPDF = (data: any) => {
    if (data.file_pdf_url) { window.open(data.file_pdf_url, '_blank'); }
    else {
      const doc = new jsPDF();
      doc.text(`Surat Izin: ${data.nama_lengkap}`, 20, 20);
      doc.save(`Izin_${data.nama_lengkap}.pdf`);
    }
  };

  const toggleAbsensi = async (status: boolean) => {
    const { error } = await supabase.from('status_sistem').update({ is_active: status }).eq('id', 'absensi');
    if (!error) setAbsensiEnabled(status);
  };

  // --- FUNGSI BARU UNTUK UPDATE KODE ---
  const updateKodeAbsen = async () => {
    const { error } = await supabase
      .from('status_sistem')
      .update({ kode_akses: kodeAbsen.toUpperCase() })
      .eq('id', 'absensi');
    
    if (!error) alert("Kode Absen Berhasil Diperbarui: " + kodeAbsen.toUpperCase());
    else alert("Gagal Update Kode!");
  };

  if (role === 'GUEST') return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-xl rounded-3xl border-t-8 border-[#800020] w-full max-w-sm text-center">
        <h2 className="text-xl font-black text-[#800020] mb-6 uppercase">Login Admin</h2>
        <input type="password" placeholder="Password Admin" className="w-full p-4 border-2 rounded-2xl mb-4 text-center font-bold" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-[#800020] text-white py-4 rounded-2xl font-black uppercase">Masuk</button>
      </form>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-xl font-black text-[#800020] uppercase">{role === 'WEB' ? 'Admin Manajemen Konten' : 'Admin Absensi'}</h1>
        <button onClick={() => setRole('GUEST')} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black text-xs">LOGOUT</button>
      </div>

      {role === 'WEB' ? (
        <div className="space-y-10">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-[#004d40]">
              <h2 className="font-black mb-4 text-[#004d40] uppercase text-xs">1. Post Tugas Kuliah</h2>
              <input type="text" placeholder="Matkul" className="w-full border p-3 mb-2 rounded-xl text-xs" value={mkKuliah} onChange={e => setMkKuliah(e.target.value)} />
              <input type="text" placeholder="Judul" className="w-full border p-3 mb-2 rounded-xl text-xs" value={judulKuliah} onChange={e => setJudulKuliah(e.target.value)} />
              <input type="datetime-local" className="w-full border p-3 mb-2 rounded-xl text-xs" value={deadlineKuliah} onChange={e => setDeadlineKuliah(e.target.value)} />
              <input type="text" placeholder="Link Pengumpulan" className="w-full border p-3 mb-2 rounded-xl text-xs bg-blue-50" value={linkKuliah} onChange={e => setLinkKuliah(e.target.value)} />
              <textarea placeholder="Deskripsi..." className="w-full border p-3 mb-4 rounded-xl text-xs min-h-[80px]" value={deskripsiKuliah} onChange={e => setDeskripsiKuliah(e.target.value)} />
              <button onClick={handlePostTugasKuliah} className="w-full bg-[#004d40] text-white py-3 rounded-xl font-black text-xs">PUBLISH</button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-[#D4AF37]">
              <h2 className="font-black mb-4 text-[#800020] uppercase text-xs">2. Post Praktikum</h2>
              <select className="w-full border p-3 mb-2 rounded-xl text-xs font-bold" value={mkPrak} onChange={e => {setMkPrak(e.target.value); setGolongan(e.target.value === 'DIT' ? 'B1' : 'C1');}}>
                <option value="FISTAN">FISTAN</option><option value="DBT">DBT</option><option value="DPT">DPT</option><option value="DIT">DIT</option>
              </select>
              <select className="w-full border p-3 mb-2 rounded-xl text-xs font-bold" value={golongan} onChange={e => setGolongan(e.target.value)}>
                {mkPrak === 'DIT' ? (<><option value="B1">GOL B1</option><option value="B3">GOL B3</option><option value="C3">GOL C3</option></>) : (<><option value="C1">GOL C1</option><option value="C2">GOL C2</option><option value="C3">GOL C3</option></>)}
              </select>
              <input type="text" placeholder="Judul" className="w-full border p-3 mb-2 rounded-xl text-xs" value={judulPrak} onChange={e => setJudulPrak(e.target.value)} />
              <input type="datetime-local" className="w-full border p-3 mb-4 rounded-xl text-xs" value={deadlinePrak} onChange={e => setDeadlinePrak(e.target.value)} />
              <button onClick={handlePostTugasPrak} className="w-full bg-[#D4AF37] text-white py-3 rounded-xl font-black text-xs">PUBLISH</button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-[#800020]">
              <h2 className="font-black mb-4 text-slate-700 uppercase text-xs">3. Upload Materi</h2>
              <input type="text" placeholder="Matkul" className="w-full border p-3 mb-2 rounded-xl text-xs" onChange={e => setMkMateri(e.target.value)} />
              <input type="text" placeholder="Judul Materi" className="w-full border p-3 mb-2 rounded-xl text-xs" onChange={e => setJudulMateri(e.target.value)} />
              <input type="file" className="w-full mb-4 text-[10px]" onChange={e => setFile(e.target.files?.[0] || null)} />
              <button onClick={handleUploadMateri} className="w-full bg-[#800020] text-white py-3 rounded-xl font-black text-xs">UPLOAD</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-black text-xs uppercase mb-4 text-slate-400">Tugas Kuliah Aktif</h3>
              {tugasKuliah.map(t => (
                <div key={t.id} className="p-3 mb-2 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase">{t.mk_nama}: {t.judul_tugas}</span>
                  <button onClick={() => deleteData(t.id, 'tugas_perkuliahan')} className="text-red-500 text-[10px] font-black">HAPUS</button></div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-black text-xs uppercase mb-4 text-slate-400">Surat Izin Mahasiswa</h3>
              {izins.map(i => (
                <div key={i.id} className="flex justify-between items-center p-2 mb-1 bg-slate-50 rounded-lg">
                  <span className="text-[10px] font-bold uppercase">{i.nama_lengkap}</span>
                  <button onClick={() => downloadPDF(i)} className="text-[#800020] text-[10px] font-black">PDF</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* PANEL ABSENSI */
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
             {/* KENDALI PINTU ABSENSI */}
             <div className="bg-white p-8 rounded-3xl shadow-sm text-center border-l-8 border-blue-600">
                <h2 className="font-black text-slate-800 uppercase text-xs mb-4">Pintu Absensi</h2>
                <button onClick={() => toggleAbsensi(!absensiEnabled)} className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-lg ${absensiEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {absensiEnabled ? 'SISTEM: OPEN' : 'SISTEM: CLOSED'}
                </button>
             </div>

             {/* KENDALI KODE ABSENSI (FITUR BARU) */}
             <div className="bg-white p-8 rounded-3xl shadow-sm text-center border-l-8 border-[#800020]">
                <h2 className="font-black text-slate-800 uppercase text-xs mb-4">Kode Akses Hari Ini</h2>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="SET KODE" 
                    className="flex-1 border-2 p-3 rounded-xl font-black text-center uppercase text-sm focus:border-[#800020] outline-none"
                    value={kodeAbsen}
                    onChange={e => setKodeAbsen(e.target.value)}
                  />
                  <button onClick={updateKodeAbsen} className="bg-[#800020] text-white px-6 rounded-xl font-black text-[10px] uppercase shadow-md">Simpan</button>
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 italic">*Beritahu kode ini ke mahasiswa</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-black text-xs uppercase mb-4 text-slate-400 italic">Daftar Mahasiswa Sudah Absen (Log 24 Jam)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b uppercase text-slate-400 font-black">
                    <th className="py-2">Nama Mahasiswa</th>
                    <th className="py-2">NPM</th>
                    <th className="py-2">Waktu Absen</th>
                  </tr>
                </thead>
                <tbody>
                  {absensi.map((a, idx) => (
                    <tr key={idx} className="border-b font-bold text-slate-700">
                      <td className="py-3 uppercase">{a.nama_mahasiswa}</td> {/* Diperbaiki dari nama_lengkap sesuai tabel absensi */}
                      <td className="py-3">{a.npm}</td>
                      <td className="py-3 text-slate-400">{new Date(a.waktu_absen).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {absensi.length === 0 && <p className="text-center py-10 text-slate-300 font-black uppercase text-xs">Belum ada yang absen hari ini</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}