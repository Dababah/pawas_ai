'use client';

import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WebWorkspace = () => {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  
  const tools = [
    { name: 'Core Pawas Admin', url: 'https://corepawas.com/admin', color: 'text-purple-400', icon: 'CP' },
    { name: 'TradingView', url: 'https://www.tradingview.com/chart', color: 'text-blue-400', icon: 'TV' },
    { name: 'MyUMY Portal', url: 'https://krs.umy.ac.id', color: 'text-emerald-400', icon: 'UM' },
    { name: 'Supabase Console', url: 'https://supabase.com/dashboard', color: 'text-zinc-400', icon: 'SC' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {!activeUrl ? (
        <div className="space-y-6">
          <header className="flex items-center gap-2 mb-6">
            <Globe className="text-blue-400" size={24} />
            <h1 className="text-xl font-bold text-white">Professional Workspace</h1>
          </header>

          <p className="text-sm text-zinc-500 mb-4">Akses cepat ke platform bisnis dan alat profesional harian Anda.</p>

          <div className="grid grid-cols-2 gap-4">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveUrl(tool.url)}
                className="glass-card p-6 flex flex-col items-center gap-3 text-center transition-all hover:border-white/20 active:scale-95"
              >
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-lg font-black ${tool.color}`}>
                  {tool.icon}
                </div>
                <span className="text-xs font-bold text-white">{tool.name}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-8 glass-card p-5 border-dashed border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Custom URL</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://..."
                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setActiveUrl((e.target as HTMLInputElement).value);
                }}
              />
              <button className="p-2 bg-blue-600 rounded-xl">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-black rounded-t-3xl overflow-hidden border border-white/10">
          <div className="bg-[#111111] p-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveUrl(null)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 max-w-[150px] truncate">
                <Globe size={12} />
                {activeUrl.replace('https://', '')}
              </div>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <ChevronLeft size={18} />
              <ChevronRight size={18} />
              <RefreshCw size={16} />
            </div>
          </div>
          <iframe 
            src={activeUrl} 
            className="flex-1 w-full bg-white"
            title="Workspace Frame"
          />
        </div>
      )}
    </div>
  );
};

export default WebWorkspace;
