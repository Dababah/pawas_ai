'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Neural Security</h1>
            <p className="text-zinc-500 text-sm mt-1">Verifikasi identitas Fawwaz Ali</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="email" 
              placeholder="Email neural"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-emerald-500/50"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="password" 
              placeholder="Sandi enkripsi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-emerald-500/50"
              required
            />
          </div>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Akses Sistem'}
          </button>
        </form>

        <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest">
          End-to-End Encryption Enabled
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
