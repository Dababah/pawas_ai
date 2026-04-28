'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Smartphone, Trash2, RefreshCw, FileDown, Activity, DollarSign, ArrowUpRight, Search, ShieldCheck, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InventoryPage = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ 
    tipe_hp: '', 
    harga_beli: 0, 
    harga_jual: 0, 
    status_barang: 'Ready',
    imei: '',
    condition: 'Second'
  });

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory_hp')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setStock(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('inventory_hp').delete().eq('id', id);
    if (!error) {
      setStock(prev => prev.filter(item => item.id !== id));
    }
  };

  const addUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('inventory_hp').insert([newItem]).select();
    if (data) {
      setStock([data[0], ...stock]);
    }
    setIsModalOpen(false);
    setNewItem({ tipe_hp: '', harga_beli: 0, harga_jual: 0, status_barang: 'Ready', imei: '', condition: 'Second' });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Laporan Inventaris Corepawas', 14, 22);
    doc.setFontSize(11);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = stock.map(item => [
      item.tipe_hp,
      item.harga_beli.toLocaleString('id-ID'),
      item.harga_jual.toLocaleString('id-ID'),
      item.status_barang.toUpperCase()
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Model HP', 'Harga Beli (Rp)', 'Harga Jual (Rp)', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [6, 182, 212] } // Cyan
    });

    doc.save(`Corepawas_Inventory_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-20 industrial-grid min-h-screen"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-500 text-[10px] font-black uppercase tracking-[0.4em]">
            <Smartphone size={14} className="animate-pulse" />
            <span>Corepawas Gadget</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white font-outfit tracking-tighter uppercase">Inventory <span className="text-gradient-gold">HP</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToPDF} 
            className="flex items-center gap-2 px-6 py-3 glass-panel border-white/10 text-zinc-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            <FileDown size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]"
          >
            <Plus size={18} />
            <span>Add Stock</span>
          </button>
        </div>
      </header>

      {/* Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Stock', val: stock.length, sub: 'Units', icon: <Package size={14} />, color: 'text-white' },
          { label: 'Est. Revenue', val: `Rp ${(stock.reduce((acc, i) => acc + i.harga_jual, 0) / 1000000).toFixed(1)}M`, sub: 'Projected', icon: <DollarSign size={14} />, color: 'text-cyan-400' },
          { label: 'Avg Margin', val: 'Rp 750K', sub: 'Per Unit', icon: <Activity size={14} />, color: 'text-amber-500' },
          { label: 'Ready Now', val: stock.filter(s => s.status_barang === 'Ready').length, sub: 'Available', icon: <ShieldCheck size={14} />, color: 'text-emerald-400' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="glass-panel p-6 border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-zinc-600 mb-3">
              {stat.icon}
              <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className={`text-2xl font-black ${stat.color} font-outfit`}>{stat.val}</p>
            <p className="text-[9px] text-zinc-700 font-bold uppercase mt-1 tracking-tighter">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">Stock Database</h2>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-zinc-600 font-black uppercase">Live System</span>
              </div>
          </div>
        </div>

        <div className="grid gap-3">
          {loading && stock.length === 0 ? (
            <div className="text-center py-24 glass-panel border-white/5 animate-pulse">
              <RefreshCw size={32} className="animate-spin mx-auto text-zinc-800 mb-4" />
              <p className="text-zinc-700 text-xs font-black uppercase tracking-widest">Accessing core data...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {stock.map((item) => (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="glass-panel p-5 flex items-center justify-between group hover:border-cyan-500/30 transition-all bg-white/[0.01]"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all">
                      <Smartphone size={28} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="text-base font-black text-white uppercase tracking-tight">{item.tipe_hp}</p>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                          item.condition === 'New' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-amber-500/20 text-amber-500'
                        }`}>
                          {item.condition}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-zinc-700" />
                          <span className="text-[10px] text-zinc-400 font-bold font-outfit">Rp {item.harga_jual.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="h-3 w-[1px] bg-zinc-800" />
                        <span className="text-[9px] text-zinc-600 font-black uppercase">IMEI: {item.imei || 'NOT_SET'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                      <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Expected Profit</p>
                      <p className="text-sm font-black text-emerald-500 font-outfit">
                        +Rp {(item.harga_jual - item.harga_beli).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.status_barang === 'Ready' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {item.status_barang}
                    </div>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-3 text-zinc-800 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && stock.length === 0 && (
            <div className="text-center py-24 glass-panel border-dashed border-white/5 rounded-[2rem]">
              <Package size={48} className="mx-auto text-zinc-900 mb-6" />
              <p className="text-zinc-700 text-[11px] font-black uppercase tracking-[0.3em]">No units registered in Corepawas DB</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Manual Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Unit Modal */}
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
              className="relative w-full max-w-xl glass-panel p-10 border-cyan-500/20 bg-[#0a0a0b]"
            >
              <h2 className="text-3xl font-black text-white font-outfit tracking-tighter uppercase mb-8">Stock <span className="text-cyan-500">Registration</span></h2>
              <form onSubmit={addUnit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Model Name</label>
                  <input required value={newItem.tipe_hp} onChange={(e) => setNewItem({...newItem, tipe_hp: e.target.value})} placeholder="iPhone 15 Pro Max..." className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500 transition-all font-bold uppercase text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Buy Price (Rp)</label>
                  <input required type="number" value={newItem.harga_beli} onChange={(e) => setNewItem({...newItem, harga_beli: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500 transition-all font-outfit text-lg font-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Target Price (Rp)</label>
                  <input required type="number" value={newItem.harga_jual} onChange={(e) => setNewItem({...newItem, harga_jual: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500 transition-all font-outfit text-lg font-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">IMEI / SN</label>
                  <input value={newItem.imei} onChange={(e) => setNewItem({...newItem, imei: e.target.value})} placeholder="Optional" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500 transition-all font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Condition</label>
                  <select value={newItem.condition} onChange={(e) => setNewItem({...newItem, condition: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500 transition-all font-bold text-sm appearance-none">
                    <option value="New">New / BNOB</option>
                    <option value="Second">Second / Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
                <div className="md:col-span-2 pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 glass-panel border-white/10 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">Abort</button>
                  <button type="submit" className="flex-1 py-4 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">Authorize Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InventoryPage;
