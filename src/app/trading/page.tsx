'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart2, Activity, Trash2, RefreshCw, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Filter, Target, Zap, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TradingPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trading_journal')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) {
      setHistory([...data].reverse());
      
      // Process data for chart (Cumulative Profit)
      let cumulative = 0;
      const formattedData = data.map((t: any) => {
        cumulative += parseFloat(t.profit_loss) || 0;
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

  const deleteTrade = async (id: string) => {
    const { error } = await supabase.from('trading_journal').delete().eq('id', id);
    if (!error) {
      setHistory(prev => prev.filter(trade => trade.id !== id));
      fetchTrades(); // Refresh chart
    }
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
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">
            <Activity size={14} className="animate-pulse" />
            <span>Terminal Execution</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white font-outfit tracking-tighter uppercase">Trading <span className="text-gradient-gold">Journal</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTrades} 
            className="flex items-center gap-2 px-6 py-3 glass-panel border-white/10 text-zinc-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            <Target size={18} />
            <span>Add Entry</span>
          </button>
        </div>
      </header>

      {/* Performance Chart */}
      <motion.div variants={itemVariants} className="glass-panel p-8 bg-white/[0.01] border-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Waves size={200} />
        </div>
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Equity Trajectory</h3>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Pips Growth Protocol</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black font-outfit ${chartData.length > 0 && chartData[chartData.length - 1].profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {chartData.length > 0 ? (chartData[chartData.length - 1].profit >= 0 ? '+' : '') + chartData[chartData.length - 1].profit : '0'}
            </p>
            <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest mt-1">Total Net Pips</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} tickLine={false}
                tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} tickLine={false}
                tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 900 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.8)'
                }}
                itemStyle={{ color: '#3b82f6', fontSize: '12px', fontWeight: '900' }}
                labelStyle={{ color: '#71717a', fontSize: '10px', fontWeight: '900', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" dataKey="profit" stroke="#2563eb" fillOpacity={1} fill="url(#colorProfit)" 
                strokeWidth={4} animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'System Efficiency', val: '72%', icon: <Activity size={14} />, color: 'text-white' },
          { label: 'Risk Factor', val: '2.8', icon: <TrendingUp size={14} />, color: 'text-emerald-500' },
          { label: 'Max Drawdown', val: '-3.1%', icon: <ArrowDownRight size={14} />, color: 'text-red-500' },
          { label: 'Neural Accuracy', val: 'A+', icon: <Zap size={14} />, color: 'text-blue-500' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="glass-panel p-6 border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-zinc-600 mb-3">
              {stat.icon}
              <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className={`text-2xl font-black ${stat.color} font-outfit`}>{stat.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">Execution Archive</h2>
          <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">{history.length} Logs Verified</span>
        </div>
        
        <div className="grid gap-3">
          {loading && history.length === 0 ? (
            <div className="text-center py-24 glass-panel border-white/5 animate-pulse">
              <RefreshCw size={32} className="animate-spin mx-auto text-zinc-800 mb-4" />
              <p className="text-zinc-700 text-xs font-black uppercase tracking-widest">Analyzing history...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {history.map((trade) => {
                const isProfit = (parseFloat(trade.profit_loss) || 0) >= 0;
                return (
                  <motion.div
                    variants={itemVariants} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }}
                    key={trade.id}
                    className="glass-panel p-5 flex items-center justify-between group hover:border-blue-500/30 transition-all bg-white/[0.01]"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${isProfit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isProfit ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-base font-black text-white uppercase tracking-tight">{trade.pair}</p>
                          <span className="text-[9px] bg-zinc-900 px-2 py-1 rounded border border-white/5 text-zinc-500 font-black uppercase tracking-widest">
                            {trade.setup_type || 'STANDARD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] text-zinc-600 font-black uppercase">Entry: {trade.entry_price}</span>
                           <div className="h-3 w-[1px] bg-zinc-800" />
                           <span className="text-[10px] text-zinc-500 font-bold uppercase">
                            {trade.created_at ? new Date(trade.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className={`text-xl font-black ${isProfit ? 'text-emerald-500' : 'text-red-500'} font-outfit`}>
                          {isProfit ? '+' : ''}{trade.profit_loss}
                        </p>
                        <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">PIPS_RESULT</p>
                      </div>
                      <button 
                        onClick={() => deleteTrade(trade.id)} 
                        className="p-3 text-zinc-800 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="text-center py-24 glass-panel border-dashed border-white/5 rounded-[2rem]">
            <TrendingUp size={48} className="mx-auto text-zinc-900 mb-6" />
            <p className="text-zinc-700 text-[11px] font-black uppercase tracking-[0.3em]">No execution logs found in neural buffer</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TradingPage;
