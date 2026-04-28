'use client';

import React from 'react';
import { Home, FileText, TrendingUp, Clock, MessageSquare, Search, Settings, HelpCircle, LayoutGrid, Globe } from 'lucide-react';
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
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[#0a0a0b]/90 backdrop-blur-xl border-r border-white/[0.06] p-5 fixed left-0 top-0 z-50">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8c7851] to-[#6b4e3d] flex items-center justify-center shadow-lg shadow-[#8c7851]/10">
            <LayoutGrid size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base block leading-none font-outfit">Pawas<span className="text-[#8c7851]">.ai</span></span>
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">Neural System</span>
          </div>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:bg-white/[0.03] rounded-xl text-sm transition-all group mb-4 border border-transparent hover:border-white/[0.06]"
          >
            <Search size={16} className="group-hover:text-white transition-colors" />
            <span className="group-hover:text-zinc-300 transition-colors text-xs">Search</span>
            <kbd className="ml-auto text-[9px] bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.06] text-zinc-600">⌘K</kbd>
          </button>

          <div className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-3 mb-3">Main</div>

          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white/[0.04] border border-white/[0.08] rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10"><Icon size={18} /></span>
                <span className="relative z-10 font-medium text-xs">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute right-3 w-1.5 h-1.5 bg-[#8c7851] rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-white/[0.04] space-y-0.5">
          <button
            onClick={() => window.open('https://corepawas-hp.vercel.app/', '_blank')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-600 hover:text-[#8c7851] hover:bg-[#8c7851]/5 rounded-xl text-xs transition-all"
          >
            <Globe size={16} />
            <span className="font-bold">Core Pawas Web</span>
          </button>
          <button
            onClick={() => window.open('https://wa.me/6282342309890', '_blank')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.03] rounded-xl text-xs transition-all"
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
