import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';

interface SettingsProps {
  user: AppUser;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onUpdateUser: (u: AppUser) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, darkMode, setDarkMode, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  
  // নতুন ফিচার: লোকাল স্টেট যা localStorage-এ সেভ থাকবে
  const [studyGoal, setStudyGoal] = useState(() => localStorage.getItem('saiyed_study_goal') || '60');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('saiyed_sound_effects') !== 'false');

  useEffect(() => {
    localStorage.setItem('saiyed_study_goal', studyGoal);
  }, [studyGoal]);

  useEffect(() => {
    localStorage.setItem('saiyed_sound_effects', String(soundEnabled));
  }, [soundEnabled]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 font-['Hind_Siliguri'] pb-16 px-2">
      
      {/* Header */}
      <header className="flex flex-col space-y-1">
        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">সেটিংস</h2>
        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">কাস্টমাইজেশন, সিস্টেম স্ট্যাটাস ও প্রোফাইল</p>
      </header>

      {/* Futuristic & Inspiring Developer Card */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800/80 dark:border-emerald-500/10 group">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-blue-500/10 rounded-full blur-[60px]" />
        
        {/* Top Tag */}
        <div className="flex items-center space-x-2 text-emerald-400 mb-6 relative z-10 bg-emerald-500/5 border border-emerald-500/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">ভিশনারি ডেভেলপার প্রোফাইল</h3>
        </div>

        {/* Profile Details */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-[2rem] flex items-center justify-center text-3xl border border-emerald-500/20 backdrop-blur-md shadow-xl text-emerald-400 font-sans font-bold transform group-hover:scale-105 transition-transform duration-300">
            SA
          </div>
          <div>
            <h4 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">সাঈদ (Saiyed)</h4>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
              <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">হিসাববিজ্ঞান বিভাগ</span>
              <span className="text-slate-500 dark:text-slate-400">•</span>
              <span className="font-bold text-slate-300">হাটহাজারী কলেজ</span>
            </div>
          </div>
        </div>

        {/* Expanded Inspiring Bio */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 relative z-10 space-y-4">
          <p className="text-[14px] font-medium leading-relaxed text-slate-300 font-light antialiased">
            "আমি সাঈদ। প্রযুক্তির অসীম সম্ভাবনাকে শিক্ষার সাথে নিখুঁতভাবে যুক্ত করার এক তীব্র স্বপ্ন থেকে আমি এই **সাঈদ এআই (Saiyed AI)** প্ল্যাটফর্মটি তৈরি করেছি। এটি শুধু একটি অ্যাপ নয়, বরং আমার সহপাঠী ও বন্ধুদের জন্য তৈরি একটি আধুনিক ডিজিটাল সারথি, যা জটিল থেকে জটিলতর পড়াগুলোকে সহজ এবং আনন্দদায়ক করে তুলবে। আমার বিশ্বাস, সঠিক প্রযুক্তির ছোঁয়ায় আমাদের সবার শেখার যাত্রা আরও একধাপ এগিয়ে যাবে।"
          </p>
          
          {/* Developer Tech Focus Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] uppercase font-black tracking-wider bg-slate-800/60 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700/50">AI Prompting</span>
            <span className="text-[10px] uppercase font-black tracking-wider bg-slate-800/60 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700/50">UI/UX Crafting</span>
            <span className="text-[10px] uppercase font-black tracking-wider bg-slate-800/60 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700/50">EdTech Innovation</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="space-y-4">
        
        {/* New Feature: AI System Status Panel */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 dark:text-zinc-500 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            <span className="text-[11px] font-black uppercase tracking-widest">এআই সিস্টেম স্ট্যাটাস</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-2xl border dark:border-zinc-800/60 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400">ইঞ্জিন মডেল</span>
              <span className="text-xs font-black text-slate-800 dark:text-zinc-200 mt-0.5">Saiyed Ai 1.5</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-2xl border dark:border-zinc-800/60 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400">সার্ভার রেসপন্স</span>
              <span className="text-xs font-black text-emerald-500 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> আল্ট্রা ফাস্ট
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-2xl border dark:border-zinc-800/60 flex flex-col justify-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400">ডাটা সিকিউরিটি</span>
              <span className="text-xs font-black text-blue-500 mt-0.5">লোকাল এনক্রিপশন</span>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 dark:text-zinc-500 mb-4">
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
              placeholder="আপনার নাম লিখুন..."
            />
            <button 
              onClick={() => onUpdateUser({...user, name})} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 sm:py-0 rounded-2xl text-[12px] font-extrabold tracking-wide active:scale-[0.98] transition-all shadow-md shadow-emerald-600/10 whitespace-nowrap"
            >
              নাম সেভ করুন
            </button>
          </div>
        </div>

        {/* New Feature: Daily Study Goal Tracker */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[15px] text-slate-800 dark:text-zinc-200">ডেইলি স্টাডি গোল</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">প্রতিদিন সাঈদ এআই এর সাথে পড়ার লক্ষ্যমাত্রা</p>
            </div>
          </div>
          <select 
            value={studyGoal} 
            onChange={(e) => setStudyGoal(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-bold outline-none dark:text-white transition-all cursor-pointer"
          >
            <option value="30">৩০ মিনিট</option>
            <option value="60">১ ঘণ্টা (প্রমিত)</option>
            <option value="120">২ ঘণ্টা (নিবিড়)</option>
            <option value="0">কোনো লক্ষ্য নেই</option>
          </select>
        </div>

        {/* Preference: Dark Mode */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800/60 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
              {darkMode ? (
                <svg className="w-5 h-5 text-amber-400 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M14.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-bold text-[15px] text-slate-800 dark:text-zinc-200">ডার্ক থিম মোড</p>
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

        {/* New Preference: Sound Effects */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800/60 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
              <svg className={`w-5 h-5 ${soundEnabled ? 'text-teal-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {soundEnabled ? (
                  <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                ) : (
                  <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                )}
              </svg>
            </div>
            <div>
              <p className="font-bold text-[15px] text-slate-800 dark:text-zinc-200">ইন-অ্যাপ ইন্টারঅ্যাকশন সাউন্ড</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">মেসেজ পাঠানো এবং বিভিন্ন ক্লিকে সাউন্ড ইফেক্ট</p>
            </div>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className={`w-14 h-8 rounded-full transition-all duration-300 relative ${soundEnabled ? 'bg-teal-500 shadow-lg shadow-teal-500/20' : 'bg-slate-200 dark:bg-zinc-800'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${soundEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/30 dark:bg-red-950/5 rounded-3xl p-6 border border-red-100/60 dark:border-red-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[15px] text-red-600 dark:text-red-400">ডেঞ্জার জোন</p>
            <p className="text-[11px] font-medium text-red-500/60 mt-0.5">অ্যাপের সমস্ত লোকাল ডাটা ও চ্যাট হিস্ট্রি স্থায়ীভাবে মুছতে</p>
          </div>
          <button 
            onClick={() => { if(confirm('সব ডাটা মুছবেন? এটি আর ফিরিয়ে আনা যাবে না।')) { localStorage.clear(); window.location.reload(); } }} 
            className="py-3.5 px-6 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-2xl text-[12px] font-black border border-red-200 dark:border-red-900/30 active:scale-[0.98] transition-all shadow-sm text-center"
          >
            রিসেট অল অ্যাপ ডাটা
          </button>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="flex flex-col items-center justify-center pt-10 space-y-1">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-zinc-700">Kaisir Ahamed Saiyed</p>
        <p className="text-[9px] font-bold text-slate-400/50 dark:text-zinc-600">Version 3.0 • Premium AI Edition</p>
      </div>
    </div>
  );
};

export default Settings;
