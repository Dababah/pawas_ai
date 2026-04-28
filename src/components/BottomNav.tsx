'use client';

import React from 'react';
import { Home, FileText, TrendingUp, Globe, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: <Home size={22} />, label: 'Home', path: '/' },
    { icon: <FileText size={22} />, label: 'Neural', path: '/notion' },
    { icon: <TrendingUp size={22} />, label: 'Trade', path: '/trading' },
    { icon: <Globe size={22} />, label: 'Web', path: '/web' },
    { icon: <MessageSquare size={22} />, label: 'AI', path: '/assistant' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`flex flex-col items-center gap-1 transition-all ${
            pathname === item.path ? 'text-white scale-110' : 'text-zinc-500'
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
