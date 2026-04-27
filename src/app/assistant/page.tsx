'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { askPawasAI } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

const AssistantPage = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Halo Fawwaz. Ada yang bisa saya bantu catat atau analisis hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askPawasAI(text, messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })));
      
      const cleanText = response.replace(/<action>[\s\S]*?<\/action>/g, '').trim();
      setMessages(prev => [...prev, { role: 'assistant', text: cleanText || "Data telah saya proses." }]);
      
      if (response.includes('<action>')) {
        const actionMatch = response.match(/<action>([\s\S]*?)<\/action>/);
        if (actionMatch) {
          try {
            const { action, data } = JSON.parse(actionMatch[1]);
            console.log('Executing action:', action, data);

            if (action === 'save_task') {
              await supabase.from('tasks').insert([data]);
            } else if (action === 'save_inventory') {
              await supabase.from('inventory').insert([data]);
            } else if (action === 'log_trade') {
              await supabase.from('trades').insert([data]);
            } else if (action === 'save_note') {
              await supabase.from('notes').insert([data]);
            }
          } catch (e) {
            console.error('Failed to execute database action', e);
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Maaf, terjadi kesalahan koneksi neural. Silakan coba lagi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <header className="flex items-center gap-2 mb-6">
        <Sparkles className="text-emerald-400" size={20} />
        <h1 className="text-xl font-bold text-white">Neural Assistant</h1>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'glass-card rounded-tl-none'
              }`}>
                <div className="flex-shrink-0 mt-1">
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-emerald-400" />}
                </div>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="animate-spin text-emerald-400" size={16} />
              <span className="text-xs text-zinc-500">Pawas.ai sedang berpikir...</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 relative">
        <div className="flex gap-2 items-center bg-[#111111] border border-white/10 rounded-2xl p-2 pl-4">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ketik atau gunakan suara..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600"
          />
          <button 
            onClick={startListening}
            className={`p-2 rounded-xl transition-all ${
              isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mic size={20} />
          </button>
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
