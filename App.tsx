import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Share2, Flame, Edit3, LayoutGrid, CalendarDays, Award } from 'lucide-react';
import { Goal, GoalCategory, YearStats, Vision } from './types.ts';
import { STORAGE_KEYS } from './constants.tsx';
import { getYearStats, getDaysInMonth, decodeDataFromUrl } from './utils.ts';
import Dashboard from './components/Dashboard.tsx';
import GoalRow from './components/GoalRow.tsx';
import GoalModal from './components/GoalModal.tsx';
import ShareModal from './components/ShareModal.tsx';
import AICoachPanel from './components/AICoachPanel.tsx';

const TARGET_YEAR = 2026;

const App: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [vision, setVision] = useState<Vision>({ motto: '2026: 追求卓越，不留遺憾', coreValues: ['專注', '健康', '豐盛'] });
  const [stats, setStats] = useState<YearStats>(() => getYearStats(TARGET_YEAR));
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isViewMode, setIsViewMode] = useState(false); 
  const [showVisionEdit, setShowVisionEdit] = useState(false);
  
  const yearKey = `${STORAGE_KEYS.GOALS}_${TARGET_YEAR}`;
  const visionKey = `zenith_vision_${TARGET_YEAR}`;
  const monthDays = useMemo(() => getDaysInMonth(TARGET_YEAR, selectedMonth), [selectedMonth]);

  const gridTemplateMobile = `120px repeat(${monthDays.length}, 34px)`;
  const gridTemplateDesktop = `60px 240px 100px 70px 70px 70px 140px repeat(${monthDays.length}, 34px)`;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
      const base64 = hash.replace('#data=', '');
      const importedData = decodeDataFromUrl(base64);
      if (importedData) {
        setGoals(importedData);
        setIsViewMode(true);
        return;
      }
    }

    const saved = localStorage.getItem(yearKey);
    const savedVision = localStorage.getItem(visionKey);
    if (savedVision) setVision(JSON.parse(savedVision));
    
    let initialData: Goal[] = [];
    if (saved) {
      try {
        initialData = JSON.parse(saved);
      } catch (e) { console.error(e); }
    }
    
    if (initialData.length === 0) {
      initialData = [
        {
          id: '1', title: '每日閱讀 30 分鐘', category: GoalCategory.GROWTH, krNumber: 'KR1',
          target: 365, actual: 0, unit: '次', description: '建立知識深度',
          logs: [], createdAt: Date.now()
        },
        {
          id: '2', title: '每週運動 4 次', category: GoalCategory.HEALTH, krNumber: 'KR2',
          target: 208, actual: 0, unit: '次', description: '維持核心體能',
          logs: [], createdAt: Date.now()
        }
      ];
    }
    setGoals(initialData);
  }, [yearKey, visionKey]);

  const saveGoals = (newGoals: Goal[]) => {
    if (isViewMode) return;
    setGoals(newGoals);
    localStorage.setItem(yearKey, JSON.stringify(newGoals));
  };

  const saveVision = () => {
    localStorage.setItem(visionKey, JSON.stringify(vision));
    setShowVisionEdit(false);
  };

  const handleLog = (goalId: string, date: string) => {
    if (isViewMode) return;
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      const existingIdx = g.logs.findIndex(l => l.date === date);
      let newLogs = [...g.logs];
      let newActual = g.actual;
      if (existingIdx > -1) {
        newLogs.splice(existingIdx, 1);
        newActual -= 1;
      } else {
        newLogs.push({ date, value: 1 });
        newActual += 1;
      }
      return { ...g, logs: newLogs, actual: newActual };
    });
    saveGoals(updated);
  };

  const handleSaveGoal = (data: Partial<Goal>) => {
    if (isViewMode) return;
    if (editingGoal) {
      saveGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...data } as Goal : g));
    } else {
      const newGoal: Goal = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        actual: 0, logs: [], createdAt: Date.now()
      } as Goal;
      saveGoals([newGoal, ...goals]);
    }
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  return (
    <div className="h-screen flex flex-col bg-[#fdfcfb] text-[#1e293b] select-none overflow-hidden animate-fade-in">
      {isViewMode && (
        <div className="bg-[#1e293b] text-white px-4 py-2 flex items-center justify-between text-[10px] font-black tracking-widest z-[60] shadow-xl">
          <span className="flex items-center space-x-2">
            <Award className="w-3.5 h-3.5 text-yellow-400 fill-current" />
            <span className="uppercase">Template Preview Mode</span>
          </span>
          <button 
            onClick={() => { localStorage.setItem(yearKey, JSON.stringify(goals)); setIsViewMode(false); window.location.hash = ''; }}
            className="bg-white text-black px-4 py-1 rounded-full text-[9px] uppercase hover:bg-gray-100 transition-all active:scale-95"
          >
            Import This Plan
          </button>
        </div>
      )}

      <nav className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-xl z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#1e293b] flex items-center justify-center rounded-xl shadow-lg rotate-3">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Zenith 2026</h1>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Master Strategy Template</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsShareModalOpen(true)} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
            <Share2 className="w-5 h-5" />
          </button>
          {!isViewMode && (
            <button 
              onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="tracking-tight">NEW GOAL</span>
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">
          
          {/* 年度大願景區塊 */}
          <div className="bg-white border border-gray-100 rounded-[48px] p-8 md:p-14 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform duration-[2000ms]">
               <CalendarDays className="w-96 h-96" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Yearly Motto</span>
                  </div>
                  {!isViewMode && (
                    <button onClick={() => setShowVisionEdit(!showVisionEdit)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-50 rounded-lg">
                      <Edit3 className="w-4 h-4 text-slate-300 hover:text-slate-900" />
                    </button>
                  )}
                </div>
                
                {showVisionEdit ? (
                  <div className="space-y-6 max-w-2xl">
                    <input 
                      className="w-full text-3xl md:text-5xl font-black border-b-4 border-blue-600 focus:outline-none bg-transparent py-2 uppercase"
                      value={vision.motto} onChange={e => setVision({...vision, motto: e.target.value})}
                    />
                    <div className="flex items-center space-x-4">
                       <div className="flex-1 flex gap-3">
                         {vision.coreValues.map((v, i) => (
                           <input key={i} className="flex-1 text-[11px] font-black uppercase tracking-widest bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all outline-none" value={v} onChange={e => {
                             const nv = [...vision.coreValues]; nv[i] = e.target.value; setVision({...vision, coreValues: nv});
                           }} />
                         ))}
                       </div>
                       <button onClick={saveVision} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl">SAVE</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase max-w-4xl">{vision.motto}</h2>
                    <div className="flex flex-wrap gap-8 pt-6">
                      {vision.coreValues.map((v, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Value 0{i+1}</span>
                          <span className="text-sm font-black uppercase tracking-[0.1em] text-slate-600">{v}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="shrink-0">
                <Dashboard stats={stats} />
              </div>
            </div>
          </div>

          <AICoachPanel goals={goals} stats={stats} />

          {/* 核心追蹤表單 */}
          <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/20">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <LayoutGrid className="w-5 h-5 text-slate-400" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Execution Grid</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">每日習慣與關鍵指標追蹤</p>
                   </div>
                </div>
                
                <div className="flex bg-white p-1.5 rounded-2xl border-2 border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                   {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].map((m, i) => (
                     <button 
                       key={i} onClick={() => setSelectedMonth(i)}
                       className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all shrink-0 ${selectedMonth === i ? 'bg-[#1e293b] text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-gray-50'}`}
                     >
                       {m}
                     </button>
                   ))}
                </div>
             </div>

             <div className="overflow-x-auto no-scrollbar touch-pan-x">
                <div className="min-w-max">
                   <div 
                     className="grid border-b border-gray-100 bg-white sticky top-0 z-20"
                     style={{ gridTemplateColumns: window.innerWidth < 768 ? gridTemplateMobile : gridTemplateDesktop }}
                   >
                      <div className="hidden md:flex p-5 text-[10px] font-black text-slate-300 items-center justify-center uppercase tracking-widest">ID</div>
                      <div className="p-5 flex items-center sticky left-0 bg-white z-30 font-black text-[11px] uppercase tracking-widest text-slate-400">Goals & Habits</div>
                      <div className="hidden md:flex p-5 text-[10px] font-black text-slate-300 items-center justify-center uppercase">Target</div>
                      <div className="hidden md:flex p-5 text-[10px] font-black text-slate-300 items-center justify-center uppercase">Actual</div>
                      <div className="hidden md:flex p-5 text-[10px] font-black text-slate-300 items-center justify-center uppercase">Remain</div>
                      <div className="hidden md:flex p-5 text-[10px] font-black text-slate-300 items-center justify-center uppercase">Status</div>
                      <div className="hidden md:flex p-5 text-[10px] font-black text-slate-300 items-center justify-center uppercase">Rate</div>
                      {monthDays.map(d => (
                        <div key={d.iso} className={`w-[34px] flex flex-col items-center justify-center py-3 border-l border-gray-50/50 ${d.isWeekend ? 'bg-slate-50/30' : ''}`}>
                           <span className="text-[8px] font-black text-slate-300 uppercase mb-0.5">{d.weekDay}</span>
                           <span className="text-[11px] font-black text-slate-900">{d.day}</span>
                        </div>
                      ))}
                   </div>

                   <div className="divide-y divide-gray-50">
                     {goals.map(goal => (
                       <GoalRow 
                         key={goal.id} goal={goal} todayISO={stats.todayISO} yearProgress={stats.yearProgress} monthDays={monthDays} onLog={handleLog}
                         onEdit={(g) => { if(!isViewMode) { setEditingGoal(g); setIsModalOpen(true); } }}
                         isViewMode={isViewMode} gridTemplateMobile={gridTemplateMobile} gridTemplateDesktop={gridTemplateDesktop}
                       />
                     ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal} editingGoal={editingGoal} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} currentGoals={goals} />
    </div>
  );
};

export default App;