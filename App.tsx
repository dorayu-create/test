import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Share2, Flame, Edit3, ChevronRight, LayoutGrid, CalendarDays } from 'lucide-react';
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
  const [vision, setVision] = useState<Vision>({ motto: '成為更好的自己：2026 年度願景', coreValues: ['健康', '財富', '智慧'] });
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
          id: '1', title: '每日晨間冥想', category: GoalCategory.HEALTH, krNumber: 'KR1',
          target: 365, actual: 0, unit: '次', description: '保持心靈平靜與專注',
          logs: [], createdAt: Date.now()
        },
        {
          id: '2', title: '閱讀專業書籍 24 本', category: GoalCategory.GROWTH, krNumber: 'KR2',
          target: 24, actual: 0, unit: '本', description: '每個月完成兩本書',
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
    <div className="h-screen flex flex-col bg-[#fdfcfb] text-[#1a1a1a] select-none overflow-hidden">
      {/* 預覽模式提醒 */}
      {isViewMode && (
        <div className="bg-[#1a1a1a] text-white px-4 py-2 flex items-center justify-between text-[10px] font-bold tracking-widest z-[60]">
          <span className="flex items-center space-x-2">
            <Flame className="w-3 h-3 text-orange-500 fill-current" />
            <span>年度計畫模板預覽中</span>
          </span>
          <button 
            onClick={() => { localStorage.setItem(yearKey, JSON.stringify(goals)); setIsViewMode(false); window.location.hash = ''; }}
            className="bg-white text-black px-3 py-1 rounded uppercase hover:bg-gray-100 transition-colors"
          >
            匯入為我的 2026
          </button>
        </div>
      )}

      {/* 導覽列：極簡白 */}
      <nav className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 border-2 border-black flex items-center justify-center rounded-lg">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight uppercase leading-none">Zenith 2026</h1>
            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Core Strategy System</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsShareModalOpen(true)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          {!isViewMode && (
            <button 
              onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
              className="bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>新增目標</span>
            </button>
          )}
        </div>
      </nav>

      {/* 主要內容區 */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">
          
          {/* 年度北極星區塊：模擬紙質筆記本封面 */}
          <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
               <CalendarDays className="w-80 h-80" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Annual North Star</span>
                  {!isViewMode && (
                    <button onClick={() => setShowVisionEdit(!showVisionEdit)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <Edit3 className="w-3.5 h-3.5 text-gray-300 hover:text-black" />
                    </button>
                  )}
                </div>
                
                {showVisionEdit ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <input 
                      className="w-full text-3xl font-black border-b-2 border-black focus:outline-none bg-transparent py-2"
                      value={vision.motto} onChange={e => setVision({...vision, motto: e.target.value})}
                    />
                    <div className="flex items-center space-x-4">
                       <div className="flex-1 flex gap-2">
                         {vision.coreValues.map((v, i) => (
                           <input key={i} className="flex-1 text-xs font-bold bg-gray-50 p-2 rounded border" value={v} onChange={e => {
                             const nv = [...vision.coreValues]; nv[i] = e.target.value; setVision({...vision, coreValues: nv});
                           }} />
                         ))}
                       </div>
                       <button onClick={saveVision} className="bg-black text-white px-6 py-2 rounded-lg text-xs font-black">儲存願景</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{vision.motto}</h2>
                    <div className="flex flex-wrap gap-4 pt-4">
                      {vision.coreValues.map((v, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-black uppercase tracking-widest text-gray-500">{v}</span>
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

          {/* AI 助手與指標追蹤 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             <div className="lg:col-span-4">
                <AICoachPanel goals={goals} stats={stats} />
             </div>
             
             <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                   <div className="flex items-center space-x-3">
                      <LayoutGrid className="w-5 h-5 text-gray-400" />
                      <h3 className="text-sm font-black uppercase tracking-widest">習慣矩陣追蹤</h3>
                   </div>
                   <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                      {[...Array(12)].map((_, i) => (
                        <button 
                          key={i} onClick={() => setSelectedMonth(i)}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${selectedMonth === i ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}
                        >
                          {i + 1}M
                        </button>
                      ))}
                   </div>
                </div>

                <div className="overflow-x-auto no-scrollbar touch-pan-x">
                   <div className="min-w-max">
                      {/* 表頭 */}
                      <div 
                        className="grid border-b border-gray-100 bg-white sticky top-0 z-20"
                        style={{ gridTemplateColumns: window.innerWidth < 768 ? gridTemplateMobile : gridTemplateDesktop }}
                      >
                         <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase tracking-tighter">ID</div>
                         <div className="p-4 flex items-center sticky left-0 bg-white z-30 font-black text-[10px] uppercase tracking-widest text-gray-400">指標項目</div>
                         <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Target</div>
                         <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Actual</div>
                         <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Remain</div>
                         <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Efficiency</div>
                         <div className="hidden md:flex p-4 text-[9px] font-black text-gray-300 items-center justify-center uppercase">Progress</div>
                         {monthDays.map(d => (
                           <div key={d.iso} className={`w-[34px] flex flex-col items-center justify-center py-2 border-l border-gray-50 ${d.isWeekend ? 'bg-gray-50/50' : ''}`}>
                              <span className="text-[7px] font-black text-gray-300 uppercase">{d.weekDay}</span>
                              <span className="text-[10px] font-black text-gray-900">{d.day}</span>
                           </div>
                         ))}
                      </div>

                      {/* 內容列 */}
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
        </div>
      </main>

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal} editingGoal={editingGoal} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} currentGoals={goals} />
    </div>
  );
};

export default App;