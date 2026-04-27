'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Bot, User, Sparkles, Loader2, Volume2, VolumeX, Image as ImageIcon, X } from 'lucide-react';
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

  const triggerHaptic = (pattern = 10) => {
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
      const assistantMsg = cleanText || "Gambar telah saya analisis.";
      
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
            else if (action === 'save_inventory') await supabase.from('inventory').insert([data]);
            else if (action === 'log_trade') await supabase.from('trades').insert([data]);
            else if (action === 'save_note') await supabase.from('notes').insert([data]);
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
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-emerald-400" size={20} />
          <h1 className="text-xl font-bold text-white">Neural Assistant</h1>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-zinc-900 rounded-xl text-zinc-500">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl flex flex-col gap-2 ${
                msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'glass-card rounded-tl-none'
              }`}>
                {msg.image && (
                  <img src={msg.image} alt="Upload" className="rounded-lg w-full max-h-40 object-cover" />
                )}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-emerald-400" />}
                  </div>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="animate-spin text-emerald-400" size={16} />
              <span className="text-xs text-zinc-500">Menganalisis data...</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {selectedImage && (
          <div className="relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-emerald-500" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X size={12} />
            </button>
          </div>
        )}
        
        <div className="flex gap-2 items-center bg-[#111111] border border-white/10 rounded-2xl p-2 pl-4">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ketik, suara, atau kirim foto..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white"
          />
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-zinc-400 hover:text-white">
            <ImageIcon size={20} />
          </button>
          <button onClick={startListening} className={`p-2 rounded-xl ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-zinc-400'}`}>
            <Mic size={20} />
          </button>
          <button onClick={() => handleSend(input)} disabled={(!input.trim() && !selectedImage) || isLoading} className="p-2 bg-emerald-600 text-white rounded-xl">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
