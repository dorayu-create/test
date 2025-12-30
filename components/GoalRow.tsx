import React, { useMemo } from 'react';
import { Goal } from '../types.ts';
import { getEfficiencyStatus, calculateStreak } from '../utils.ts';
import { Check, Flame } from 'lucide-react';

interface GoalRowProps {
  goal: Goal;
  todayISO: string;
  yearProgress: number;
  monthDays: { iso: string, day: number, isWeekend: boolean }[];
  onLog: (goalId: string, date: string) => void;
  onEdit: (goal: Goal) => void;
  isViewMode?: boolean;
  gridTemplateMobile: string;
  gridTemplateDesktop: string;
}

const GoalRow: React.FC<GoalRowProps> = ({ 
  goal, todayISO, yearProgress, monthDays, onLog, onEdit, isViewMode = false,
  gridTemplateMobile, gridTemplateDesktop
}) => {
  const achievementRate = (goal.actual / goal.target) * 100;
  const remaining = Math.max(0, goal.target - goal.actual);
  const efficiency = getEfficiencyStatus(achievementRate, yearProgress);
  const streak = useMemo(() => calculateStreak(goal.logs, todayISO), [goal.logs, todayISO]);
  
  const getBarColor = () => achievementRate >= 100 ? 'bg-red-500' : achievementRate >= 50 ? 'bg-indigo-600' : 'bg-slate-400';
  const isMobile = window.innerWidth < 768;

  return (
    <div 
      className="grid items-stretch border-b border-slate-50 group bg-white hover:bg-slate-50/80 transition-all"
      style={{ gridTemplateColumns: isMobile ? gridTemplateMobile : gridTemplateDesktop }}
    >
      <div className="hidden md:flex p-4 text-[11px] font-black text-slate-300 border-r border-slate-50 items-center justify-center font-mono">
        {goal.krNumber || 'KR'}
      </div>
      <div 
        className={`p-4 border-r border-slate-100 flex items-center justify-between sticky left-0 z-20 bg-white group-hover:bg-indigo-50/40 shadow-[4px_0_15px_rgba(0,0,0,0.03)] transition-colors ${isViewMode ? 'cursor-default' : 'cursor-pointer'}`} 
        onClick={() => !isViewMode && onEdit(goal)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5 mb-1">
            <p className={`text-xs font-black truncate leading-tight ${!isViewMode ? 'text-slate-900 group-hover:text-indigo-600' : 'text-slate-700'}`}>{goal.title}</p>
            {streak.current > 0 && (
              <div className="flex items-center text-[10px] text-orange-500 font-black animate-bounce-slow">
                <Flame className="w-3 h-3 fill-current mr-0.5" />
                {streak.current}
              </div>
            )}
          </div>
          <p className="text-[8px] text-slate-400 font-bold uppercase truncate tracking-widest">{goal.category}</p>
        </div>
      </div>
      <div className="hidden md:flex p-4 text-center border-r border-slate-50 text-[11px] font-bold text-slate-400 items-center justify-center font-mono">{goal.target}</div>
      <div className="hidden md:flex p-4 text-center border-r border-slate-50 text-[12px] font-black text-indigo-700 bg-indigo-50/20 items-center justify-center font-mono">{goal.actual}</div>
      <div className="hidden md:flex p-4 text-center border-r border-slate-50 text-[11px] font-bold text-slate-400 items-center justify-center font-mono">{remaining}</div>
      <div className={`hidden md:flex p-4 text-center border-r border-slate-50 text-[11px] font-black items-center justify-center font-mono ${achievementRate >= 100 ? 'text-red-600' : 'text-slate-700'}`}>
        {Math.round(achievementRate)}%
      </div>
      <div className="hidden md:flex p-4 border-r border-slate-50 items-center space-x-2">
        <div className="flex-grow bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div className={`h-full ${getBarColor()} transition-all duration-1000`} style={{ width: `${Math.min(100, achievementRate)}%` }} />
        </div>
        <span title={efficiency.label} className="text-xs cursor-help">{efficiency.icon}</span>
      </div>
      {monthDays.map(d => {
        const isLogged = goal.logs.some(l => l.date === d.iso);
        const isToday = d.iso === todayISO;
        return (
          <button
            key={d.iso} disabled={isViewMode} onClick={() => onLog(goal.id, d.iso)}
            className={`w-9 min-h-[60px] border-r border-slate-50 flex items-center justify-center transition-all ${d.isWeekend ? 'bg-slate-50/50' : ''} ${isToday ? 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500' : ''} ${isViewMode ? 'cursor-default' : 'hover:bg-indigo-50 active:scale-90'}`}
          >
            {isLogged ? (
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-md ${isViewMode ? 'bg-slate-400' : 'bg-indigo-600'}`}>
                <Check className="w-4 h-4 text-white stroke-[4]" />
              </div>
            ) : <div className={`w-5 h-5 border-2 rounded-lg transition-colors ${d.isWeekend ? 'border-slate-200 bg-white/50' : 'border-slate-100 bg-white'} group-hover:border-slate-200`} />}
          </button>
        );
      })}
    </div>
  );
};

export default GoalRow;