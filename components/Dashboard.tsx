import React, { useState, useEffect } from 'react';
import { Subject, ClassLevel, Group, AppUser } from '../types';

interface DashboardProps {
  user: AppUser;
  onStartTutor: (lvl: ClassLevel, grp: Group, sub: Subject) => Promise<void>;
  onGoToTranslator: () => void;
  onGoToNews: () => void;
  onGoToHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartTutor, onGoToTranslator, onGoToNews, onGoToHistory }) => {
  const [isServerActive, setIsServerActive] = useState(true);
  const [activeUsers, setActiveUsers] = useState(4);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const infoSlides = [
    { text: `${user.college} • ${user.department}`, color: 'text-slate-400 dark:text-slate-300' },
    { text: "Kaisir Ahamed Saiyed is the CEO of Saiyed AI", color: 'text-emerald-500 dark:text-emerald-400 font-black' },
    { text: "Trainer Of Computer", color: 'text-indigo-500 dark:text-indigo-400 font-extrabold' },
    { text: "Hathazari Government College Accounting Department", color: 'text-amber-500 dark:text-amber-400' },
    { text: "For Feedback 01941652097", color: 'text-rose-500 dark:text-rose-400 font-black tracking-normal' }
  ];

  useEffect(() => {
    const userInterval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 16));
    }, 8000);

    const textInterval = setInterval(() => {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setIsAnimatingOut(false);
        setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % infoSlides.length);
      }, 500);
    }, 4000);

    return () => {
      clearInterval(userInterval);
      clearInterval(textInterval);
    };
  }, []);

  // কোটা চেক এবং এপিআই কল হ্যান্ডলার
  const handleStartTutor = async (sub: Subject) => {
    try {
      await onStartTutor(ClassLevel.C10, Group.GENERAL, sub);
    } catch (error: any) {
      // যদি এপিআই কোটা শেষ হয় (429 Status)
      if (error?.response?.status === 429) {
        setIsServerActive(false);
        alert("দুঃখিত! সার্ভার কোটা শেষ হয়ে গেছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
        
        // ১০ মিনিট (৬,০০,০০০ মি.সে.) পর সার্ভার অটোমেটিক সক্রিয় হবে
        setTimeout(() => setIsServerActive(true), 600000);
      } else {
        console.error("API Error:", error);
      }
    }
  };

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
              <span className={`px-2 py-0.5 text-[9px] rounded-full font-black uppercase tracking-tighter ${isServerActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 animate-pulse' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 animate-bounce'}`}>
                {isServerActive ? "Server Active 🟢" : "Server Down 🔴"}
              </span>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-tight">{activeUsers} active user</span>
            </div>
          </div>
          <p key={currentSlideIndex} className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${infoSlides[currentSlideIndex].color} ${isAnimatingOut ? 'animate-out fade-out slide-out-to-top-2' : 'animate-in fade-in slide-in-from-bottom-2'}`}>
            {infoSlides[currentSlideIndex].text}
          </p>
        </div>
        <button onClick={onGoToHistory} className="w-11 h-11 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-sm active:scale-90 transition-all hover:bg-slate-50">🗑️</button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => { setActiveTab('translator'); onGoToTranslator(); }} className="p-5 rounded-[2.2rem] bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-left group">
          <div className="text-2xl mb-3">💬🈶</div>
          <h3 className="font-black text-sm">Translator</h3>
        </button>
        <button onClick={() => { setActiveTab('news'); onGoToNews(); }} className="p-5 rounded-[2.2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-left group">
          <div className="text-2xl mb-3">📰</div>
          <h3 className="font-black text-sm">আজকের খবর</h3>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {subjectList.map((sub, i) => (
          <button 
            key={i} 
            onClick={() => handleStartTutor(sub.name)}
            className={`group flex flex-col items-center justify-center p-6 rounded-[2.5rem] border shadow-sm transition-all ${!isServerActive ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.92]'} ${sub.color}`}
          >
            <div className={`w-14 h-14 ${sub.iconBg} rounded-[1.5rem] flex items-center justify-center text-3xl mb-4`}>{sub.icon}</div>
            <h4 className={`font-black text-[13px] ${sub.textColor}`}>{sub.name}</h4>
          </button>
        ))}
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-5 left-4 right-4 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] px-4 py-2.5 flex justify-around">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-emerald-500 font-black' : 'text-slate-400'}>Home</button>
        <button onClick={() => { setActiveTab('translator'); onGoToTranslator(); }} className={activeTab === 'translator' ? 'text-indigo-500 font-black' : 'text-slate-400'}>Translate</button>
        <button onClick={() => { setActiveTab('news'); onGoToNews(); }} className={activeTab === 'news' ? 'text-emerald-500 font-black' : 'text-slate-400'}>News</button>
        <button onClick={() => { setActiveTab('history'); onGoToHistory(); }} className={activeTab === 'history' ? 'text-amber-500 font-black' : 'text-slate-400'}>History</button>
      </div>
    </div>
  );
};

export default Dashboard;
