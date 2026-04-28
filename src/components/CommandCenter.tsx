'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, X, Sparkles, Loader2, Command, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Ctrl+J to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setActions([]);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: [] }),
      });
      const data = await res.json();
      setResult(data.response);
      setActions(data.actions || []);

      if (data.navigateTo) {
        setTimeout(() => {
          router.push(data.navigateTo);
          setIsOpen(false);
        }, 1500);
      }
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setResult('Speech recognition tidak didukung di browser ini.');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      if (navigator.vibrate) navigator.vibrate(20);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.start();
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 md:bottom-8 md:right-8 z-[60] w-14 h-14 bg-gradient-to-br from-[#8c7851] to-[#6b4e3d] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#8c7851]/30 hover:shadow-[#8c7851]/50 transition-all hover:scale-105 active:scale-95 group"
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
        title="Command Center (Ctrl+J)"
      >
        <Command size={22} className="text-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-black" />
      </motion.button>

      {/* Command Center Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Input Row */}
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                <Sparkles size={18} className="text-[#8c7851] shrink-0" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
                  placeholder="Perintah apa saja... (contoh: buatkan jadwal gym jam 5 sore)"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-500"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={startListening}
                    disabled={isLoading}
                    className={`p-2 rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500/20 text-red-400 animate-pulse'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                    title="Voice Command"
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  {input.trim() && (
                    <button
                      onClick={() => handleSend(input)}
                      disabled={isLoading}
                      className="p-2 bg-[#8c7851] text-white rounded-xl hover:bg-[#a08960] transition-all"
                    >
                      <Send size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="p-6 flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-[#8c7851]" />
                  <span className="text-sm text-zinc-400">Memproses perintah...</span>
                </div>
              )}

              {/* Result */}
              {result && !isLoading && (
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  <div className="p-5 space-y-3">
                    {actions.length > 0 && (
                      <div className="space-y-1.5">
                        {actions.map((a, i) => (
                          <div key={i} className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                            {a}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-zinc-300 leading-relaxed custom-html-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions (when empty) */}
              {!result && !isLoading && (
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Quick Commands</p>
                  {[
                    '📝 Buatkan catatan meeting hari ini',
                    '⏰ Ingatkan deadline tugas kriptografi besok siang',
                    '📊 Analisis win rate trading saya bulan ini',
                    '📦 Tambahkan iPhone 15 Pro ke inventory',
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(cmd.slice(2).trim()); handleSend(cmd.slice(2).trim()); }}
                      className="w-full text-left text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <kbd className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-500 border border-white/10">Ctrl+J</kbd>
                  <span className="text-[9px] text-zinc-600">Toggle</span>
                </div>
                <span className="text-[9px] text-zinc-600">Pawas AI Neural Engine</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
