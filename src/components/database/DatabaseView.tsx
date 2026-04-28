'use client';

import React, { useState } from 'react';
import { Table as TableIcon, Layout, Calendar as CalendarIcon, Plus, MoreHorizontal } from 'lucide-react';

type ViewMode = 'table' | 'board' | 'calendar';

interface RowData {
  id: string;
  name: string;
  status: string;
  price: number;
  cost: number;
  deadline: string;
}

export default function DatabaseView() {
  const [view, setView] = useState<ViewMode>('table');
  const [data, setData] = useState<RowData[]>([
    { id: '1', name: 'iPhone 13 Pro', status: 'In Stock', price: 13000000, cost: 12000000, deadline: '2026-05-01' },
    { id: '2', name: 'Tugas Machine Learning', status: 'In Progress', price: 0, cost: 0, deadline: '2026-04-30' },
    { id: '3', name: 'NFP Data Release', status: 'To Do', price: 0, cost: 0, deadline: '2026-05-05' },
  ]);

  const renderTableView = () => (
    <div className="overflow-x-auto border border-white/10 rounded-xl">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="text-xs uppercase bg-white/5 text-gray-400">
          <tr>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Price</th>
            <th className="px-6 py-3 font-medium">Margin</th>
            <th className="px-6 py-3 font-medium">Deadline</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium text-white">{row.name}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs rounded-md bg-white/10 border border-white/20">
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4">Rp {row.price.toLocaleString()}</td>
              <td className="px-6 py-4 text-green-400">
                {row.price > 0 ? `Rp ${(row.price - row.cost).toLocaleString()}` : '-'}
              </td>
              <td className="px-6 py-4">{row.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3 border-t border-white/10">
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <Plus size={16} /> New Row
        </button>
      </div>
    </div>
  );

  const renderBoardView = () => {
    const columns = ['To Do', 'In Progress', 'Done', 'In Stock'];
    
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col} className="min-w-[280px] bg-white/5 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {col} <span className="text-gray-500">{data.filter(d => d.status === col).length}</span>
              </h3>
              <button className="text-gray-500 hover:text-white"><MoreHorizontal size={16} /></button>
            </div>
            {data.filter(d => d.status === col).map(item => (
              <div key={item.id} className="bg-[#111] border border-white/10 p-3 rounded-lg hover:border-white/20 transition-colors cursor-pointer group">
                <p className="text-sm font-medium text-white mb-2">{item.name}</p>
                {item.deadline && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <CalendarIcon size={12} /> {item.deadline}
                  </p>
                )}
              </div>
            ))}
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mt-2 transition-colors">
              <Plus size={14} /> New
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarView = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[400px]">
      <CalendarIcon size={48} className="text-white/20 mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">Calendar View Active</h3>
      <p className="text-sm text-gray-400 max-w-sm text-center">
        Full calendar grid rendering would be implemented here, mapping deadlines and economic data releases to dates.
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 font-inter">
      {/* View Tabs */}
      <div className="flex items-center gap-1 bg-[#111] p-1 rounded-lg w-fit mb-6 border border-white/10">
        <button
          onClick={() => setView('table')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <TableIcon size={16} /> Table
        </button>
        <button
          onClick={() => setView('board')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'board' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <Layout size={16} /> Board
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <CalendarIcon size={16} /> Calendar
        </button>
      </div>

      {/* Database Content */}
      <div className="min-h-[400px]">
        {view === 'table' && renderTableView()}
        {view === 'board' && renderBoardView()}
        {view === 'calendar' && renderCalendarView()}
      </div>
    </div>
  );
}
