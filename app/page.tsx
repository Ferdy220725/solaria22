"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Video, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

// --- INTERFACES ---
interface Tugas {
  id: string;
  judul_tugas: string;
  mk_nama: string;
  deadline: string;
  deskripsi?: string;
  link_pengumpulan?: string;
}

interface ZoomMeeting {
  id: string;
  title: string;
  link: string;
}

export default function Dashboard() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [zoomData, setZoomData] = useState<ZoomMeeting | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayName, setDisplayName] = useState('Member');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const hasEntered = sessionStorage.getItem('zora_entered');
    if (hasEntered) {
      setShowDashboard(true);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: taskData } = await supabase.from('tugas_perkuliahan').select('*').order('deadline', { ascending: true });
      if (taskData) setTugas(taskData as Tugas[]);

      const { data: zoom } = await supabase.from('zoom_meetings').select('*').limit(1).single();
      if (zoom) setZoomData(zoom as ZoomMeeting);

      const savedName = localStorage.getItem('nama_user_solaria') || 'Member';
      setDisplayName(savedName.trim().split(' ')[0]);

      const savedCompleted = JSON.parse(localStorage.getItem('agrotek_completed_tasks') || '[]');
      setCompletedTaskIds(savedCompleted);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskExpansion = (id: string) => {
    setExpandedTasks(prev => ({ ...prev, [id] : !prev[id] }));
  };

  const handleToggleDone = async (id: string, isCurrentlyDone: boolean) => {
    const newCompleted = !isCurrentlyDone ? [...completedTaskIds, id] : completedTaskIds.filter(tid => tid !== id);
    setCompletedTaskIds(newCompleted);
    localStorage.setItem('agrotek_completed_tasks', JSON.stringify(newCompleted));
  };

  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const displayedTugas = tugas.filter(t => activeTab === 'pending' ? !completedTaskIds.includes(t.id) : completedTaskIds.includes(t.id));

  const enterDashboard = () => {
    setShowDashboard(true);
    sessionStorage.setItem('zora_entered', 'true');
  };

  if (!showDashboard) {
    return (
      <>
        <style jsx global>{`
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, #b8860b 0%, #f7ef8a 25%, #d4af37 50%, #f7ef8a 75%, #b8860b 100%);
            background-size: 200% auto;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            animation: shimmer 10s linear infinite;
          }
        `}</style>

        <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-6 font-serif overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-60"></div>

          <div className="relative text-center animate-in fade-in zoom-in duration-1000 ease-out w-full max-w-full">
            {/* REVISI HANYA DI SINI: Mengatur ukuran teks agar responsif dan tidak kepotong di HP */}
            <h1 className="text-[60px] sm:text-[100px] md:text-[160px] font-light tracking-[0.3em] md:tracking-[0.6em] leading-none animate-shimmer select-none drop-shadow-[0_0_15px_rgba(247,239,138,0.2)] py-4">
              ZORA
            </h1>
            
            <div className="flex items-center justify-center gap-6 mt-2 mb-16 opacity-70">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
              <p className="text-zinc-400 tracking-[0.3em] md:tracking-[0.6em] uppercase text-[8px] md:text-[10px] font-sans font-bold">
                Luxury Management System
              </p>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            </div>

            <button 
              onClick={enterDashboard} 
              className="relative px-16 py-5 border border-[#D4AF37]/50 text-[#D4AF37] hover:border-[#D4AF37] hover:text-black hover:bg-[#D4AF37] transition-all duration-700 rounded-full tracking-[0.3em] text-[11px] uppercase font-sans font-bold group overflow-hidden"
            >
              <span className="relative z-10">Access Terminal</span>
              <div className="absolute inset-0 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0"></div>
            </button>
          </div>

          <div className="absolute bottom-10 text-[9px] text-zinc-700 uppercase tracking-widest font-sans font-bold">
            Powered by FeZo
          </div>
        </div>
      </>
    );
  }

  return (
    <div id="main-dashboard" className="min-h-screen bg-gradient-to-br from-white to-zinc-100 lg:ml-64 transition-all pb-12 font-sans relative">
      
      <header className="bg-black text-white p-16 border-b border-[#D4AF37]/20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-70"></div>
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          <p className="text-[#D4AF37] uppercase tracking-[0.5em] text-[10px] mb-3 font-bold">Authorization Granted: {displayName}</p>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white uppercase italic leading-tight">Class Management C</h1>
          <div className="h-px w-40 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-8"></div>
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 -mt-12 relative z-20">
        
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-zinc-400 font-serif italic">
            <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
            Initializing ...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-9 rounded-3xl shadow-xl border border-zinc-100 hover:border-[#D4AF37]/30 transition-all group relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Video size={150} className="text-black"/>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <Video className="text-[#D4AF37]" size={18} />
                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-sans">Virtual Conference Hub</h2>
                  </div>
                  {zoomData ? (
                    <div className="space-y-5">
                      <p className="text-base font-serif italic text-zinc-900 leading-snug">{zoomData.title}</p>
                      <a 
                        href={zoomData.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-zinc-50 hover:bg-black p-5 rounded-2xl border border-zinc-100 group transition-all duration-300"
                      >
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-black group-hover:text-[#D4AF37]">Initialize Link</span>
                        <ExternalLink size={16} className="text-[#D4AF37]" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic font-serif">No conference link currently active.</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-9 rounded-3xl shadow-xl border border-zinc-100 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse border-4 border-green-200"></div>
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-sans">Live Attendance Portal</h2>
                </div>
                <button 
                  onClick={() => router.push('/absensi')} 
                  className="w-full bg-black text-[#D4AF37] hover:bg-zinc-900 py-5 rounded-2xl font-bold uppercase tracking-[0.25em] text-[11px] hover:scale-[1.01] transition-all shadow-lg shadow-black/10 relative z-10 font-sans"
                >
                  Log Presence
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[35px] shadow-2xl border border-zinc-100 overflow-hidden relative">
              <div className="flex border-b border-zinc-100 bg-zinc-50/50 font-sans">
                <button onClick={() => setActiveTab('pending')} className={`flex-1 py-6 text-[11px] font-bold uppercase tracking-[0.25em] transition-all relative ${activeTab === 'pending' ? 'text-black bg-white' : 'text-zinc-400 hover:text-black'}`}>
                  Active Assignments
                  {activeTab === 'pending' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-20 bg-[#D4AF37]"></div>}
                </button>
                <button onClick={() => setActiveTab('completed')} className={`flex-1 py-6 text-[11px] font-bold uppercase tracking-[0.25em] transition-all relative ${activeTab === 'completed' ? 'text-black bg-white' : 'text-zinc-400 hover:text-black'}`}>
                  Archive
                  {activeTab === 'completed' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-20 bg-[#D4AF37]"></div>}
                </button>
              </div>

              <div className="p-10 divide-y divide-zinc-100">
                {displayedTugas.length > 0 ? displayedTugas.map((t) => (
                  <div key={t.id} className="py-10 first:pt-0 last:pb-0">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="flex-1 space-y-3">
                        <span className="text-[#D4AF37] text-[10px] font-extrabold uppercase tracking-[0.35em] font-sans">{t.mk_nama}</span>
                        <h3 className="text-2xl font-serif text-zinc-950 tracking-tight leading-tight">{t.judul_tugas}</h3>
                        <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-bold uppercase tracking-tight font-sans bg-zinc-50 p-2 rounded-md w-fit border border-zinc-100">
                          <span>Deadline: {formatDeadline(t.deadline)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 h-fit mt-2 md:mt-0">
                        {t.link_pengumpulan && activeTab === 'pending' && (
                          <a href={t.link_pengumpulan} target="_blank" className="px-7 py-3 bg-black text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all font-sans">Submit Port</a>
                        )}
                        <button onClick={() => handleToggleDone(t.id, activeTab === 'completed')} className="px-7 py-3 border-2 border-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all font-sans bg-white hover:bg-zinc-50">
                          {activeTab === 'pending' ? "Mark Archived" : "Restore"}
                        </button>
                      </div>
                    </div>

                    {t.deskripsi && (
                      <div className="mt-6 border-t border-dashed border-zinc-100 pt-6">
                        <button 
                          onClick={() => toggleTaskExpansion(t.id)}
                          className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.15em] flex items-center gap-2.5 hover:opacity-70 transition-opacity font-sans"
                        >
                          {expandedTasks[t.id] ? <><ChevronUp size={15}/> Hide Details</> : <><ChevronDown size={15}/> View Details</>}
                        </button>
                        
                        {expandedTasks[t.id] && (
                          <div className="mt-5 p-7 bg-zinc-50 rounded-2xl border-l-4 border-[#D4AF37]/50 animate-in slide-in-from-top-3 duration-500 ease-out relative overflow-hidden">
                            <div className="absolute right-4 top-4 text-xs font-black uppercase tracking-widest text-zinc-200 select-none font-sans">Description</div>
                            <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line font-medium italic font-serif relative z-10">
                              {t.deskripsi}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="py-24 text-center opacity-40 italic font-serif text-zinc-400 border-2 border-dashed border-zinc-100 rounded-2xl">Terminal data stream is empty.</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}