'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart2, Activity, Trash2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Trade } from '@/lib/supabase';

const TradingPage = () => {
  const [history, setHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const deleteTrade = async (id: number) => {
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (!error) {
      setHistory(prev => prev.filter(trade => trade.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-blue-400" size={24} />
          <h1 className="text-xl font-bold text-white">Trading Journal</h1>
        </div>
        <button onClick={fetchTrades} className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="glass-card p-5 mb-6 overflow-hidden relative border-blue-500/20">
        <div className="relative z-10">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Market Analysis</p>
          <h3 className="text-lg font-bold text-white mb-2">XAUUSD Strategy</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Market structure is currenty monitored via AI. Ask Pawas.ai for latest technical analysis.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5">
          <TrendingUp size={120} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Recent Trades</h2>
        {loading && history.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">Menghubungkan ke neural trading database...</div>
        ) : (
          <AnimatePresence>
            {history.map((trade, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={trade.id}
                className="glass-card p-4 flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-white">{trade.pair} <span className="text-zinc-500 font-normal">/ Entry: {trade.entry}</span></p>
                  <p className="text-[10px] text-zinc-500">{trade.created_at ? new Date(trade.created_at).toLocaleDateString() : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${trade.result.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.result}
                  </span>
                  <button 
                    onClick={() => trade.id && deleteTrade(trade.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && history.length === 0 && (
          <div className="text-center py-12 border border-white/5 bg-white/5 rounded-3xl">
            <p className="text-zinc-500 text-xs italic">Belum ada jurnal trading. Mulailah mencatat profit Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingPage;
