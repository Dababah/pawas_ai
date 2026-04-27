'use client';

import React, { useState } from 'react';
import { FileText, Plus, Search, MoreVertical, Hash, List, Type, Image as ImageIcon, Layout, ArrowLeft, Sparkles, Clock, Star, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotesPage = () => {
  const [activeNote, setActiveNote] = useState<number | null>(null);
  
  const [notes, setNotes] = useState([
    { id: 1, title: 'IT Study: RSA Algorithm', icon: '🎓', category: 'Kuliah', content: 'RSA is an asymmetric cryptography algorithm that is widely used for secure data transmission. It is based on the mathematical difficulty of factoring the product of two large prime numbers. The security of RSA relies on the fact that while it is easy to multiply two large prime numbers together, it is extremely difficult to reverse the process...' },
    { id: 2, title: 'Business Plan: Core Pawas 2026', icon: '🚀', category: 'Bisnis', content: 'Expanding to high-end gadgets market in Southeast Asia. Our core value proposition remains transparency and premium service. Key milestones include opening a flagship experience center and integrating AI-driven inventory management.' },
    { id: 3, title: 'Trading Strategy: SMC M15', icon: '📉', category: 'Trading', content: 'Focus on Liquidity Grab and Break of Market Structure (BMS). Using M15 for bias and M1 for refined entries. Risk management remains the top priority with a strict 1:3 RR ratio on every execution.' },
  ]);

  const addNewNote = () => {
    const newId = notes.length + 1;
    const newNote = {
      id: newId,
      title: 'Untitled Note',
      icon: '📝',
      category: 'General',
      content: 'Start writing your neural notes here...'
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newId);
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

            <motion.div variants={itemVariants} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search across all pages..."
                className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-white/10 focus:bg-zinc-900/50 transition-all placeholder:text-zinc-700"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Quick Access</h2>
                  <Star size={12} className="text-zinc-800" />
                </div>
                <div className="grid gap-3">
                  {notes.map((note) => (
                    <motion.button
                      key={note.id}
                      variants={itemVariants}
                      onClick={() => setActiveNote(note.id)}
                      className="w-full glass-panel p-5 flex items-center justify-between group hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {note.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">{note.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">{note.category}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">Updated 2h ago</span>
                          </div>
                        </div>
                      </div>
                      <MoreVertical size={16} className="text-zinc-800 group-hover:text-zinc-500 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Neural Systems</h2>
                  <Layout size={12} className="text-zinc-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'New Database', icon: <Layout className="text-blue-500" />, sub: 'Structured data' },
                    { label: 'Templates', icon: <List className="text-purple-500" />, sub: 'Efficiency nodes' },
                    { label: 'Cloud Sync', icon: <Clock className="text-emerald-500" />, sub: 'Real-time backup' },
                    { label: 'Neural AI', icon: <Sparkles className="text-orange-500" />, sub: 'Auto completion' },
                  ].map((sys, idx) => (
                    <motion.div key={idx} variants={itemVariants} className="p-5 glass-panel group hover:bg-white/[0.02] cursor-pointer transition-all">
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
                <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <Share2 size={18} />
                </button>
                <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <MoreVertical size={18} />
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

              <div 
                className="text-lg md:text-xl text-zinc-400 leading-relaxed outline-none min-h-[400px] font-medium"
                contentEditable 
                suppressContentEditableWarning
              >
                {notes.find(n => n.id === activeNote)?.content}
              </div>
            </div>

            <div className="mt-auto py-6 border-t border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-xl">
              <div className="flex gap-2">
                {[
                  <Type key="t" size={20} />, 
                  <List key="l" size={20} />, 
                  <ImageIcon key="i" size={20} />, 
                  <Hash key="h" size={20} />
                ].map((icon, idx) => (
                  <button key={idx} className="p-2.5 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    {icon}
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

