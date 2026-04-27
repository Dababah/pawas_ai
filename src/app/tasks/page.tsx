'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle, Plus, Calendar, Filter, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const TasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<{title: string, matkul: string, deadline: string, status: 'pending' | 'completed'}>({ 
    title: '', 
    matkul: '', 
    deadline: '',
    status: 'pending'
  });

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });
    
    if (data) setTasks(data);
    else {
      // Mock data if table doesn't exist or empty
      setTasks([
        { id: 1, title: 'Tugas Kriptografi', matkul: 'Kriptografi', deadline: '2026-04-28T23:59:59', status: 'pending' },
        { id: 2, title: 'Meeting Supplier', matkul: 'Business', deadline: '2026-04-29T09:00:00', status: 'pending' },
        { id: 3, title: 'Laporan Trading Mingguan', matkul: 'Trading', deadline: '2026-04-30T17:00:00', status: 'completed' },
      ]);
    }
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

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = { ...newTask, status: 'pending', created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('tasks').insert([taskData]).select();
    
    if (data) {
      setTasks([data[0], ...tasks]);
    } else {
      // Mock local addition
      setTasks([{ id: Date.now(), ...taskData }, ...tasks]);
    }
    setIsModalOpen(false);
    setNewTask({ title: '', matkul: '', deadline: '', status: 'pending' });
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
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#f0ede4] text-[#0d1a15] rounded-xl text-sm font-bold hover:bg-[#8c7851] hover:text-[#f0ede4] transition-all shadow-xl"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </header>

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

            {task.status !== 'completed' && (
              <div className="flex items-center gap-2 text-[#6b4e3d]">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Due Soon</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 space-y-6"
            >
              <h2 className="text-2xl font-black text-white font-outfit">New Task Node</h2>
              <form onSubmit={addTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Task Title</label>
                  <input 
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g. RSA Algorithm Implementation"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#4a6741] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Subject / Project</label>
                  <input 
                    required
                    value={newTask.matkul}
                    onChange={(e) => setNewTask({...newTask, matkul: e.target.value})}
                    placeholder="e.g. Cryptography"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#4a6741] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Deadline Date</label>
                  <input 
                    required
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#4a6741] transition-all"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-[#f0ede4] text-[#0d1a15] rounded-xl text-sm font-bold hover:bg-[#4a6741] hover:text-white transition-all"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
