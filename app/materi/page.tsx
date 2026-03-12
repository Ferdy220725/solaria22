import { createClient } from '../../utils/supabase/server';

export default async function MateriPage() {
  const supabase = await createClient();
  const { data: materi } = await supabase.from('materi').select('*').order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#800020] mb-8">Materi Perkuliahan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materi?.map((item: any) => (
          <div key={item.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 border-l-8 border-l-[#D4AF37]">
            <h2 className="text-xl font-bold text-slate-800">{item.judul}</h2>
            <p className="text-sm text-slate-500 mb-4">Diupload pada: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
            
            <div className="flex gap-3">
              {/* Tombol LIHAT: Membuka di tab baru (Preview) */}
              <a 
                href={item.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 bg-slate-100 text-slate-700 text-center py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Lihat Isi File
              </a>

              {/* Tombol DOWNLOAD: Memaksa unduh dengan atribut download */}
              {/* Catatan: Browser akan otomatis mengunduh jika header dari Supabase mengizinkan, 
                  jika tidak, file akan terbuka di tab baru untuk disimpan (Save As) */}
              <a 
                href={`${item.file_url}?download=`} 
                download={item.judul}
                className="flex-1 bg-[#800020] text-white text-center py-2 rounded-lg font-medium hover:bg-[#5a0016] transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {materi?.length === 0 && (
        <p className="text-center text-slate-500 mt-10">Belum ada materi yang diunggah.</p>
      )}
    </div>
  );
}