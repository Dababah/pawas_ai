'use client';

import React from 'react';
import { Home, FileText, TrendingUp, Clock, MessageSquare, Search, Settings, HelpCircle, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Workspace', path: '/notes' },
    { icon: Clock, label: 'Deadlines', path: '/tasks' },
    { icon: TrendingUp, label: 'Trading', path: '/trading' },
    { icon: MessageSquare, label: 'AI Assistant', path: '/assistant' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[#0d1a15]/50 backdrop-blur-xl border-r border-white/5 p-6 fixed left-0 top-0 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4a6741] to-[#8c7851] flex items-center justify-center shadow-lg shadow-[#4a6741]/20">
            <LayoutGrid size={20} className="text-[#f0ede4]" />
          </div>
          <div>
            <span className="font-bold text-[#f0ede4] text-lg block leading-none font-outfit">Pawas.ai</span>
            <span className="text-[10px] text-[#8c7851] uppercase tracking-widest font-bold">Neural System</span>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-[#8c7851] hover:bg-white/5 rounded-xl text-sm transition-all group mb-6 border border-transparent hover:border-white/5">
            <Search size={18} className="group-hover:text-[#f0ede4] transition-colors" />
            <span className="group-hover:text-[#f0ede4] transition-colors">Quick Search</span>
            <kbd className="ml-auto text-[10px] bg-[#1a2e26] px-1.5 py-0.5 rounded border border-white/10 text-[#8c7851]">⌘K</kbd>
          </button>
          
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 mb-4">Main Menu</div>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive 
                    ? 'text-white' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                  <Icon size={20} />
                </span>
                <span className="relative z-10 font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-dot"
                    className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl text-sm transition-all">
            <Settings size={18} />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl text-sm transition-all">
            <HelpCircle size={18} />
            <span className="font-medium">Support</span>
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-[#0d1a15]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex justify-around items-center px-4 z-50 shadow-2xl premium-shadow">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="mobile-active-pill"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                <Icon size={22} />
              </span>
              {isActive && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;

