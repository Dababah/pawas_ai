'use client';

import React, { useState } from 'react';
import { FileText, Plus, Search, MoreVertical, Hash, List, Type, Image as ImageIcon, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotesPage = () => {
  const [activeNote, setActiveNote] = useState<number | null>(null);
  
  const notes = [
    { id: 1, title: 'IT Study: RSA Algorithm', icon: '🎓', category: 'Kuliah', content: '# RSA Algorithm\n\nRSA is an asymmetric cryptography algorithm...' },
    { id: 2, title: 'Business Plan: Core Pawas 2026', icon: '🚀', category: 'Bisnis', content: 'Expanding to high-end gadgets...' },
    { id: 3, title: 'Trading Strategy: SMC M15', icon: '📉', category: 'Trading', content: 'Focus on Liquidity Grab and BMS...' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {!activeNote ? (
        <div className="space-y-6">
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <FileText className="text-zinc-400" size={24} />
              <h1 className="text-xl font-bold text-white">Workspace</h1>
            </div>
            <button className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
              <Plus size={20} />
            </button>
          </header>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="text" 
              placeholder="Search pages..."
              className="w-full bg-[#111111] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-1 mb-3">Recently Viewed</h2>
            {notes.map((note, i) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveNote(note.id)}
                className="w-full glass-card p-4 flex items-center justify-between group hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{note.icon}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-zinc-200">{note.title}</p>
                    <p className="text-[10px] text-zinc-500">{note.category}</p>
                  </div>
                </div>
                <MoreVertical size={14} className="text-zinc-700 group-hover:text-zinc-400" />
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col gap-2">
              <Layout size={18} className="text-blue-500" />
              <span className="text-xs font-medium text-zinc-300">New Database</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col gap-2">
              <List size={18} className="text-purple-500" />
              <span className="text-xs font-medium text-zinc-300">Templates</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
          <header className="flex items-center justify-between mb-8">
            <button onClick={() => setActiveNote(null)} className="text-zinc-500 hover:text-white text-sm flex items-center gap-1">
              <Hash size={14} /> Workspace
            </button>
            <div className="flex gap-4 text-zinc-500">
              <MoreVertical size={18} />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto space-y-6">
            <div className="flex flex-col gap-4">
              <span className="text-4xl">{notes.find(n => n.id === activeNote)?.icon}</span>
              <h1 className="text-3xl font-bold text-white outline-none" contentEditable suppressContentEditableWarning>
                {notes.find(n => n.id === activeNote)?.title}
              </h1>
            </div>

            <div className="space-y-4 text-zinc-400">
              <div className="flex items-center gap-2 text-xs border-b border-white/5 pb-2 mb-6">
                <span className="text-zinc-600">Category:</span>
                <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                  {notes.find(n => n.id === activeNote)?.category}
                </span>
              </div>

              <div 
                className="min-h-[200px] outline-none text-sm leading-relaxed prose prose-invert"
                contentEditable 
                suppressContentEditableWarning
              >
                {notes.find(n => n.id === activeNote)?.content}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 flex gap-4 text-zinc-600">
            <button className="hover:text-zinc-300"><Type size={18} /></button>
            <button className="hover:text-zinc-300"><List size={18} /></button>
            <button className="hover:text-zinc-300"><ImageIcon size={18} /></button>
            <button className="hover:text-zinc-300"><Hash size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
