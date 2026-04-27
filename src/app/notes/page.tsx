'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, MoreVertical, Hash, List, Type, Image as ImageIcon, Layout, ArrowLeft, Sparkles, Clock, Star, Share2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { askPawasAI } from '@/lib/gemini';

const NotesPage = () => {
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('notes').select('*').order('id', { ascending: false });
    if (data) {
      setNotes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const tabs = ['All', 'Kuliah', 'Bisnis', 'Trading', 'Personal'];
  const filteredNotes = activeTab === 'All' ? notes : notes.filter(n => n.category?.toLowerCase() === activeTab.toLowerCase());

  const addNewNote = async () => {
    const newNote = {
      title: 'Untitled Note',
      icon: '📝',
      category: activeTab === 'All' ? 'Personal' : activeTab,
      content: 'Start writing your neural notes here...'
    };
    const { data, error } = await supabase.from('notes').insert([newNote]).select();
    if (data) {
      setNotes([data[0], ...notes]);
      setActiveNote(data[0].id);
    } else {
      const mockId = Date.now();
      setNotes([{ id: mockId, ...newNote }, ...notes]);
      setActiveNote(mockId);
    }
  };

  const handleEditorCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleEditorCommand('insertImage', event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const deleteNote = async (id: number) => {
    if (confirm('Hapus catatan ini secara permanen?')) {
      await supabase.from('notes').delete().eq('id', id);
      setNotes(prev => prev.filter(n => n.id !== id));
      setActiveNote(null);
    }
  };

  const updateNote = async (id: number, updates: any) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    await supabase.from('notes').update(updates).eq('id', id);
  };

  const shareNote = () => {
    const note = notes.find(n => n.id === activeNote);
    if (!note) return;
    
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.content.replace(/<[^>]*>/g, ''),
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${note.title}\n\n${note.content.replace(/<[^>]*>/g, '')}`);
      alert('Konten catatan telah disalin ke clipboard.');
    }
  };

  const generateNoteContent = async () => {
    if (!aiPrompt.trim() || !activeNote) return;
    setIsGenerating(true);
    try {
      const response = await askPawasAI(`Tolong buatkan isi catatan/artikel/materi yang sangat profesional dan rapi untuk topik: "${aiPrompt}". Gunakan paragraf, bullet points (<ul><li>), atau header (<h3>) HTML standar jika diperlukan agar tampilannya bagus. Jangan berikan balasan percakapan, cukup langsung teks materi utamanya saja tanpa backticks markdown.`);
      
      const note = notes.find(n => n.id === activeNote);
      if (!note) return;
      
      const cleanResponse = response.replace(/```html|```/g, '');
      const existingContent = note.content === 'Start writing your neural notes here...' ? '' : note.content + '<br/><br/>';
      const newContent = `${existingContent}<h3>✨ AI Generated: ${aiPrompt}</h3><br/>${cleanResponse}`;
      
      updateNote(activeNote, { content: newContent });
      setAiPrompt('');
    } catch (error) {
      alert('Koneksi Neural gagal. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {!activeNote ? (
          <motion.div 
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 pb-20"
          >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                  <Sparkles size={12} className="text-purple-500" />
                  <span>Neural Workspace</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white font-outfit">Knowledge Base</h1>
              </div>
              
              <button 
                onClick={addNewNote}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#f0ede4] text-[#0d1a15] rounded-xl text-sm font-bold hover:bg-[#8c7851] hover:text-[#f0ede4] transition-all shadow-lg shadow-white/5 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>New Page</span>
              </button>
            </header>

            <div className="flex flex-col gap-4">
              <motion.div variants={itemVariants} className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#8c7851] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search your neural network..."
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-[#8c7851]/50 focus:bg-[#8c7851]/5 transition-all placeholder:text-zinc-700"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeTab === tab 
                        ? 'bg-[#8c7851] text-[#f0ede4] shadow-lg shadow-[#8c7851]/20' 
                        : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Quick Access</h2>
                  <Star size={12} className="text-zinc-800" />
                </div>
                <div className="grid gap-3">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <p className="text-zinc-500 text-sm font-medium">No notes found in '{activeTab}'.</p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <motion.button
                        key={note.id}
                        variants={itemVariants}
                        onClick={() => setActiveNote(note.id)}
                        className="w-full glass-panel p-5 flex items-center justify-between group hover:border-[#8c7851]/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform group-hover:bg-[#8c7851]/10">
                            {note.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">{note.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-[#8c7851] font-bold uppercase tracking-tighter bg-[#8c7851]/10 px-2 py-0.5 rounded-full">{note.category}</span>
                              <span className="w-1 h-1 rounded-full bg-zinc-800" />
                              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">Saved in Neural Base</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="p-2 text-zinc-800 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.button>
                    ))
                  )}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Neural Systems</h2>
                  <Layout size={12} className="text-zinc-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'New Database', icon: <Layout className="text-blue-500" />, sub: 'Structured data', cmd: () => alert('Database Neural sedang diinisialisasi...') },
                    { label: 'Templates', icon: <List className="text-purple-500" />, sub: 'Efficiency nodes', cmd: () => alert('Memuat template profesional...') },
                    { label: 'Cloud Sync', icon: <Clock className="text-emerald-500" />, sub: 'Real-time backup', cmd: () => alert('Sinkronisasi awan aktif.') },
                    { label: 'Neural AI', icon: <Sparkles className="text-orange-500" />, sub: 'Auto completion', cmd: () => window.location.href = '/assistant' },
                  ].map((sys, idx) => (
                    <motion.div 
                      key={idx} 
                      variants={itemVariants} 
                      onClick={sys.cmd}
                      className="p-5 glass-panel group hover:bg-white/[0.02] cursor-pointer transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {sys.icon}
                      </div>
                      <p className="text-xs font-bold text-white mb-1">{sys.label}</p>
                      <p className="text-[10px] text-zinc-600 font-medium">{sys.sub}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-80px)]"
          >
            <header className="flex items-center justify-between py-4 border-b border-white/5 mb-10">
              <button 
                onClick={() => setActiveNote(null)} 
                className="text-zinc-500 hover:text-white transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={16} /> Back to Library
              </button>
              <div className="flex items-center gap-4">
                <button 
                  onClick={shareNote}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={() => activeNote && deleteNote(activeNote)}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-10 pr-2">
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center text-5xl shadow-2xl border border-white/5">
                  {notes.find(n => n.id === activeNote)?.icon}
                </div>
                <h1 
                  className="text-4xl md:text-6xl font-black text-white tracking-tight outline-none font-outfit" 
                  contentEditable 
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newTitle = e.currentTarget.textContent || '';
                    updateNote(activeNote, { title: newTitle });
                  }}
                >
                  {notes.find(n => n.id === activeNote)?.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 items-center py-4 border-y border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Category:</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-zinc-300 font-bold uppercase">
                      {notes.find(n => n.id === activeNote)?.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Modified:</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">Oct 28, 2026 • 03:15 AM</span>
                  </div>
                </div>
              </div>

              {/* AI Generator Bar */}
              <div className="bg-[#8c7851]/10 border border-[#8c7851]/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center shadow-lg transition-all focus-within:border-[#8c7851]/50">
                <div className="flex items-center gap-3 w-full">
                  <Sparkles size={20} className="text-[#8c7851] animate-pulse shrink-0" />
                  <input 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generateNoteContent()}
                    placeholder="Command Neural AI to write something..."
                    className="flex-1 w-full bg-transparent border-none outline-none text-[#f0ede4] placeholder:text-[#8c7851]/40 text-sm font-medium"
                    disabled={isGenerating}
                  />
                  <button 
                    onClick={generateNoteContent}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="hidden sm:block px-5 py-2.5 bg-[#8c7851] text-[#0d1a15] rounded-xl text-xs font-bold hover:bg-[#f0ede4] transition-all disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                {/* Mobile Generate Button */}
                <button 
                  onClick={generateNoteContent}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="sm:hidden w-full mt-2 px-5 py-2.5 bg-[#8c7851] text-[#0d1a15] rounded-xl text-xs font-bold hover:bg-[#f0ede4] transition-all disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Neural Content'}
                </button>
              </div>

              <div 
                className="text-lg md:text-xl text-zinc-400 leading-relaxed outline-none min-h-[400px] font-medium custom-html-content"

                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newContent = e.currentTarget.innerHTML;
                  updateNote(activeNote, { content: newContent });
                }}
              >
                {notes.find(n => n.id === activeNote)?.content}
              </div>
            </div>

            <div className="mt-auto py-6 border-t border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-xl">
              <div className="flex gap-2">
                {[
                  { icon: <Type size={20} />, cmd: () => handleEditorCommand('bold'), label: 'Bold' },
                  { icon: <List size={20} />, cmd: () => handleEditorCommand('insertUnorderedList'), label: 'List' },
                  { icon: <ImageIcon size={20} />, cmd: handleImageUpload, label: 'Image' },
                  { icon: <Hash size={20} />, cmd: () => handleEditorCommand('formatBlock', '<h3>'), label: 'Heading' }
                ].map((tool, idx) => (
                  <button 
                    key={idx} 
                    onClick={tool.cmd}
                    title={tool.label}
                    className="p-2.5 text-zinc-600 hover:text-[#f0ede4] hover:bg-white/5 rounded-xl transition-all active:scale-95"
                  >
                    {tool.icon}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
                AI Auto-saving enabled
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;

