'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center">
              <span className="text-3xl font-black text-black">P</span>
            </div>
            <h1 className="text-2xl font-bold tracking-widest text-white">PAWAS.AI</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Neural Assistant</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
