'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart2, Activity, Trash2, RefreshCw, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
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
        const profitValue = parseFloat(t.result.replace(/[^0-9.-]/g, '')) || 0;
        cumulative += profitValue;
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
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            <Activity size={12} className="text-blue-500" />
            <span>Market Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-outfit">Trading Journal</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert('Fitur filter sedang dalam pengembangan neural.')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <Filter size={14} /> Filter
          </button>
          <button 
            onClick={fetchTrades} 
            className="p-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Performance Chart */}
      <motion.div variants={itemVariants} className="glass-panel p-6 premium-shadow">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Equity Growth</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Cumulative Pips Performance</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-400 font-outfit">
              {chartData.length > 0 ? `+${chartData[chartData.length - 1].profit}` : '0'}
            </p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">Total Net Pips</p>
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#52525b', fontSize: '10px', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
                strokeWidth={3}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Win Rate', val: '68%', icon: <Activity size={14} />, color: 'text-white' },
          { label: 'Profit Factor', val: '2.4', icon: <TrendingUp size={14} />, color: 'text-emerald-400' },
          { label: 'Max Drawdown', val: '4.2%', icon: <ArrowDownRight size={14} />, color: 'text-red-400' },
          { label: 'Avg Trade', val: '+24 Pips', icon: <BarChart2 size={14} />, color: 'text-blue-400' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="glass-panel p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-500">
              {stat.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold ${stat.color} font-outfit`}>{stat.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Execution Log</h2>
          <span className="text-[10px] text-zinc-600 font-bold uppercase">{history.length} Trades Total</span>
        </div>
        
        {loading && history.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950/50 rounded-3xl border border-white/5">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 text-sm font-medium tracking-tight">Syncing with global market nodes...</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {history.map((trade, i) => {
                const isProfit = trade.result.startsWith('+');
                return (
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={trade.id}
                    className="glass-panel p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isProfit ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white tracking-tight">{trade.pair}</p>
                          <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5 text-zinc-500 font-bold uppercase tracking-tighter">Entry @ {trade.entry}</span>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                          {trade.created_at ? new Date(trade.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-sm font-black ${isProfit ? 'text-emerald-400' : 'text-red-400'} font-outfit`}>
                          {trade.result}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Pips Result</p>
                      </div>
                      <button 
                        onClick={() => trade.id && deleteTrade(trade.id)} 
                        className="p-2 hover:bg-red-500/10 hover:text-red-500 text-zinc-700 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TradingPage;

