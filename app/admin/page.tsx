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
  const [judulTugas, setJudulTugas] = useState('');
  const [deadline, setDeadline] = useState('');
  const [judulMateri, setJudulMateri] = useState('');

  const supabase = createClient();

  useEffect(() => { if (isAuth) fetchData(); }, [isAuth]);

  const fetchData = async () => {
    const { data: dIzin } = await supabase.from('perizinan').select('*').order('created_at', { ascending: false });
    const { data: dTugas } = await supabase.from('tugas').select('*').order('deadline', { ascending: true });
    if (dIzin) setIzins(dIzin);
    if (dTugas) setTugas(dTugas);
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === "admin123") setIsAuth(true);
    else alert("Password Salah!");
  };

  // FITUR HAPUS TUGAS
  const deleteTugas = async (id: string) => {
    if (confirm("Hapus tugas ini dari dashboard?")) {
      await supabase.from('tugas').delete().eq('id', id);
      fetchData();
    }
  };

  // FITUR HAPUS PERIZINAN (Agar tidak menumpuk)
  const deleteIzin = async (id: string) => {
    if (confirm("Hapus data perizinan mahasiswa ini?")) {
      await supabase.from('perizinan').delete().eq('id', id);
      fetchData();
    }
  };

  // FITUR UPLOAD MATERI
  const handleUploadMateri = async () => {
    if (!file || !judulMateri) return alert("Pilih file & isi judul!");
    const fileName = `${Date.now()}_${file.name}`;
    const { error: upError } = await supabase.storage.from('uploads').upload(fileName, file);
    
    if (upError) return alert("Gagal Upload: Pastikan bucket 'uploads' sudah Public");

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    await supabase.from('materi').insert([{ judul: judulMateri, file_url: urlData.publicUrl }]);
    alert("Materi Berhasil di-Upload!");
    setJudulMateri('');
    setFile(null);
  };

  // FITUR DOWNLOAD PDF SURAT IZIN (Template Resmi)
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
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-[#800020]">Panel Control Admin</h1>

      {/* Grid Input */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-8 border-[#D4AF37]">
          <h2 className="font-bold mb-4">Tambah Tugas ke Dashboard</h2>
          <input type="text" placeholder="Judul Tugas" className="w-full border p-2 mb-2 rounded" onChange={e => setJudulTugas(e.target.value)} />
          <input type="datetime-local" className="w-full border p-2 mb-4 rounded" onChange={e => setDeadline(e.target.value)} />
          <button onClick={async () => { await supabase.from('tugas').insert([{ judul_tugas: judulTugas, deadline: deadline }]); fetchData(); }} className="w-full bg-[#D4AF37] text-white py-2 rounded">Post Tugas</button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-8 border-[#800020]">
          <h2 className="font-bold mb-4">Upload Materi Kuliah</h2>
          <input type="text" placeholder="Judul Materi (Contoh: Genetika Minggu 1)" className="w-full border p-2 mb-2 rounded" value={judulMateri} onChange={e => setJudulMateri(e.target.value)} />
          <input type="file" className="w-full border p-2 mb-4 rounded" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleUploadMateri} className="w-full bg-[#800020] text-white py-2 rounded">Simpan Materi</button>
        </div>
      </div>

      {/* List Tugas */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Manajemen Tugas</h2>
        <div className="space-y-2">
          {tugas.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 border-b hover:bg-slate-50">
              <span>{t.judul_tugas} - <small className="text-red-500">{new Date(t.deadline).toLocaleString()}</small></span>
              <button onClick={() => deleteTugas(t.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm border border-red-200">Hapus</button>
            </div>
          ))}
        </div>
      </div>

      {/* List Perizinan */}
      <h2 className="text-xl font-bold mb-4">Daftar Mahasiswa Izin</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4">Nama & NPM</th>
              <th className="p-4">Mata Kuliah</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {izins.map(i => (
              <tr key={i.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-medium">{i.nama_lengkap}<br/><small className="text-slate-400">{i.npm}</small></td>
                <td className="p-4">{i.mk_nama}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => downloadPDF(i)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Unduh PDF</button>
                    <button onClick={() => deleteIzin(i.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}