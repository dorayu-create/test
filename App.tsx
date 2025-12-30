import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Share2, Flame, Edit3, LayoutGrid, CalendarDays, Award, ChevronRight } from 'lucide-react';
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
  const [vision, setVision] = useState<Vision>({ motto: '2026: 追求卓越，不留遺憾', coreValues: ['紀律', '專注', '財富'] });
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
          id: '1', title: '每日核心運動', category: GoalCategory.HEALTH, krNumber: 'KR1',
          target: 365, actual: 0, unit: '次', description: '保持體力與心理健康',
          logs: [], createdAt: Date.now()
        },
        {
          id: '2', title: '深度學習專業技能', category: GoalCategory.GROWTH, krNumber: 'KR2',
          target: 250, actual: 0, unit: '小時', description: '建立職涯護城河',
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
    <div className="h-screen flex flex-col bg-[#fdfcfb] text-[#0f172a] select-none overflow-hidden">
      {isViewMode && (
        <div className="bg-[#0f172a] text-white px-4 py-1.5 flex items-center justify-between text-[10px] font-black tracking-widest z-[60]">
          <span className="flex items-center space-x-2">
            <Award className="w-3.5 h-3.5 text-yellow-400 fill-current" />
            <span className="uppercase">Template Preview</span>
          </span>
          <button 
            onClick={() => { localStorage.setItem(yearKey, JSON.stringify(goals)); setIsViewMode(false); window.location.hash = ''; }}
            className="bg-white text-black px-4 py-0.5 rounded-full text-[9px] font-bold"
          >
            IMPORT AS MINE
          </button>
        </div>
      )}

      <header className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-md z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-9 h-9 bg-[#0f172a] flex items-center justify-center rounded-xl shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tighter uppercase leading-none">Zenith 2026</h1>
            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Master Strategy Template</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsShareModalOpen(true)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-black">
            <Share2 className="w-5 h-5" />
          </button>
          {!isViewMode && (
            <button 
              onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
              className="bg-[#0f172a] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>新增指標</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">
          
          {/* 年度願景區塊 (Vision Board) */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-6 transition-transform duration-1000">
               <CalendarDays className="w-80 h-80" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Annual North Star</span>
                  {!isViewMode && (
                    <button onClick={() => setShowVisionEdit(!showVisionEdit)} className="opacity-0 group-hover:opacity-100 p-1 transition-opacity">
                      <Edit3 className="w-3.5 h-3.5 text-gray-300 hover:text-black" />
                    </button>
                  )}
                </div>
                
                {showVisionEdit ? (
                  <div className="space-y-4 max-w-2xl">
                    <input 
                      className="w-full text-4xl font-black border-b-2 border-black focus:outline-none bg-transparent py-2"
                      value={vision.motto} onChange={e => setVision({...vision, motto: e.target.value})}
                    />
                    <div className="flex items-center space-x-4">
                       <div className="flex-1 flex gap-2">
                         {vision.coreValues.map((v, i) => (
                           <input key={i} className="flex-1 text-xs font-bold bg-gray-50 p-3 rounded-xl border border-transparent focus:border-gray-200" value={v} onChange={e => {
                             const nv = [...vision.coreValues]; nv[i] = e.target.value; setVision({...vision, coreValues: nv});
                           }} />
                         ))}
                       </div>
                       <button onClick={saveVision} className="bg-black text-white px-8 py-3 rounded-xl text-xs font-black">SAVE</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">{vision.motto}</h2>
                    <div className="flex flex-wrap gap-8 pt-4">
                      {vision.coreValues.map((v, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">{v}</span>
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

          {/* 習慣追蹤矩陣 (Execution Matrix) */}
          <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                <div className="flex items-center space-x-3">
                   <LayoutGrid className="w-5 h-5 text-gray-400" />
                   <h3 className="text-xs font-black uppercase tracking-widest">Execution Grid</h3>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                   {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].map((m, i) => (
                     <button 
                       key={i} onClick={() => setSelectedMonth(i)}
                       className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all shrink-0 ${selectedMonth === i ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                     >
                       {m}
                     </button>
                   ))}
                </div>
             </div>

             <div className="overflow-x-auto no-scrollbar touch-pan-x">
                <div className="min-w-max">
                   {/* Grid Header */}
                   <div 
                     className="grid border-b border-gray-100 bg-white sticky top-0 z-20"
                     style={{ gridTemplateColumns: window.innerWidth < 768 ? gridTemplateMobile : gridTemplateDesktop }}
                   >
                      <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase tracking-widest">ID</div>
                      <div className="p-4 flex items-center sticky left-0 bg-white z-30 font-black text-[10px] uppercase tracking-widest text-gray-400 border-r border-gray-50">關鍵指標</div>
                      <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Target</div>
                      <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Actual</div>
                      <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Remain</div>
                      <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Status</div>
                      <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Rate</div>
                      {monthDays.map(d => (
                        <div key={d.iso} className={`w-[34px] flex flex-col items-center justify-center py-2 border-l border-gray-50 ${d.isWeekend ? 'bg-gray-50/50' : ''}`}>
                           <span className="text-[7px] font-black text-gray-300 uppercase">{d.weekDay}</span>
                           <span className="text-[10px] font-black">{d.day}</span>
                        </div>
                      ))}
                   </div>

                   {/* Rows */}
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