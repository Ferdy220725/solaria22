"use client";
import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { createClient } from '../../utils/supabase/client';

export default function PerizinanPage() {
  const [nama, setNama] = useState('');
  const [npm, setNpm] = useState('');
  const [mk, setMk] = useState('');
  const [alasan, setAlasan] = useState('');
  const sigCanvas = useRef<any>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

    const { error } = await supabase.from('perizinan').insert([
      { nama_lengkap: nama, npm: npm, mk_nama: mk, alasan: alasan, tanda_tangan_url: signatureData }
    ]);

    if (error) alert("Gagal mengirim: " + error.message);
    else {
      alert("Izin berhasil dikirim!");
      window.location.reload();
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-2xl my-10 border-t-8 border-[#800020]">
      <h1 className="text-2xl font-bold text-[#800020] mb-6">Form Perizinan Kuliah</h1>
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">Nama Lengkap</label>
            <input type="text" className="w-full border p-2 rounded-lg" onChange={e => setNama(e.target.value)} required />
          </div>
          <div>
            <label className="block font-bold mb-1">NPM</label>
            <input type="text" className="w-full border p-2 rounded-lg" onChange={e => setNpm(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="block font-bold mb-1">Mata Kuliah</label>
          <input type="text" className="w-full border p-2 rounded-lg" onChange={e => setMk(e.target.value)} required />
        </div>
        <div>
          <label className="block font-bold mb-1">Alasan Izin</label>
          <textarea className="w-full border p-2 rounded-lg" rows={3} onChange={e => setAlasan(e.target.value)} required></textarea>
        </div>
        <div>
          <label className="block font-bold mb-1 text-sm">Tanda Tangan Digital</label>
          <div className="border-2 border-dashed bg-slate-50 rounded-lg">
            <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{width: 500, height: 150, className: 'sigCanvas w-full'}} />
          </div>
          <button type="button" onClick={() => sigCanvas.current.clear()} className="text-xs text-red-500 underline mt-1">Hapus TTD & Ulangi</button>
        </div>
        <button type="submit" className="w-full bg-[#800020] text-white py-3 rounded-xl font-bold hover:bg-[#5a0016] shadow-lg transition-all">
          Kirim Surat Izin
        </button>
      </form>
    </div>
  );
}