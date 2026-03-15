"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { jsPDF } from "jspdf";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [izins, setIzins] = useState<any[]>([]);
  const [tugasPrak, setTugasPrak] = useState<any[]>([]);
  const [tugasKuliah, setTugasKuliah] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  // State Tugas Praktikum
  const [judulPrak, setJudulPrak] = useState('');
  const [mkPrak, setMkPrak] = useState('FISTAN'); 
  const [golongan, setGolongan] = useState('C1');
  const [linkPrak, setLinkPrak] = useState('');
  const [deadlinePrak, setDeadlinePrak] = useState('');

  // State Tugas Perkuliahan
  const [judulKuliah, setJudulKuliah] = useState('');
  const [mkKuliah, setMkKuliah] = useState('');
  const [deadlineKuliah, setDeadlineKuliah] = useState('');
  
  // State Materi
  const [judulMateri, setJudulMateri] = useState('');
  const [mkMateri, setMkMateri] = useState('');

  const supabase = createClient();

  // --- FUNGSI FIX TIMEZONE (PENAMBAHAN BARU) ---
  const formatToWIB = (dateString: string) => {
    if (!dateString) return null;
    // Mengubah jam input lokal menjadi format ISO dengan offset WIB (+07:00)
    return `${dateString}:00+07:00`;
  };

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth]);

  const fetchData = async () => {
    const { data: dIzin } = await supabase.from('perizinan').select('*').order('created_at', { ascending: false });
    const { data: dPrak } = await supabase.from('tugas_praktikum').select('*').order('deadline', { ascending: true });
    const { data: dKuliah } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
    
    if (dIzin) setIzins(dIzin);
    if (dPrak) setTugasPrak(dPrak);
    if (dKuliah) setTugasKuliah(dKuliah);
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === "admin123") setIsAuth(true);
    else alert("Password Salah!");
  };

  // --- FUNGSI POST TUGAS KULIAH (DIPERBAIKI BAGIAN DEADLINE) ---
  const handlePostTugasKuliah = async () => {
    if (!judulKuliah || !mkKuliah || !deadlineKuliah) return alert("Lengkapi info tugas kuliah!");
    try {
      const { error } = await supabase.from('tugas_perkuliahan').insert([{
        judul_tugas: judulKuliah.trim(),
        mk_nama: mkKuliah.trim(),
        deadline: formatToWIB(deadlineKuliah) // Menggunakan format WIB
      }]);
      
      if (error) throw error;
      
      alert("Tugas Kuliah Berhasil di-Post!");
      setJudulKuliah(''); setMkKuliah(''); setDeadlineKuliah('');
      fetchData();
    } catch (err: any) {
      alert("Gagal post: " + err.message);
    }
  };

  // --- FUNGSI POST TUGAS PRAKTIKUM (DIPERBAIKI BAGIAN DEADLINE) ---
  const handlePostTugasPrak = async () => {
    if (!judulPrak || !mkPrak || !deadlinePrak) return alert("Mohon lengkapi info tugas praktikum!");
    
    try {
      const { error } = await supabase.from('tugas_praktikum').insert([{
        judul_tugas: judulPrak.trim(),
        mk_nama: mkPrak.trim().toUpperCase(), 
        golongan: golongan.trim().toUpperCase(), 
        deadline: formatToWIB(deadlinePrak), // Menggunakan format WIB
        link_pengumpulan: linkPrak.trim()
      }]);

      if (error) throw error;

      alert(`Tugas ${mkPrak} Golongan ${golongan} Berhasil di-Post!`);
      setJudulPrak(''); setLinkPrak(''); setDeadlinePrak('');
      fetchData();
    } catch (err: any) {
      alert("Gagal post praktikum: " + err.message);
    }
  };

  const deleteData = async (id: string, table: string) => {
    if (confirm("Hapus data ini selamanya?")) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) alert("Gagal hapus: " + error.message);
      else fetchData();
    }
  };

  const handleUploadMateri = async () => {
    if (!file || !judulMateri || !mkMateri) return alert("Isi Judul, Mata Kuliah, dan Pilih File!");
    
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error: upError } = await supabase.storage.from('uploads').upload(fileName, file);
      
      if (upError) throw upError;

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
      
      const { error: dbError } = await supabase.from('materi').insert([{ 
        judul: judulMateri.trim(), 
        file_url: urlData.publicUrl, 
        mk_nama: mkMateri.trim() 
      }]);

      if (dbError) throw dbError;

      alert("Materi Berhasil di-Upload!");
      setJudulMateri(''); setMkMateri(''); setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const downloadPDF = (data: any) => {
    const doc = new jsPDF();
    const date = new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(11);
    doc.text(`Surabaya, ${date}`, 140, 20);
    doc.text("Kepada Yth.", 20, 35);
    doc.text(`Bapak/Ibu Dosen Pengampu Mata Kuliah ${data.mk_nama}`, 20, 40);
    doc.text("Program Studi Agroteknologi", 20, 45);
    doc.text("Fakultas Pertanian", 20, 50);
    doc.text("UPN \"Veteran\" Jawa Timur", 20, 55);
    doc.text("Dengan hormat,", 20, 70);
    doc.text("Saya yang bertanda tangan di bawah ini:", 20, 75);
    doc.text(`Nama : ${data.nama_lengkap}`, 30, 85);
    doc.text(`NPM : ${data.npm || '-'}`, 30, 90);
    doc.text("Program Studi : Agroteknologi", 30, 95);
    doc.text("Fakultas : Pertanian", 30, 100);
    doc.text(`Dengan ini memohon izin untuk tidak dapat mengikuti perkuliahan pada:`, 20, 115);
    doc.text(`Mata Kuliah : ${data.mk_nama}`, 30, 125);
    doc.text(`Alasan : ${data.alasan}`, 30, 130);
    doc.text("Sehubungan dengan hal tersebut, saya memohon izin dan pengertiannya.", 20, 145);
    doc.text("Demikian surat izin ini saya sampaikan. Atas perhatiannya saya ucapkan terima kasih.", 20, 155);
    doc.text("Hormat saya,", 140, 175);
    if (data.tanda_tangan_url) {
        try {
            doc.addImage(data.tanda_tangan_url, 'PNG', 140, 180, 30, 15);
        } catch (e) { console.error("Gagal memuat tanda tangan ke PDF"); }
    }
    doc.text(`(${data.nama_lengkap})`, 140, 205);
    doc.save(`Surat_Izin_${data.nama_lengkap}.pdf`);
  };

  if (!isAuth) return (
    <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-xl rounded-3xl border-t-8 border-[#800020] w-full max-w-md">
        <h2 className="text-2xl font-black mb-6 text-[#800020] text-center">ADMIN PANEL</h2>
        <input 
          type="password" 
          placeholder="Masukkan Password Admin" 
          className="border-2 p-3 w-full mb-4 rounded-xl focus:border-[#800020] outline-none transition-all" 
          onChange={e => setPassword(e.target.value)} 
        />
        <button className="w-full bg-[#800020] text-white py-3 rounded-xl font-bold hover:bg-red-900 transition-all">MASUK</button>
      </form>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-[#800020]">Panel Control Admin</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Agrotek C Management</p>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all">Logout</button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* FORM 1: TUGAS PERKULIAHAN */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-[#004d40] flex flex-col justify-between">
          <div>
            <h2 className="font-black mb-4 text-[#004d40] uppercase text-sm">1. Post Tugas Kuliah (Teori)</h2>
            <input type="text" placeholder="Matkul (ex: Genetika)" className="w-full border p-3 mb-3 rounded-xl text-sm" value={mkKuliah} onChange={e => setMkKuliah(e.target.value)} />
            <input type="text" placeholder="Judul Tugas" className="w-full border p-3 mb-3 rounded-xl text-sm" value={judulKuliah} onChange={e => setJudulKuliah(e.target.value)} />
            <input type="datetime-local" className="w-full border p-3 mb-4 rounded-xl text-sm" value={deadlineKuliah} onChange={e => setDeadlineKuliah(e.target.value)} />
          </div>
          <button onClick={handlePostTugasKuliah} className="w-full bg-[#004d40] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-green-900/20">Post ke Dashboard</button>
        </div>

        {/* FORM 2: TUGAS PRAKTIKUM */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-[#D4AF37] flex flex-col justify-between">
          <div>
            <h2 className="font-black mb-4 text-[#800020] uppercase text-sm">2. Post Tugas Praktikum</h2>
            <select className="w-full border p-3 mb-3 rounded-xl text-sm font-bold bg-slate-50" value={mkPrak} onChange={e => {
                setMkPrak(e.target.value);
                setGolongan(e.target.value === 'DIT' ? 'B1' : 'C1');
            }}>
              <option value="FISTAN">FISTAN</option>
              <option value="DBT">DBT</option>
              <option value="DPT">DPT</option>
              <option value="DIT">DIT</option>
            </select>
            <select className="w-full border p-3 mb-3 rounded-xl text-sm font-black text-[#800020]" value={golongan} onChange={e => setGolongan(e.target.value)}>
              {mkPrak === 'DIT' ? (
                <>
                  <option value="B1">GOLONGAN B1</option>
                  <option value="B3">GOLONGAN B3</option>
                  <option value="C3">GOLONGAN C3</option>
                </>
              ) : (
                <>
                  <option value="C1">GOLONGAN C1</option>
                  <option value="C2">GOLONGAN C2</option>
                  <option value="C3">GOLONGAN C3</option>
                </>
              )}
            </select>
            <input type="text" placeholder="Judul Tugas" className="w-full border p-3 mb-3 rounded-xl text-sm" value={judulPrak} onChange={e => setJudulPrak(e.target.value)} />
            <input type="datetime-local" className="w-full border p-3 mb-4 rounded-xl text-sm" value={deadlinePrak} onChange={e => setDeadlinePrak(e.target.value)} />
          </div>
          <button onClick={handlePostTugasPrak} className="w-full bg-[#D4AF37] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-yellow-900/20">Post ke Praktikum</button>
        </div>

        {/* FORM 3: UPLOAD MATERI */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-[#800020] flex flex-col justify-between">
          <div>
            <h2 className="font-black mb-4 text-slate-700 uppercase text-sm">3. Upload Materi</h2>
            <input type="text" placeholder="Mata Kuliah" className="w-full border p-3 mb-3 rounded-xl text-sm" value={mkMateri} onChange={e => setMkMateri(e.target.value)} />
            <input type="text" placeholder="Judul (ex: Minggu 1)" className="w-full border p-3 mb-3 rounded-xl text-sm" value={judulMateri} onChange={e => setJudulMateri(e.target.value)} />
            <input type="file" className="w-full border p-3 mb-4 rounded-xl text-xs bg-slate-50" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <button onClick={handleUploadMateri} className="w-full bg-[#800020] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-red-900/20">Simpan Materi</button>
        </div>
      </div>

      {/* MANAJEMEN TUGAS */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-black text-[#004d40] mb-6 uppercase text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Tugas Kuliah Aktif
          </h3>
          <div className="space-y-3">
            {tugasKuliah.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 text-xs truncate uppercase">{t.mk_nama}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.judul_tugas}</p>
                </div>
                <button onClick={() => deleteData(t.id, 'tugas_perkuliahan')} className="text-red-500 font-bold text-[10px] hover:underline px-3">Hapus</button>
                </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-black text-[#800020] mb-6 uppercase text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Tugas Praktikum Aktif
          </h3>
          <div className="space-y-3">
            {tugasPrak.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="overflow-hidden">
                    <p className="font-bold text-[#800020] text-xs truncate uppercase">[{t.mk_nama}] GOL {t.golongan}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.judul_tugas}</p>
                </div>
                <button onClick={() => deleteData(t.id, 'tugas_praktikum')} className="text-red-500 font-bold text-[10px] hover:underline px-3">Hapus</button>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* DAFTAR PERIZINAN */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-black mb-8 text-slate-800 uppercase text-sm tracking-widest">Daftar Mahasiswa Izin</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 uppercase font-black text-[10px]">
              <tr>
                <th className="p-4 border-b">Mahasiswa</th>
                <th className="p-4 border-b">Mata Kuliah</th>
                <th className="p-4 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {izins.map(i => (
                <tr key={i.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-black text-slate-800 text-sm uppercase">{i.nama_lengkap}</p>
                    <p className="text-slate-400 font-medium">{i.npm}</p>
                  </td>
                  <td className="p-4 font-bold text-[#800020]">{i.mk_nama}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => downloadPDF(i)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-[10px] hover:bg-green-700 transition-all shadow-sm">PDF</button>
                      <button onClick={() => deleteData(i.id, 'perizinan')} className="text-red-600 bg-red-50 px-4 py-2 rounded-xl font-bold text-[10px] border border-red-100 hover:bg-red-600 hover:text-white transition-all">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {izins.length === 0 && <p className="text-center py-20 text-slate-400 italic text-xs">Belum ada data izin yang masuk.</p>}
        </div>
      </div>
    </div>
  );
}