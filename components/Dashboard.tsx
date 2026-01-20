
import React from 'react';
import { Subject, Group, ClassLevel, AppUser, View } from '../types';

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
    color: 'from-blue-600 to-indigo-700',
    subjects: [Subject.MATH, Subject.ENGLISH, Subject.BANGLA, Subject.ICT, Subject.GK]
  },
  {
    name: 'বিজ্ঞান বিভাগ',
    color: 'from-emerald-500 to-teal-700',
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.BIOLOGY, Subject.SCIENCE_GEN]
  },
  {
    name: 'ব্যবসায় শিক্ষা',
    color: 'from-orange-500 to-red-700',
    subjects: [Subject.ACCOUNTING, Subject.FINANCE, Subject.ECONOMICS, Subject.MANAGEMENT, Subject.BUSINESS_ENT]
  },
  {
    name: 'ডিজিটাল স্কিলস',
    color: 'from-purple-600 to-pink-700',
    subjects: [Subject.WORD, Subject.EXCEL, Subject.POWERPOINT]
  }
];

const getSubjectIcon = (s: Subject) => {
  const mapping: Record<string, string> = {
    [Subject.MATH]: 'https://cdn-icons-png.flaticon.com/512/3771/3771278.png',
    [Subject.ENGLISH]: 'https://cdn-icons-png.flaticon.com/512/3898/3898082.png',
    [Subject.PHYSICS]: 'https://cdn-icons-png.flaticon.com/512/2921/2921131.png',
    [Subject.CHEMISTRY]: 'https://cdn-icons-png.flaticon.com/512/2921/2921128.png',
    [Subject.BIOLOGY]: 'https://cdn-icons-png.flaticon.com/512/2921/2921121.png',
    [Subject.ACCOUNTING]: 'https://cdn-icons-png.flaticon.com/512/2611/2611222.png',
    [Subject.ICT]: 'https://cdn-icons-png.flaticon.com/512/919/919827.png',
    [Subject.GK]: 'https://cdn-icons-png.flaticon.com/512/2921/2921116.png',
    [Subject.ECONOMICS]: 'https://cdn-icons-png.flaticon.com/512/2611/2611225.png',
    [Subject.FINANCE]: 'https://cdn-icons-png.flaticon.com/512/2611/2611223.png',
    [Subject.MANAGEMENT]: 'https://cdn-icons-png.flaticon.com/512/2611/2611227.png',
    [Subject.WORD]: 'https://cdn-icons-png.flaticon.com/512/732/732228.png',
    [Subject.EXCEL]: 'https://cdn-icons-png.flaticon.com/512/732/732220.png',
    [Subject.POWERPOINT]: 'https://cdn-icons-png.flaticon.com/512/732/732224.png',
    [Subject.BANGLA]: 'https://cdn-icons-png.flaticon.com/512/2921/2921118.png',
  };
  return mapping[s] || 'https://cdn-icons-png.flaticon.com/512/2921/2921124.png';
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, onStartTutor, onGoToPlanner, onGoToTranslator, onGoToNews, onGoToHistory
}) => {
  const firstName = user ? user.name.split(' ')[0] : 'শিক্ষার্থী';

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700 font-['Hind_Siliguri']">
      {/* Premium Social-Style Header */}
      <header className="py-4 flex justify-between items-center sticky top-0 bg-[#F0F2F5]/90 dark:bg-slate-950/90 backdrop-blur-md z-40">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            সাঈদ <span className="text-emerald-500">এআই</span>
          </h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            শুভকামনা, {firstName}!
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onGoToNews} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border dark:border-slate-800 shadow-sm active:scale-90 transition-all text-xl">🗞️</button>
          <button onClick={onGoToHistory} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full overflow-hidden border-2 border-emerald-500/20 active:scale-90 transition-all">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="p" />
            ) : (
              <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">{firstName[0]}</div>
            )}
          </button>
        </div>
      </header>

      {/* Modern High-Impact Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onGoToPlanner} className="flex flex-col items-start p-5 rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-xl active:scale-95 transition-all">
           <span className="text-2xl bg-white/10 p-2 rounded-xl mb-3">📅</span>
           <h3 className="font-black text-base">স্টাডি রুটিন</h3>
           <p className="text-[10px] opacity-60 font-black uppercase mt-1">পড়াশোনার মাস্টার প্ল্যান</p>
        </button>
        <button onClick={onGoToTranslator} className="flex flex-col items-start p-5 rounded-[2rem] bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-md active:scale-95 transition-all">
           <span className="text-2xl bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl mb-3">🌍</span>
           <h3 className="font-black text-base text-slate-800 dark:text-white">অনুবাদ এআই</h3>
           <p className="text-[10px] text-blue-600 font-black uppercase mt-1">গভীর বিশ্লেষণসহ</p>
        </button>
      </div>

      {/* Facebook-style List Groups */}
      <div className="space-y-10">
        {SUBJECT_GROUPS.map((group, idx) => (
          <div key={idx} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 150}ms` }}>
            <div className="flex items-center justify-between mb-4 px-1">
               <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center">
                 <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${group.color} mr-2.5`}></span>
                 {group.name}
               </h2>
               <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-4"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {group.subjects.map((sub, sIdx) => (
                <button 
                  key={sIdx} 
                  onClick={() => onStartTutor(ClassLevel.C10, Group.GENERAL, sub)}
                  className="flex items-center p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center p-2.5 mr-4 shadow-inner group-hover:scale-110 transition-transform">
                    <img src={getSubjectIcon(sub)} alt={sub} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      {sub}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">টিউটোরিয়াল ও সমাধান</p>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700 text-lg group-hover:translate-x-1 transition-transform">→</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Clean Footer Info */}
      <div className="py-10 text-center space-y-2 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Saiyed AI • Education</p>
        <p className="text-[8px] font-bold italic">Hathazari College Student Project</p>
      </div>
    </div>
  );
};

export default Dashboard;
