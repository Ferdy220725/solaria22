"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Paperclip, Sparkles, Maximize2, Minimize2, 
  FileText, Trash2, Copy, Check, Mic, MicOff, GraduationCap, 
  Microscope, PenTool, MessageCircle, RefreshCw, TrendingDown, TrendingUp 
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/utils/supabase/client';

export default function ChatBot({ materialsFromSupabase }: { materialsFromSupabase?: any[] }) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [fileToUpload, setFileToUpload] = useState<{name: string, base64: string} | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentMode, setCurrentMode] = useState("Free Chat");
  const [showModeMenu, setShowModeMenu] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const modes = [
    { id: 'study', name: 'Study Mode', icon: <GraduationCap size={16} />, desc: 'Fokus rangkum materi' },
    { id: 'research', name: 'Deep Research', icon: <Microscope size={16} />, desc: 'Analisis mendalam' },
    { id: 'writing', name: 'Writing Mode', icon: <PenTool size={16} />, desc: 'Bantu susun laporan' },
    { id: 'chat', name: 'Free Chat', icon: <MessageCircle size={16} />, desc: 'Diskusi santai' },
  ];

  // 1. Voice to Text Setup (ADA)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'id-ID';
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + (prev ? " " : "") + transcript);
          setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return toast.error("Browser tidak support.");
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { setIsListening(true); recognitionRef.current.start(); toast.info("Zora Mendengarkan..."); }
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-zora', handleOpen);
    return () => window.removeEventListener('open-zora', handleOpen);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase.from('chat_history').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchHistory();
  }, [supabase]);

  // 2. Smart Scroll Logic (ADA)
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages.length]);

  // 3. Copy Pesan (ADA)
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    toast.success("Disalin! 📋");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 4. Upload File onChange (ADA)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setFileToUpload({ name: file.name, base64: base64 });
      toast.success(`${file.name} siap!`);
    };
    reader.readAsDataURL(file);
  };

  // 5. Clear History (ADA)
  const clearHistory = async () => {
    const { error } = await supabase.from('chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) { setMessages([]); toast.success("Riwayat bersih! 🧹"); }
  };

  // 6. Fitur Re-explain/Simplify/Detail (ADA)
  const handleQuickCommand = (command: string) => {
    setInput(command);
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement;
      form?.requestSubmit();
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !fileToUpload) || isLoading) return;
    
    const userMsg = { role: 'user', content: fileToUpload ? `[Analisis: ${fileToUpload.name}]\n${input}` : input };
    await supabase.from('chat_history').insert([userMsg]);
    setMessages(prev => [...prev, userMsg]);
    
    const currentMessages = [...messages, userMsg];
    const currentFile = fileToUpload;
    setInput(""); setFileToUpload(null); setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages, fileData: currentFile, supabaseData: materialsFromSupabase, mode: currentMode }),
      });
      if (!response.ok) throw new Error();
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value);
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: assistantContent };
            return newMsgs;
          });
        }
        await supabase.from('chat_history').insert([{ role: 'assistant', content: assistantContent }]);
      }
    } catch (err) { toast.error("Gagal konek!"); } finally { setIsLoading(false); }
  };

  return (
    <>
      {isOpen && (
        <div className={`fixed z-[10000] flex flex-col bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-300
          ${isFullScreen ? 'inset-0' : 'bottom-24 right-4 md:right-8 w-[calc(100%-2rem)] md:w-[420px] h-[620px] max-h-[85vh] rounded-3xl'} overflow-hidden`}>
          
          {/* Header (Trash, FullScreen, Close ADA) */}
          <div className="px-5 py-4 bg-[#800020] text-white flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <Bot size={18} />
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white">Zora Assistant 🍃</h3>
                <span className="text-[10px] opacity-70 block -mt-1 uppercase tracking-widest text-white">{currentMode}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearHistory} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
              <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 hover:bg-white/10 rounded-lg hidden md:block">{isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative flex flex-col">
            {/* Chat Content Container */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-10 bg-slate-50/50 dark:bg-transparent scrollbar-thin">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-30">
                  <Sparkles size={32} className="text-[#800020]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ready in {currentMode}</p>
                </div>
              )}
              
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                  <div className={`flex flex-col gap-2 max-w-[90%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`relative px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm
                      ${m.role === 'user' ? 'bg-[#800020] text-white rounded-tr-none' : 'bg-white dark:bg-[#1a1a1a] border dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                      <div className="prose prose-sm dark:prose-invert break-words text-inherit">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Actions for Assistant: Copy & Re-explain Buttons (ADA) */}
                    {m.role === 'assistant' && m.content && (
                      <div className="flex flex-wrap gap-2 items-center pl-1">
                        <button onClick={() => handleCopy(m.content, idx)} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#800020] transition-colors bg-white dark:bg-white/5 px-2 py-1 rounded-md border dark:border-white/10 shadow-sm uppercase">
                          {copiedId === idx ? <Check size={10} className="text-green-500" /> : <Copy size={10} />} SALIN
                        </button>
                        <button onClick={() => handleQuickCommand("Jelaskan ulang bagian ini")} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white dark:bg-white/5 px-2 py-1 rounded-md border dark:border-white/10 shadow-sm uppercase">
                          <RefreshCw size={10} /> Jelaskan ulang
                        </button>
                        <button onClick={() => handleQuickCommand("Buat penjelasan ini jauh lebih sederhana")} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-orange-600 transition-colors bg-white dark:bg-white/5 px-2 py-1 rounded-md border dark:border-white/10 shadow-sm uppercase">
                          <TrendingDown size={10} /> Lebih sederhana
                        </button>
                        <button onClick={() => handleQuickCommand("Berikan penjelasan yang lebih detail dan mendalam")} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-emerald-600 transition-colors bg-white dark:bg-white/5 px-2 py-1 rounded-md border dark:border-white/10 shadow-sm uppercase">
                          <TrendingUp size={10} /> Lebih detail
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex gap-1.5 pl-2 text-[#800020] animate-pulse"><div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" /></div>}
            </div>

            {/* 7. Mode Selector FAB Style (ADA) */}
            {showModeMenu && (
              <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-[#1a1a1a] border dark:border-white/10 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200 z-50">
                <div className="grid grid-cols-2 gap-2">
                  {modes.map((mode) => (
                    <button key={mode.id} onClick={() => { setCurrentMode(mode.name); setShowModeMenu(false); toast.info(`Mode: ${mode.name}`); }}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all ${
                        currentMode === mode.name ? 'bg-[#800020] border-[#800020] text-white' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-300'
                      }`}>
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-tight">{mode.icon} {mode.name}</div>
                      <span className={`text-[9px] ${currentMode === mode.name ? 'opacity-80' : 'text-slate-400'}`}>{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8. Input Area (Upload, Mic, Send ADA) */}
          <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t dark:border-white/10 flex-shrink-0">
            {fileToUpload && (
              <div className="mb-2 flex items-center justify-between bg-[#800020]/5 p-2 rounded-xl border border-[#800020]/10 text-[10px] font-bold">
                <div className="flex items-center gap-2 truncate text-slate-600 dark:text-slate-400">
                  <FileText size={14} className="text-[#800020]" /> {fileToUpload.name}
                </div>
                <button onClick={() => setFileToUpload(null)} className="text-red-500 hover:scale-110 transition-transform"><X size={14}/></button>
              </div>
            )}
            <form id="chat-form" onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl focus-within:ring-1 focus-within:ring-[#800020]/30 transition-all">
              {/* Trigger Mode FAB */}
              <button type="button" onClick={() => setShowModeMenu(!showModeMenu)} className={`p-2 rounded-lg transition-all ${showModeMenu ? 'bg-[#800020] text-white shadow-inner' : 'text-slate-400 hover:text-[#800020] bg-white dark:bg-white/5 shadow-sm'}`}>
                <Sparkles size={18} />
              </button>

              {/* Upload Input (Fungsional) */}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.docx" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#800020] transition-colors tracking-tighter">
                <Paperclip size={18} />
              </button>

              <input 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 px-1 text-slate-700 dark:text-slate-200" 
                value={input} 
                placeholder={isListening ? "Zora Mendengarkan..." : `Tanya di ${currentMode}...`} 
                onChange={(e) => setInput(e.target.value)} 
              />

              {/* Mic Icon (Pulse Animasi) */}
              <button type="button" onClick={toggleListening} className={`p-2 transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-[#800020]'}`}>
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button 
                type="submit" 
                disabled={(!input.trim() && !fileToUpload) || isLoading} 
                className="p-2.5 bg-[#800020] text-white rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-20"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}