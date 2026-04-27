'use client';

import React from 'react';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const TradingPage = () => {
  const history = [
    { id: 1, pair: 'XAUUSD', type: 'Buy', result: '+24 pips', date: '27 Apr 2026' },
    { id: 2, pair: 'BTCUSD', type: 'Sell', result: '-10 pips', date: '26 Apr 2026' },
    { id: 3, pair: 'XAUUSD', type: 'Buy', result: '+45 pips', date: '25 Apr 2026' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-blue-400" size={24} />
          <h1 className="text-xl font-bold text-white">Trading Journal</h1>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
          <Activity size={14} className="text-emerald-500 animate-pulse" />
          LIVE: $2,420.12
        </div>
      </header>

      <div className="glass-card p-5 mb-6 overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Market Analysis</p>
          <h3 className="text-lg font-bold text-white mb-2">XAUUSD M15</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Market structure is bullish. Price is currently retracing to the H1 Demand zone. 
            Looking for BOS on M5 before entry. Watch out for news at 19:30.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <TrendingUp size={120} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Recent Trades</h2>
        {history.map((trade, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={trade.id}
            className="glass-card p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-white">{trade.pair} <span className="text-zinc-500 font-normal">/ {trade.type}</span></p>
              <p className="text-[10px] text-zinc-500">{trade.date}</p>
            </div>
            <span className={`text-sm font-bold ${trade.result.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {trade.result}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TradingPage;
