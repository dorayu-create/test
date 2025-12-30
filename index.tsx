import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Target, Sparkles, ChevronRight, LayoutDashboard, 
  Calendar, Settings, BrainCircuit, Rocket, Plus
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/genai";

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // 預留 Gemini API 邏輯
  const generateStrategy = async () => {
    setLoading(true);
    // 這裡填入你的 API Key
    const genAI = new GoogleGenerativeAI("YOUR_API_KEY_HERE");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    try {
      // 模擬 AI 生成邏輯
      console.log("AI 正在規劃 2026 策略...");
    } catch (err) {
      console.error("AI 生成失敗", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#fdfcfb] text-[#1e293b]">
      {/* 頂部標題 */}
      <header className="px-6 pt-[env(safe-area-inset-top)] bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Rocket className="text-white" size={18} />
            </div>
            <span className="font-black tracking-tighter text-xl">ZENITH 2026</span>
          </div>
          <button onClick={generateStrategy} className="p-2 hover:bg-blue-50 rounded-full transition-colors">
            <Sparkles className={loading ? "animate-pulse text-blue-600" : "text-slate-400"} size={20} />
          </button>
        </div>
      </header>

      {/* 內容區 */}
      <main className="flex-1 overflow-y-auto px-6 py-8 pb-32 no-scrollbar">
        <div className="animate-fade-in">
          <h2 className="text-4xl font-black tracking-tight mb-2">啟動策略。</h2>
          <p className="text-slate-400 font-medium mb-8">將您的願景拆解為可執行的行動步驟。</p>

          {/* 卡片區域 */}
          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <BrainCircuit size={24} />
                </div>
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase">AI Suggested</span>
              </div>
              <h3 className="text-xl font-bold mb-1">年度北極星目標</h3>
              <p className="text-slate-400 text-sm mb-4">定義 2026 年最核心的成功指標</p>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                    Q{i}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between group active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-bold">新增行動清單</h3>
                  <p className="text-slate-400 text-xs">從一個小習慣開始改變</p>
                </div>
              </div>
              <Plus size={20} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </main>

      {/* 底部導航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-10 pb-[env(safe-area-inset-bottom)]">
        <div className="h-20 flex items-center justify-between">
          <NavIcon icon={<LayoutDashboard size={22}/>} active />
          <NavIcon icon={<Calendar size={22}/>} />
          <NavIcon icon={<Settings size={22}/>} />
        </div>
      </nav>
    </div>
  );
};

const NavIcon = ({ icon, active = false }) => (
  <button className={`p-2 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-300'}`}>
    {icon}
  </button>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
