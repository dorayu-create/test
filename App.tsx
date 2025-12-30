
import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Download, Upload, RefreshCw, Share2, Lock, Save, ArrowLeft, Zap } from 'lucide-react';
import { Goal, GoalCategory, YearStats } from './types';
import { STORAGE_KEYS } from './constants';
import { getYearStats, getDaysInMonth, decodeDataFromUrl } from './utils';
import Dashboard from './components/Dashboard';
import GoalRow from './components/GoalRow';
import GoalModal from './components/GoalModal';
import ShareModal from './components/ShareModal';
import AICoachPanel from './components/AICoachPanel';

const TARGET_YEAR = 2026;

const App: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<YearStats>(() => getYearStats(TARGET_YEAR));
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isViewMode, setIsViewMode] = useState(false); 
  
  const yearKey = `${STORAGE_KEYS.GOALS}_${TARGET_YEAR}`;
  const monthDays = useMemo(() => getDaysInMonth(TARGET_YEAR, selectedMonth), [selectedMonth]);

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
    let initialData: Goal[] = [];
    
    if (saved) {
      try {
        initialData = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    
    if (initialData.length === 0) {
      initialData = [
        {
          id: '1', title: '2026 數位轉型計畫', category: GoalCategory.CAREER, krNumber: 'KR1',
          target: 100, actual: 0, unit: '次', description: '包含 100 篇專業內容發佈',
          logs: [], createdAt: Date.now()
        },
        {
          id: '2', title: '全年度健康跑', category: GoalCategory.HEALTH, krNumber: 'KR5',
          target: 200, actual: 0, unit: '天', description: '每次 5 公里',
          logs: [], createdAt: Date.now()
        }
      ];
    }
    setGoals(initialData);
  }, [yearKey]);

  const saveGoals = (newGoals: Goal[]) => {
    if (isViewMode) return;
    setSaveStatus('saving');
    setGoals(newGoals);
    localStorage.setItem(yearKey, JSON.stringify(newGoals));
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const handleImportToMine = () => {
    if (window.confirm('確定要將此計畫模板匯入為您的正式計畫嗎？這將會覆蓋您目前的本地資料。')) {
      localStorage.setItem(yearKey, JSON.stringify(goals));
      setIsViewMode(false);
      window.history.replaceState(null, "", window.location.pathname);
      alert('匯入成功！現在這是屬於您的計畫了，開始行動吧！');
    }
  };

  const handleExitPreview = () => {
    window.location.hash = "";
    window.location.reload();
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
        actual: data.actual || 0,
        logs: [],
        createdAt: Date.now()
      } as Goal;
      saveGoals([newGoal, ...goals]);
    }
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  return (
    <div className="h-screen flex flex-col font-sans select-none overflow-hidden bg-[#f8fafc]">
      {/* 唯讀模式 Banner */}
      {isViewMode && (
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wider z-[60] shadow-lg shrink-0">
          <div className="flex items-center space-x-2">
            <Zap className="w-3 h-3 fill-current text-yellow-300" />
            <span className="truncate">預覽模式</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleExitPreview} className="hover:underline opacity-70">返回</button>
            <button onClick={handleImportToMine} className="bg-white text-blue-600 px-3 py-1 rounded-full text-[9px] font-black">匯入</button>
          </div>
        </div>
      )}

      <header className="bg-[#0f172a] text-white px-3 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center space-x-2">
          <Target className="text-blue-500 w-5 h-5" />
          <h1 className="text-sm font-black tracking-tighter uppercase">Zenith 2026</h1>
        </div>
        
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {!isViewMode && (
            <button 
              onClick={() => setIsShareModalOpen(true)} 
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isViewMode && (
            <button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }} className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow overflow-y-auto custom-scrollbar">
        <div className="p-3 sm:p-6 max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <Dashboard stats={stats} />
            </div>
            <div className="lg:col-span-2">
              <AICoachPanel goals={goals} stats={stats} />
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
            {/* 全域水平捲軸容器 */}
            <div className="overflow-x-auto no-scrollbar touch-pan-x">
              <div className="min-w-max">
                {/* 表格標題 */}
                <div className="grid grid-cols-[100px_repeat(31,32px)] md:grid-cols-[80px_200px_70px_70px_70px_70px_180px_repeat(31,32px)] bg-slate-800 text-white text-[9px] sm:text-[10px] font-black uppercase sticky top-0 z-30">
                  <div className="hidden md:flex p-3 border-r border-slate-700 items-center justify-center">KR</div>
                  <div className="p-3 border-r border-slate-700 flex items-center justify-center text-blue-300 sticky left-0 bg-slate-800 z-40 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">項目</div>
                  <div className="hidden md:flex p-3 border-r border-slate-700 items-center justify-center">目標</div>
                  <div className="hidden md:flex p-3 border-r border-slate-700 items-center justify-center">累積</div>
                  <div className="hidden md:flex p-3 border-r border-slate-700 items-center justify-center">剩餘</div>
                  <div className="hidden md:flex p-3 border-r border-slate-700 items-center justify-center text-emerald-400">％</div>
                  <div className="hidden md:flex p-3 border-r border-slate-700 items-center justify-center">年度視覺</div>
                  
                  {/* 日期標題 */}
                  {monthDays.map(d => (
                    <div key={d.iso} className={`w-8 border-r border-slate-700 flex flex-col items-center justify-center py-1.5 ${d.isWeekend ? 'bg-slate-700' : ''}`}>
                      <span className="opacity-50 text-[7px] font-bold">{d.weekDay}</span>
                      <span className="text-[10px]">{d.day}</span>
                    </div>
                  ))}
                </div>

                {/* 表格內容 */}
                <div className="divide-y divide-gray-100">
                  {goals.map(goal => (
                    <GoalRow 
                      key={goal.id}
                      goal={goal}
                      yearProgress={stats.yearProgress}
                      monthDays={monthDays}
                      onLog={handleLog}
                      onEdit={(g) => { if(!isViewMode) { setEditingGoal(g); setIsModalOpen(true); } }}
                      isViewMode={isViewMode}
                    />
                  ))}
                  {goals.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      目前無任何指標
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 shrink-0 px-2 py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar max-w-full mx-auto justify-start sm:justify-center">
           {[...Array(12)].map((_, i) => (
             <button key={i} onClick={() => setSelectedMonth(i)} className={`px-4 py-2 text-[11px] font-black rounded-lg transition-all whitespace-nowrap shrink-0 ${selectedMonth === i ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
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
