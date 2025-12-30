
import React from 'react';
import { Goal } from '../types.ts';
import { getEfficiencyStatus } from '../utils.ts';
import { Check } from 'lucide-react';

interface GoalRowProps {
  goal: Goal;
  yearProgress: number;
  monthDays: { iso: string, day: number, isWeekend: boolean }[];
  onLog: (goalId: string, date: string) => void;
  onEdit: (goal: Goal) => void;
  isViewMode?: boolean;
  gridTemplateMobile: string;
  gridTemplateDesktop: string;
}

const GoalRow: React.FC<GoalRowProps> = ({ 
  goal, yearProgress, monthDays, onLog, onEdit, isViewMode = false,
  gridTemplateMobile, gridTemplateDesktop
}) => {
  const achievementRate = (goal.actual / goal.target) * 100;
  const remaining = Math.max(0, goal.target - goal.actual);
  const efficiency = getEfficiencyStatus(achievementRate, yearProgress);
  const getBarColor = () => achievementRate >= 100 ? 'bg-red-600' : achievementRate >= 50 ? 'bg-slate-600' : 'bg-slate-300';
  const isMobile = window.innerWidth < 768;

  return (
    <div 
      className="grid items-stretch border-b border-gray-100 group bg-white hover:bg-slate-50/50 transition-colors"
      style={{ gridTemplateColumns: isMobile ? gridTemplateMobile : gridTemplateDesktop }}
    >
      <div className="hidden md:flex p-3 text-[10px] font-black text-slate-400 border-r border-gray-100 items-center justify-center text-center uppercase">
        {goal.krNumber || 'KR'}
      </div>
      <div 
        className={`p-3 border-r border-gray-100 flex items-center justify-between sticky left-0 z-20 bg-white group-hover:bg-blue-50/40 shadow-[2px_0_8px_rgba(0,0,0,0.05)] transition-colors ${isViewMode ? 'cursor-default' : 'cursor-pointer'}`} 
        onClick={() => !isViewMode && onEdit(goal)}
      >
        <div className="min-w-0 w-full">
          <p className={`text-[10px] sm:text-xs font-black truncate leading-tight ${!isViewMode ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-600'}`}>{goal.title}</p>
          <p className="text-[7px] text-slate-400 font-bold uppercase truncate tracking-widest">{goal.category}</p>
        </div>
      </div>
      <div className="hidden md:flex p-3 text-center border-r border-gray-100 text-[11px] font-bold text-slate-500 items-center justify-center font-mono">{goal.target}</div>
      <div className="hidden md:flex p-3 text-center border-r border-gray-100 text-[11px] font-black text-blue-700 bg-blue-50/20 items-center justify-center font-mono">{goal.actual}</div>
      <div className="hidden md:flex p-3 text-center border-r border-gray-100 text-[11px] font-bold text-slate-400 items-center justify-center font-mono">{remaining}</div>
      <div className={`hidden md:flex p-3 text-center border-r border-gray-100 text-[11px] font-black items-center justify-center font-mono ${achievementRate >= 100 ? 'text-red-600' : 'text-slate-700'}`}>
        {Math.round(achievementRate)}%
      </div>
      <div className="hidden md:flex p-3 border-r border-gray-100 items-center space-x-2">
        <div className="flex-grow bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200">
          <div className={`h-full ${getBarColor()} transition-all duration-1000`} style={{ width: `${Math.min(100, achievementRate)}%` }} />
        </div>
        <span className="text-[10px]">{efficiency.icon}</span>
      </div>
      {monthDays.map(d => {
        const isLogged = goal.logs.some(l => l.date === d.iso);
        return (
          <button
            key={d.iso} disabled={isViewMode} onClick={() => onLog(goal.id, d.iso)}
            className={`w-8 min-h-[52px] border-r border-gray-50 flex items-center justify-center transition-all ${d.isWeekend ? 'bg-slate-50/50' : ''} ${isViewMode ? 'cursor-default' : 'hover:bg-blue-100 active:bg-blue-200'}`}
          >
            {isLogged ? (
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shadow-sm ${isViewMode ? 'bg-slate-400' : 'bg-blue-600 scale-110'}`}>
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            ) : <div className="w-4 h-4 border border-slate-200 rounded-sm hover:border-blue-400" />}
          </button>
        );
      })}
    </div>
  );
};

export default GoalRow;
