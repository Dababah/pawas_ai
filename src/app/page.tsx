'use client';

import React from 'react';
import { BookOpen, TrendingUp, Smartphone, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Halo, Pawas</h1>
          <p className="text-zinc-500 text-sm italic">"1% Better Every Day"</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <span className="text-xs font-bold">PA</span>
        </div>
      </header>

      {/* Tugas Kuliah Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-3 mb-4 text-emerald-400">
          <BookOpen size={20} />
          <h2 className="font-semibold">Tugas Kuliah Terdekat</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
            <div>
              <p className="text-sm font-medium">Kriptografi - Tugas 4</p>
              <p className="text-xs text-zinc-500">Materi: RSA & AES</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-orange-400 flex items-center gap-1">
                <Clock size={12} /> 14 Jam lagi
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trading Statistics Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-3 mb-4 text-blue-400">
          <TrendingUp size={20} />
          <h2 className="font-semibold">Profit Trading Minggu Ini</h2>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-white">$142.50</p>
            <p className="text-xs text-zinc-500 mt-1">+12.4% vs Minggu Lalu</p>
          </div>
          <div className="flex gap-1 items-end h-12">
            {[30, 45, 25, 60, 40, 70, 50].map((h, i) => (
              <div 
                key={i} 
                className="w-2 bg-blue-500/50 rounded-t-sm transition-all hover:bg-blue-400" 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Inventory Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-3 mb-4 text-purple-400">
          <Smartphone size={20} />
          <h2 className="font-semibold">Stok Gadget Ready (Core Pawas)</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-xs text-zinc-500 mb-1">iPhone 13</p>
            <p className="text-sm font-bold">3 Unit</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-xs text-zinc-500 mb-1">iPhone 11</p>
            <p className="text-sm font-bold">5 Unit</p>
          </div>
        </div>
      </motion.div>

      {/* Business Quick Access */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-3 mb-4 text-orange-400">
          <Globe size={20} />
          <h2 className="font-semibold">Professional Links</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { name: 'Admin', icon: 'CP' },
            { name: 'Charts', icon: 'TV' },
            { name: 'Portal', icon: 'UM' },
            { name: 'Database', icon: 'DB' }
          ].map((link) => (
            <div key={link.name} className="flex flex-col items-center gap-2 min-w-[60px]">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-xs text-zinc-400">
                {link.icon}
              </div>
              <span className="text-[10px] text-zinc-500">{link.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
