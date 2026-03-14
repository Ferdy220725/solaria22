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
  
  const [judulMateri, setJudulMateri] = useState('');
  const [mkMateri, setMkMateri] = useState('');

  const supabase = createClient();

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

  // Fungsi Post Tugas Perkuliahan (Dashboard)
  const handlePostTugasKuliah = async () => {
    if (!judulKuliah || !mkKuliah || !deadlineKuliah) return alert("Lengkapi info tugas kuliah!");
    const { error } = await supabase.from('tugas_perkuliahan').insert([{
      judul_tugas: judulKuliah.trim(),
      mk_nama: mkKuliah.trim(),
      deadline: deadlineKuliah
    }]);
    if (error) alert("Gagal post tugas kuliah");
    else {
      alert("Tugas Kuliah Berhasil Muncul di Dashboard!");
      setJudulKuliah(''); setMkKuliah(''); setDeadlineKuliah('');
      fetchData();
    }
  };

  // Fungsi Post Tugas Praktikum (Menu Praktikum) - PERBAIKAN LOGIKA DIT
  const handlePostTugasPrak = async () => {
    if (!judulPrak || !mkPrak || !deadlinePrak) return alert("Mohon lengkapi info tugas praktikum!");
    
    // Memastikan teks yang dikirim bersih dari spasi dan seragam (Uppercase)
    const { error } = await supabase.from('tugas_praktikum').insert([{
      judul_tugas: judulPrak.trim(),
      mk_nama: mkPrak.trim().toUpperCase(), 
      golongan: golongan.trim().toUpperCase(), 
      deadline: deadlinePrak,
      link_pengumpulan: linkPrak.trim()
    }]);

    if (error) {
      console.error(error);
      alert("Gagal post tugas praktikum");
    } else {
      alert(`Tugas ${mkPrak} Golongan ${golongan} Berhasil di-Post!`);
      setJudulPrak(''); setLinkPrak('');
      fetchData();
    }
  };

  const deleteTugas = async (id: string, table: string) => {
    if (confirm("Hapus tugas ini?")) {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  const handleUploadMateri = async () => {
    if (!file || !judulMateri || !mkMateri) return alert("Isi Judul, Mata Kuliah, dan Pilih File!");
    const fileName = `${Date.now()}_${file.name}`;
    const { error: upError } = await supabase.storage.from('uploads').upload(fileName, file);
    if (upError) return alert("Gagal Upload Storage!");
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    await supabase.from('materi').insert([{ 
      judul: judulMateri.trim(), file_url: urlData.publicUrl, mk_nama: mkMateri.trim() 
    }]);
    alert("Materi Berhasil di-Upload!");
    setJudulMateri(''); setMkMateri(''); setFile(null);
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
    if (data.tanda_tangan_url) doc.addImage(data.tanda_tangan_url, 'PNG', 140, 180, 30, 15);
    doc.text(`(${data.nama_lengkap})`, 140, 205);
    doc.save(`Surat_Izin_${data.nama_lengkap}.pdf`);
  };

  if (!isAuth) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleLogin} className="p-10 bg-white shadow-2xl rounded-2xl border-t-8 border-[#800020]">
        <h2 className="text-2xl font-bold mb-4 text-[#800020]">Admin Login</h2>
        <input type="password" placeholder="Password" className="border p-3 w-full mb-4 rounded-lg" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-[#800020] text-white py-3 rounded-lg font-bold">Masuk</button>
      </form>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#800020]">Panel Control Admin</h1>
        <button onClick={() => window.location.reload()} className="text-sm bg-slate-200 px-4 py-2 rounded-lg font-bold">Logout</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* FORM 1: TUGAS PERKULIAHAN */}
        <div className="bg-white p-5 rounded-xl shadow border-l-8 border-[#004d40]">
          <h2 className="font-bold mb-4 text-[#004d40]">1. Post Tugas Kuliah (Teori)</h2>
          <input type="text" placeholder="Matkul (ex: Genetika)" className="w-full border p-2 mb-2 rounded text-sm" value={mkKuliah} onChange={e => setMkKuliah(e.target.value)} />
          <input type="text" placeholder="Judul Tugas" className="w-full border p-2 mb-2 rounded text-sm" value={judulKuliah} onChange={e => setJudulKuliah(e.target.value)} />
          <input type="datetime-local" className="w-full border p-2 mb-4 rounded text-sm" value={deadlineKuliah} onChange={e => setDeadlineKuliah(e.target.value)} />
          <button onClick={handlePostTugasKuliah} className="w-full bg-[#004d40] text-white py-2 rounded font-bold text-sm">Post ke Dashboard</button>
        </div>

        {/* FORM 2: TUGAS PRAKTIKUM */}
        <div className="bg-white p-5 rounded-xl shadow border-l-8 border-[#D4AF37]">
          <h2 className="font-bold mb-4 text-[#800020]">2. Post Tugas Praktikum</h2>
          <select className="w-full border p-2 mb-2 rounded text-sm" value={mkPrak} onChange={e => {
              setMkPrak(e.target.value);
              // Reset golongan saat ganti MK agar tidak error
              setGolongan(e.target.value === 'DIT' ? 'B1' : 'C1');
          }}>
            <option value="FISTAN">FISTAN</option>
            <option value="DBT">DBT</option>
            <option value="DPT">DPT</option>
            <option value="DIT">DIT</option>
          </select>
          <select className="w-full border p-2 mb-2 rounded text-sm font-bold" value={golongan} onChange={e => setGolongan(e.target.value)}>
            {mkPrak === 'DIT' ? (
              <>
                <option value="B1">B1</option>
                <option value="B3">B3</option>
                <option value="C3">C3</option>
              </>
            ) : (
              <>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
                <option value="C3">C3</option>
              </>
            )}
          </select>
          <input type="text" placeholder="Judul Tugas" className="w-full border p-2 mb-2 rounded text-sm" value={judulPrak} onChange={e => setJudulPrak(e.target.value)} />
          <input type="datetime-local" className="w-full border p-2 mb-4 rounded text-sm" value={deadlinePrak} onChange={e => setDeadlinePrak(e.target.value)} />
          <button onClick={handlePostTugasPrak} className="w-full bg-[#D4AF37] text-white py-2 rounded font-bold text-sm">Post ke Praktikum</button>
        </div>

        {/* FORM 3: UPLOAD MATERI */}
        <div className="bg-white p-5 rounded-xl shadow border-l-8 border-[#800020]">
          <h2 className="font-bold mb-4 text-slate-700">3. Upload Materi</h2>
          <input type="text" placeholder="Mata Kuliah" className="w-full border p-2 mb-2 rounded text-sm" value={mkMateri} onChange={e => setMkMateri(e.target.value)} />
          <input type="text" placeholder="Judul (ex: Minggu 1)" className="w-full border p-2 mb-2 rounded text-sm" value={judulMateri} onChange={e => setJudulMateri(e.target.value)} />
          <input type="file" className="w-full border p-2 mb-4 rounded text-xs" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleUploadMateri} className="w-full bg-[#800020] text-white py-2 rounded font-bold text-sm">Simpan Materi</button>
        </div>
      </div>

      {/* MANAJEMEN TUGAS */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-[#004d40] mb-4">Tugas Kuliah Aktif</h3>
          {tugasKuliah.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 border-b text-xs">
              <span>{t.mk_nama} - {t.judul_tugas}</span>
              <button onClick={() => deleteTugas(t.id, 'tugas_perkuliahan')} className="text-red-500 font-bold">Hapus</button>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-[#800020] mb-4">Tugas Praktikum Aktif</h3>
          {tugasPrak.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 border-b text-xs">
              <span>[{t.mk_nama}] Gol {t.golongan} - {t.judul_tugas}</span>
              <button onClick={() => deleteTugas(t.id, 'tugas_praktikum')} className="text-red-500 font-bold">Hapus</button>
            </div>
          ))}
        </div>
      </div>

      {/* PERIZINAN */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-bold mb-4 text-slate-800">Daftar Mahasiswa Izin</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase">
              <tr>
                <th className="p-3 border-b">Nama & NPM</th>
                <th className="p-3 border-b">Mata Kuliah</th>
                <th className="p-3 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {izins.map(i => (
                <tr key={i.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{i.nama_lengkap}</p>
                    <p className="text-slate-500">{i.npm}</p>
                  </td>
                  <td className="p-3 font-medium text-slate-700">{i.mk_nama}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => downloadPDF(i)} className="bg-green-600 text-white px-2 py-1 rounded font-bold">PDF</button>
                      <button onClick={() => deleteTugas(i.id, 'perizinan')} className="text-red-600 bg-red-50 px-2 py-1 rounded font-bold border border-red-100">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {izins.length === 0 && <p className="text-center py-10 text-slate-400 italic text-xs">Belum ada data izin masuk.</p>}
        </div>
      </div>
    </div>
  );
}