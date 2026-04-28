'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle, Plus, Calendar, Filter, ArrowLeft, Trash2, Sparkles, List, Layout, Edit2, X, GraduationCap, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const TasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'board'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', category: '', deadline: '', priority: 'Medium' });

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('task_management')
      .select('*')
      .order('deadline', { ascending: true });
    
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    const { error } = await supabase.from('task_management').update({ status_lab: newStatus }).eq('id', id);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status_lab: newStatus } : t));
    }
  };

  const deleteTask = async (id: string) => {
    if (confirm('Authorize deletion of this data entry?')) {
      await supabase.from('task_management').delete().eq('id', id);
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({ title: '', category: 'Kuliah', deadline: '', priority: 'Medium' });
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
    setFormData({ 
      title: task.title, 
      category: task.category || 'Kuliah', 
      deadline: formattedDeadline,
      priority: task.priority || 'Medium'
    });
    setIsModalOpen(true);
  };

  const saveTask = async () => {
    if (!formData.title.trim()) return alert('Title entry required.');
    
    let isoDeadline = null;
    if (formData.deadline) {
      isoDeadline = new Date(formData.deadline).toISOString();
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      deadline: isoDeadline,
      priority: formData.priority,
      status_lab: editingTask ? editingTask.status_lab : 'Pending',
      nim: '21110xxx'
    };

    if (editingTask) {
      const { data, error } = await supabase.from('task_management').update(payload).eq('id', editingTask.id).select();
      if (data) setTasks(prev => prev.map(t => t.id === editingTask.id ? data[0] : t));
    } else {
      const { data, error } = await supabase.from('task_management').insert([payload]).select();
      if (data) setTasks(prev => [...prev, data[0]].sort((a,b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }));
    }
    setIsModalOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants} initial="hidden" animate="show"
      className="space-y-8 pb-20 industrial-grid min-h-screen"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 hover:text-white transition-all">
            <ArrowLeft size={14} /> Back to Hub
          </Link>
          <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">
            <GraduationCap size={14} className="animate-pulse" />
            <span>Academic Pipeline</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white font-outfit tracking-tighter uppercase">Task <span className="text-gradient-gold">Matrix</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-white'}`}><List size={18} /></button>
            <button onClick={() => setView('board')} className={`p-2 rounded-lg transition-all ${view === 'board' ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-white'}`}><Layout size={18} /></button>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
            <Plus size={18} />
            <span>New Entry</span>
          </button>
        </div>
      </header>

      {view === 'list' ? (
        <div className="grid gap-4">
          {loading && tasks.length === 0 ? (
            <div className="text-center py-24 glass-panel border-white/5 animate-pulse">
              <Activity size={32} className="animate-spin mx-auto text-zinc-800 mb-4" />
              <p className="text-zinc-700 text-xs font-black uppercase tracking-widest">Syncing with academic DB...</p>
            </div>
          ) : tasks.map((task) => (
            <motion.div
              key={task.id} variants={itemVariants}
              className={`glass-panel p-5 flex items-center justify-between group border-l-4 transition-all ${
                task.status_lab === 'Completed' ? 'opacity-40 border-l-zinc-800' : 
                task.priority === 'Urgent' ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500 bg-amber-500/5'
              }`}
            >
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => toggleTask(task.id, task.status_lab)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                    task.status_lab === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/10 text-transparent hover:border-amber-500'
                  }`}
                >
                  <CheckCircle2 size={16} />
                </button>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className={`text-base font-black uppercase tracking-tight ${task.status_lab === 'Completed' ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </p>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                      task.priority === 'Urgent' ? 'bg-red-500 text-white' : 'bg-white/5 text-zinc-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest">{task.category}</span>
                    <div className="h-3 w-[1px] bg-zinc-800" />
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase">
                        {task.deadline ? new Date(task.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'NO_LIMIT'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                  <button onClick={() => openEditModal(task)} className="p-3 text-zinc-700 hover:text-amber-400 hover:bg-amber-500/5 rounded-xl transition-all"><Edit2 size={18} /></button>
                  <button onClick={() => deleteTask(task.id)} className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* TO DO BOARD */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Operational</h3>
              </div>
              <span className="text-[10px] font-black text-zinc-700">{tasks.filter(t => t.status_lab !== 'Completed').length}</span>
            </div>
            {tasks.filter(t => t.status_lab !== 'Completed').map((task) => (
              <motion.div
                key={task.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-5 border-white/5 hover:border-amber-500/30 cursor-pointer group transition-all bg-white/[0.01]"
                onClick={() => openEditModal(task)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded">
                    {task.category}
                  </span>
                  <Zap size={14} className={task.priority === 'Urgent' ? 'text-red-500 animate-bounce' : 'text-zinc-800'} />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-4">{task.title}</h4>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Clock size={12} />
                    <span className="text-[9px] font-bold uppercase">{task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id, task.status_lab); }} className="text-[9px] font-black text-zinc-700 hover:text-emerald-500 uppercase tracking-widest">Done</button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* COMPLETED BOARD */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">Archived</h3>
              </div>
              <span className="text-[10px] font-black text-zinc-700">{tasks.filter(t => t.status_lab === 'Completed').length}</span>
            </div>
            {tasks.filter(t => t.status_lab === 'Completed').map((task) => (
              <motion.div
                key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-panel p-5 border-white/5 opacity-40 hover:opacity-100 transition-all bg-white/[0.01]"
              >
                <h4 className="text-sm font-black text-zinc-500 uppercase tracking-tight line-through mb-4">{task.title}</h4>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">COMPLETED</span>
                  <button onClick={() => deleteTask(task.id)} className="text-zinc-800 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl glass-panel p-10 border-amber-500/20 bg-[#0a0a0b]"
            >
              <h2 className="text-3xl font-black text-white font-outfit tracking-tighter uppercase mb-8">Data <span className="text-amber-500">Entry</span></h2>
              <form onSubmit={(e) => { e.preventDefault(); saveTask(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Task Identification</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. OSPF Lab Configuration" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-amber-500 transition-all font-bold uppercase text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Pipeline Category</label>
                  <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-amber-500 transition-all font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Priority Protocol</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-amber-500 transition-all font-bold text-sm appearance-none">
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Standard</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">CRITICAL_URGENT</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Termination Point (Deadline)</label>
                  <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-amber-500 transition-all font-outfit text-sm [color-scheme:dark]" />
                </div>
                <div className="md:col-span-2 pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 glass-panel border-white/10 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">Abort</button>
                  <button type="submit" className="flex-1 py-4 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">Commit Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TasksPage;

export default TasksPage;
