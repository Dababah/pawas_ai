'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = [
    { title: 'RSA Algorithm Detail', type: 'Note', path: '/notes', icon: <FileText size={14} /> },
    { title: 'Tugas Kriptografi', type: 'Task', path: '/tasks', icon: <Clock size={14} /> },
    { title: 'XAUUSD Strategy', type: 'Trade', path: '/trading', icon: <TrendingUp size={14} /> },
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl bg-[#0d1a15] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
            <Search className="text-zinc-500" size={18} />
            <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search neural network..."
              className="flex-1 w-full bg-transparent border-none outline-none text-[#f0ede4] placeholder:text-zinc-600 text-sm font-medium"
            />
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors">
              <X size={18} />

            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.length > 0 ? (
              <div className="space-y-1">
                {results.length > 0 ? results.map((res, i) => (
                  <button 
                    key={i}
                    onClick={() => { router.push(res.path); onClose(); }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-[#8c7851] group-hover:text-[#f0ede4]">
                        {res.icon}
                      </div>
                      <span className="text-sm text-[#f0ede4] font-medium">{res.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#8c7851]/40 uppercase tracking-widest">{res.type}</span>
                  </button>
                )) : (
                  <div className="p-10 text-center text-[#8c7851]/60 text-sm">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Recently Accessed</p>
                <div className="flex flex-wrap gap-2">
                  {['Kriptografi', 'XAUUSD', 'Suppliers', 'RSA'].map((tag) => (
                    <button key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-zinc-400 hover:text-white hover:border-[#8c7851]/50 hover:bg-[#8c7851]/10 transition-all">
                      <Sparkles size={12} className="text-[#8c7851]" /> {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/20 flex flex-wrap items-center justify-between gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <span className="hidden sm:inline">Press Enter to select</span>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">↑↓ Navigate</span>
              <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">ESC Close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SearchModal;
