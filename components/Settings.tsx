import React, { useState } from 'react';
import { AppUser } from '../types';

interface SettingsProps {
  user: AppUser;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onUpdateUser: (u: AppUser) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, darkMode, setDarkMode, onUpdateUser }) => {
  const [name, setName] = useState(user.name);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-['Hind_Siliguri'] pb-12">
      {/* Header */}
      <header className="flex flex-col space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">সেটিংস</h2>
        <p className="text-[11px] font-extrabold text-emerald-500 uppercase tracking-widest">ব্যক্তিগত প্রোফাইল ও অ্যাপ সেটিংস</p>
      </header>

      {/* Premium Developer Card */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl border border-slate-800 dark:border-emerald-500/10">
        <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-[60px] animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px]" />
        
        <div className="flex items-center space-x-2 text-emerald-400 mb-5 relative z-10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em]">ডেভেলপার ইনফো</h3>
        </div>

        <div className="flex items-center space-x-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center text-2xl border border-emerald-500/30 backdrop-blur-md shadow-lg text-emerald-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">সাঈদ (Saiyed)</h4>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-[12px] font-bold text-emerald-400">হিসাববিজ্ঞান বিভাগ</span>
              <span className="w-1 h-1 bg-slate-600 rounded-full" />
              <span className="text-[11px] font-medium text-slate-400">হাটহাজারী কলেজ</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800/60 relative z-10">
          <p className="text-[13px] font-normal leading-relaxed text-slate-300 italic font-light">
            "আমি সাঈদ, আমার বন্ধুদের জন্য এই এআই অ্যাপটি তৈরি করেছি যাতে সবাই আধুনিক প্রযুক্তির সহায়তায় পড়াশোনাকে আরও সহজ ও আনন্দদায়ক করতে পারে।"
          </p>
        </div>
      </section>

      {/* Main Settings Options */}
      <div className="space-y-4">
        {/* Profile Section Card */}
        <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800/80 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center space-x-2.5 mb-4 text-slate-400 dark:text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <label className="text-[11px] font-black uppercase tracking-widest">আপনার নাম</label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none dark:text-white transition-all shadow-inner"
              placeholder="নাম লিখুন..."
            />
            <button 
              onClick={() => onUpdateUser({...user, name})} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 sm:py-0 rounded-2xl text-[12px] font-bold tracking-wide active:scale-[0.98] transition-all shadow-md shadow-emerald-600/10"
            >
              আপডেট করুন
            </button>
          </div>
        </div>

        {/* Preference Section Card */}
        <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
              {darkMode ? (
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M14.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-bold text-[15px] text-slate-800 dark:text-zinc-200">ডার্ক থিম</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">রাত বা কম আলোতে চোখের সুরক্ষার জন্য</p>
            </div>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`w-14 h-8 rounded-full transition-all duration-300 relative ${darkMode ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200 dark:bg-zinc-800'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${darkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-red-50/40 dark:bg-red-950/10 rounded-3xl p-6 border border-red-100/70 dark:border-red-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[15px] text-red-600 dark:text-red-400">ডেঞ্জার জোন</p>
            <p className="text-[11px] font-medium text-red-500/70 mt-0.5">অ্যাপের সমস্ত লোকাল ডাটা ও চ্যাট হিস্ট্রি মুছে ফেলতে</p>
          </div>
          <button 
            onClick={() => { if(confirm('সব ডাটা মুছবেন?')) { localStorage.clear(); window.location.reload(); } }} 
            className="py-3.5 px-6 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-2xl text-[12px] font-bold border border-red-200 dark:border-red-900/30 active:scale-[0.98] transition-all shadow-sm text-center sm:text-left"
          >
            রিসেট অ্যাপ ডাটা
          </button>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="flex flex-col items-center justify-center pt-8 space-y-1">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-zinc-700">Handcrafted by Saiyed</p>
        <p className="text-[9px] font-medium text-slate-400/60 dark:text-zinc-600">Version 2.0 • Premium Edition</p>
      </div>
    </div>
  );
};

export default Settings;
