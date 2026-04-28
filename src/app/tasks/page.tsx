'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle, Plus, Calendar, Filter, ArrowLeft, Trash2, Sparkles, List, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const TasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'board'>('list');

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });
    
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  };

  const deleteTask = async (id: number) => {
    if (confirm('Hapus deadline ini permanen?')) {
      await supabase.from('tasks').delete().eq('id', id);
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };


  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8c7851] text-xs font-bold uppercase tracking-widest mb-4 hover:text-[#f0ede4] transition-colors">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-[#8c7851] text-[10px] font-bold uppercase tracking-[0.3em]">
            <Clock size={12} className="text-[#6b4e3d]" />
            <span>Neural Schedule</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#f0ede4] font-outfit tracking-tight">Deadlines & Tasks</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0d1a15] border border-white/10 rounded-xl p-1">
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setView('board')}
              className={`p-2 rounded-lg transition-all ${view === 'board' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <Layout size={16} />
            </button>
          </div>
          <Link 
            href="/assistant"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f0ede4] text-[#0d1a15] rounded-xl text-sm font-bold hover:bg-[#8c7851] hover:text-[#f0ede4] transition-all shadow-xl"
          >
            <Sparkles size={18} className="text-orange-500" />
            <span className="hidden sm:inline">Ask Neural AI</span>
          </Link>
        </div>
      </header>

      {view === 'list' ? (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-panel p-5 flex items-center justify-between group ${task.status === 'completed' ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleTask(task.id, task.status)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.status === 'completed' ? 'bg-[#4a6741] border-[#4a6741] text-white' : 'border-[#8c7851]/30 text-transparent hover:border-[#8c7851]'
                  }`}
                >
                  <CheckCircle2 size={14} />
                </button>
                <div>
                  <p className={`text-sm font-bold ${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-[#f0ede4]'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-[#8c7851]/60 font-bold uppercase tracking-tighter">{task.matkul}</span>
                    <span className="w-1 h-1 rounded-full bg-[#1a2e26]" />
                    <span className="text-[10px] text-[#8c7851]/60 font-bold uppercase tracking-tighter">
                      {task.deadline ? new Date(task.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'No Deadline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {task.status !== 'completed' && (
                  <div className="hidden sm:flex items-center gap-2 text-[#6b4e3d] mr-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Due Soon</span>
                  </div>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* TO DO Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-md bg-[#8c7851]/20 text-[#8c7851] text-[10px] font-bold uppercase tracking-widest">
                To Do
              </div>
              <span className="text-zinc-600 text-xs font-bold">{tasks.filter(t => t.status !== 'completed').length}</span>
            </div>
            {tasks.filter(t => t.status !== 'completed').map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0b0b0b] border border-white/5 hover:border-[#8c7851]/30 p-4 rounded-xl cursor-pointer group transition-all"
                onClick={() => toggleTask(task.id, task.status)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] text-[#8c7851] font-bold uppercase bg-[#8c7851]/10 px-2 py-0.5 rounded">
                    {task.matkul}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{task.title}</h3>
                {task.deadline && (
                  <div className="flex items-center gap-2 text-zinc-500 mt-4 pt-3 border-t border-white/5">
                    <Clock size={12} />
                    <span className="text-[10px] font-medium">
                      {new Date(task.deadline).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* COMPLETED Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-md bg-[#4a6741]/20 text-[#4a6741] text-[10px] font-bold uppercase tracking-widest">
                Completed
              </div>
              <span className="text-zinc-600 text-xs font-bold">{tasks.filter(t => t.status === 'completed').length}</span>
            </div>
            {tasks.filter(t => t.status === 'completed').map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0b0b0b]/50 border border-white/5 p-4 rounded-xl cursor-pointer group transition-all opacity-60 hover:opacity-100"
                onClick={() => toggleTask(task.id, task.status)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase bg-white/5 px-2 py-0.5 rounded line-through">
                    {task.matkul}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-zinc-500 line-through mb-2">{task.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
