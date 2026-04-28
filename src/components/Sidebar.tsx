'use client';

import React from 'react';
import { Home, FileText, TrendingUp, Clock, MessageSquare, Search, Settings, HelpCircle, LayoutGrid, Globe, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import SearchModal from './SearchModal';

const Sidebar = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[#1c1a1d] border-r border-white/[0.04] py-3 px-3 fixed left-0 top-0 z-50">
        {/* Workspace Switcher */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-4 hover:bg-white/[0.03] rounded-lg cursor-pointer transition-all group">
          <div className="w-6 h-6 rounded-md bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutGrid size={14} className="text-white" />
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="font-bold text-zinc-200 text-sm block leading-none truncate font-inter">Pawas Workspace</span>
          </div>
          <Settings size={14} className="text-zinc-600 group-hover:text-zinc-400" />
        </div>

        <div className="space-y-0.5 px-1">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:bg-white/[0.04] rounded-lg text-sm transition-all group mb-2"
          >
            <Search size={16} />
            <span className="text-zinc-400 text-[13px]">Search</span>
            <kbd className="ml-auto text-[10px] text-zinc-600 font-sans tracking-tighter opacity-50">⌘K</kbd>
          </button>

          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                  isActive ? 'bg-white/[0.06] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Workspace Section (AppFlowy Style) */}
        <div className="mt-8 px-1">
          <div className="flex items-center justify-between px-3 mb-2 group">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Favorites</span>
            <Plus size={12} className="text-zinc-600 opacity-0 group-hover:opacity-100 cursor-pointer" />
          </div>
          <div className="space-y-0.5">
             <Link href="/notes" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300 transition-all">
                <FileText size={16} className="text-zinc-600" />
                <span>Product Roadmap</span>
             </Link>
          </div>
        </div>

        <div className="mt-auto pt-4 space-y-1 px-1 border-t border-white/[0.02]">
          <Link
            href="/assistant"
            className="flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-400/5 rounded-lg text-[13px] transition-all"
          >
            <MessageSquare size={16} />
            <span className="font-medium">AI Assistant</span>
          </Link>
          <button
            onClick={() => window.open('https://wa.me/6282342309890', '_blank')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] rounded-lg text-[13px] transition-all text-left"
          >
            <HelpCircle size={16} />
            <span className="font-medium">Support</span>
          </button>
        </div>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-5 left-5 right-5 h-16 bg-[#0a0a0b]/90 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] flex justify-around items-center px-3 z-50 shadow-2xl">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center w-11 h-11 rounded-2xl transition-all ${
                isActive ? 'text-white' : 'text-zinc-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active-pill"
                  className="absolute inset-0 bg-white/[0.08] border border-white/[0.08] rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10"><Icon size={20} /></span>
              {isActive && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-0.5 w-1 h-1 bg-[#8c7851] rounded-full"
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
