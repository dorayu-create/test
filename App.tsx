import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Share2, Zap, Flame, Compass, Edit3 } from 'lucide-react';
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
  const [vision, setVision] = useState<Vision>({ motto: '2026: 追求卓越，不留遺憾', coreValues: ['自律', '創新', '共贏'] });
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

  const gridTemplateMobile = `110px repeat(${monthDays.length}, 36px)`;
  const gridTemplateDesktop = `60px 220px 100px 70px 70px 70px 160px repeat(${monthDays.length}, 36px)`;

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
          id: '1', title: '每日深度學習 1 小時', category: GoalCategory.GROWTH, krNumber: 'KR1',
          target: 300, actual: 0, unit: '次', description: '閱讀與專業技能提升',
          logs: [], createdAt: Date.now()
        },
        {
          id: '2', title: '全年度 5KM 慢跑', category: GoalCategory.HEALTH, krNumber: 'KR2',
          target: 150, actual: 0, unit: '次', description: '建立強健體格',
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

  const handleImportToMine = () => {
    if (window.confirm('確定要將此模板匯入為您的正式計畫嗎？這將覆蓋您目前的資料。')) {
      localStorage.setItem(yearKey, JSON.stringify(goals));
      setIsViewMode(false);
      window.history.replaceState(null, "", window.location.pathname);
    }
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
        actual: 0,
        logs: [],
        createdAt: Date.now()
      } as Goal;
      saveGoals([newGoal, ...goals]);
    }
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  return (
    <div className="h-screen flex flex-col font-sans select-none bg-slate-50 text-slate-900 overflow-hidden">
      {isViewMode && (
        <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between text-[11px] font-black uppercase tracking-widest z-[60] shadow-xl">
          <div className="flex items-center space-x-2">
            <Zap className="w-3 h-3 fill-current text-yellow-300 animate-pulse" />
            <span>模板預覽模式</span>
          </div>
          <button onClick={handleImportToMine} className="bg-white text-indigo-600 px-4 py-1 rounded-full font-black shadow-lg hover:bg-indigo-50 active:scale-95 transition-all">
            立即匯入
          </button>
        </div>
      )}

      <header className="bg-slate-900 text-white px-6 h-16 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase leading-none">Zenith 2026</h1>
            <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] mt-1 uppercase">Strategic Planning System</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!isViewMode && (
            <button onClick={() => setIsShareModalOpen(true)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          )}
          {!isViewMode && (
            <button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 active:scale-95 shadow-lg shadow-indigo-600/30 transition-all">
              <Plus className="w-4 h-4" />
              <span>新增指標</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 pb-20">
        <div className="p-4 sm:p-8 max-w-[1800px] mx-auto space-y-8">
          
          {/* 年度願景區塊 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Compass className="w-40 h-40" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded">Annual Vision</span>
                  {!isViewMode && (
                    <button onClick={() => setShowVisionEdit(!showVisionEdit)} className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>
                {showVisionEdit ? (
                  <div className="space-y-4 max-w-lg">
                    <input 
                      className="w-full text-2xl font-black bg-slate-50 border-b-2 border-indigo-500 p-2 outline-none" 
                      value={vision.motto} onChange={e => setVision({...vision, motto: e.target.value})}
                    />
                    <div className="flex gap-2">
                       {vision.coreValues.map((v, i) => (
                         <input key={i} className="bg-slate-50 border rounded px-2 py-1 text-xs font-bold" value={v} onChange={e => {
                           const newV = [...vision.coreValues];
                           newV[i] = e.target.value;
                           setVision({...vision, coreValues: newV});
                         }} />
                       ))}
                       <button onClick={saveVision} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold">儲存</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{vision.motto}</h2>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {vision.coreValues.map((v, i) => (
                        <div key={i} className="flex items-center space-x-1 px-3 py-1 bg-slate-100 rounded-full">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{v}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="bg-slate-900 rounded-2xl p-5 text-white min-w-[240px] shadow-2xl">
                 <div className="flex justify-between items-center mb-4">
                   <span className="text-[9px] font-black uppercase text-slate-400">Streak Champion</span>
                   <Flame className="w-4 h-4 text-orange-500 fill-current" />
                 </div>
                 <div className="text-3xl font-black mb-1">Stay Focused.</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                   建立連勝，<br/>是建立自律的最短路徑。
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-1"><Dashboard stats={stats} /></div>
            <div className="xl:col-span-3"><AICoachPanel goals={goals} stats={stats} /></div>
          </div>

          <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar touch-pan-x bg-white">
              <div className="min-w-max">
                <div 
                  className="grid bg-slate-900 text-white text-[10px] font-black uppercase sticky top-0 z-30 shadow-md"
                  style={{ gridTemplateColumns: window.innerWidth < 768 ? gridTemplateMobile : gridTemplateDesktop }}
                >
                  <div className="hidden md:flex p-4 border-r border-slate-800 items-center justify-center">KR</div>
                  <div className="p-4 border-r border-slate-800 flex items-center sticky left-0 bg-slate-900 z-40">
                    <span className="text-indigo-400 mr-2">/</span>項目追蹤
                  </div>
                  <div className="hidden md:flex p-4 border-r border-slate-800 items-center justify-center">目標</div>
                  <div className="hidden md:flex p-4 border-r border-slate-800 items-center justify-center">累積</div>
                  <div className="hidden md:flex p-4 border-r border-slate-800 items-center justify-center">剩餘</div>
                  <div className="hidden md:flex p-4 border-r border-slate-800 items-center justify-center text-emerald-400">效率</div>
                  <div className="hidden md:flex p-4 border-r border-slate-800 items-center justify-center">進度</div>
                  {monthDays.map(d => (
                    <div key={d.iso} className={`w-9 border-r border-slate-800 flex flex-col items-center justify-center py-2 ${d.isWeekend ? 'bg-slate-800/50' : ''}`}>
                      <span className="opacity-40 text-[8px] font-bold mb-0.5">{d.weekDay}</span>
                      <span className="text-[11px] font-black">{d.day}</span>
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-slate-100">
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

      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 shrink-0 p-4 shadow-2xl z-50">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar max-w-[1200px] mx-auto justify-start sm:justify-center">
           {[...Array(12)].map((_, i) => (
             <button key={i} onClick={() => setSelectedMonth(i)} className={`px-5 py-2.5 text-[11px] font-black rounded-2xl transition-all whitespace-nowrap shrink-0 ${selectedMonth === i ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}>
               {i + 1}月
             </button>
           ))}
        </div>
      </footer>
      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal} editingGoal={editingGoal} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} currentGoals={goals} />
    </div>
  );
};

export default App;