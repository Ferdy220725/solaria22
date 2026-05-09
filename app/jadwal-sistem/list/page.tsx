'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X } from 'lucide-react' // Pastikan sudah install lucide-react

interface Jadwal {
  id: number;
  subject: string;
  time: string;
  room: string;
  day: string; 
  is_published: boolean;
}

export default function KalenderJadwal() {
  const [jadwal, setJadwal] = useState<Jadwal[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // --- LOGIKA BARU: State untuk menyimpan jadwal yang sedang dipilih (Pop-up) ---
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal[] | null>(null)
  const [selectedDateLabel, setSelectedDateLabel] = useState("")

  const supabase = createClient()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

  const jumlahHari = new Date(year, month + 1, 0).getDate() 
  const hariPertama = new Date(year, month, 1).getDay() 
  const listHari = Array.from({ length: jumlahHari }, (_, i) => i + 1)

  const getData = async () => {
    const { data } = await supabase
      .from('jadwal_kuliah')
      .select('*')
      .eq('is_published', true) 
    if (data) setJadwal(data as Jadwal[])
  }

  useEffect(() => {
    getData()
    const sub = supabase.channel('realtime_calendar').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'jadwal_kuliah' }, getData).subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [])

  const gantiBulan = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1))
  }

  // --- LOGIKA BARU: Fungsi untuk menangani klik pada tanggal ---
  const handleDateClick = (tgl: number, jadwalHariIni: Jadwal[]) => {
    if (jadwalHariIni.length > 0) {
      setSelectedJadwal(jadwalHariIni)
      setSelectedDateLabel(`${tgl} ${namaBulan[month]} ${year}`)
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header Kalender (TETAP SAMA) */}
        <div className="bg-[#800020] text-white p-6 rounded-t-3xl shadow-xl flex justify-between items-center border-x-2 border-t-2 border-[#800020] border-b-4 border-[#FFD700]">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-[#FFD700]">Jadwal Kuliah</h1>
            <p className="text-sm font-bold uppercase tracking-widest">{namaBulan[month]} {year}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => gantiBulan(-1)} className="p-2 bg-black/30 hover:bg-black/50 rounded-lg transition border border-white/20 active:scale-95 text-xs font-bold">◀ PREV</button>
            <button onClick={() => gantiBulan(1)} className="p-2 bg-black/30 hover:bg-black/50 rounded-lg transition border border-white/20 active:scale-95 text-xs font-bold">NEXT ▶</button>
          </div>
        </div>

        {/* Grid Kalender (DITAMBAHKAN ONCLICK) */}
        <div className="bg-white shadow-2xl rounded-b-3xl overflow-hidden border-2 border-[#800020]">
          <div className="grid grid-cols-7 bg-gray-200 border-b-2 border-gray-400">
            {["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((h) => (
              <div key={h} className="py-3 text-center text-[11px] font-black uppercase text-gray-700 border-r border-gray-300 last:border-r-0">
                {h}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-gray-400 gap-[2px]"> 
            {Array.from({ length: hariPertama }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-100/50"></div>
            ))}

            {listHari.map((tgl) => {
              const tanggalFull = `${year}-${String(month + 1).padStart(2, '0')}-${String(tgl).padStart(2, '0')}`
              const jadwalHariIni = jadwal.filter(j => j.day === tanggalFull)

              return (
                <div 
                  key={tgl} 
                  // LOGIKA BARU: Menambahkan onClick pada kotak tanggal
                  onClick={() => handleDateClick(tgl, jadwalHariIni)}
                  className={`h-24 md:h-32 p-2 transition-all group relative overflow-hidden cursor-pointer ${jadwalHariIni.length > 0 ? 'bg-white hover:bg-blue-50' : 'bg-white/90'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[13px] font-black px-2 py-0.5 rounded-md ${jadwalHariIni.length > 0 ? 'bg-[#800020] text-[#FFD700]' : 'text-gray-400 border border-gray-100'}`}>
                      {tgl}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1.5 overflow-hidden">
                    {jadwalHariIni.map((j) => (
                      <div key={j.id} className="bg-[#800020] text-[9px] text-white p-2 rounded-md border-l-4 border-[#FFD700] leading-tight shadow-md">
                        <div className="font-black truncate uppercase tracking-tighter">{j.subject}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* --- LOGIKA BARU: UI MODAL POP-UP (Hanya muncul jika tanggal di-klik) --- */}
        {selectedJadwal && (
          <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(128,0,32,0.5)] border-2 border-[#FFD700]">
              <div className="bg-[#800020] p-5 flex justify-between items-center text-white border-b-4 border-[#FFD700]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">Detail Jadwal</p>
                  <h2 className="text-xl font-black">{selectedDateLabel}</h2>
                </div>
                <button onClick={() => setSelectedJadwal(null)} className="p-2 bg-black/20 rounded-full hover:bg-black/40 transition">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedJadwal.map((j) => (
                  <div key={j.id} className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 shadow-inner">
                    <h3 className="text-[#800020] font-black uppercase text-lg leading-tight mb-2 border-b-2 border-gray-200 pb-1">{j.subject}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Waktu</span>
                        <span className="font-bold text-gray-800">🕒 {j.time}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Ruangan</span>
                        <span className="font-bold text-[#800020]">📍 {j.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setSelectedJadwal(null)}
                className="w-full bg-[#800020] text-[#FFD700] py-4 font-black uppercase tracking-widest text-xs hover:bg-red-900 transition-colors"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        )}
        {/* --- AKHIR MODAL --- */}

      </div>
    </div>
  )
}