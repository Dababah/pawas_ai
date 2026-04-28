'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle, Plus, Calendar, Filter, ArrowLeft, Trash2, Sparkles, List, Layout, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const TasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'board'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', matkul: '', deadline: '' });

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

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({ title: '', matkul: '', deadline: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    let formattedDeadline = '';
    if (task.deadline) {
      const d = new Date(task.deadline);
      const offset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
      formattedDeadline = localISOTime;
    }
    setFormData({ title: task.title, matkul: task.matkul || '', deadline: formattedDeadline });
    setIsModalOpen(true);
  };

  const saveTask = async () => {
    if (!formData.title.trim()) return alert('Judul tugas harus diisi');
    
    let isoDeadline = null;
    if (formData.deadline) {
      isoDeadline = new Date(formData.deadline).toISOString();
    }

    const payload = {
      title: formData.title,
      matkul: formData.matkul,
      deadline: isoDeadline,
      status: editingTask ? editingTask.status : 'pending'
    };

    if (editingTask) {
      const { data, error } = await supabase.from('tasks').update(payload).eq('id', editingTask.id).select();
      if (data) setTasks(prev => prev.map(t => t.id === editingTask.id ? data[0] : t));
    } else {
      const { data, error } = await supabase.from('tasks').insert([payload]).select();
      if (data) setTasks(prev => [...prev, data[0]].sort((a,b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }));
    }
    setIsModalOpen(false);
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
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8c7851] text-[#0d1a15] rounded-xl text-sm font-bold hover:bg-[#f0ede4] transition-all"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Task</span>
          </button>
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
                <div className="flex opacity-0 group-hover:opacity-100 transition-all gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                    className="p-2 text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }} className="text-zinc-600 hover:text-blue-400">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-zinc-600 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
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
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }} className="text-zinc-600 hover:text-blue-400">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-zinc-600 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-zinc-500 line-through mb-2">{task.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0d1a15] border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white font-outfit">{editingTask ? 'Edit Task' : 'New Task'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Title</label>
                  <input 
                    type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Belajar Kriptografi"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8c7851] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Category / Matkul</label>
                  <input 
                    type="text" value={formData.matkul} onChange={e => setFormData({...formData, matkul: e.target.value})}
                    placeholder="e.g. Kuliah"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8c7851] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Deadline</label>
                  <input 
                    type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8c7851] outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all">
                  Cancel
                </button>
                <button onClick={saveTask} className="flex-1 py-3 rounded-xl bg-[#8c7851] hover:bg-[#f0ede4] text-[#0d1a15] text-sm font-bold transition-all">
                  Save Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
