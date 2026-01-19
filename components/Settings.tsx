
import React from 'react';
import { ChatTheme, ChatBackground, User } from '../types';

interface SettingsProps {
  user: User | null;
  onGoToAuth: () => void;
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
  user, onGoToAuth, darkMode, setDarkMode, 
  onToggleFullscreen, isFullscreen, onResetAll
}) => {
  const isApiConfigured = Boolean(
    process.env.API_KEY || process.env.API_KEY_2 || process.env.API_KEY_3 || process.env.API_KEY_4
  );

  const isFirebaseConfigured = Boolean(
    process.env.FIREBASE_API_KEY && 
    process.env.FIREBASE_AUTH_DOMAIN && 
    process.env.FIREBASE_PROJECT_ID
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
      <header>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">সেটিংস</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">সাঈদ এআই কন্ট্রোল প্যানেল</p>
      </header>

      {/* User Profile Card */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border dark:border-slate-700">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-4">ইউজার প্রোফাইল</h3>
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-emerald-500/20">
              {user.name[0]}
            </div>
            <div>
              <p className="font-black text-sm text-slate-800 dark:text-white">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-4">
            <p className="text-sm font-bold text-slate-400">আপনি বর্তমানে গেস্ট হিসেবে আছেন।</p>
            <button 
              onClick={onGoToAuth}
              disabled={!isFirebaseConfigured}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all ${
                isFirebaseConfigured 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isFirebaseConfigured ? 'লগইন করুন' : 'লগইন সিস্টেম ডিজেবল'}
            </button>
            {!isFirebaseConfigured && <p className="text-[9px] text-red-500 font-bold">⚠️ ফায়ারবেস কনফিগারেশন বাকি আছে</p>}
          </div>
        )}
      </section>

      {/* Status Indicators */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-emerald-100 dark:border-slate-700 space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">সার্ভিস স্ট্যাটাস</h3>
        
        <div className={`flex items-center space-x-3 p-3 rounded-2xl border ${isApiConfigured ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200' : 'bg-red-50 dark:bg-red-900/10 border-red-200'}`}>
          <span className="text-xl">{isApiConfigured ? '⚡' : '❌'}</span>
          <div>
            <p className="font-black text-[11px] text-slate-700 dark:text-slate-200">AI লার্নিং ইঞ্জিন</p>
            <p className={`text-[9px] font-bold ${isApiConfigured ? 'text-emerald-600' : 'text-red-500'}`}>{isApiConfigured ? 'সচল (Connected)' : 'অচল (No API Key)'}</p>
          </div>
        </div>

        <div className={`flex items-center space-x-3 p-3 rounded-2xl border ${isFirebaseConfigured ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200' : 'bg-red-50 dark:bg-red-900/10 border-red-200'}`}>
          <span className="text-xl">{isFirebaseConfigured ? '🔐' : '❌'}</span>
          <div>
            <p className="font-black text-[11px] text-slate-700 dark:text-slate-200">লগইন সিস্টেম (Firebase)</p>
            <p className={`text-[9px] font-bold ${isFirebaseConfigured ? 'text-blue-600' : 'text-red-500'}`}>{isFirebaseConfigured ? 'সচল (Configured)' : 'অচল (Missing Config)'}</p>
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

        <div className="p-4">
          <button 
            onClick={onResetAll}
            className="w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <span>সব ডেটা রিসেট ও {user ? 'লগআউট' : 'ক্লিন'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border dark:border-slate-700">
        <h3 className="font-black text-[10px] mb-4 uppercase tracking-[0.25em] text-emerald-500">ডেভলপার ও সাপোর্ট</h3>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="opacity-40 font-black uppercase text-[9px]">তৈরি করেছে</span>
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
