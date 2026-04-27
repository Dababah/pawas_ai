'use client';

import React from 'react';
import { BookOpen, TrendingUp, Smartphone, Clock, Globe, ArrowUpRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Dashboard = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">
          <span>Personal Workspace</span>
          <span>/</span>
          <span className="text-zinc-200">Home</span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Halo, Fawwaz</h1>
          <p className="text-zinc-500 text-lg">Pusat komando asisten neural Anda.</p>
        </div>
      </header>

      <div className="grid gap-8">
        {/* Quick Actions Grid (Notion Style) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/notes" className="group p-6 bg-[#111111] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <BookOpen size={20} />
              </div>
              <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-white mb-1">Materi Kuliah</h3>
            <p className="text-xs text-zinc-500">Akses cepat ke catatan Kriptografi & IT UMY.</p>
          </Link>

          <Link href="/trading" className="group p-6 bg-[#111111] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <TrendingUp size={20} />
              </div>
              <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-white mb-1">Trading Journal</h3>
            <p className="text-xs text-zinc-500">Evaluasi market XAUUSD & BTCUSD harian.</p>
          </Link>
        </section>

        {/* Status Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Upcoming Events</h2>
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Pengumpulan Tugas Kriptografi</p>
                <p className="text-[10px] text-zinc-500">14 Jam lagi • Materi RSA</p>
              </div>
            </div>
            <span className="text-[10px] px-3 py-1 bg-zinc-800 rounded-full text-zinc-400 font-bold uppercase tracking-tighter">Priority</span>
          </div>
        </section>

        {/* Business Glance */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Core Pawas Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
              <p className="text-[10px] text-zinc-500 mb-1">Stock Ready</p>
              <p className="text-lg font-bold text-white">12 Unit</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
              <p className="text-[10px] text-zinc-500 mb-1">Total Margin</p>
              <p className="text-lg font-bold text-emerald-400">Rp 4.2M</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
              <p className="text-[10px] text-zinc-500 mb-1">Trades (W)</p>
              <p className="text-lg font-bold text-blue-400">14 (68%)</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
              <p className="text-[10px] text-zinc-500 mb-1">GPA Target</p>
              <p className="text-lg font-bold text-purple-400">3.85</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
