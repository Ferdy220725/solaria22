"use client";
import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { createClient } from '../../utils/supabase/client';

export default function PerizinanPage() {
  const [nama, setNama] = useState('');
  const [npm, setNpm] = useState('');
  const [mk, setMk] = useState('');
  const [alasan, setAlasan] = useState('');
  const [fileSurat, setFileSurat] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const sigCanvas = useRef<any>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi tanda tangan tidak boleh kosong
    if (sigCanvas.current.isEmpty()) {
      return alert("Mohon bubuhkan tanda tangan Anda!");
    }

    setIsUploading(true);

    try {
      // 1. Ambil Data Tanda Tangan
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

      // 2. Upload Surat Dokter jika ada (Opsional)
      let suratDokterUrl = null;
      if (fileSurat) {
        const fileExt = fileSurat.name.split('.').pop();
        const fileName = `surat-dokter/${Date.now()}_${npm}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, fileSurat);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
        suratDokterUrl = urlData.publicUrl;
      }

      // 3. Simpan data ke Database
      const { error } = await supabase.from('perizinan').insert([
        { 
          nama_lengkap: nama, 
          npm: npm, 
          mk_nama: mk, 
          alasan: alasan, 
          tanda_tangan_url: signatureData,
          surat_dokter_url: suratDokterUrl // Menyimpan URL surat dokter
        }
      ]);

      if (error) throw error;

      alert("Surat Izin berhasil dikirim ke Admin!");
      window.location.reload();

    } catch (error: any) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-2xl my-10 border-t-8 border-[#800020]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#800020]">Form Perizinan Kuliah</h1>
        <p className="text-sm text-slate-500">Mohon isi data dengan benar untuk keperluan administrasi.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Nama Lengkap</label>
            <input type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#800020] outline-none" onChange={e => setNama(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">NPM</label>
            <input type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#800020] outline-none" onChange={e => setNpm(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Mata Kuliah</label>
          <input type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#800020] outline-none" onChange={e => setMk(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Alasan Izin</label>
          <textarea className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#800020] outline-none" rows={3} placeholder="Contoh: Sakit tipes, kedukaan, dll." onChange={e => setAlasan(e.target.value)} required></textarea>
        </div>

        {/* INPUT SURAT DOKTER (OPSIONAL) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-bold mb-1 text-[#800020]">Lampiran Surat Dokter (Opsional)</label>
          <p className="text-[10px] text-slate-500 mb-2">*Format gambar (JPG/PNG) atau PDF</p>
          <input 
            type="file" 
            accept="image/*,.pdf"
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#800020] file:text-white hover:file:bg-[#5a0016] cursor-pointer"
            onChange={e => setFileSurat(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Tanda Tangan Digital</label>
          <div className="border-2 border-dashed bg-slate-50 rounded-lg overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas} 
              penColor="black" 
              canvasProps={{width: 500, height: 150, className: 'sigCanvas w-full cursor-crosshair'}} 
            />
          </div>
          <button type="button" onClick={() => sigCanvas.current.clear()} className="text-xs text-red-500 underline mt-1 font-medium">Hapus TTD & Ulangi</button>
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          className={`w-full ${isUploading ? 'bg-slate-400' : 'bg-[#800020] hover:bg-[#5a0016]'} text-white py-3 rounded-xl font-bold shadow-lg transition-all mt-4`}
        >
          {isUploading ? "Sedang Mengirim..." : "Kirim Surat Izin"}
        </button>
      </form>
    </div>
  );
}