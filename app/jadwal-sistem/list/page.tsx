'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Gift, Calendar, Edit2, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'

interface Jadwal {
  id: number;
  subject: string;
  time: string;
  room: string;
  day: string;
  is_published: boolean;
}

interface HariPenting {
  nama: string;
  isLibur: boolean;
}

export default function KalenderJadwal() {
  const [jadwal, setJadwal] = useState<Jadwal[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hariIni] = useState(new Date())

  // --- LOGIKA: State Manajemen Ulang Tahun (TETAP AMAN) ---
  const [ultahUser, setUltahUser] = useState<string | null>(null) // Format: "MM-DD"
  const [inputUltah, setInputUltah] = useState("")
  const [showUltahModal, setShowUltahModal] = useState(false)
  const [showKejutanUltah, setShowKejutanUltah] = useState(false)

  // --- LOGIKA DATA: Daftar Hari Penting & Libur Nasional Lengkap 2026 ---
  const daftarHariPenting: Record<string, HariPenting> = {
    "2026-01-01": { nama: "Tahun Baru Masehi", isLibur: true },
    "2026-01-23": { nama: "Isra Mikraj Nabi Muhammad SAW", isLibur: true },
    "2026-02-17": { nama: "Tahun Baru Imlek 2577", isLibur: true },
    "2026-03-19": { nama: "Hari Raya Nyepi (Tahun Baru Saka 1948)", isLibur: true },
    "2026-03-20": { nama: "Hari Raya Idul Fitri 1447 H (Hari ke-1)", isLibur: true },
    "2026-03-21": { nama: "Hari Raya Idul Fitri 1447 H (Hari ke-2)", isLibur: true },
    "2026-04-03": { nama: "Wafat Yesus Kristus", isLibur: true },
    "2026-04-05": { nama: "Hari Paskah", isLibur: false },
    "2026-05-01": { nama: "Hari Buruh Internasional", isLibur: true },
    "2026-05-14": { nama: "Kenaikan Yesus Kristus", isLibur: true },
    "2026-05-27": { nama: "Hari Raya Waisak 2570", isLibur: true },
    "2026-05-28": { nama: "Hari Raya Idul Adha 1447 H", isLibur: true },
    "2026-06-01": { nama: "Hari Lahir Pancasila", isLibur: true },
    "2026-06-17": { nama: "Tahun Baru Islam 1448 Hijriah", isLibur: true },
    "2026-08-17": { nama: "Hari Kemerdekaan RI ke-81", isLibur: true },
    "2026-08-26": { nama: "Maulid Nabi Muhammad SAW", isLibur: true },
    "2026-10-28": { nama: "Hari Sumpah Pemuda", isLibur: false },
    "2026-11-10": { nama: "Hari Pahlawan", isLibur: false },
    "2026-12-25": { nama: "Hari Raya Natal", isLibur: true },
  }

  // Bawaan Asli (TETAP AMAN)
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

  // Fungsi Fetching Asli (TETAP AMAN)
  const getData = async () => {
    const { data } = await supabase
      .from('jadwal_kuliah')
      .select('*')
      .eq('is_published', true)
    if (data) setJadwal(data as Jadwal[])
  }

  // Realtime Subscriptions Asli (TETAP AMAN)
  useEffect(() => {
    getData()
    const sub = supabase.channel('realtime_calendar').on('postgres_changes',
      { event: '*', schema: 'public', table: 'jadwal_kuliah' }, getData).subscribe()

    // Cek Ulang Tahun di LocalStorage saat Pertama Masuk
    const savedUltah = localStorage.getItem('user_birthday')
    if (!savedUltah) {
      setShowUltahModal(true)
    } else {
      setUltahUser(savedUltah)
      cekApakahHariIniUltah(savedUltah)
    }

    return () => { supabase.removeChannel(sub) }
  }, [])

  // Fungsi Pendukung Ulang Tahun (TETAP AMAN)
  const simpanUlangThn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputUltah) return
    const [_, mm, dd] = inputUltah.split('-')
    const formatUltah = `${mm}-${dd}`
    localStorage.setItem('user_birthday', formatUltah)
    setUltahUser(formatUltah)
    setShowUltahModal(false)
    cekApakahHariIniUltah(formatUltah)
  }

  const cekApakahHariIniUltah = (tanggalUltah: string) => {
    const mHariIni = String(hariIni.getMonth() + 1).padStart(2, '0')
    const tHariIni = String(hariIni.getDate()).padStart(2, '0')
    if (`${mHariIni}-${tHariIni}` === tanggalUltah) {
      setShowKejutanUltah(true)
    }
  }

  const gantiBulan = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1))
  }

  const handleDateClick = (tgl: number, jadwalHariIni: Jadwal[]) => {
    if (jadwalHariIni.length > 0) {
      setSelectedJadwal(jadwalHariIni)
      setSelectedDateLabel(`${tgl} ${namaBulan[month]} ${year}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#0a0a0a] font-sans">
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

        {/* Widget Akses Cepat Mengubah Ulang Tahun */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Jadwal Kuliah</h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Kalender akademik & jadwal kelas kamu</p>
          </div>
          <button
            onClick={() => setShowUltahModal(true)}
            className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-[#141414] px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
          >
            <Edit2 size={12} />
            {ultahUser ? 'Ubah Tanggal Ulang Tahun' : 'Atur Ulang Tahun'}
          </button>
        </div>

        {/* Kartu Kalender */}
        <div className="bg-white dark:bg-[#141414] rounded-[28px] shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden">

          {/* Header bulan */}
          <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 dark:border-white/10">
            <button
              onClick={() => gantiBulan(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition active:scale-95"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-black text-slate-900 dark:text-white text-sm md:text-base uppercase tracking-wide">
              {namaBulan[month]} {year}
            </span>
            <button
              onClick={() => gantiBulan(1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition active:scale-95"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Header Nama Hari */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
            {["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((h, i) => (
              <div key={h} className={`py-2.5 text-center text-[10px] font-black uppercase tracking-wider ${i === 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {h}
              </div>
            ))}
          </div>

          {/* Grid Angka Tanggal */}
          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-white/5">
            {Array.from({ length: hariPertama }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/60 dark:bg-white/[0.02]"></div>
            ))}

            {listHari.map((tgl) => {
              const formatM = String(month + 1).padStart(2, '0')
              const formatD = String(tgl).padStart(2, '0')
              const tanggalFull = `${year}-${formatM}-${formatD}`
              const mDanD = `${formatM}-${formatD}`

              const jadwalHariIni = jadwal.filter(j => j.day === tanggalFull)
              const detailHariPenting = daftarHariPenting[tanggalFull]
              const isLibur = detailHariPenting?.isLibur || false
              const isHariIni = hariIni.getDate() === tgl && hariIni.getMonth() === month && hariIni.getFullYear() === year
              const isUserUltah = ultahUser === mDanD

              return (
                <div
                  key={tgl}
                  onClick={() => handleDateClick(tgl, jadwalHariIni)}
                  className={`h-24 md:h-32 p-2 relative flex flex-col justify-between group select-none overflow-hidden transition-colors
                    bg-white dark:bg-[#141414] hover:bg-slate-50 dark:hover:bg-white/5
                    ${jadwalHariIni.length > 0 ? 'cursor-pointer' : ''}
                    ${isHariIni ? 'ring-2 ring-inset ring-indigo-500' : ''}
                  `}
                >
                  {/* Top Row: Angka Tanggal, Icon Ultah & Indikator Hari Ini */}
                  <div className="flex justify-between items-start z-10">
                    <span className={`text-xs font-black h-6 w-6 flex items-center justify-center rounded-lg transition-all
                      ${isLibur ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        isHariIni ? 'bg-indigo-600 text-white' :
                        jadwalHariIni.length > 0 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {tgl}
                    </span>

                    <div className="flex items-center gap-1">
                      {isUserUltah && (
                        <span className="p-1 bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-lg animate-bounce" title="Hari Ulang Tahunmu!">
                          <Gift size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Hari Penting & Jadwal Kuliah */}
                  <div className="mt-1 flex-1 flex flex-col justify-end gap-1 z-10 overflow-hidden">
                    {detailHariPenting && (
                      <div className={`text-[9px] font-bold px-1.5 py-1 rounded-lg leading-tight text-center break-words
                        ${isLibur ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10' : 'text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10'}`}>
                        {detailHariPenting.nama}
                      </div>
                    )}

                    {jadwalHariIni.slice(0, 2).map((j) => (
                      <div key={j.id} className="bg-indigo-600 text-[9px] text-white px-1.5 py-1 rounded-lg font-bold truncate">
                        {j.subject}
                      </div>
                    ))}
                    {jadwalHariIni.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-400 px-1">+{jadwalHariIni.length - 2} lainnya</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MODAL INPUT TANGGAL ULANG TAHUN (Pop Up Awal - TETAP AMAN) */}
        {showUltahModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white dark:bg-[#141414] w-full max-w-sm rounded-[28px] p-6 shadow-2xl border border-slate-100 dark:border-white/10 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Kapan Hari Ulang Tahunmu?</h3>
                <p className="text-xs text-slate-400 mt-1">Kami ingin menyiapkan kejutan kecil spesial saat harinya tiba!</p>
              </div>
              <form onSubmit={simpanUlangThn} className="space-y-3">
                <input
                  type="date"
                  required
                  onChange={(e) => setInputUltah(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 dark:text-slate-200"
                />
                <div className="flex gap-2">
                  {ultahUser && (
                    <button
                      type="button"
                      onClick={() => setShowUltahModal(false)}
                      className="w-1/3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl text-xs transition"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition active:scale-95"
                  >
                    Simpan & Ingat
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL KEJUTAN ULANG TAHUN (TETAP AMAN) */}
        {showKejutanUltah && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-gradient-to-b from-indigo-600 to-purple-600 w-full max-w-md rounded-[28px] p-8 text-center text-white relative shadow-2xl overflow-hidden border border-white/10">
              <div className="absolute top-4 left-6 animate-bounce text-xl">✨</div>
              <div className="absolute top-12 right-8 animate-pulse text-2xl">🎉</div>
              <div className="absolute bottom-8 left-12 animate-bounce text-lg">🎈</div>

              <div className="space-y-4 relative z-10">
                <div className="inline-flex p-4 bg-white/15 rounded-full">
                  <Gift size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-black tracking-wide">SELAMAT ULANG TAHUN! 🥳</h2>
                <p className="text-sm font-medium opacity-90 leading-relaxed">
                  Semoga harimu dipenuhi kebahagiaan, urusan perkuliahan berjalan lancar, dan semua impianmu segera terwujud! Tetap semangat belajar ya! 🚀
                </p>
                <button
                  onClick={() => setShowKejutanUltah(false)}
                  className="w-full bg-white text-indigo-700 font-black tracking-widest py-3.5 rounded-2xl text-xs shadow-xl hover:bg-slate-50 transition active:scale-95 uppercase"
                >
                  Terima Kasih Banyak!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detail Jadwal Kuliah Bawaan Asli (TETAP AMAN) */}
        {selectedJadwal && (
          <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#141414] w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-5 flex justify-between items-center text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Detail Jadwal</p>
                  <h2 className="text-lg font-black">{selectedDateLabel}</h2>
                </div>
                <button onClick={() => setSelectedJadwal(null)} className="p-2 bg-black/20 rounded-full hover:bg-black/30 transition">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                {selectedJadwal.map((j) => (
                  <div key={j.id} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                    <h3 className="text-slate-900 dark:text-white font-black text-base leading-tight mb-3">{j.subject}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Waktu</p>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{j.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <MapPin size={14} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Ruangan</p>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{j.room}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedJadwal(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 font-black uppercase tracking-widest text-xs transition-colors"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}