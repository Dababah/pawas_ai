'use client';

import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WebWorkspace = () => {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  
  const tools = [
    { name: 'MyKlass UMY', url: 'https://myklass-eng.umy.ac.id/my/courses.php', color: 'text-emerald-400', icon: 'MK' },
    { name: 'Core Pawas Admin', url: 'https://vercel.com/dababahs-projects/corepawas-hp/J6aHVY47LZz65Q6BvPRTyJothR11', color: 'text-purple-400', icon: 'CP' },
    { name: 'TradingView', url: 'https://www.tradingview.com/chart', color: 'text-blue-400', icon: 'TV' },
    { name: 'Supabase Console', url: 'https://supabase.com/dashboard', color: 'text-zinc-400', icon: 'SC' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {!activeUrl ? (
        <div className="space-y-8">
          <header className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-widest">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-zinc-200">Web Apps</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Professional Links</h1>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveUrl(tool.url)}
                className="group p-6 bg-[#111111] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all text-center flex flex-col items-center gap-4"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black transition-transform group-hover:scale-110 ${tool.color}`}>
                  {tool.icon}
                </div>
                <span className="text-xs font-semibold text-zinc-300">{tool.name}</span>
              </motion.button>
            ))}
          </div>

          <div className="p-6 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Quick Browse</p>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="https://..."
                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setActiveUrl((e.target as HTMLInputElement).value);
                }}
              />
              <button className="p-2.5 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="bg-[#0b0b0b] p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveUrl(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 max-w-[200px] truncate uppercase tracking-widest">
                <Globe size={10} />
                {activeUrl.replace('https://', '').split('/')[0]}
              </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-600">
              <ChevronLeft size={18} className="hover:text-zinc-300 cursor-pointer" />
              <ChevronRight size={18} className="hover:text-zinc-300 cursor-pointer" />
              <RefreshCw size={16} className="hover:text-zinc-300 cursor-pointer" />
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
