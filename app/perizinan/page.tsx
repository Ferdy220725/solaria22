"use client";

import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { createClient } from "@/utils/supabase/client"; // Pastikan path ini sesuai dengan project Next.js kamu

const SuratIzinMahasiswa = () => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    namaMatkul: "",
    namaLengkap: "",
    npm: "",
    prodi: "Agroteknologi",
    fakultas: "Pertanian",
    tanggal: "",
    alasan: "",
    namaWali: "",
  });

  // Refs untuk Signature Pad
  const sigPadMhs = useRef<SignatureCanvas>(null);
  const sigPadOrtu = useRef<SignatureCanvas>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearSignature = (type: "mhs" | "ortu") => {
    if (type === "mhs") sigPadMhs.current?.clear();
    else sigPadOrtu.current?.clear();
  };

  const handleSubmit = async () => {
    // Validasi Sederhana
    if (!formData.namaLengkap || !formData.npm || !formData.namaMatkul) {
      return alert("Mohon lengkapi Nama, NPM, dan Mata Kuliah!");
    }
    if (sigPadMhs.current?.isEmpty() || sigPadOrtu.current?.isEmpty()) {
      return alert("Tanda tangan Mahasiswa dan Wali wajib diisi!");
    }

    setLoading(true);

    try {
      // 1. Ambil data TTD sebagai Base64 String
      const ttdMhsBase64 = sigPadMhs.current!.getTrimmedCanvas().toDataURL("image/png");
      const ttdOrtuBase64 = sigPadOrtu.current!.getTrimmedCanvas().toDataURL("image/png");

      let lampiranUrl = "";

      // 2. Upload Lampiran ke Supabase Storage (jika ada)
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_bukti.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('uploads') // Pastikan nama bucket di Supabase adalah 'uploads'
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
        lampiranUrl = urlData.publicUrl;
      }

      // 3. Insert ke Tabel perizinan (Menyesuaikan kolom tabelmu)
      const { error } = await supabase.from('perizinan').insert([{
        nama_lengkap: formData.namaLengkap,
        npm: formData.npm,
        mk_nama: formData.namaMatkul,
        alasan: formData.alasan,
        nama_wali: formData.namaWali,
        prodi: formData.prodi,
        fakultas: formData.fakultas,
        tgl_izin: formData.tanggal,
        tanda_tangan_url: ttdMhsBase64,   // TTD Mahasiswa disimpan di sini
        surat_dokter_url: ttdOrtuBase64,   // TTD Wali disimpan di sini
        file_pdf_url: lampiranUrl        // URL Lampiran foto/bukti
      }]);

      if (error) throw error;

      alert("Berhasil! Data perizinan telah dikirim ke Admin.");
      
      // Reset form
      setFormData({ ...formData, namaMatkul: "", alasan: "", tanggal: "" });
      setFile(null);
      sigPadMhs.current?.clear();
      sigPadOrtu.current?.clear();

    } catch (err: any) {
      console.error(err);
      alert("Gagal mengirim data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 bg-slate-100 min-h-screen text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-[30px] shadow-xl border border-slate-200">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#800020] uppercase tracking-tight">Form Perizinan Kuliah</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">Lengkapi data untuk dikonfirmasi oleh Admin</p>
        </div>

        <div className="space-y-5">
          {/* Baris 1: Nama & NPM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1">Nama Mahasiswa</label>
              <input name="namaLengkap" placeholder="Contoh: Budi Santoso" className="w-full border-2 p-3 rounded-2xl focus:border-[#800020] outline-none transition-all" onChange={handleInputChange} value={formData.namaLengkap} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1">NPM</label>
              <input name="npm" placeholder="Masukkan NPM" className="w-full border-2 p-3 rounded-2xl focus:border-[#800020] outline-none transition-all" onChange={handleInputChange} value={formData.npm} />
            </div>
          </div>

          {/* Baris 2: Matkul & Wali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1">Mata Kuliah</label>
              <input name="namaMatkul" placeholder="Nama MK" className="w-full border-2 p-3 rounded-2xl focus:border-[#800020] outline-none transition-all" onChange={handleInputChange} value={formData.namaMatkul} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1">Nama Orang Tua/Wali</label>
              <input name="namaWali" placeholder="Nama Pendamping" className="w-full border-2 p-3 rounded-2xl focus:border-[#800020] outline-none transition-all" onChange={handleInputChange} value={formData.namaWali} />
            </div>
          </div>

          {/* Baris 3: Tanggal & Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1">Tanggal Izin</label>
              <input name="tanggal" type="date" className="w-full border-2 p-3 rounded-2xl focus:border-[#800020] outline-none transition-all" onChange={handleInputChange} value={formData.tanggal} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1">Lampiran Bukti (Foto)</label>
              <input type="file" accept="image/*" className="w-full border-2 p-2 rounded-2xl text-xs bg-slate-50" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase ml-1">Alasan Tidak Mengikuti Kuliah</label>
            <textarea name="alasan" rows={3} placeholder="Contoh: Sakit demam/Acara keluarga..." className="w-full border-2 p-3 rounded-2xl focus:border-[#800020] outline-none transition-all" onChange={handleInputChange} value={formData.alasan} />
          </div>

          {/* AREA TANDA TANGAN (Sangat Penting untuk HP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-600 flex justify-between">
                Tanda Tangan Wali <button onClick={() => clearSignature('ortu')} className="text-red-500 lowercase font-normal italic">[hapus]</button>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden touch-none">
                <SignatureCanvas ref={sigPadOrtu} penColor="black" canvasProps={{ className: "w-full h-32" }} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-600 flex justify-between">
                Tanda Tangan Mahasiswa <button onClick={() => clearSignature('mhs')} className="text-red-500 lowercase font-normal italic">[hapus]</button>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden touch-none">
                <SignatureCanvas ref={sigPadMhs} penColor="black" canvasProps={{ className: "w-full h-32" }} />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className={`w-full mt-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#800020] text-white hover:bg-black'}`}
        >
          {loading ? "Sedang Mengirim..." : "Kirim Perizinan"}
        </button>

        <p className="text-center text-[9px] text-slate-400 mt-6 font-bold uppercase">
          Setelah dikirim, Admin akan meninjau dan mencetak surat anda dalam format PDF.
        </p>
      </div>
    </div>
  );
};

export default SuratIzinMahasiswa;