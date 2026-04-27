'use client';

import React from 'react';
import { BookOpen, TrendingUp, Smartphone, Clock, Globe, ArrowUpRight, Search, Sparkles, Zap, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Dashboard = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div variants={item} className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            <Sparkles size={12} className="text-white/40" />
            <span>Neural Dashboard</span>
            <span className="text-zinc-800">/</span>
            <span className="text-white">Overview</span>
          </motion.div>
          <motion.h1 variants={item} className="text-4xl md:text-5xl font-black text-white tracking-tight font-outfit">
            Halo, <span className="text-zinc-500">Fawwaz</span>
          </motion.h1>
          <motion.p variants={item} className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed">
            Sistem asisten neural Anda siap membantu mengelola workspace, trading, dan bisnis.
          </motion.p>
        </div>
        
        <motion.div variants={item} className="hidden lg:flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
              </div>
            ))}
          </div>
          <span className="text-xs text-zinc-500 font-medium">+3 active nodes</span>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={item}>
              <Link href="/notes" className="group block p-6 glass-card relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-6">
                  <ArrowUpRight size={20} className="text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-outfit">Materi Kuliah</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">Akses cepat ke repositori catatan Kriptografi & IT UMY secara terorganisir.</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">12 Files</span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Update 2h ago</span>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link href="/trading" className="group block p-6 glass-card relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-6">
                  <ArrowUpRight size={20} className="text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-outfit">Trading Journal</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">Analisis teknikal harian untuk market XAUUSD & BTCUSD dengan manajemen risiko.</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                  <span className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">Active Margin</span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">4 Open Positions</span>
                </div>
              </Link>
            </motion.div>
          </section>

          <section className="space-y-4">
            <motion.div variants={item} className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} /> Core Pawas Metrics
              </h2>
              <span className="text-[10px] text-zinc-600 font-medium">Real-time Data</span>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Stock Ready', val: '12 Unit', sub: 'iPhone/Mac', color: 'text-white' },
                { label: 'Total Margin', val: 'Rp 4.2M', sub: 'This Month', color: 'text-emerald-400' },
                { label: 'Win Rate', val: '68%', sub: 'Last 20 Trades', color: 'text-blue-400' },
                { label: 'GPA Target', val: '3.85', sub: 'Current: 3.78', color: 'text-purple-400' },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={item} className="p-5 glass-panel group hover:border-white/20 transition-all">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color} mb-1 font-outfit`}>{stat.val}</p>
                  <p className="text-[10px] text-zinc-600">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Status Area */}
        <div className="space-y-8">
          <section className="space-y-4">
            <motion.div variants={item} className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={14} /> Deadlines
              </h2>
              <button className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-bold tracking-widest">View All</button>
            </motion.div>
            
            <motion.div variants={item} className="glass-panel p-5 space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-orange-500/10 transition-all" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                  <Zap size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Tugas Kriptografi</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">Implementasi algoritma RSA dengan Python.</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] text-orange-500 font-bold uppercase">14 Jam Lagi</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/5 rounded text-zinc-400 font-bold uppercase tracking-tighter">High Priority</span>
              </div>
            </motion.div>

            <motion.div variants={item} className="glass-panel p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                  <Target size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Meeting Supplier</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">Update stok iPhone 15 Series untuk Pawas.ai</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Besok, 09:00 AM</span>
              </div>
            </motion.div>
          </section>

          <section className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/5 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 opacity-10">
              <Sparkles size={80} />
            </div>
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Smartphone size={16} className="text-zinc-400" /> Neural Pro Tip
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Gunakan mode <span className="text-white">Command + K</span> untuk mencari catatan kuliah secara instan dari manapun.
            </p>
            <button className="w-full py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors">
              Upgrade System
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

