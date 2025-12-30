
import { GoogleGenAI } from "@google/genai";
import { Goal, YearStats } from "./types.ts";

export const getAICoachFeedback = async (goals: Goal[], stats: YearStats): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const goalsSummary = goals.map(g => ({
    title: g.title,
    progress: ((g.actual / g.target) * 100).toFixed(1) + '%',
    status: g.actual >= g.target ? 'Done' : 'In Progress'
  }));

  const prompt = `
    Context: Annual Goal Tracking System.
    Year Progress: ${stats.yearProgress.toFixed(1)}%.
    Today is: ${stats.today}.
    Days Remaining: ${stats.daysRemaining}.

    User's Goals:
    ${JSON.stringify(goalsSummary, null, 2)}

    Task: Act as a high-performance executive coach. Analyze the progress and provide 3 tips to boost efficiency.
    Format in Markdown. Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "目前無法產生建議。";
  } catch (error) {
    console.error("AI Coach Error:", error);
    return "AI 教練正在休息中，請稍後再試。";
  }
};
