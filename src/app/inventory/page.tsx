'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Smartphone, Trash2, RefreshCw, FileDown, Activity, DollarSign, ArrowUpRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Inventory } from '@/lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InventoryPage = () => {
  const [stock, setStock] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id', { ascending: false });
    
    if (data) setStock(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const deleteItem = async (id: number) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (!error) {
      setStock(prev => prev.filter(item => item.id !== id));
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Laporan Inventaris Core Pawas', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = stock.map(item => [
      item.unit,
      item.buy_price.toLocaleString('id-ID'),
      item.sell_price.toLocaleString('id-ID'),
      item.status.toUpperCase()
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Unit Gadget', 'Harga Beli (Rp)', 'Harga Jual (Rp)', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`Laporan_Inventaris_PawasAI_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
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
      className="space-y-8 pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#8c7851]/60 text-[10px] font-bold uppercase tracking-[0.3em]">
            <Package size={12} className="text-[#4a6741]" />
            <span>Business Assets</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#f0ede4] font-outfit tracking-tight">Core Inventory</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToPDF} 
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2e26] border border-white/5 rounded-xl text-xs font-bold text-[#8c7851]/80 hover:text-[#f0ede4] transition-all shadow-xl"
          >
            <FileDown size={16} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button 
            onClick={fetchInventory} 
            className="p-2.5 bg-[#1a2e26] border border-white/5 rounded-xl text-[#8c7851]/80 hover:text-[#f0ede4] transition-all shadow-xl"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => window.location.href = '/assistant'} 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f0ede4] text-[#0d1a15] rounded-xl text-sm font-bold hover:bg-[#8c7851] hover:text-[#f0ede4] transition-all shadow-xl"
          >
            <Plus size={18} />
            <span>Add Unit</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', val: stock.length, sub: 'In Warehouse', icon: <Package size={14} />, color: 'text-[#f0ede4]' },
          { label: 'Est. Revenue', val: `Rp ${(stock.reduce((acc, i) => acc + i.sell_price, 0) / 1000000).toFixed(1)}M`, sub: 'Projected', icon: <DollarSign size={14} />, color: 'text-[#4a6741]' },
          { label: 'Avg Margin', val: 'Rp 850K', sub: 'Per Unit', icon: <Activity size={14} />, color: 'text-[#8c7851]' },
          { label: 'Ready Stock', val: stock.filter(s => s.status === 'ready').length, sub: 'Units', icon: <Smartphone size={14} />, color: 'text-[#6b4e3d]' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="glass-panel p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#8c7851]/60">
              {stat.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold ${stat.color} font-outfit`}>{stat.val}</p>
            <p className="text-[9px] text-[#8c7851]/40 font-bold uppercase">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-[#8c7851]/60 uppercase tracking-[0.2em]">Inventory Log</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-4">
              <div className="w-2 h-2 rounded-full bg-[#4a6741]" />
              <span className="text-[9px] text-[#4a6741] font-bold uppercase">Ready</span>
            </div>
            <span className="text-[10px] text-[#8c7851]/40 font-bold uppercase">{stock.length} Total Units</span>
          </div>
        </div>

        <div className="grid gap-3">
          {loading && stock.length === 0 ? (
            <div className="text-center py-20 bg-zinc-950/50 rounded-3xl border border-white/5">
              <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-500 text-sm font-medium">Syncing warehouse data...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {stock.map((item, i) => (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="glass-panel p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform group-hover:bg-purple-500/10 group-hover:text-purple-400">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white tracking-tight">{item.unit}</p>
                        {item.status === 'ready' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-zinc-600 font-bold uppercase">Buy:</span>
                          <span className="text-[10px] text-zinc-400 font-medium font-outfit">Rp {item.buy_price.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-zinc-600 font-bold uppercase">Target:</span>
                          <span className="text-[10px] text-emerald-400 font-bold font-outfit">Rp {item.sell_price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Expected Margin</p>
                      <p className="text-xs font-bold text-white font-outfit">+Rp {(item.sell_price - item.buy_price).toLocaleString('id-ID')}</p>
                    </div>
                    <button 
                      onClick={() => item.id && deleteItem(item.id)}
                      className="p-2.5 hover:bg-red-500/10 hover:text-red-500 text-zinc-700 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && stock.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-zinc-950/30 border border-dashed border-white/5 rounded-[2rem]"
            >
              <Package size={40} className="mx-auto text-zinc-800 mb-4" />
              <p className="text-zinc-600 text-sm font-medium">No units found in your digital warehouse.</p>
              <p className="text-zinc-700 text-[10px] uppercase font-bold tracking-widest mt-2">Initialize supply via neural assistant</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryPage;

