
import React, { useState } from 'react';
// Changed User to AppUser to match exported member from ../types
import { ChatTheme, ChatBackground, AppUser } from '../types';

interface SettingsProps {
  // Updated User to AppUser
  user: AppUser | null;
  onUpdateInterests: (interests: string[]) => void;
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

// Updated props type to AppUser
const Settings: React.FC<SettingsProps> = ({ 
  user, onUpdateInterests, onGoToAuth, darkMode, setDarkMode, 
  onToggleFullscreen, isFullscreen, onResetAll
}) => {
  const [interestInput, setInterestInput] = useState('');

  const isApiConfigured = Boolean(
    process.env.API_KEY || process.env.API_KEY_2 || process.env.API_KEY_3 || process.env.API_KEY_4
  );

  const isAuthEnabled = Boolean(
    process.env.FIREBASE_API_KEY && 
    process.env.FIREBASE_AUTH_DOMAIN && 
    process.env.FIREBASE_PROJECT_ID
  );

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = interestInput.trim();
    if (!cleanInput || !user) return;
    
    const current = user.interests || [];
    if (!current.includes(cleanInput)) {
      onUpdateInterests([...current, cleanInput]);
    }
    setInterestInput('');
  };

  const removeInterest = (interest: string) => {
    if (!user) return;
    onUpdateInterests(user.interests.filter(i => i !== interest));
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
      <header>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">সেটিংস</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">সাঈদ এআই প্রোফাইল ও নিয়ন্ত্রণ</p>
      </header>

      {/* Profile & Interests Card */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border dark:border-slate-700">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-6">ব্যবহারকারীর প্রোফাইল</h3>
        
        {user ? (
          <div className="space-y-8">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-xl shadow-emerald-500/20 overflow-hidden relative">
                {user.photoURL ? (
                   <img src={user.photoURL} alt="p" className="w-full h-full object-cover" />
                ) : (
                  user.name[0]
                )}
                <div className="absolute inset-0 border-2 border-white/20 rounded-[1.5rem]"></div>
              </div>
              <div>
                <p className="font-black text-lg text-slate-800 dark:text-white leading-tight">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{user.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[8px] font-black rounded-md uppercase border border-emerald-100 dark:border-emerald-800">ক্লাউড সিঙ্ক সক্রিয়</span>
              </div>
            </div>

            {/* AI Personalization / Interests */}
            <div className="space-y-4 pt-6 border-t dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">সাঈদ এআই-এর জন্য আপনার আগ্রহসমূহ:</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, i) => (
                    <span key={i} className="group px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[10px] font-black rounded-xl border border-slate-200 dark:border-slate-700 flex items-center transition-all hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10">
                      {interest}
                      <button 
                        onClick={() => removeInterest(interest)} 
                        className="ml-2 opacity-30 hover:opacity-100 text-red-500 transition-opacity"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold italic py-2">কোনো বিশেষ আগ্রহ যোগ করা নেই। এআইকে আপনার পছন্দ জানাতে নিচে লিখুন।</p>
                )}
              </div>
              
              <form onSubmit={handleAddInterest} className="flex space-x-2 mt-2">
                <input 
                  type="text" 
                  value={interestInput}
                  onChange={e => setInterestInput(e.target.value)}
                  placeholder="যেমন: মহাকাশ বিজ্ঞান, প্রোগ্রামিং..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none transition-all dark:text-white"
                />
                <button 
                  type="submit" 
                  disabled={!interestInput.trim()}
                  className="bg-emerald-600 disabled:bg-slate-200 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  যোগ করুন
                </button>
              </form>
              <p className="text-[8px] font-bold text-slate-400 italic">* আপনার আগ্রহের ওপর ভিত্তি করে সাঈদ এআই উদাহরণ প্রদান করবে।</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-2xl grayscale opacity-50">👤</div>
            <p className="text-sm font-bold text-slate-400 text-center px-4 leading-relaxed">একাউন্টে লগইন থাকলে আপনার পড়ার হিস্টোরি ও ইন্টারেস্ট সারা জীবন সংরক্ষিত থাকবে।</p>
            <button 
              onClick={onGoToAuth}
              disabled={!isAuthEnabled}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${
                isAuthEnabled 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAuthEnabled ? 'এখনি লগইন করুন' : 'সার্ভার রক্ষণাবেক্ষণ চলছে'}
            </button>
          </div>
        )}
      </section>

      {/* System Status Indicators (Refined) */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">সিস্টেম স্ট্যাটাস</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 ${isApiConfigured ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
            <span className="text-xl">{isApiConfigured ? '🧠' : '⚠️'}</span>
            <p className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-300">এআই ইঞ্জিন</p>
            <p className={`text-[8px] font-bold ${isApiConfigured ? 'text-emerald-600' : 'text-red-500'}`}>{isApiConfigured ? 'অনলাইন' : 'অফলাইন'}</p>
          </div>

          <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 ${isAuthEnabled ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100' : 'bg-red-50/50 border-red-100'}`}>
            <span className="text-xl">{isAuthEnabled ? '🛡️' : '⚠️'}</span>
            <p className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-300">ক্লাউড সিঙ্ক</p>
            <p className={`text-[8px] font-bold ${isAuthEnabled ? 'text-blue-600' : 'text-red-500'}`}>{isAuthEnabled ? 'সক্রিয়' : 'অচল'}</p>
          </div>
        </div>
      </section>

      {/* Basic Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-xl border dark:border-slate-700 divide-y dark:divide-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-lg">🌙</div>
            <p className="font-black text-sm text-slate-700 dark:text-slate-200">ডার্ক মোড</p>
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
            <span>ডেটা রিসেট ও {user ? 'লগআউট' : 'ক্লিয়ার'}</span>
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
            <span className="opacity-40 font-black uppercase text-[9px]">প্রতিষ্ঠান</span>
            <span className="font-bold">হাটহাজারী কলেজ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-40 font-black uppercase text-[9px]">সরাসরি যোগাযোগ</span>
            <span className="font-black text-emerald-600">০১৯৪১৬৫২০৯৭</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
              
