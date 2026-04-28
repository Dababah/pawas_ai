'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Clock, ArrowUpRight, Sparkles, Zap, Activity, Package, GraduationCap, Dumbbell, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MarketWidget from '@/components/MarketWidget';

export default function Dashboard() {
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, totalNotes: 0, totalInventory: 0 });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [tasksRes, notesRes, invRes] = await Promise.all([
        supabase.from('tasks').select('*').order('deadline', { ascending: true }),
        supabase.from('notes').select('id'),
        supabase.from('inventory').select('id, status'),
      ]);
      const tasks = tasksRes.data || [];
      setRecentTasks(tasks.filter(t => t.status === 'pending').slice(0, 4));
      setStats({
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        totalNotes: notesRes.data?.length || 0,
        totalInventory: (invRes.data || []).filter(i => i.status === 'ready').length,
      });
    };
    fetchData();
  }, []);

  const getTimeLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h left`;
    return `${Math.floor(hours / 24)}d left`;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10">
      {/* Hero Header */}
      <header className="space-y-3">
        <motion.div variants={itemVariants} className="flex items-center gap-2 text-[#8c7851] text-[10px] font-black uppercase tracking-[0.3em]">
          <Sparkles size={12} className="text-[#8c7851]" />
          <span>Neural Dashboard</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400">Command Center</span>
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black text-white tracking-tight font-outfit">
          Halo, <span className="text-gradient-gold">Fawwaz</span>
        </motion.h1>
        <motion.p variants={itemVariants} className="text-zinc-500 text-sm max-w-lg leading-relaxed">
          Neural workspace siap. Tekan <kbd className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[#8c7851] mx-1">Ctrl+J</kbd> untuk Command Center atau gunakan voice command.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Nav Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <Link href="/notes" className="group block p-5 glass-card relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-5">
                  <ArrowUpRight size={18} className="text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen size={22} />
                </div>
                <h3 className="text-base font-bold text-white mb-1 font-outfit">Workspace</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Block editor, catatan kuliah & project notes.</p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stats.totalNotes} Pages</span>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link href="/trading" className="group block p-5 glass-card relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-5">
                  <ArrowUpRight size={18} className="text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp size={22} />
                </div>
                <h3 className="text-base font-bold text-white mb-1 font-outfit">Trading Journal</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Analisis teknikal XAUUSD & BTCUSD.</p>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">SMC Strategy</span>
                </div>
              </Link>
            </motion.div>
          </section>

          {/* Market Widget */}
          <motion.section variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={12} /> Live Market
              </h2>
              <span className="text-[9px] text-zinc-700 font-medium">Auto-refresh 30s</span>
            </div>
            <MarketWidget />
          </motion.section>

          {/* Core Metrics */}
          <motion.section variants={itemVariants} className="space-y-3">
            <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
              <Zap size={12} /> Core Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Stock Ready', val: `${stats.totalInventory}`, icon: <Package size={14} />, color: 'text-white', accent: 'bg-white/5' },
                { label: 'Tasks Done', val: `${stats.completedTasks}/${stats.totalTasks}`, icon: <GraduationCap size={14} />, color: 'text-emerald-400', accent: 'bg-emerald-500/5' },
                { label: 'Workspace', val: `${stats.totalNotes}`, icon: <BookOpen size={14} />, color: 'text-amber-400', accent: 'bg-amber-500/5' },
                { label: 'AI Ready', val: 'Online', icon: <Command size={14} />, color: 'text-[#8c7851]', accent: 'bg-[#8c7851]/5' },
              ].map((stat, idx) => (
                <div key={idx} className={`p-4 glass-panel group hover:border-white/10 transition-all`}>
                  <div className={`w-7 h-7 ${stat.accent} rounded-lg flex items-center justify-center ${stat.color} mb-2`}>
                    {stat.icon}
                  </div>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-lg font-black ${stat.color} font-outfit`}>{stat.val}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Sidebar: Deadlines */}
        <div className="space-y-6">
          <motion.section variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={12} /> Upcoming Deadlines
              </h2>
              <Link href="/tasks" className="text-[9px] text-zinc-700 hover:text-white transition-colors uppercase font-black tracking-widest">View All</Link>
            </div>

            <div className="grid gap-3">
              {recentTasks.length > 0 ? recentTasks.map((task, idx) => {
                const timeLeft = task.deadline ? getTimeLeft(task.deadline) : '';
                const isUrgent = timeLeft === 'Overdue' || (task.deadline && new Date(task.deadline).getTime() - Date.now() < 86400000);
                return (
                  <Link href="/tasks" key={idx}>
                    <motion.div variants={itemVariants} className={`glass-panel p-4 space-y-3 relative overflow-hidden group cursor-pointer transition-all ${isUrgent ? 'border-red-500/20 hover:border-red-500/40' : 'hover:border-white/10'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? 'bg-red-500/10 text-red-400' : 'bg-[#8c7851]/10 text-[#8c7851]'}`}>
                          <Zap size={16} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{task.title}</p>
                          <p className="text-[10px] text-zinc-600">{task.matkul || 'General'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-red-400 animate-pulse' : 'bg-amber-400'}`} />
                          <span className={`text-[9px] font-black uppercase ${isUrgent ? 'text-red-400' : 'text-amber-500'}`}>{timeLeft || 'No deadline'}</span>
                        </div>
                        {task.deadline && (
                          <span className="text-[9px] font-bold text-zinc-600">
                            {new Date(task.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                );
              }) : (
                <div className="text-center py-8 glass-panel">
                  <p className="text-zinc-600 text-xs font-bold uppercase">No Active Deadlines</p>
                  <p className="text-[10px] text-zinc-700 mt-1">Gunakan Ctrl+J untuk membuat task baru</p>
                </div>
              )}
            </div>
          </motion.section>

          {/* AI Quick Action */}
          <motion.div variants={itemVariants}>
            <Link href="/assistant" className="group block p-5 glass-card relative overflow-hidden border-[#8c7851]/10 hover:border-[#8c7851]/30">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8c7851]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8c7851]/20 to-[#6b4e3d]/10 rounded-xl flex items-center justify-center mb-3">
                  <Sparkles size={20} className="text-[#8c7851]" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1 font-outfit">Neural AI Chat</h3>
                <p className="text-[10px] text-zinc-600 leading-relaxed">Full conversation mode dengan konteks database.</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
