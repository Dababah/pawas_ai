'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

type MarketData = {
  xauusd: { price: number; change24h: number };
  btcusd: { price: number; change24h: number };
};

export default function MarketWidget() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarket = async () => {
    try {
      const res = await fetch('/api/market');
      const json = await res.json();
      setData(json);
    } catch {
      // Keep last data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map(i => (
          <div key={i} className="market-card animate-pulse">
            <div className="h-4 bg-white/5 rounded w-16 mb-3" />
            <div className="h-6 bg-white/5 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  const assets = [
    {
      symbol: 'XAUUSD',
      label: 'Gold',
      price: data.xauusd.price,
      change: data.xauusd.change24h,
      gradient: 'from-amber-500/20 to-yellow-600/5',
      accent: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'shadow-amber-500/5',
    },
    {
      symbol: 'BTCUSD',
      label: 'Bitcoin',
      price: data.btcusd.price,
      change: data.btcusd.change24h,
      gradient: 'from-orange-500/20 to-orange-600/5',
      accent: 'text-orange-400',
      border: 'border-orange-500/20',
      glow: 'shadow-orange-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {assets.map((asset, idx) => {
        const isUp = asset.change >= 0;
        return (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`market-card bg-gradient-to-br ${asset.gradient} ${asset.border} ${asset.glow} shadow-xl`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${asset.accent}`}>
                {asset.symbol}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
              }`}>
                {isUp ? '+' : ''}{asset.change?.toFixed(2)}%
              </span>
            </div>
            <p className="text-lg font-black text-white font-outfit tracking-tight">
              ${asset.price?.toLocaleString('en-US', { minimumFractionDigits: asset.symbol === 'BTCUSD' ? 0 : 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {isUp ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-red-400" />}
              <span className="text-[9px] text-zinc-500 font-medium">24h</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
