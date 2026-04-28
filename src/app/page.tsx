'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Clock, ArrowUpRight, Sparkles, Zap, Activity, Package, GraduationCap, Dumbbell, Command, AlertTriangle, CheckCircle2, DollarSign, ListTodo, Plus, Settings, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MarketWidget from '@/components/MarketWidget';

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tasksRes, invRes, schedRes] = await Promise.all([
        supabase.from('task_management').select('*').order('deadline', { ascending: true }).limit(5),
        supabase.from('inventory_hp').select('*').order('created_at', { ascending: false }),
        supabase.from('schedules').select('*').order('scheduled_at', { ascending: true }).limit(5),
      ]);
      
      setTasks(tasksRes.data || []);
      setInventory(invRes.data || []);
      setSchedules(schedRes.data || []);
      setLoading(false);
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

  const readyStock = inventory.filter(i => i.status_barang === 'Ready').length;
  const soldThisWeek = inventory.filter(i => i.status_barang === 'Sold').length; // Simplified

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="space-y-12 pb-20 pt-4"
    >
      {/* --- APPFLOWY STYLE HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.04] pb-8">
        <div className="space-y-1">
          <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-white tracking-tight font-inter">
            Good Evening, <span className="text-blue-400">Fawwaz</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-zinc-500 text-sm font-medium">
            Manage your workspace, tasks, and neural assets in one place.
          </motion.p>
        </div>
        
        <motion.div variants={itemVariants} className="flex items-center gap-3">
           <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2">
             <Plus size={16} /> New Page
           </button>
           <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-white/[0.06]">
             <Settings size={18} />
           </button>
        </motion.div>
      </header>

      {/* --- COMMAND CENTER GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMN 1: RECENT DOCUMENTS (Left - 8 Units) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
              <Clock size={14} className="text-amber-500" /> Urgent Deadlines
            </h2>
            <Link href="/tasks" className="text-[9px] text-zinc-700 hover:text-white transition-colors uppercase font-black tracking-widest underline decoration-amber-500/30 underline-offset-4">List</Link>
          </div>

          <div className="space-y-4">
            {tasks.length > 0 ? tasks.map((task, idx) => {
              const timeLeft = task.deadline ? getTimeLeft(task.deadline) : '';
              const isUrgent = timeLeft === 'Overdue' || (task.deadline && new Date(task.deadline).getTime() - Date.now() < 86400000);
              
              return (
                <motion.div 
                  key={task.id} 
                  variants={itemVariants}
                  className={`glass-card p-4 border-l-2 transition-all hover:scale-[1.02] ${
                    isUrgent ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500 bg-amber-500/5'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                        isUrgent ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {task.category || 'Kuliah'}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 italic">{timeLeft}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{task.title}</h3>
                    <div className="flex items-center gap-1.5 text-zinc-600">
                      <ListTodo size={12} />
                      <span className="text-[10px]">{task.status_lab || 'Pending'}</span>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="p-10 border border-dashed border-zinc-800 rounded-2xl text-center">
                <p className="text-[10px] text-zinc-700 font-black uppercase">No active deadlines</p>
              </div>
            )}
          </div>

          {/* Quick AI Trigger */}
          <motion.button 
            variants={itemVariants}
            className="w-full py-4 glass-panel border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/5 flex items-center justify-center gap-3 transition-all active:scale-95"
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
          >
            <Command size={14} /> Open AI Controller
          </motion.button>
        </div>

        {/* COLUMN 2: COREPAWAS INVENTORY (Center - 6 Units) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
              <Package size={14} className="text-cyan-500" /> Corepawas Inventory
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-bold text-zinc-600">{readyStock} Ready</span>
              </div>
            </div>
          </div>

          {/* Inventory Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="glass-panel p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-cyan-500/10 transform -rotate-12 group-hover:scale-110 transition-transform">
                <DollarSign size={120} />
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Weekly Target</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white font-outfit">Rp 12.5M</span>
                <span className="text-emerald-400 text-xs font-bold mb-1">+12%</span>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[65%]" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 relative overflow-hidden">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Unit Sold</p>
               <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white font-outfit">{inventory.length - readyStock}</span>
                <span className="text-zinc-500 text-xs font-bold mb-1">units</span>
              </div>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className={`h-4 flex-1 rounded-sm ${i <= 5 ? 'bg-purple-500/40' : 'bg-zinc-900'}`} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Stock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inventory.slice(0, 4).map((item) => (
              <motion.div 
                key={item.id} 
                variants={itemVariants}
                className="glass-panel p-4 flex items-center justify-between group hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity size={18} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.tipe_hp}</p>
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Rp {(item.harga_jual / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
                <div className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                  item.status_barang === 'Ready' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {item.status_barang}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: MARKET & GYM (Right - 3 Units) */}
        <div className="lg:col-span-3 space-y-8">
          {/* Market Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" /> Market Monitor
              </h2>
            </div>
            <MarketWidget />
            <motion.div variants={itemVariants} className="glass-panel p-4 border-emerald-500/20">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">XAUUSD Outlook</p>
              <p className="text-xs text-white font-bold">Waiting for BoS at 2345.50</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">SMC Bullish</span>
              </div>
            </motion.div>
          </section>

          {/* Schedules Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
                <Dumbbell size={14} className="text-orange-500" /> Daily Schedule
              </h2>
            </div>
            <div className="space-y-3">
              {schedules.length > 0 ? schedules.map((item) => (
                <motion.div 
                  key={item.id} 
                  variants={itemVariants}
                  className="glass-panel p-4 border-l-2 border-l-orange-500 bg-orange-500/5 group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
                      {new Date(item.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">{item.category}</p>
                </motion.div>
              )) : (
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl">
                  <p className="text-[10px] text-zinc-700 font-black uppercase">No more schedules</p>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </motion.div>
  );
}
