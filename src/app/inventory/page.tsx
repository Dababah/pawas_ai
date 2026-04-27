'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Smartphone, Trash2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Inventory } from '@/lib/supabase';

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

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Package className="text-purple-400" size={24} />
          <h1 className="text-xl font-bold text-white">Core Pawas Inventory</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white">
            <Plus size={18} />
          </button>
        </div>
      </header>

      <div className="grid gap-4">
        {loading && stock.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">Memuat data dari Supabase...</div>
        ) : (
          <AnimatePresence>
            {stock.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key={item.id}
                className="glass-card p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.unit}</p>
                    <p className="text-xs text-zinc-500">Buy: {item.buy_price} • Target: {item.sell_price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    item.status === 'ready' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {item.status}
                  </span>
                  <button 
                    onClick={() => item.id && deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && stock.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 text-sm">Stok kosong. Gunakan AI untuk menambah unit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
