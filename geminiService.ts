import { GoogleGenAI } from "@google/genai";
import { Goal, YearStats } from "./types.ts";

export const getAICoachFeedback = async (goals: Goal[], stats: YearStats): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const goalsSummary = goals.map(g => ({
    title: g.title,
    progress: ((g.actual / g.target) * 100).toFixed(1) + '%',
    target: g.target,
    actual: g.actual
  }));

  const prompt = `
    角色：你是頂尖的「高績效戰略教練」。
    背景：這是一個 2026 年度的目標追蹤系統。
    年度進度：${stats.yearProgress.toFixed(1)}% (今日是 ${stats.today})。
    剩餘天數：${stats.daysRemaining} 天。

    當前計畫與進度：
    ${JSON.stringify(goalsSummary, null, 2)}

    請針對以上數據提供：
    1. 戰略分析：目前的進度與年度流逝率相比，哪些目標正處於危險期？
    2. 具體建議：提供 3 個能立即提升效率的「防呆」或是「槓桿」策略。
    3. 激勵金句：一句能切中當前進度狀態的執行咒語。

    格式要求：使用 Markdown，排版要像高階商業報表，語氣冷靜、專業、精準。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "無法獲取建議。";
  } catch (error) {
    console.error("AI Coach Error:", error);
    return "教練目前連線不穩定，請檢查網絡或 API Key 設定。";
  }
};