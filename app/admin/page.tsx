"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { jsPDF } from "jspdf";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [izins, setIzins] = useState<any[]>([]);
  const [tugas, setTugas] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  // State untuk Fitur Baru
  const [judulTugas, setJudulTugas] = useState('');
  const [mkTugas, setMkTugas] = useState(''); // Tambahan Matkul Tugas
  const [linkTugas, setLinkTugas] = useState(''); // Tambahan Link Tugas
  const [deadline, setDeadline] = useState('');
  
  const [judulMateri, setJudulMateri] = useState('');
  const [mkMateri, setMkMateri] = useState(''); // Tambahan Matkul Materi untuk Filter

  const supabase = createClient();

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth]);

  const fetchData = async () => {
    const { data: dIzin } = await supabase.from('perizinan').select('*').order('created_at', { ascending: false });
    // Mengambil dari tabel baru: tugas_praktikum
    const { data: dTugas } = await supabase.from('tugas_praktikum').select('*').order('deadline', { ascending: true });
    if (dIzin) setIzins(dIzin);
    if (dTugas) setTugas(dTugas);
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === "admin123") setIsAuth(true);
    else alert("Password Salah!");
  };

  const deleteTugas = async (id: string) => {
    if (confirm("Hapus tugas ini dari dashboard?")) {
      await supabase.from('tugas_praktikum').delete().eq('id', id);
      fetchData();
    }
  };

  const deleteIzin = async (id: string) => {
    if (confirm("Hapus data perizinan mahasiswa ini?")) {
      await supabase.from('perizinan').delete().eq('id', id);
      fetchData();
    }
  };

  const handleUploadMateri = async () => {
    if (!file || !judulMateri || !mkMateri) return alert("Isi Judul, Mata Kuliah, dan Pilih File!");
    
    const fileName = `${Date.now()}_${file.name}`;
    const { error: upError } = await supabase.storage.from('uploads').upload(fileName, file);
    
    if (upError) return alert("Gagal Upload Storage!");

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    
    // Sekarang memasukkan mk_nama agar bisa difilter mahasiswa
    await supabase.from('materi').insert([{ 
      judul: judulMateri, 
      file_url: urlData.publicUrl,
      mk_nama: mkMateri 
    }]);

    alert("Materi Berhasil di-Upload!");
    setJudulMateri('');
    setMkMateri('');
    setFile(null);
  };

  const handlePostTugas = async () => {
    if (!judulTugas || !mkTugas || !deadline) return alert("Mohon lengkapi info tugas!");
    
    const { error } = await supabase.from('tugas_praktikum').insert([{
      judul_tugas: judulTugas,
      mk_nama: mkTugas,
      deadline: deadline,
      link_pengumpulan: linkTugas // Opsional
    }]);

    if (error) alert("Gagal post tugas");
    else {
      alert("Tugas Praktikum Berhasil di-Post!");
      setJudulTugas('');
      setMkTugas('');
      setLinkTugas('');
      fetchData();
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
      doc.addImage(data.tanda_tangan_url, 'PNG', 140, 180, 30, 15);
    }
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
    <div className="p-8 max-w-6xl mx-auto space-y-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#800020]">Panel Control Admin</h1>
        <button onClick={() => window.location.reload()} className="text-sm bg-slate-200 px-4 py-2 rounded-lg">Logout</button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Tugas Praktikum */}
        <div className="bg-white p-6 rounded-xl shadow border-l-8 border-[#D4AF37]">
          <h2 className="font-bold mb-4 text-slate-700">Tambah Info Tugas Praktikum</h2>
          <input type="text" placeholder="Nama Mata Kuliah" className="w-full border p-2 mb-2 rounded" value={mkTugas} onChange={e => setMkTugas(e.target.value)} />
          <input type="text" placeholder="Judul Tugas" className="w-full border p-2 mb-2 rounded" value={judulTugas} onChange={e => setJudulTugas(e.target.value)} />
          <input type="text" placeholder="Link Pengumpulan (Opsional)" className="w-full border p-2 mb-2 rounded" value={linkTugas} onChange={e => setLinkTugas(e.target.value)} />
          <label className="text-xs text-slate-500">Deadline Tugas:</label>
          <input type="datetime-local" className="w-full border p-2 mb-4 rounded" value={deadline} onChange={e => setDeadline(e.target.value)} />
          <button onClick={handlePostTugas} className="w-full bg-[#D4AF37] text-white py-2 rounded font-bold">Post ke Dashboard</button>
        </div>

        {/* Form Upload Materi */}
        <div className="bg-white p-6 rounded-xl shadow border-l-8 border-[#800020]">
          <h2 className="font-bold mb-4 text-slate-700">Upload Materi Kuliah</h2>
          <input type="text" placeholder="Nama Mata Kuliah (Untuk Filter)" className="w-full border p-2 mb-2 rounded" value={mkMateri} onChange={e => setMkMateri(e.target.value)} />
          <input type="text" placeholder="Judul Materi (Contoh: Minggu 1)" className="w-full border p-2 mb-2 rounded" value={judulMateri} onChange={e => setJudulMateri(e.target.value)} />
          <input type="file" className="w-full border p-2 mb-4 rounded text-sm" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleUploadMateri} className="w-full bg-[#800020] text-white py-2 rounded font-bold">Simpan Materi</button>
        </div>
      </div>

      {/* Manajemen Tugas Dashboard */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Tugas Praktikum Aktif</h2>
        <div className="space-y-3">
          {tugas.length === 0 && <p className="text-slate-400 text-center py-4">Belum ada tugas yang diposting.</p>}
          {tugas.map(t => (
            <div key={t.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50">
              <div>
                <p className="font-bold text-[#800020]">{t.mk_nama}</p>
                <p className="text-sm text-slate-600">{t.judul_tugas}</p>
                <p className="text-xs text-red-500 font-medium">Deadline: {new Date(t.deadline).toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => deleteTugas(t.id)} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm border border-red-200">Hapus</button>
            </div>
          ))}
        </div>
      </div>

      {/* Manajemen Perizinan & Surat Dokter */}
      <h2 className="text-xl font-bold mb-4">Daftar Mahasiswa Izin</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 border-b">Nama & NPM</th>
                <th className="p-4 border-b">Mata Kuliah</th>
                <th className="p-4 border-b">Surat Dokter</th>
                <th className="p-4 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {izins.map(i => (
                <tr key={i.id} className="border-b hover:bg-slate-50">
                  <td className="p-4">
                    <span className="font-bold text-slate-800">{i.nama_lengkap}</span>
                    <br/><small className="text-slate-500">{i.npm}</small>
                  </td>
                  <td className="p-4 text-slate-700">{i.mk_nama}</td>
                  <td className="p-4">
                    {i.surat_dokter_url ? (
                      <a href={i.surat_dokter_url} target="_blank" className="text-blue-600 underline text-sm font-medium">Lihat Surat</a>
                    ) : (
                      <span className="text-slate-400 text-sm italic">Tidak Ada</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => downloadPDF(i)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700">PDF</button>
                      <button onClick={() => deleteIzin(i.id)} className="bg-red-100 text-red-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-200">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}