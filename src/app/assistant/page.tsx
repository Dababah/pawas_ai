'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Bot, User, Sparkles, Loader2, Volume2, VolumeX, Image as ImageIcon, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { askPawasAI } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { scheduleTaskNotification } from '@/lib/notifications';

const AssistantPage = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; image?: string }[]>([
    { role: 'assistant', text: 'Halo Fawwaz. Ada yang bisa saya bantu catat atau analisis hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  const speak = (text: string) => {
    if (isMuted || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    window.speechSynthesis.speak(utterance);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() && !selectedImage) return;

    triggerHaptic(15);
    const userMsg = { role: 'user' as const, text: text || 'Analisis gambar ini', image: selectedImage || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToProcess = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await askPawasAI(
        text || 'Analisis gambar ini', 
        messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        imageToProcess || undefined
      );
      
      const cleanText = response.replace(/<action>[\s\S]*?<\/action>/g, '').trim();
      const assistantMsg = cleanText || "Data telah saya proses.";
      
      setMessages(prev => [...prev, { role: 'assistant', text: assistantMsg }]);
      speak(assistantMsg);
      triggerHaptic([10, 5, 10]);
      
      if (response.includes('<action>')) {
        const actionMatch = response.match(/<action>([\s\S]*?)<\/action>/);
        if (actionMatch) {
          try {
            const { action, data } = JSON.parse(actionMatch[1]);
            if (action === 'save_task') {
              await supabase.from('tasks').insert([data]);
              if (data.deadline) await scheduleTaskNotification(data.title, data.deadline);
            }
            else if (action === 'save_inventory') {
              await bizSupabase.from('inventory').insert([data]);
            }
            else if (action === 'log_biz_sale') {
              await bizSupabase.from('sales').insert([data]);
            }
            else if (action === 'log_trade') {
              await supabase.from('trades').insert([data]);
            }
            else if (action === 'save_note') {
              await supabase.from('notes').insert([data]);
            }
          } catch (e) {
            console.error('Database action failed', e);
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Maaf, koneksi neural terputus.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => { setIsListening(true); triggerHaptic(20); };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => handleSend(event.results[0][0].transcript);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-widest">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-zinc-200">Neural Assistant</span>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className="flex gap-4 group"
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Command size={16} />}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  {msg.role === 'user' ? 'Fawwaz Ali' : 'Pawas AI'}
                </p>
                {msg.image && (
                  <img src={msg.image} alt="Upload" className="rounded-xl w-full max-h-60 object-cover border border-white/5 mb-2" />
                )}
                <p className="text-sm leading-relaxed text-zinc-300">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <p className="text-xs text-zinc-600 italic mt-2">Thinking...</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-white/5">
        {selectedImage && (
          <div className="relative inline-block mb-4">
            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-emerald-500" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
              <X size={12} />
            </button>
          </div>
        )}
        
        <div className="flex gap-3 items-center">
          <div className="flex-1 flex gap-2 items-center bg-[#0b0b0b] rounded-xl px-3 py-1.5 border border-white/5 focus-within:border-zinc-700 transition-all">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Type or use voice command..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-300 placeholder:text-zinc-700 py-1"
            />
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors">
              <ImageIcon size={18} />
            </button>
            <button onClick={startListening} className={`p-1.5 rounded-lg ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-zinc-600'}`}>
              <Mic size={18} />
            </button>
          </div>
          <button onClick={() => handleSend(input)} disabled={(!input.trim() && !selectedImage) || isLoading} className="p-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
