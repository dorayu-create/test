import { YearStats, Goal } from './types.ts';

export const getYearStats = (targetYear: number = 2026): YearStats => {
  const now = new Date();
  const year = targetYear;
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  let elapsed = 0;
  if (now.getFullYear() === year) {
    elapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  } else if (now.getFullYear() > year) {
    elapsed = totalDays;
  }

  return {
    today: now.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
    todayISO: now.toISOString().split('T')[0],
    daysElapsed: Math.max(0, elapsed),
    daysRemaining: Math.max(0, totalDays - elapsed),
    yearProgress: Math.min(100, (Math.max(0, elapsed) / totalDays) * 100),
    year
  };
};

export const calculateStreak = (logs: {date: string}[], todayISO: string) => {
  if (!logs || logs.length === 0) return { current: 0, longest: 0 };
  
  const sortedDates = [...new Set(logs.map(l => l.date))].sort();
  let longest = 0;
  let current = 0;
  let tempCurrent = 0;

  // Longest calculation
  for (let i = 0; i < sortedDates.length; i++) {
    if (i > 0) {
      const prev = new Date(sortedDates[i-1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
      if (diff === 1) {
        tempCurrent++;
      } else {
        tempCurrent = 1;
      }
    } else {
      tempCurrent = 1;
    }
    longest = Math.max(longest, tempCurrent);
  }

  // Current calculation
  const lastDate = sortedDates[sortedDates.length - 1];
  const lastDateObj = new Date(lastDate);
  const todayObj = new Date(todayISO);
  const diffFromToday = (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 3600 * 24);

  if (diffFromToday <= 1) {
    let count = 0;
    let checkDate = new Date(lastDate);
    
    while (sortedDates.includes(checkDate.toISOString().split('T')[0])) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    current = count;
  }

  return { current, longest };
};

export const formatPercent = (val: number) => `${val.toFixed(1)}%`;

export const getEfficiencyStatus = (achievementRate: number, yearProgress: number) => {
  if (achievementRate >= 100) return { label: '超標', color: 'text-red-600', icon: '🔥', bg: 'bg-red-50' };
  if (yearProgress <= 0) return { label: '準備中', color: 'text-slate-400', icon: '⏳', bg: 'bg-slate-50' };
  
  const diff = achievementRate - yearProgress;
  if (diff >= 5) return { label: '領先', color: 'text-emerald-600', icon: '🚀', bg: 'bg-emerald-50' };
  if (diff <= -5) return { label: '落後', color: 'text-amber-600', icon: '⚠️', bg: 'bg-amber-50' };
  return { label: '正常', color: 'text-blue-600', icon: '✅', bg: 'bg-blue-50' };
};

export const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  while (date.getMonth() === month) {
    const iso = date.toISOString().split('T')[0];
    const d = date.getDay();
    days.push({
      iso,
      day: date.getDate(),
      weekDay: weekDays[d],
      isWeekend: d === 0 || d === 6
    });
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const encodeDataForUrl = (goals: Goal[]): string => {
  try {
    const compressed = goals.map(g => ({
      i: g.id, t: g.title, c: g.category, k: g.krNumber, tg: g.target, a: g.actual, u: g.unit,
      l: g.logs.map(log => ({ d: log.date, v: log.value }))
    }));
    const json = JSON.stringify(compressed);
    const utf8Bytes = new TextEncoder().encode(json);
    let binary = '';
    utf8Bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    console.error('Encode Error:', e);
    return "";
  }
};

export const decodeDataFromUrl = (base64: string): Goal[] | null => {
  try {
    let padding = '';
    const mod = base64.length % 4;
    if (mod > 0) padding = '='.repeat(4 - mod);
    const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/') + padding;
    const binary = atob(standardBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json);
    return data.map((g: any) => ({
      id: g.i, title: g.t, category: g.c, krNumber: g.k, target: g.tg, actual: g.a, unit: g.u,
      description: '', logs: g.l.map((log: any) => ({ date: log.d, value: log.v })), createdAt: Date.now()
    }));
  } catch (e) {
    console.error('Decode Error:', e);
    return null;
  }
};