'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Bot, User, Sparkles, Loader2, Volume2, VolumeX, Image as ImageIcon, X, Command, Clock, ThumbsUp, ThumbsDown, RotateCcw, Copy, MoreVertical, Plus, Star, Book, Pin, Settings, Menu, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { askPawasAI } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { scheduleTaskNotification } from '@/lib/notifications';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AssistantPage = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; image?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load from local storage on initial render
    const saved = localStorage.getItem('pawas_ai_chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([{ role: 'assistant', text: 'Halo Fawwaz. Ada yang bisa saya bantu catat atau analisis hari ini?' }]);
      }
    } else {
      setMessages([{ role: 'assistant', text: 'Halo Fawwaz. Ada yang bisa saya bantu catat atau analisis hari ini?' }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Save to local storage whenever messages change
    if (messages.length > 0) {
      localStorage.setItem('pawas_ai_chat', JSON.stringify(messages));
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
      // Fetch Omniscient Context (Notion-like Global Access)
      const { data: tasksData } = await supabase.from('tasks').select('*').order('deadline', { ascending: true });
      const { data: notesData } = await supabase.from('notes').select('id, title, category, created_at'); // Light summary
      const { data: tradesData } = await supabase.from('trades').select('*').order('id', { ascending: false }).limit(5);

      const dbContext = {
        active_tasks: tasksData || [],
        available_notes: notesData || [],
        recent_trades: tradesData || []
      };

      const contextualText = `[REALTIME DB CONTEXT]: ${JSON.stringify(dbContext)}\n\n[USER COMMAND]: ${text || 'Analisis gambar ini'}`;

      const response = await askPawasAI(
        contextualText, 
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
        const actionMatch = response.match(/<action>([\s\S]*?)<\/action>/i);
        if (actionMatch) {
          try {
            const cleanJsonString = actionMatch[1].replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedJson = JSON.parse(cleanJsonString);
            const actionType = (parsedJson.action || '').toLowerCase();
            const data = parsedJson.data || parsedJson; // Fallback if AI puts data directly at root
            
            if (actionType === 'save_task' || actionType === 'add_task') {
              await supabase.from('tasks').insert([{...data, status: 'pending'}]);
              if (data.deadline) await scheduleTaskNotification(data.title, data.deadline);
            }
            else if (actionType === 'delete_task') {
              await supabase.from('tasks').delete().eq('id', data.id);
            }
            else if (actionType === 'update_task') {
              await supabase.from('tasks').update({ status: data.status }).eq('id', data.id);
            }
            else if (actionType === 'save_inventory' || actionType === 'add_inventory') {
              await supabase.from('inventory').insert([{...data, status: 'ready'}]);
            }
            else if (actionType === 'log_trade' || actionType === 'save_trade') {
              await supabase.from('trades').insert([data]);
            }
            else if (actionType === 'save_note' || actionType === 'update_notes') {
              const noteTitle = data.title || parsedJson.title || 'AI Generated Note';
              const noteCategory = data.category || parsedJson.category || 'Personal';
              const noteContent = data.content || cleanText;

              await supabase.from('notes').insert([{
                title: noteTitle,
                category: noteCategory,
                content: noteContent,
                icon: '🧠'
              }]);
            }
            else if (actionType === 'navigate') {
              if (data.path) {
                window.location.href = data.path;
              }
            }
          } catch (e) {
            console.error('Database action failed or Invalid JSON', e);
          }
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Maaf Fawwaz, koneksi neural terganggu (${error.message}). Coba kirim pesan lagi atau periksa kuota API Gemini Anda.` 
      }]);
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

  const toggleMute = () => {
    setIsMuted(prev => {
      const newState = !prev;
      if (newState && typeof window !== 'undefined') {
        window.speechSynthesis.cancel(); // Stop speaking immediately if muted
      }
      return newState;
    });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] md:h-[calc(100vh-6rem)] -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden bg-[#0b0b0b]">
      {/* Gemini Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'} flex-shrink-0 bg-[#1e1f20] transition-all duration-300 flex flex-col rounded-r-3xl overflow-hidden shadow-xl z-20 absolute md:relative h-full`}>
        <div className="p-4 pt-6">
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-zinc-400 hover:text-white mb-4"><Menu size={20}/></button>
          <button 
            onClick={() => setMessages([])} 
            className="flex items-center justify-between w-full p-3 bg-[#0b0b0b] hover:bg-zinc-800 rounded-full text-sm font-medium text-white transition-colors"
          >
            <div className="flex items-center gap-3"><Plus size={16} /> Percakapan baru</div>
            <Edit size={14} className="text-zinc-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <div className="space-y-6">
            <button className="flex items-center gap-3 w-full p-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
              <Star size={16} /> Item Buatan Saya
            </button>
            
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 px-2 mb-2">Notebook</div>
              <button className="flex items-center gap-3 w-full p-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                <Book size={16} /> jual beli hp
              </button>
              <button className="flex items-center gap-3 w-full p-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                <Book size={16} /> XAUUSD Recovery System...
              </button>
              <button className="flex items-center gap-3 w-full p-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                <Plus size={16} /> Notebook baru
              </button>
            </div>

            <button className="flex items-center justify-between w-full p-2 text-sm font-bold text-zinc-500 hover:bg-zinc-800 rounded-lg transition-colors">
              Gem
            </button>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 px-2 mb-2">Percakapan</div>
              <button className="flex items-center justify-between w-full p-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                <span className="truncate">COREPAWASPremium GadgetBe...</span> <Pin size={12} className="text-zinc-500" />
              </button>
              <button className="flex items-center justify-between w-full p-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                <span className="truncate">Strategi Website Personal Brandi...</span> <Pin size={12} className="text-zinc-500" />
              </button>
              <button className="flex items-center justify-between w-full p-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                <span className="truncate">MAGANG/SKRIPSI</span> <Pin size={12} className="text-zinc-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 mt-auto">
          <button className="flex items-center gap-3 w-full p-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
            <Settings size={16} /> Setelan & bantuan
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-10 bg-gradient-to-b from-[#0b0b0b] to-transparent">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xl font-medium tracking-tight text-white font-outfit">
              Pawas<span className="text-zinc-500">.ai</span>
            </div>
          </div>
          <button 
            onClick={toggleMute} 
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-0 pt-24 pb-32 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatePresence>
            {messages.length === 1 && messages[0].role === 'assistant' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start justify-center pt-10 md:pt-20 pb-10"
              >
                <h1 className="text-5xl md:text-6xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 tracking-tight font-outfit mb-2">
                  Hello, Fawwaz
                </h1>
                <h2 className="text-5xl md:text-6xl font-medium text-[#f0ede4]/30 tracking-tight font-outfit mb-12">
                  How can I help you today?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {[
                    { title: 'Create schedule', sub: 'Add tasks to your deadline board', icon: <Clock size={20} className="text-blue-400" /> },
                    { title: 'Write notes', sub: 'Draft markdown notes in Workspace', icon: <Bot size={20} className="text-orange-400" /> },
                    { title: 'Market analysis', sub: 'Analyze XAUUSD structure', icon: <Sparkles size={20} className="text-purple-400" /> }
                  ].map((s, i) => (
                    <button key={i} onClick={() => setInput(s.title)} className="p-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 text-left transition-all border border-transparent hover:border-white/10 group">
                      <div className="mb-3">{s.icon}</div>
                      <p className="text-sm font-medium text-white mb-1">{s.title}</p>
                      <p className="text-xs text-zinc-500">{s.sub}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((msg, i) => {
                if (i === 0 && msg.role === 'assistant') return null; // Skip initial greeting if chat started

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-4'} group`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles size={20} className="text-purple-400" />
                      </div>
                    )}
                    
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end max-w-[80%]' : 'flex-1 max-w-[100%]'}`}>
                      {msg.image && (
                        <img src={msg.image} alt="Upload" className={`rounded-2xl max-h-80 object-cover mb-3 shadow-lg border border-white/5 ${msg.role === 'user' ? 'rounded-tr-sm' : ''}`} />
                      )}
                      {msg.text && (
                        <div className={`text-[15px] leading-relaxed custom-html-content ${
                          msg.role === 'user' 
                            ? 'bg-zinc-800 text-white px-5 py-3 rounded-3xl rounded-tr-sm' 
                            : 'text-zinc-200 py-1'
                        }`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {/* Action Buttons for AI */}
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 mt-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><ThumbsUp size={16} /></button>
                          <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><ThumbsDown size={16} /></button>
                          <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><RotateCcw size={16} /></button>
                          <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Copy size={16} /></button>
                          <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><MoreVertical size={16} /></button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start gap-4 mt-4">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-purple-400 animate-pulse" />
              </div>
              <div className="py-2">
                <Loader2 className="animate-spin text-zinc-500" size={20} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:pb-8 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/80 to-transparent">
        <div className="max-w-3xl mx-auto">
          {selectedImage && (
            <div className="relative inline-block mb-3 ml-4">
              <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border-2 border-zinc-700 shadow-xl" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-zinc-800 text-white rounded-full p-1 shadow-lg hover:bg-zinc-700 transition-colors">
                <X size={12} />
              </button>
            </div>
          )}
          
          <div className="flex gap-2 items-end bg-zinc-900 rounded-3xl p-2 shadow-2xl border border-white/5 focus-within:border-white/20 transition-all">
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <ImageIcon size={20} />
            </button>
            <textarea 
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'inherit';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask Pawas AI"
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder:text-zinc-500 py-3 resize-none max-h-[150px] custom-scrollbar"
              rows={1}
            />
            <div className="flex items-center gap-1 mb-1 mr-1">
              {input.trim() || selectedImage ? (
                <button 
                  onClick={() => handleSend(input)} 
                  disabled={isLoading} 
                  className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              ) : (
                <button 
                  onClick={startListening} 
                  className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Mic size={20} />
                </button>
              )}
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-3 font-medium">
            Pawas AI may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AssistantPage;
