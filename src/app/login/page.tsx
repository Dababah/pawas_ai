'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, RotateCcw, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const PatternLock = () => {
  const [nodes, setNodes] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const points = Array.from({ length: 9 }, (_, i) => i);

  const handleStart = (id: number) => {
    setIsDrawing(true);
    setNodes([id]);
    setError(false);
  };

  const handleEnter = (id: number) => {
    if (isDrawing && !nodes.includes(id)) {
      setNodes([...nodes, id]);
    }
  };

  const handleEnd = async () => {
    setIsDrawing(false);
    if (nodes.length < 4) {
      setError(true);
      setTimeout(() => setNodes([]), 1000);
      return;
    }

    // Simulasi verifikasi pola (Dalam produksi, pola ini dikirim sebagai password)
    // Untuk Fawwaz, kita set pola default sederhana dulu agar bisa masuk
    const patternStr = nodes.join('');
    
    // Login otomatis untuk demo (Fawwaz Ali)
    // Di dunia nyata, kita kirim patternStr sebagai password ke Supabase
    setSuccess(true);
    setTimeout(() => router.push('/'), 1000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 select-none">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-12 flex flex-col items-center"
      >
        <header className="text-center space-y-2">
          <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center border border-white/10">
            <Lock size={24} className={success ? "text-emerald-400" : "text-zinc-500"} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Neural Unlock</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Gambarkan pola akses Fawwaz</p>
        </header>

        <div 
          ref={containerRef}
          onMouseUp={handleEnd}
          onTouchEnd={handleEnd}
          className="relative grid grid-cols-3 gap-12 p-8 bg-[#111111]/50 rounded-[40px] border border-white/5"
        >
          {points.map((id) => (
            <div
              key={id}
              onMouseDown={() => handleStart(id)}
              onMouseEnter={() => handleEnter(id)}
              onTouchStart={() => handleStart(id)}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                const nodeId = elem?.getAttribute('data-id');
                if (nodeId) handleEnter(parseInt(nodeId));
              }}
              data-id={id}
              className="relative w-12 h-12 flex items-center justify-center z-10"
            >
              <motion.div
                animate={{
                  scale: nodes.includes(id) ? 1.5 : 1,
                  backgroundColor: nodes.includes(id) 
                    ? (error ? '#ef4444' : (success ? '#10b981' : '#ffffff')) 
                    : 'rgba(255,255,255,0.1)'
                }}
                className="w-3 h-3 rounded-full transition-colors duration-200"
              />
            </div>
          ))}

          {/* SVG Lines */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
            {nodes.slice(0, -1).map((node, i) => {
              const start = node;
              const end = nodes[i+1];
              const getPos = (n: number) => ({
                x: (n % 3) * 88 + 76, // Diadjust sesuai gap & padding
                y: Math.floor(n / 3) * 88 + 76
              });
              const p1 = getPos(start);
              const p2 = getPos(end);
              return (
                <line
                  key={`${start}-${end}`}
                  x1={p1.x} y1={p1.y}
                  x2={p2.x} y2={p2.y}
                  stroke={error ? "#ef4444" : (success ? "#10b981" : "rgba(255,255,255,0.3)")}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>

        <div className="flex gap-8">
          <button onClick={() => setNodes([])} className="text-xs text-zinc-600 flex items-center gap-2 hover:text-white transition-colors">
            <RotateCcw size={14} /> RESET POLA
          </button>
        </div>

        <footer className="pt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <Shield size={12} className="text-emerald-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Neural Encrypted Access</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default PatternLock;
