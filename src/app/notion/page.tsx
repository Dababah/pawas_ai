'use client';

import React, { useState } from 'react';
import BlockEditor from '@/components/editor/BlockEditor';
import DatabaseView from '@/components/database/DatabaseView';
import { BookOpen, Database, Sparkles, Mic, FileText } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function NotionEnginePage() {
  const [activeTab, setActiveTab] = useState<'editor' | 'database' | 'smart-capture'>('editor');
  
  return (
    <div className="min-h-screen bg-[#000000] text-white font-inter pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Neural Workspace
          </h1>
        </div>
      </header>

      {/* Tabs / Navigation */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'editor' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <FileText size={18} /> Notes Canvas
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'database' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Database size={18} /> Databases
          </button>
          <button
            onClick={() => setActiveTab('smart-capture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'smart-capture' ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Mic size={18} /> Smart Capture
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'editor' && (
            <div className="bg-[#050505] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <BookOpen className="text-gray-400" size={24} />
                <h2 className="text-2xl font-bold">Jurnal Trading & Kuliah</h2>
              </div>
              <BlockEditor />
            </div>
          )}

          {activeTab === 'database' && (
            <div className="bg-[#050505] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold">Master Database</h2>
                <p className="text-sm text-gray-400 mt-1">Manage inventory, tasks, and deadlines in one place.</p>
              </div>
              <DatabaseView />
            </div>
          )}

          {activeTab === 'smart-capture' && (
            <div className="bg-[#050505] rounded-2xl border border-white/10 p-8 shadow-2xl text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6 animate-pulse">
                <Mic size={32} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">AI Smart Capture</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Speak or type naturally. AI will automatically route your input to the Gadget Inventory, College Tasks, or Trading Journal based on context.
              </p>
              <div className="w-full max-w-lg flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. 'I just bought an iPhone 13 Pro for 12 mil...'" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
