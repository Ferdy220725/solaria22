"use client";

import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { jsPDF } from "jspdf";
import { createClient } from "@/utils/supabase/client"; // Pastikan path ini sesuai dengan project Next.js kamu

// ── Kontak tujuan (ubah di sini kalau nomor/link grup berubah) ────────────
const NOMOR_WA_ADMIN = "6282228731431"; // 0822... diubah ke format internasional 62

const SuratIzinMahasiswa = () => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // State buat tahap "setelah submit": nyimpen link PDF (hasil upload ke Supabase Storage)
  const [suratPdfUrl, setSuratPdfUrl] = useState<string | null>(null);
  const [showKirimPanel, setShowKirimPanel] = useState(false);
  const [namaFilePdf, setNamaFilePdf] = useState("");

  // Snapshot data yang dipakai buat nyusun template pesan WA
  // (dipisah dari formData karena formData akan direset setelah submit)
  const [dataTerkirim, setDataTerkirim] = useState({
    namaLengkap: "",
    npm: "",
    namaMatkul: "",
    tanggal: "",
    alasan: "",
  });

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

  // ── Generate PDF surat izin (dipakai langsung dari data form + TTD yang baru diisi) ──
  const buildSuratPdf = (
    data: typeof formData,
    ttdMhsBase64: string,
    ttdOrtuBase64: string,
    lampiranUrl: string
  ): jsPDF => {
    const doc = new jsPDF();
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("SURAT PERMOHONAN IZIN KULIAH", 105, 25, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text("Kepada Yth.", 20, 45);
    doc.setFont("times", "bold");
    doc.text("Bapak/Ibu Dosen Pengampu Mata Kuliah", 20, 51);
    doc.text(data.namaMatkul || "-", 20, 57);
    doc.text("Di Tempat", 20, 63);
    doc.setFont("times", "normal");
    doc.text("Dengan hormat,", 20, 75);
    doc.text("Saya yang bertanda tangan di bawah ini:", 20, 82);
    const dX = 30;
    doc.text(`Nama Mahasiswa`, dX, 92);
    doc.text(`: ${data.namaLengkap}`, dX + 40, 92);
    doc.text(`NPM`, dX, 99);
    doc.text(`: ${data.npm}`, dX + 40, 99);
    doc.text(`Program Studi`, dX, 106);
    doc.text(`: ${data.prodi || "Agroteknologi"}`, dX + 40, 106);
    const isi = `Melalui surat ini, saya bermaksud untuk mengajukan permohonan izin tidak mengikuti kegiatan perkuliahan pada tanggal ${data.tanggal || "-"}, dikarenakan ${data.alasan || "-"}.`;
    doc.text(doc.splitTextToSize(isi, 170), 20, 120);
    doc.text("Demikian surat permohonan ini saya sampaikan. Atas perhatiannya saya ucapkan terima kasih.", 20, 140);
    const ttdY = 165;
    doc.text("Mengetahui,", 50, ttdY, { align: "center" });
    doc.text("Wali Mahasiswa,", 50, ttdY + 6, { align: "center" });
    doc.text("Hormat saya,", 150, ttdY, { align: "center" });
    doc.text("Mahasiswa,", 150, ttdY + 6, { align: "center" });
    try {
      doc.addImage(ttdOrtuBase64, "PNG", 30, ttdY + 10, 40, 15);
    } catch (e) {}
    try {
      doc.addImage(ttdMhsBase64, "PNG", 130, ttdY + 10, 40, 15);
    } catch (e) {}
    doc.setFont("times", "bold");
    doc.text(`( ${data.namaWali || "________________"} )`, 50, ttdY + 35, { align: "center" });
    doc.text(`( ${data.namaLengkap} )`, 150, ttdY + 35, { align: "center" });
    if (lampiranUrl) {
      doc.addPage();
      doc.text("LAMPIRAN BUKTI", 105, 20, { align: "center" });
      try {
        doc.addImage(lampiranUrl, "JPEG", 15, 30, 180, 240);
      } catch (e) {}
    }
    return doc;
  };

  // ── Template pesan WA siap kirim: berisi ringkasan data + LINK PDF ──────────
  // Admin/panitia grup tinggal buka link untuk lihat/download PDF sendiri,
  // jadi mahasiswa tidak perlu repot download & lampirkan manual.
  const buildPesanWa = (tujuan: "admin" | "grup") => {
    const sapaan = tujuan === "admin" ? "Halo Admin," : "Halo teman-teman,";
    return (
      `${sapaan}\n` +
      `Saya *${dataTerkirim.namaLengkap}* (NPM: ${dataTerkirim.npm}) ingin mengajukan izin kuliah.\n\n` +
      `📚 Mata Kuliah: ${dataTerkirim.namaMatkul || "-"}\n` +
      `📅 Tanggal Izin: ${dataTerkirim.tanggal || "-"}\n` +
      `📝 Alasan: ${dataTerkirim.alasan || "-"}\n\n` +
      `📄 Surat Izin (PDF): ${suratPdfUrl || "-"}\n\n` +
      `Terima kasih banyak 🙏`
    );
  };

  // ── Buka WhatsApp (personal admin) dengan pesan + link PDF sudah terisi ──
  // PENTING: pakai api.whatsapp.com/send (bukan wa.me), karena wa.me adalah
  // shortlink yang di-redirect dan di banyak HP Android suka merusak/memotong
  // karakter emoji (4-byte UTF-8) saat proses redirect — hasilnya jadi "�".
  // api.whatsapp.com/send adalah endpoint aslinya jadi encoding tetap utuh.
  const openWaPersonal = () => {
    const pesan = encodeURIComponent(buildPesanWa("admin"));
    window.open(`https://api.whatsapp.com/send?phone=${NOMOR_WA_ADMIN}&text=${pesan}`, "_blank");
  };

  // ── Kirim ke grup WA. Link invite grup (chat.whatsapp.com/...) TIDAK support
  // parameter ?text=, jadi nggak bisa auto-target pesan ke grup spesifik.
  // Solusinya pakai link "send" WA TANPA nomor tujuan: ini akan membuka
  // WhatsApp dengan pesan sudah terisi, lalu user tinggal PILIH grup tujuannya
  // sendiri dari daftar chat (mirip fitur forward) — 2 tap doang, tanpa copy-paste.
  const openWaGrup = () => {
    const pesan = encodeURIComponent(buildPesanWa("grup"));
    window.open(`https://api.whatsapp.com/send?text=${pesan}`, "_blank");
  };

  const bukaLinkPdf = () => {
    if (!suratPdfUrl) return;
    window.open(suratPdfUrl, "_blank");
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
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_bukti.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads") // Pastikan nama bucket di Supabase adalah 'uploads'
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(fileName);
        lampiranUrl = urlData.publicUrl;
      }

      // 3. Insert ke Tabel perizinan (Menyesuaikan kolom tabelmu)
      const { error } = await supabase.from("perizinan").insert([
        {
          nama_lengkap: formData.namaLengkap,
          npm: formData.npm,
          mk_nama: formData.namaMatkul,
          alasan: formData.alasan,
          nama_wali: formData.namaWali,
          prodi: formData.prodi,
          fakultas: formData.fakultas,
          tgl_izin: formData.tanggal,
          tanda_tangan_url: ttdMhsBase64, // TTD Mahasiswa disimpan di sini
          surat_dokter_url: ttdOrtuBase64, // TTD Wali disimpan di sini
          file_pdf_url: lampiranUrl, // URL Lampiran foto/bukti
        },
      ]);

      if (error) throw error;

      // 4. Generate PDF surat izin dari data yang baru saja dikirim
      const doc = buildSuratPdf(formData, ttdMhsBase64, ttdOrtuBase64, lampiranUrl);
      const pdfBlob = doc.output("blob");

      // Format nama file: NPM_NamaMahasiswa_KodeUnik.pdf
      // (kode unik dari timestamp base36 supaya tiap submit jadi file baru, tidak bentrok/ketolak)
      const namaBersih = formData.namaLengkap.trim().replace(/[^a-zA-Z0-9 _-]/g, "");
      const kodeUnik = Date.now().toString(36).toUpperCase();
      const fileName = `${formData.npm || "mahasiswa"}_${namaBersih || "mahasiswa"}_${kodeUnik}.pdf`;

      // 5. Upload PDF hasil generate ke Supabase Storage supaya dapat LINK publik
      //    (ini kunci utamanya: link jauh lebih reliable dibanding attach file
      //    lewat Web Share API yang suka gagal di banyak device/WA versi tertentu)
      const { error: uploadPdfError } = await supabase.storage
        .from("uploads")
        .upload(`surat/${fileName}`, pdfBlob, { contentType: "application/pdf", upsert: true });

      if (uploadPdfError) throw uploadPdfError;

      const { data: pdfUrlData } = supabase.storage.from("uploads").getPublicUrl(`surat/${fileName}`);

      // Simpan snapshot data buat template pesan (sebelum formData direset)
      setDataTerkirim({
        namaLengkap: formData.namaLengkap,
        npm: formData.npm,
        namaMatkul: formData.namaMatkul,
        tanggal: formData.tanggal,
        alasan: formData.alasan,
      });

      setSuratPdfUrl(pdfUrlData.publicUrl);
      setNamaFilePdf(fileName);
      setShowKirimPanel(true);

      // Reset form (data & link PDF tetap disimpan di state buat panel kirim)
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

  // Tandai kalau user sudah menekan salah satu opsi kirim,
  // supaya modal tidak lagi "memaksa" setelah aksi dilakukan.
  const [sudahPilihAksi, setSudahPilihAksi] = useState(false);

  const handlePilihAksi = async (aksi: "wa" | "grup" | "lihat") => {
    if (aksi === "wa") openWaPersonal();
    else if (aksi === "grup") openWaGrup();
    else bukaLinkPdf();
    setSudahPilihAksi(true);
  };

  return (
    <div className="p-4 md:p-10 bg-slate-100 min-h-screen text-slate-900 font-sans">
      {/* ── MODAL WAJIB: muncul begitu perizinan sukses terkirim ── */}
      {showKirimPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white max-w-md w-full rounded-[30px] p-6 md:p-8 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 uppercase">Data Berhasil Terkirim!</p>
              <p className="text-xs font-black text-[#800020] uppercase mt-1">Satu Langkah Lagi ⚠️</p>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Surat PDF kamu sudah siap dan sudah punya link. <b>Wajib dikirim ke Admin lewat WhatsApp</b> di
              bawah ini supaya perizinanmu langsung diproses — laporan tidak dianggap masuk kalau surat belum
              dikirim.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => handlePilihAksi("wa")}
                className="w-full bg-green-600 text-white px-5 py-4 rounded-xl font-black text-xs shadow-md hover:bg-green-700"
              >
                📩 Kirim ke WA Admin Sekarang
              </button>
              <button
                onClick={() => handlePilihAksi("grup")}
                className="w-full bg-emerald-700 text-white px-5 py-4 rounded-xl font-black text-xs shadow-md hover:bg-emerald-800"
              >
                👥 Kirim ke Grup WA Kelas
              </button>
              <button
                onClick={() => handlePilihAksi("lihat")}
                className="w-full bg-slate-100 text-slate-600 px-5 py-3 rounded-xl font-black text-[10px] shadow-sm hover:bg-slate-200"
              >
                🔗 Lihat/Buka Link PDF Saja
              </button>
            </div>

            <p className="text-[9px] text-slate-400 leading-relaxed">
              Pesan WA sudah otomatis terisi lengkap dengan link surat PDF-nya. Untuk "Kirim ke WA Admin",
              chat langsung terbuka tinggal pencet kirim. Untuk "Kirim ke Grup", WhatsApp akan membuka daftar
              chat kamu — tinggal pilih grup kelasnya, pesan sudah siap, lalu kirim. Admin akan buka link
              tersebut untuk melihat/mengunduh suratnya sendiri.
            </p>

            {sudahPilihAksi && (
              <button
                onClick={() => setShowKirimPanel(false)}
                className="text-[10px] font-bold text-slate-400 hover:underline pt-1"
              >
                Tutup, saya sudah kirim ✓
              </button>
            )}
          </div>
        </div>
      )}

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
