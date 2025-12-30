import React from 'react';
import { YearStats } from '../types.ts';

interface DashboardProps {
  stats: YearStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const items = [
    { label: 'Year', value: stats.year },
    { label: 'Remain', value: stats.daysRemaining },
    { label: 'Elapsed', value: stats.daysElapsed },
  ];

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex items-center space-x-6">
        {items.map((item, idx) => (
          <div key={idx} className="text-right">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300 mb-1">{item.label}</p>
            <p className="text-xl font-black tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-black text-white p-4 rounded-2xl w-full md:w-64 shadow-2xl shadow-blue-900/10">
        <div className="flex justify-between items-center mb-3">
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Time Progress</span>
           <span className="text-xl font-black tabular-nums">{stats.yearProgress.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
           <div 
            className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${stats.yearProgress}%` }}
           />
        </div>
        <p className="text-[8px] font-bold text-gray-500 mt-2 uppercase text-center tracking-tighter italic">"Tomorrow is a gift, today is a strategy."</p>
      </div>
    </div>
  );
};

export default Dashboard;