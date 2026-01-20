
import React from 'react';
import { Subject, Group, ClassLevel, AppUser } from '../types';

interface DashboardProps {
  user: AppUser | null;
  onStartTutor: (classLvl: ClassLevel, group: Group, sub: Subject) => void;
  onGoToPlanner: () => void;
  onGoToTranslator: () => void;
  onGoToNews: () => void;
  onGoToHistory: () => void;
  weakTopics: string[];
}

const SUBJECT_GROUPS = [
  {
    name: 'মৌলিক শিক্ষা',
    color: 'emerald',
    subjects: [Subject.MATH, Subject.ENGLISH, Subject.BANGLA, Subject.ICT, Subject.GK]
  },
  {
    name: 'বিজ্ঞান বিভাগ',
    color: 'blue',
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.BIOLOGY, Subject.SCIENCE_GEN]
  },
  {
    name: 'ব্যবসায় শিক্ষা',
    color: 'orange',
    subjects: [Subject.ACCOUNTING, Subject.FINANCE, Subject.ECONOMICS, Subject.MANAGEMENT]
  },
  {
    name: 'কম্পিউটার কোর্স',
    color: 'purple',
    subjects: [Subject.WORD, Subject.EXCEL, Subject.POWERPOINT]
  }
];

const getSubjectIcon = (s: Subject) => {
  const mapping: Record<string, string> = {
    [Subject.MATH]: 'https://cdn-icons-png.flaticon.com/128/3771/3771278.png',
    [Subject.ENGLISH]: 'https://cdn-icons-png.flaticon.com/128/3898/3898082.png',
    [Subject.PHYSICS]: 'https://cdn-icons-png.flaticon.com/128/2921/2921131.png',
    [Subject.CHEMISTRY]: 'https://cdn-icons-png.flaticon.com/128/2921/2921128.png',
    [Subject.BIOLOGY]: 'https://cdn-icons-png.flaticon.com/128/2921/2921121.png',
    [Subject.ACCOUNTING]: 'https://cdn-icons-png.flaticon.com/128/2611/2611222.png',
    [Subject.ICT]: 'https://cdn-icons-png.flaticon.com/128/919/919827.png',
    [Subject.GK]: 'https://cdn-icons-png.flaticon.com/128/2921/2921116.png',
    [Subject.BANGLA]: 'https://cdn-icons-png.flaticon.com/128/2921/2921118.png',
    [Subject.WORD]: 'https://cdn-icons-png.flaticon.com/128/732/732228.png',
    [Subject.EXCEL]: 'https://cdn-icons-png.flaticon.com/128/732/732220.png',
    [Subject.POWERPOINT]: 'https://cdn-icons-png.flaticon.com/128/732/732224.png',
  };
  return mapping[s] || 'https://cdn-icons-png.flaticon.com/128/2921/2921124.png';
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, onStartTutor, onGoToPlanner, onGoToTranslator, onGoToNews, onGoToHistory
}) => {
  const firstName = user ? user.name.split(' ')[0] : 'শিক্ষার্থী';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-['Hind_Siliguri']">
      {/* Premium Header */}
      <header className="flex justify-between items-center py-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-50 dark:border-slate-900">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            সাঈদ <span className="text-emerald-500">এআই</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
            শুভকামনা, {firstName}!
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onGoToNews} className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center border dark:border-slate-800 shadow-sm active:scale-90 transition-all text-xl">🗞️</button>
          <button onClick={onGoToHistory} className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border-[3px] border-emerald-500/10 active:scale-90 transition-all shadow-lg">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="p" />
            ) : (
              <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">{firstName[0]}</div>
            )}
          </button>
        </div>
      </header>

      {/* Hero Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onGoToPlanner} className="flex flex-col items-start p-6 rounded-[2.2rem] bg-slate-900 text-white shadow-2xl active:scale-95 transition-all relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
           <span className="text-2xl mb-4">📅</span>
           <h3 className="font-black text-base">স্টাডি রুটিন</h3>
           <p className="text-[9px] text-slate-400 font-black uppercase mt-1">মাস্টার প্ল্যান</p>
        </button>
        <button onClick={onGoToTranslator} className="flex flex-col items-start p-6 rounded-[2.2rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 shadow-xl active:scale-95 transition-all relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform"></div>
           <span className="text-2xl mb-4">🌍</span>
           <h3 className="font-black text-base text-slate-800 dark:text-white">অনুবাদ এআই</h3>
           <p className="text-[9px] text-blue-500 font-black uppercase mt-1">গভীর বিশ্লেষণ</p>
        </button>
      </div>

      {/* Subject Sections */}
      <div className="space-y-10 pt-4">
        {SUBJECT_GROUPS.map((group, idx) => (
          <div key={idx} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 150}ms` }}>
            <div className="flex items-center space-x-3 mb-5 px-1">
               <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                 {group.name}
               </h2>
               <div className="h-[1.5px] flex-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {group.subjects.map((sub, sIdx) => (
                <button 
                  key={sIdx} 
                  onClick={() => onStartTutor(ClassLevel.C10, Group.GENERAL, sub)}
                  className="flex items-center p-4 bg-white dark:bg-slate-900 rounded-[1.8rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center p-2.5 mr-4 group-hover:scale-110 transition-transform">
                    <img src={getSubjectIcon(sub)} alt={sub} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100">
                      {sub}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">শেখা শুরু করুন</p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
