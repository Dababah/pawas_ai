'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart2, Activity, Trash2, RefreshCw, PieChart as PieChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Trade } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TradingPage = () => {
  const [history, setHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) {
      setHistory([...data].reverse());
      
      // Process data for chart (Cumulative Profit)
      let cumulative = 0;
      const formattedData = data.map((t: Trade) => {
        const profit = parseFloat(t.result.replace(/[^0-9.-]/g, '')) || 0;
        cumulative += profit;
        return {
          date: t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '',
          profit: cumulative
        };
      });
      setChartData(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const deleteTrade = async (id: number) => {
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (!error) {
      setHistory(prev => prev.filter(trade => trade.id !== id));
      fetchTrades(); // Refresh chart
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-blue-400" size={24} />
          <h1 className="text-xl font-bold text-white">Trading Analytics</h1>
        </div>
        <button onClick={fetchTrades} className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Performance Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 h-[240px] w-full"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Equity Curve (Pips)</span>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">Win Rate</p>
          <p className="text-xl font-bold text-white">68%</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">Total Pips</p>
          <p className="text-xl font-bold text-emerald-400">
            {chartData.length > 0 ? chartData[chartData.length - 1].profit : 0}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Trade History</h2>
        {loading && history.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">Syncing neural analytics...</div>
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
                  <p className="text-sm font-bold text-white">{trade.pair} <span className="text-zinc-500 font-normal">/ {trade.entry}</span></p>
                  <p className="text-[10px] text-zinc-500">{trade.created_at ? new Date(trade.created_at).toLocaleDateString() : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${trade.result.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.result}
                  </span>
                  <button onClick={() => trade.id && deleteTrade(trade.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TradingPage;
