"use client";
import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { createClient } from '../../utils/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';

export default function PerizinanPage() {
  const [nama, setNama] = useState('');
  const [npm, setNpm] = useState('');
  const [prodi, setProdi] = useState('');
  const [tglIzin, setTglIzin] = useState('');
  const [mk, setMk] = useState('');
  const [alasan, setAlasan] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [suratDokter, setSuratDokter] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  
  const sigCanvasMhs = useRef<any>(null);
  const sigCanvasWali = useRef<any>(null);
  const suratRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sigCanvasMhs.current.isEmpty() || sigCanvasWali.current.isEmpty()) {
      return alert("Kedua tanda tangan (Mahasiswa & Wali) harus diisi!");
    }

    setIsUploading(true);

    try {
      const element = suratRef.current;
      if (!element) return;

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        ignoreElements: (el) => el.classList.contains('no-pdf')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfIzin = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdfIzin.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdfIzin.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfIzinBytes = pdfIzin.output('arraybuffer');

      let finalPdfUint8: Uint8Array;

      if (suratDokter) {
        const mainPdfDoc = await PDFDocument.load(pdfIzinBytes);
        
        if (suratDokter.type === 'application/pdf') {
          const attachmentPdfBytes = await suratDokter.arrayBuffer();
          const attachmentPdfDoc = await PDFDocument.load(attachmentPdfBytes);
          const copiedPages = await mainPdfDoc.copyPages(attachmentPdfDoc, attachmentPdfDoc.getPageIndices());
          copiedPages.forEach((page) => mainPdfDoc.addPage(page));
        } else {
          const imgBytes = await suratDokter.arrayBuffer();
          const page = mainPdfDoc.addPage();
          let embeddedImg;
          if (suratDokter.type === 'image/png') embeddedImg = await mainPdfDoc.embedPng(imgBytes);
          else embeddedImg = await mainPdfDoc.embedJpg(imgBytes);

          const { width, height } = embeddedImg.scaleToFit(page.getWidth() - 40, page.getHeight() - 40);
          page.drawImage(embeddedImg, { x: 20, y: page.getHeight() - height - 20, width, height });
        }
        finalPdfUint8 = await mainPdfDoc.save();
      } else {
        finalPdfUint8 = new Uint8Array(pdfIzinBytes);
      }

      const pdfBlob = new Blob([finalPdfUint8.buffer as ArrayBuffer], { type: 'application/pdf' });
      const fileName = `surat-izin/Surat_Lengkap_${npm}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
      
      const { error: dbError } = await supabase.from('perizinan').insert([{ 
          nama_lengkap: nama, npm, tgl_izin: tglIzin, mk_nama: mk, file_pdf_url: urlData.publicUrl 
      }]);

      if (dbError) throw dbError;
      alert("Surat Izin Berhasil Terkirim!");
      window.location.reload();

    } catch (error: any) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 py-10 px-4 flex flex-col items-center font-sans">
      
      <div ref={suratRef} className="bg-white shadow-2xl p-12 md:p-20 border border-slate-300 text-black font-serif w-full max-w-[210mm] min-h-[297mm] leading-relaxed">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="text-center mb-10">
            <h2 className="font-bold text-xl underline uppercase tracking-widest">SURAT IZIN TIDAK MENGIKUTI PERKULIAHAN</h2>
          </div>

          <div className="mb-8 space-y-1">
            <p>Kepada Yth.</p>
            <p className="font-bold">Bapak/Ibu Dosen Pengampu Mata Kuliah</p>
            <p>Di tempat</p>
          </div>

          <p>Dengan hormat, saya yang bertanda tangan di bawah ini:</p>

          {/* Bagian Data Diri - TANPA GARIS */}
          <div className="grid grid-cols-[160px_10px_1fr] gap-y-2 ml-4 items-center">
            <span className="font-medium">Nama</span><span>:</span>
            <input type="text" className="outline-none px-1 bg-slate-50/50 focus:bg-white transition-colors w-full h-7 font-sans font-bold" onChange={e => setNama(e.target.value)} required />
            
            <span className="font-medium">NPM</span><span>:</span>
            <input type="text" className="outline-none px-1 bg-slate-50/50 focus:bg-white transition-colors w-full h-7 font-sans font-bold" onChange={e => setNpm(e.target.value)} required />
            
            <span className="font-medium">Program Studi</span><span>:</span>
            <input type="text" className="outline-none px-1 bg-slate-50/50 focus:bg-white transition-colors w-full h-7 font-sans font-bold" onChange={e => setProdi(e.target.value)} required />
          </div>

          <p className="mt-8 font-semibold">Mengajukan permohonan izin tidak mengikuti perkuliahan pada:</p>

          {/* Bagian Detail Izin - TANPA GARIS */}
          <div className="grid grid-cols-[160px_10px_1fr] gap-y-2 ml-4 items-center">
            <span className="font-medium">Hari/Tanggal</span><span>:</span>
            <input type="date" className="outline-none px-1 bg-slate-50/50 focus:bg-white transition-colors w-full h-7 font-sans font-bold" onChange={e => setTglIzin(e.target.value)} required />
            
            <span className="font-medium">Mata Kuliah</span><span>:</span>
            <input type="text" className="outline-none px-1 bg-slate-50/50 focus:bg-white transition-colors w-full h-7 font-sans font-bold" placeholder="..." onChange={e => setMk(e.target.value)} required />
            
            <span className="font-medium">Alasan</span><span>:</span>
            <input type="text" className="outline-none px-1 bg-slate-50/50 focus:bg-white transition-colors w-full h-7 font-sans font-bold" placeholder="..." onChange={e => setAlasan(e.target.value)} required />
          </div>

          <p className="text-justify pt-8">
            Demikian surat permohonan izin ini saya sampaikan. Atas perhatian dan kebijaksanaan Bapak/Ibu Dosen, saya mengucapkan terima kasih.
          </p>

          {/* Input Lampiran (no-pdf) */}
          <div className="no-pdf bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-10">
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase">📁 Lampiran Surat Dokter (Opsional)</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setSuratDokter(e.target.files?.[0] || null)} className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300" />
          </div>

          {/* Area Tanda Tangan - TANPA GARIS BAWAH (Pake Nama Tebal Saja) */}
          <div className="mt-20 flex justify-between gap-10 text-center">
            <div className="flex-1 space-y-4">
              <div>
                <p>Mengetahui,</p>
                <p>Orang Tua / Wali</p>
              </div>
              <div className="border border-dashed border-slate-200 rounded-xl p-1 bg-slate-50/30">
                <SignatureCanvas ref={sigCanvasWali} penColor="black" canvasProps={{width: 200, height: 120, className: 'sigCanvas'}} />
                <button type="button" onClick={() => sigCanvasWali.current.clear()} className="no-pdf text-[9px] text-red-500 block w-full mt-1 uppercase">Hapus</button>
              </div>
              <input type="text" className="outline-none w-full font-bold uppercase text-base text-center bg-transparent border border-slate-100 rounded-md py-1" placeholder="[ NAMA WALI ]" onChange={e => setNamaWali(e.target.value)} required />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="invisible">Space</p>
                <p>Hormat Saya,</p>
              </div>
              <div className="border border-dashed border-slate-200 rounded-xl p-1 bg-slate-50/30">
                <SignatureCanvas ref={sigCanvasMhs} penColor="black" canvasProps={{width: 200, height: 120, className: 'sigCanvas'}} />
                <button type="button" onClick={() => sigCanvasMhs.current.clear()} className="no-pdf text-[9px] text-red-500 block w-full mt-1 uppercase">Hapus</button>
              </div>
              <div className="py-1">
                <p className="font-bold underline uppercase text-base">{nama || "NAMA MAHASISWA"}</p>
                <p className="text-sm font-sans">NPM. {npm || "........"}</p>
              </div>
            </div>
          </div>

          <div className="no-pdf pt-16">
            <button type="submit" disabled={isUploading} className={`w-full py-5 rounded-3xl font-black text-white transition-all shadow-xl uppercase tracking-widest ${isUploading ? 'bg-slate-400' : 'bg-[#800020] hover:bg-black'}`}>
              {isUploading ? "Menggabungkan PDF..." : "Kirim Surat Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}