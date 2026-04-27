'use client';

import React from 'react';
import { Home, FileText, TrendingUp, Globe, MessageSquare, Plus, Search, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { icon: <Home size={18} />, label: 'Dashboard', path: '/' },
    { icon: <FileText size={18} />, label: 'Workspace', path: '/notes' },
    { icon: <TrendingUp size={18} />, label: 'Trading', path: '/trading' },
    { icon: <Globe size={18} />, label: 'Web Apps', path: '/web' },
    { icon: <MessageSquare size={18} />, label: 'AI Assistant', path: '/assistant' },
  ];

  return (
    <>
      {/* Desktop Sidebar (Notion Style) */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-[#0b0b0b] border-r border-white/5 p-4 fixed left-0 top-0 z-50">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-white text-xs">P</div>
          <span className="font-semibold text-zinc-200 text-sm">Pawas.ai</span>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-1.5 text-zinc-500 hover:bg-white/5 rounded-md text-sm transition-colors mb-4">
            <Search size={16} /> Search
          </button>
          
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all ${
                pathname === item.path ? 'bg-white/5 text-white font-medium' : 'text-zinc-500 hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-1.5 text-zinc-500 hover:bg-white/5 rounded-md text-sm">
            <Settings size={16} /> Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-1.5 text-zinc-500 hover:bg-white/5 rounded-md text-sm">
            <HelpCircle size={16} /> Help
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Bottom Nav (Refined) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-3xl flex justify-around items-center px-4 z-50 shadow-2xl">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              pathname === item.path ? 'bg-white/5 text-white' : 'text-zinc-500'
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
