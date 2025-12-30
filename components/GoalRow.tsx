import React, { useMemo } from 'react';
import { Goal } from '../types.ts';
import { getEfficiencyStatus, calculateStreak } from '../utils.ts';
import { Check, Flame } from 'lucide-react';

interface GoalRowProps {
  goal: Goal;
  todayISO: string;
  yearProgress: number;
  monthDays: { iso: string, day: number, isWeekend: boolean, weekDay: string }[];
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
  
  const isMobile = window.innerWidth < 768;

  return (
    <div 
      className="grid items-stretch group hover:bg-slate-50/50 transition-colors"
      style={{ gridTemplateColumns: isMobile ? gridTemplateMobile : gridTemplateDesktop }}
    >
      <div className="hidden md:flex p-5 text-[11px] font-black text-slate-200 border-r border-gray-50 items-center justify-center font-mono">
        {goal.krNumber || '--'}
      </div>
      
      <div 
        className={`p-5 border-r border-gray-50 flex items-center justify-between sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 transition-colors ${isViewMode ? '' : 'cursor-pointer'}`}
        onClick={() => !isViewMode && onEdit(goal)}
      >
        <div className="min-w-0">
           <div className="flex items-center space-x-2.5 mb-1.5">
             <h4 className="text-[13px] font-black text-slate-800 truncate tracking-tight">{goal.title}</h4>
             {streak.current > 2 && (
               <div className="flex items-center text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full animate-bounce-slow">
                  <Flame className="w-3 h-3 fill-current mr-0.5" />
                  {streak.current}
               </div>
             )}
           </div>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] truncate">{goal.category}</p>
        </div>
      </div>

      <div className="hidden md:flex p-5 text-center border-r border-gray-50 text-[11px] font-bold text-slate-400 items-center justify-center font-mono">{goal.target}</div>
      <div className="hidden md:flex p-5 text-center border-r border-gray-50 text-[12px] font-black text-blue-600 bg-blue-50/20 items-center justify-center font-mono">{goal.actual}</div>
      <div className="hidden md:flex p-5 text-center border-r border-gray-50 text-[11px] font-bold text-slate-300 items-center justify-center font-mono">{remaining}</div>
      <div className="hidden md:flex p-5 text-center border-r border-gray-50 items-center justify-center">
         <span className={`text-[9px] font-black px-3 py-1 rounded-full ${efficiency.bg} ${efficiency.color} uppercase tracking-widest`}>
           {efficiency.label}
         </span>
      </div>
      <div className="hidden md:flex p-5 border-r border-gray-50 items-center justify-center">
         <div className="flex flex-col items-center">
            <span className={`text-[11px] font-black ${achievementRate >= 100 ? 'text-green-600' : 'text-slate-800'}`}>{Math.round(achievementRate)}%</span>
            <div className="w-12 bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ${achievementRate >= 100 ? 'bg-green-500' : 'bg-slate-800'}`}
                 style={{ width: `${Math.min(100, achievementRate)}%` }}
               />
            </div>
         </div>
      </div>

      {monthDays.map(d => {
        const isLogged = goal.logs.some(l => l.date === d.iso);
        const isToday = d.iso === todayISO;
        return (
          <button
            key={d.iso} disabled={isViewMode} onClick={() => onLog(goal.id, d.iso)}
            className={`w-[34px] min-h-[60px] border-r border-gray-50/50 flex items-center justify-center transition-all ${d.isWeekend ? 'bg-slate-50/20' : ''} ${isToday ? 'relative after:absolute after:inset-x-0 after:bottom-0 after:h-1.5 after:bg-blue-600' : ''} ${isViewMode ? '' : 'hover:bg-blue-50/30'}`}
          >
            {isLogged ? (
              <div className="w-5.5 h-5.5 bg-[#1e293b] rounded-md shadow-md flex items-center justify-center scale-110 animate-in zoom-in-75">
                <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
              </div>
            ) : (
              <div className={`w-4 h-4 border-[1.5px] rounded-md transition-colors ${d.isWeekend ? 'border-gray-200 bg-white/50' : 'border-gray-100 bg-white'} group-hover:border-gray-300`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default GoalRow;