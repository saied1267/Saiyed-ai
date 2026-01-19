import React from 'react';
import { ChatTheme, ChatBackground } from '../types';

interface SettingsProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: 'bn' | 'en';
  setLanguage: (val: 'bn' | 'en') => void;
  chatTheme: ChatTheme;
  setChatTheme: (theme: ChatTheme) => void;
  chatBackground: ChatBackground;
  setChatBackground: (bg: ChatBackground) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onResetAll: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  darkMode, setDarkMode, chatBackground, setChatBackground,
  onToggleFullscreen, isFullscreen, onResetAll
}) => {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3
  ].filter(k => k && k !== "undefined" && k !== "");
  
  const isApiConfigured = keys.length > 0;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">সেটিংস</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">সাঈদ এআই কন্ট্রোল প্যানেল</p>
      </header>

      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-emerald-100 dark:border-slate-700">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-4">অ্যাক্টিভ ইঞ্জিন স্ট্যাটাস</h3>
        <div className={`flex items-center space-x-3 p-4 rounded-2xl border-2 ${isApiConfigured ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' : 'bg-red-50 dark:bg-red-900/20 border-red-400'}`}>
          <span className="text-3xl">{isApiConfigured ? '🛡️' : '⚠️'}</span>
          <div>
            <p className={`font-black text-sm ${isApiConfigured ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {isApiConfigured ? `সাঈদ এআই কানেক্টেড (${keys.length} ইঞ্জিন)` : 'ইঞ্জিন গরম হয়ে গেছে'}
            </p>
            <p className="text-[9px] font-bold opacity-60">
              {isApiConfigured ? `আপনার ${keys.length}টি ইঞ্জিন কাজ করছে` : 'ইঞ্জিন বন্ধ হয়ে'}
            </p>
          </div>
        </div>
      </section>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-xl border dark:border-slate-700 divide-y dark:divide-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-xl">📺</div>
            <p className="font-black text-sm">ফুল স্ক্রিন মোড</p>
          </div>
          <button 
            onClick={onToggleFullscreen}
            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              isFullscreen ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
            }`}
          >
            {isFullscreen ? 'অফ' : 'অন'}
          </button>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-xl">🌙</div>
            <p className="font-black text-sm">ডার্ক মোড</p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-xl">🎨</div>
            <p className="font-black text-sm">ব্যাকগ্রাউন্ড প্যাটার্ন</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['plain', 'dots', 'grid', 'mesh', 'paper', 'waves'] as ChatBackground[]).map(bg => (
              <button 
                key={bg} 
                onClick={() => setChatBackground(bg)}
                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                  chatBackground === bg ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 dark:border-slate-700 text-gray-400'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <button 
            onClick={onResetAll}
            className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
          >
            সব ডেটা রিসেট করুন
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border dark:border-slate-700">
        <h3 className="font-black text-[10px] mb-4 uppercase tracking-[0.25em] text-emerald-500">ডেভলপার তথ্য</h3>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="opacity-40 font-black uppercase text-[9px]">এআই এর নির্মাতা</span>
            <span className="text-gray-800 dark:text-white font-black italic">সাঈদ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-40 font-black uppercase text-[9px]">কলেজ</span>
            <span className="font-bold">হাটহাজারী কলেজ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-40 font-black uppercase text-[9px]">মোবাইল</span>
            <span className="font-black text-emerald-600">০১৯৪১৬৫২০৯৭</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
