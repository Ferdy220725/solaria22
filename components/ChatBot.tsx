"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Paperclip, User, Sparkles, Maximize2, Minimize2, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/utils/supabase/client'; // Sesuaikan path dengan project kamu

export default function ChatBot({ materialsFromSupabase }: { materialsFromSupabase?: any[] }) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [fileToUpload, setFileToUpload] = useState<{name: string, base64: string} | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Ambil history dari Supabase saat pertama kali load
  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Gagal load history:", error);
      } else if (data) {
        setMessages(data);
      }
    };

    fetchHistory();
  }, [supabase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setFileToUpload({ name: file.name, base64: base64 });
      toast.success(`${file.name} terpilih! Klik kirim untuk analisis. 🍃`);
    };
    reader.readAsDataURL(file);
  };

  // Fungsi hapus history
  const clearHistory = async () => {
    const { error } = await supabase.from('chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      setMessages([]);
      toast.success("Riwayat percakapan dibersihkan! 🧹");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !fileToUpload) || isLoading) return;

    const userMsgContent = fileToUpload ? `[Menganalisis File: ${fileToUpload.name}]\n${input}` : input;
    const userMsg = { role: 'user', content: userMsgContent };
    
    // Simpan ke Supabase (User Message)
    await supabase.from('chat_history').insert([userMsg]);

    const currentFile = fileToUpload;
    const currentMessages = [...messages, userMsg];
    
    setMessages(currentMessages);
    setInput(""); 
    setFileToUpload(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: currentMessages,
          fileData: currentFile,
          supabaseData: materialsFromSupabase 
        }),
      });

      if (!response.ok) throw new Error("Gagal konek ke API");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          assistantContent += chunk;

          setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs.length > 0) {
              newMsgs[newMsgs.length - 1] = { 
                ...newMsgs[newMsgs.length - 1], 
                content: assistantContent 
              };
            }
            return newMsgs;
          });
        }
        
        // Simpan jawaban AI ke Supabase setelah streaming selesai
        await supabase.from('chat_history').insert([{ role: 'assistant', content: assistantContent }]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim pesan!");
      setMessages(prev => prev.filter(m => m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-32 right-6 z-[100] p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl border-2 border-white hover:scale-110 transition-all">
          <Bot size={28} />
        </button>
      )}

      {isOpen && (
        <div className={`fixed z-[110] flex flex-col bg-slate-50 border border-slate-200 shadow-2xl transition-all duration-300 ${
          isFullScreen ? 'inset-4 rounded-3xl' : 'bottom-32 right-6 w-[95vw] md:w-[550px] h-[75vh] rounded-[2rem]'
        } overflow-hidden font-sans`}>
          
          <div className="p-4 bg-white border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl"><Sparkles size={18} /></div>
              <span className="font-bold text-slate-800 text-sm">Zora 🍃</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearHistory} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title="Hapus Chat">
                <Trash2 size={18} />
              </button>
              <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hidden md:block">
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><X size={20} /></button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {messages.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm italic">Belum ada obrolan. Mulai tanya yuk! 🍃</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'}`}>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t">
            {fileToUpload && (
              <div className="mb-2 flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-bottom-1">
                <FileText size={16} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 truncate max-w-[200px]">{fileToUpload.name}</span>
                <button onClick={() => setFileToUpload(null)} className="ml-auto text-red-500 p-1 hover:bg-red-50 rounded-full"><X size={14} /></button>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.pdf,.docx,.csv" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors">
                <Paperclip size={20} />
              </button>
              <input 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 py-2 text-slate-700" 
                value={input} 
                placeholder="Tulis pesan atau lampirkan file..." 
                onChange={(e) => setInput(e.target.value)} 
              />
              <button type="submit" disabled={isLoading} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}