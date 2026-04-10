"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, BookOpen, PenTool, Loader2 } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const messageToSend = customText || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Maaf, ada gangguan koneksi. Coba lagi ya!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Posisi bottom-32 supaya di atas menu utama
    <div className="fixed bottom-32 right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="bg-white dark:bg-zinc-900 w-[320px] sm:w-[380px] h-[480px] shadow-2xl rounded-2xl mb-4 flex flex-col border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">S</div>
              <span className="font-semibold text-sm">Solaria Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded-md transition-colors"><X size={20} /></button>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
            {messages.length === 0 && (
              <div className="text-center mt-10 text-zinc-400 text-xs px-6">Halo Ahmat! Ada yang bisa Solaria Copilot bantu seputar Agroteknologi?</div>
            )}
            {messages.map((m, index) => (
              <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] shadow-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-tl-none text-zinc-800 dark:text-zinc-200'
                }`}>{m.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-sm border dark:border-zinc-700"><Loader2 size={16} className="animate-spin text-blue-600" /></div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex gap-2 items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl">
              <input className="flex-1 bg-transparent border-none focus:outline-none text-sm text-zinc-800 dark:text-zinc-200" value={input} placeholder="Tanya sesuatu..." onChange={(e) => setInput(e.target.value)} />
              <button type="submit" disabled={!input.trim() || isLoading} className="text-blue-600 disabled:opacity-30"><Send size={18} /></button>
            </div>
          </form>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-2 border-white/20">
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}