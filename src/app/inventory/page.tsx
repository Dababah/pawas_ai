'use client';

import React from 'react';
import { Package, Plus, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const InventoryPage = () => {
  const stock = [
    { id: 1, unit: 'iPhone 13 128GB Midnight', buy: '7.5jt', sell: '8.3jt', status: 'Ready' },
    { id: 2, unit: 'iPhone 11 64GB White', buy: '3.8jt', sell: '4.5jt', status: 'Ready' },
    { id: 3, unit: 'iPhone 12 Pro 256GB Blue', buy: '9.2jt', sell: '10.5jt', status: 'Sold' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Package className="text-purple-400" size={24} />
          <h1 className="text-xl font-bold text-white">Core Pawas Inventory</h1>
        </div>
        <button className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white">
          <Plus size={20} />
        </button>
      </header>

      <div className="grid gap-4">
        {stock.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={item.id}
            className="glass-card p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.unit}</p>
                <p className="text-xs text-zinc-500">Buy: {item.buy} • Target: {item.sell}</p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
              item.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InventoryPage;
