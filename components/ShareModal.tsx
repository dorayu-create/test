
import React, { useState, useMemo } from 'react';
import { X, Share2, AlertTriangle, Copy, Check, Lock, Send } from 'lucide-react';
import { Goal } from '../types.ts';
import { encodeDataForUrl } from '../utils.ts';

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
      const url = new URL(window.location.href);
      url.hash = ''; 
      let base = url.toString();
      if (!base.endsWith('/') && !base.endsWith('.html')) {
        base += '/';
      }
      return `${base}#data=${encoded}`;
    } catch (e) {
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
      text: `這是我 2026 年的戰鬥藍圖。邀請你一起參考這份計畫！🚀`,
      url: finalUrl,
    };
    try {
      await navigator.share(shareData);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') handleCopy();
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

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(finalUrl)}&margin=10&ecc=M`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-800">公開分享模板</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          {isLocalPreview && (
            <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start space-x-2 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 font-bold leading-tight">
                您處於預覽模式。發布 (Deploy) 後產生的連結才能讓他人開啟。
              </p>
            </div>
          )}

          <div className="relative inline-block p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-inner mb-6">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
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
              <span>{copied ? '連結已複製' : '複製分享網址'}</span>
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
