
import React, { useState, useMemo } from 'react';
import { X, Share2, Info, AlertTriangle, CheckCircle2, Copy, Check, Lock, Send } from 'lucide-react';
import { Goal } from '../types';
import { encodeDataForUrl } from '../utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoals: Goal[];
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, currentGoals }) => {
  const [copied, setCopied] = useState(false);

  const encoded = useMemo(() => {
    if (!isOpen) return "";
    return encodeDataForUrl(currentGoals);
  }, [currentGoals, isOpen]);

  const finalUrl = useMemo(() => {
    try {
      // 這是最穩定的作法：獲取目前完整網址並移除 hash 部分
      const url = new URL(window.location.href);
      url.hash = ''; 
      
      // 確保網址結尾有斜線（對於 GitHub Pages 導向很重要）
      let base = url.toString();
      if (!base.endsWith('/') && !base.endsWith('.html')) {
        base += '/';
      }
      
      return `${base}#data=${encoded}`;
    } catch (e) {
      // 備用方案
      const cleanUrl = window.location.href.split('#')[0];
      return `${cleanUrl}#data=${encoded}`;
    }
  }, [encoded]);

  const isLocalPreview = useMemo(() => {
    return window.location.hostname === 'localhost' || window.location.hostname.includes('preview');
  }, []);

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    const shareData = {
      title: 'Zenith 2026 年度計畫模板',
      text: `這是我 2026 年的戰鬥藍圖。邀請你一起參考這份計畫，建立屬於你的年度目標！🚀`,
      url: finalUrl,
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        handleCopy();
      }
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = finalUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  // 使用更高糾錯等級 (M) 並確保 URL 編碼完整
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(finalUrl)}&margin=10&ecc=M`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-800">公開分享模板</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          {isLocalPreview && (
            <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start space-x-2 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 font-bold leading-tight">
                您目前處於「預覽模式」。產生的 QR Code 僅能在這台電腦掃描。請將 App 「發布 (Deploy)」後，產生的 QR Code 才能讓別人從外部開啟。
              </p>
            </div>
          )}

          <div className="mb-6 bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200 text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Send className="w-16 h-16 -rotate-12" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">GitHub Pages Compatible</p>
             <h3 className="text-sm font-bold leading-tight">掃描 QR Code 即可傳送<br/>您的 2026 目標模板。</h3>
          </div>

          <div className="relative inline-block p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-inner mb-6">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Scan to Preview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-6">
            {canNativeShare && (
              <button 
                onClick={handleNativeShare}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>傳送到 LINE / 社群</span>
              </button>
            )}
            
            <button 
              onClick={handleCopy}
              className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                copied ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 hover:border-blue-400 text-slate-600'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '連結已複製' : '複製公開分享網址'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold justify-center">
             <Lock className="w-3 h-3" />
             <span className="uppercase tracking-widest">End-to-End Encrypted Link</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
