
import React from 'react';
import { Subject, ClassLevel, Group, AppUser } from '../types';

interface DashboardProps {
  user: AppUser;
  onStartTutor: (lvl: ClassLevel, grp: Group, sub: Subject) => void;
  onGoToTranslator: () => void;
  onGoToNews: () => void;
  onGoToHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartTutor, onGoToTranslator, onGoToNews, onGoToHistory }) => {
  const subjectList = [
    { name: Subject.MATH, icon: '📐', color: 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10', iconBg: 'bg-blue-100 dark:bg-blue-800', textColor: 'text-blue-600' },
    { name: Subject.ENGLISH, icon: '🔤', color: 'border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/10', iconBg: 'bg-purple-100 dark:bg-purple-800', textColor: 'text-purple-600' },
    { name: Subject.ACCOUNTING, icon: '📊', color: 'border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10', iconBg: 'bg-emerald-100 dark:bg-emerald-800', textColor: 'text-emerald-600' },
    { name: Subject.ICT, icon: '💻', color: 'border-orange-500/20 bg-orange-50/50 dark:bg-orange-900/10', iconBg: 'bg-orange-100 dark:bg-orange-800', textColor: 'text-orange-600' },
    { name: Subject.FINANCE, icon: '💰', color: 'border-rose-500/20 bg-rose-50/50 dark:bg-rose-900/10', iconBg: 'bg-rose-100 dark:bg-rose-800', textColor: 'text-rose-600' },
    { name: Subject.BANGLA, icon: '✍️', color: 'border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10', iconBg: 'bg-amber-100 dark:bg-amber-800', textColor: 'text-amber-600' },
    // Computer Courses
    { name: Subject.WORD, icon: '📝', color: 'border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10', iconBg: 'bg-indigo-100 dark:bg-indigo-800', textColor: 'text-indigo-600' },
    { name: Subject.EXCEL, icon: '📈', color: 'border-green-500/20 bg-green-50/50 dark:bg-green-900/10', iconBg: 'bg-green-100 dark:bg-green-800', textColor: 'text-green-600' },
    { name: Subject.POWERPOINT, icon: '📽️', color: 'border-orange-600/20 bg-orange-50/50 dark:bg-orange-900/10', iconBg: 'bg-orange-100 dark:bg-orange-800', textColor: 'text-orange-700' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 font-['Hind_Siliguri']">
      <header className="flex justify-between items-center pt-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
            সাঈদ <span className="text-emerald-500 ml-1">এআই</span>
            <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[9px] rounded-full font-black uppercase tracking-tighter">Pro</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {user.college} • {user.department}
          </p>
        </div>
        <button 
          onClick={onGoToHistory} 
          className="w-11 h-11 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-sm active:scale-90 transition-all hover:bg-slate-50"
        >
          📚
        </button>
      </header>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onGoToTranslator} 
          className="p-5 rounded-[2.2rem] bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-left relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="text-2xl mb-3">🌍</div>
          <h3 className="font-black text-sm">অনুবাদ এআই</h3>
          <p className="text-[9px] opacity-60 mt-1 font-bold uppercase tracking-tighter">গভীর বিশ্লেষণ</p>
        </button>
        <button 
          onClick={onGoToNews} 
          className="p-5 rounded-[2.2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-left relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="text-2xl mb-3">📰</div>
          <h3 className="font-black text-sm">আজকের খবর</h3>
          <p className="text-[9px] opacity-60 mt-1 font-bold uppercase tracking-tighter">লাইভ আপডেট</p>
        </button>
      </div>

      {/* Subject Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 px-1">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">বিষয় ও কম্পিউটার কোর্স</h2>
          <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {subjectList.map((sub, i) => (
            <button 
              key={i} 
              onClick={() => onStartTutor(ClassLevel.C10, Group.GENERAL, sub.name)}
              className={`group flex flex-col items-center justify-center p-6 rounded-[2.5rem] border shadow-sm transition-all active:scale-[0.92] hover:shadow-md hover:border-emerald-500/30 ${sub.color}`}
            >
              <div className={`w-14 h-14 ${sub.iconBg} rounded-[1.5rem] flex items-center justify-center text-3xl mb-4 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-inner`}>
                {sub.icon}
              </div>
              <h4 className={`font-black text-[13px] ${sub.textColor} dark:text-white text-center leading-tight`}>{sub.name}</h4>
              <div className="mt-3 flex items-center space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                 <span className="text-[8px] font-black uppercase tracking-widest">শিখুন</span>
                 <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2.2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center animate-pulse">
        <p className="text-[11px] font-black text-slate-500 dark:text-slate-400">
          সাঈদ এআই আপনার পড়াশোনাকে আরও সহজ করতে প্রস্তুত! 🚀
        </p>
      </div>
    </div>
  );
};
export default Dashboard;
