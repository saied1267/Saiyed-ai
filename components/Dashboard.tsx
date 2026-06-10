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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // ন্যাভ ট্র্যাকিংয়ের জন্য

  // এনিমেটেড টেক্সট ও কালার কনফিগ
  const infoSlides = [
    { text: `${user.college} • ${user.department}`, color: 'text-slate-400 dark:text-slate-300' },
    { text: "Kaisir Ahamed Saiyed is the CEO of Saiyed AI", color: 'text-emerald-500 dark:text-emerald-400 font-black' },
    { text: "Trainer Of Computer", color: 'text-indigo-500 dark:text-indigo-400 font-extrabold' },
    { text: "Hathazari Government College Accounting Department", color: 'text-amber-500 dark:text-amber-400' },
    { text: "For Feedback 01941652097", color: 'text-rose-500 dark:text-rose-400 font-black tracking-normal' }
  ];

  useEffect(() => {
    // ইউজার কাউন্টার (০-১৫ জন) - এখন ধীরে ধীরে বাড়বে বা কমবে
    const userInterval = setInterval(() => {
      setActiveUsers((prevUsers) => {
        // -1, 0, অথবা +1 পরিবর্তন হবে
        const change = Math.floor(Math.random() * 3) - 1;
        const newUsers = prevUsers + change;
        // সংখ্যাটি যেন ০ এর নিচে বা ১৫ এর উপরে না যায়
        return Math.max(0, Math.min(15, newUsers));
      });
    }, 8000);

    // টেক্সট এনিমেশন ইন ও আউট পরিবর্তন
    const textInterval = setInterval(() => {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setIsAnimatingOut(false);
        setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % infoSlides.length);
      }, 500);
    }, 4000);

    // সার্ভার স্ট্যাটাস চেক
    const serverInterval = setInterval(() => {
      setIsServerActive(false);
      setTimeout(() => setIsServerActive(true), 3000); 
    }, 20000);

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
    <div className="space-y-8 animate-in fade-in duration-700 pb-32 font-['Hind_Siliguri'] relative min-h-screen">
      <header className="flex justify-between items-center pt-2">
        <div className="space-y-1">
          <div className="flex items-start space-x-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
              Saiyed <span className="text-emerald-500 ml-1">AI</span>
            </h1>
            <div className="flex flex-col items-start mt-1.5 space-y-0.5">
              {isServerActive ? (
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[9px] rounded-full font-black uppercase tracking-tighter animate-pulse">
                  Server Active 🟢
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-500 text-[9px] rounded-full font-black uppercase tracking-tighter animate-bounce">
                  Server Down 🔴
                </span>
              )}
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-tight transition-all duration-500">
                {activeUsers} active user
              </span>
            </div>
          </div>
          
          <div className="min-h-[16px] overflow-hidden pt-1">
            <p 
              key={currentSlideIndex}
              className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${infoSlides[currentSlideIndex].color} ${isAnimatingOut ? 'animate-out fade-out slide-out-to-top-2' : 'animate-in fade-in slide-in-from-bottom-2'}`}
            >
              {infoSlides[currentSlideIndex].text}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onGoToHistory} 
          className="w-11 h-11 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-sm active:scale-90 transition-all hover:bg-slate-50"
        >
         🗑️
        </button>
      </header>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { setActiveTab('translator'); onGoToTranslator(); }} 
          className="p-5 rounded-[2.2rem] bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-left relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="text-2xl mb-3">💬🈶</div>
          <h3 className="font-black text-sm">Translator</h3>
          <p className="text-[9px] opacity-60 mt-1 font-bold uppercase tracking-tighter">গভীর অনুবাদ বিশ্লেষণ</p>
        </button>
        <button 
          onClick={() => { setActiveTab('news'); onGoToNews(); }} 
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
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">বিষয় ও কম্পিউটার কোর্স</h2>
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
          সাঈদ এআই (Saiyed AI) আপনার পড়াশোনাকে আরও সহজ করতে প্রস্তুত! 🚀 For help 01941652097
        </p>
      </div>

      {/* 👑 আধুনিক ও আকর্ষণীয় বটম ন্যাভিগেশন বার (Floating iOS Style) */}
      <div className="fixed bottom-5 left-4 right-4 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] px-4 py-2.5 flex justify-around items-center transition-all duration-300">
        
        {/* Home Tab */}
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === 'home' ? 'text-emerald-500 font-black scale-105' : 'text-slate-400 dark:text-slate-500 font-medium'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={activeTab === 'home' ? '2.5' : '2'} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21.75h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21.75h7.5" />
          </svg>
          <span className="text-[9px] uppercase tracking-wider">Home</span>
        </button>

        {/* Translator Tab */}
        <button 
          onClick={() => { setActiveTab('translator'); onGoToTranslator(); }}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === 'translator' ? 'text-indigo-500 font-black scale-105' : 'text-slate-400 dark:text-slate-500 font-medium'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={activeTab === 'translator' ? '2.5' : '2'} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21a.75.75 0 0 1-.75-.75V3.75a.75.75 0 0 1 1.5 0v16.5a.75.75 0 0 1-.75.75Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75h5.25a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H12M12 6.75H6.75a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3H12" />
          </svg>
          <span className="text-[9px] uppercase tracking-wider">Translate</span>
        </button>

        {/* News Tab */}
        <button 
          onClick={() => { setActiveTab('news'); onGoToNews(); }}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === 'news' ? 'text-emerald-500 font-black scale-105' : 'text-slate-400 dark:text-slate-500 font-medium'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={activeTab === 'news' ? '2.5' : '2'} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
          </svg>
          <span className="text-[9px] uppercase tracking-wider">News</span>
        </button>

        {/* History Tab */}
        <button 
          onClick={() => { setActiveTab('history'); onGoToHistory(); }}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === 'history' ? 'text-amber-500 font-black scale-105' : 'text-slate-400 dark:text-slate-500 font-medium'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={activeTab === 'history' ? '2.5' : '2'} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span className="text-[9px] uppercase tracking-wider">History</span>
        </button>

      </div>
    </div>
  );
};

export default Dashboard;