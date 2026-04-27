'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle, Plus, Calendar, Filter, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const TasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#f0ede4] text-[#0d1a15] rounded-xl text-sm font-bold hover:bg-[#8c7851] hover:text-[#f0ede4] transition-all shadow-xl">
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
                    {new Date(task.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
};

export default TasksPage;
