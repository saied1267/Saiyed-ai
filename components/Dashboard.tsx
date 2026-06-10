import React, { useState, useEffect } from 'react';
import { Subject, ClassLevel, Group, AppUser } from '../types';

interface DashboardProps {
  user: AppUser;
  onStartTutor: (lvl: ClassLevel, grp: Group, sub: Subject) => void;
  onGoToTranslator: () => void;
  onGoToNews: () => void;
  onGoToHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartTutor, onGoToTranslator, onGoToNews, onGoToHistory }) => {
  const [isServerActive, setIsServerActive] = useState(true);
  const [activeUsers, setActiveUsers] = useState(4);
  const [textIndex, setTextIndex] = useState(0);

  const infoSlides = [
    { text: `${user.college} • ${user.department}`, color: 'text-slate-400', animation: 'animate-in slide-in-from-left-4' },
    { text: "Kaisir Ahamed Saiyed is the CEO of Saiyed AI", color: 'text-emerald-500 font-black', animation: 'animate-in zoom-in-75' },
    { text: "Trainer Of Computer", color: 'text-indigo-500', animation: 'animate-in slide-in-from-bottom-4' },
    { text: "Hathazari Government College Accounting Department", color: 'text-amber-500', animation: 'animate-in fade-in zoom-in-95' },
    { text: "For Feedback 01941652097", color: 'text-rose-500 underline decoration-dashed', animation: 'animate-bounce' }
  ];

  useEffect(() => {
    const userInterval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 16));
    }, 8000);

    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % infoSlides.length);
    }, 4500);

    const serverInterval = setInterval(() => {
      setIsServerActive(false);
      setTimeout(() => setIsServerActive(true), 3000);
    }, 25000);

    return () => {
      clearInterval(userInterval);
      clearInterval(textInterval);
      clearInterval(serverInterval);
    };
  }, []);

  const subjectList = [
    { name: Subject.MATH, icon: '📐', color: 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10', iconBg: 'bg-blue-100 dark:bg-blue-800', textColor: 'text-blue-600' },
    { name: Subject.ENGLISH, icon: '🔤', color: 'border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/10', iconBg: 'bg-purple-100 dark:bg-purple-800', textColor: 'text-purple-600' },
    { name: Subject.ACCOUNTING, icon: '📊', color: 'border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10', iconBg: 'bg-emerald-100 dark:bg-emerald-800', textColor: 'text-emerald-600' },
    { name: Subject.ICT, icon: '💻', color: 'border-orange-500/20 bg-orange-50/50 dark:bg-orange-900/10', iconBg: 'bg-orange-100 dark:bg-orange-800', textColor: 'text-orange-600' },
    { name: Subject.FINANCE, icon: '💰', color: 'border-rose-500/20 bg-rose-50/50 dark:bg-rose-900/10', iconBg: 'bg-rose-100 dark:bg-rose-800', textColor: 'text-rose-600' },
    { name: Subject.BANGLA, icon: '✍️', color: 'border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10', iconBg: 'bg-amber-100 dark:bg-amber-800', textColor: 'text-amber-600' },
    { name: Subject.WORD, icon: '📝', color: 'border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10', iconBg: 'bg-indigo-100 dark:bg-indigo-800', textColor: 'text-indigo-600' },
    { name: Subject.EXCEL, icon: '📈', color: 'border-green-500/20 bg-green-50/50 dark:bg-green-900/10', iconBg: 'bg-green-100 dark:bg-green-800', textColor: 'text-green-600' },
    { name: Subject.POWERPOINT, icon: '📽️', color: 'border-orange-600/20 bg-orange-50/50 dark:bg-orange-900/10', iconBg: 'bg-orange-100 dark:bg-orange-800', textColor: 'text-orange-700' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 font-['Hind_Siliguri']">
      <header className="px-1 pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-3">
              {/* কাস্টম লোগো ডিজাইন (সার্কিট এবং চিপ থিম) */}
              <div className="relative flex items-center justify-center w-20 h-20 bg-slate-900 rounded-3xl shadow-lg border border-slate-700 overflow-hidden">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-emerald-500 opacity-20">
                  <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                  <circle cx="80" cy="20" r="2" fill="currentColor" />
                  <circle cx="80" cy="80" r="2" fill="currentColor" />
                  <circle cx="20" cy="80" r="2" fill="currentColor" />
                  <path d="M20,20 L50,50 L80,20 M80,80 L50,50 L20,80" fill="none" stroke="currentColor" strokeWidth="1" />
                  <rect x="40" y="40" width="20" height="20" fill="currentColor" rx="2" />
                </svg>
                <div className="relative text-center z-10">
                  <h1 className="text-xl font-black text-white tracking-tighter">Saiyed <span className="text-emerald-500">AI</span></h1>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">সাঈদ এআই</p>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                {isServerActive ? (
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] rounded-full font-black uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                    Online 🟢
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] rounded-full font-black uppercase tracking-widest border border-rose-500/20 animate-bounce">
                    Offline 🔴
                  </span>
                )}
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 ml-1">
                  {activeUsers} Students Learning
                </span>
              </div>
            </div>

            <div className="min-h-[24px] flex items-center overflow-hidden">
              <p 
                key={textIndex} 
                className={`text-[11px] uppercase tracking-[0.15em] duration-700 font-bold ${infoSlides[textIndex].color} ${infoSlides[textIndex].animation}`}
              >
                {infoSlides[textIndex].text}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onGoToHistory} 
            className="w-12 h-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-sm active:scale-90 transition-all"
          >
           🗑️
          </button>
        </div>
      </header>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onGoToTranslator} 
          className="p-6 rounded-[2.5rem] bg-indigo-600 dark:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-all text-left group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">💬</div>
          <h3 className="font-black text-base">Translator</h3>
          <p className="text-[10px] font-medium opacity-80 mt-1 uppercase tracking-widest">Analysis Mode</p>
        </button>
        <button 
          onClick={onGoToNews} 
          className="p-6 rounded-[2.5rem] bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-all text-left group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">📰</div>
          <h3 className="font-black text-base">Live News</h3>
          <p className="text-[10px] font-medium opacity-80 mt-1 uppercase tracking-widest">Update Now</p>
        </button>
      </div>

      {/* Subject Grid */}
      <div className="space-y-5">
        <div className="flex items-center space-x-4 px-2">
          <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
          <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em]">Courses & Computer</h2>
          <div className="h-[1px] bg-gradient-to-r from-slate-200 to-transparent flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {subjectList.map((sub, i) => (
            <button 
              key={i} 
              onClick={() => onStartTutor(ClassLevel.C10, Group.GENERAL, sub.name)}
              className={`group flex flex-col items-center justify-center p-7 rounded-[2.8rem] border-2 border-transparent shadow-sm transition-all active:scale-[0.9] hover:border-emerald-400/20 ${sub.color}`}
            >
              <div className={`w-16 h-16 ${sub.iconBg} rounded-3xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110 shadow-lg`}>
                {sub.icon}
              </div>
              <h4 className="font-black text-[13px] text-slate-700 dark:text-white tracking-tight">{sub.name}</h4>
            </button>
          ))}
        </div>
      </div>

      <footer className="p-8 bg-slate-900 rounded-[3rem] text-center space-y-2 border-t-4 border-emerald-500">
        <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Saiyed AI Platform</p>
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
          আপনার ক্যারিয়ার গড়ার বিশ্বস্ত সঙ্গী। সাহায্য পেতে কল করুন <br/> 
          <span className="text-white font-black">01941652097</span>
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;