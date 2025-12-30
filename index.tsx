import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Target, 
  Sparkles, 
  ChevronRight, 
  LayoutDashboard, 
  ListTodo, 
  UserCircle 
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 頂部導航 - 自動避開 iOS 瀏海 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 pt-[env(safe-area-inset-top)] sticky top-0 z-20">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight italic">ZENITH 2026</h1>
          </div>
          <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full active:scale-90 transition-transform">
            <Sparkles size={20} />
          </button>
        </div>
      </header>

      {/* 內容區 */}
      <main className="flex-1 overflow-y-auto p-6 pb-32">
        <section className="mb-8">
          <p className="text-indigo-600 font-bold text-sm mb-1 uppercase tracking-widest">New Season</p>
          <h2 className="text-3xl font-black text-slate-800 leading-tight">
            你的年度策略<br/>已經準備就緒。
          </h2>
        </section>

        {/* 策略卡片 */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm active:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <LayoutDashboard size={24} />
              </div>
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-md">85% 完成</span>
            </div>
            <h3 className="text-xl font-bold mb-1">年度核心目標</h3>
            <p className="text-slate-500 text-sm mb-4">定義 2026 的三大北極星指標</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[85%]"></div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">AI 助手諮詢</h3>
              <p className="text-slate-400 text-sm">讓 Gemini 幫你拆解目標</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
              <ChevronRight size={24} />
            </div>
          </div>
        </div>
      </main>

      {/* 底部導航欄 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 pb-[env(safe-area-inset-bottom)]">
        <div className="h-20 flex items-center justify-between">
          <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard />} label="主頁" />
          <NavBtn active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<ListTodo />} label="清單" />
          <NavBtn active={activeTab === 'me'} onClick={() => setActiveTab('me')} icon={<UserCircle />} label="個人" />
        </div>
      </nav>
    </div>
  );
};

const NavBtn = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
    {React.cloneElement(icon, { size: 24 })}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const root = createRoot(document.getElementById('root'));
root.render(<App />);
