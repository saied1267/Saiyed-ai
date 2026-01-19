
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
    name: 'সাধারণ বিষয় (Basic)',
    subjects: [Subject.MATH, Subject.ENGLISH, Subject.BANGLA, Subject.GK, Subject.ICT]
  },
  {
    name: 'বিজ্ঞান ও প্রযুক্তি',
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.BIOLOGY, Subject.SCIENCE_GEN, Subject.BGS]
  },
  {
    name: 'ব্যবসায় ও মানবিক',
    subjects: [Subject.ACCOUNTING, Subject.FINANCE, Subject.ECONOMICS, Subject.MANAGEMENT, Subject.MARKETING, Subject.BUSINESS_ENT]
  },
  {
    name: 'বিবিএ (BBA)',
    subjects: [Subject.FINANCE, Subject.ACCOUNTING, Subject.ECONOMICS]
  },
  {
    name: 'কম্পিউটার স্কিল',
    subjects: [Subject.WORD, Subject.EXCEL, Subject.POWERPOINT]
  }
];

const getEmojiForSub = (s: Subject) => {
  if (s === Subject.MATH) return '🔢';
  if (s === Subject.ENGLISH) return '🔤';
  if (s === Subject.PHYSICS) return '⚛️';
  if (s === Subject.CHEMISTRY) return '🧪';
  if (s === Subject.BIOLOGY) return '🧬';
  if (s === Subject.ACCOUNTING) return '📊';
  if (s === Subject.ICT) return '💻';
  if (s === Subject.GK) return '🌍';
  if (s === Subject.ECONOMICS) return '📉';
  if (s === Subject.FINANCE) return '💰';
  if (s === Subject.MANAGEMENT) return '🏢';
  if (s === Subject.MARKETING) return '📣';
  if (s === Subject.BUSINESS_ENT) return '🚀';
  if (s === Subject.WORD) return '📄';
  if (s === Subject.EXCEL) return '📊';
  if (s === Subject.POWERPOINT) return '🎭';
  if (s === Subject.BANGLA) return '🖋️';
  if (s === Subject.SCIENCE_GEN) return '🔬';
  if (s === Subject.BGS) return '🏛️';
  return '📚';
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, onStartTutor, onGoToPlanner, onGoToTranslator, onGoToNews, onGoToHistory
}) => {
  const firstName = user ? user.name.split(' ')[0] : 'শিক্ষার্থী';

  return (
    <div className="space-y-6 pb-24">
      <header className="py-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">সাঈদ এআই</h1>
          <p className="text-sm font-bold text-gray-500 mt-1 dark:text-gray-400">সালাম, <span className="text-emerald-500">{firstName}</span>! পড়ালেখা শুরু করি?</p>
        </div>
        {user && (
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 font-black text-sm border border-emerald-200 dark:border-emerald-800">
            {firstName[0]}
          </div>
        )}
      </header>

      <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
        <button onClick={onGoToHistory} className="flex-shrink-0 bg-purple-600 p-4 rounded-3xl text-white shadow-lg min-w-[120px] active:scale-95 transition-transform border-4 border-white dark:border-slate-800">
          <span className="block text-2xl">📜</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">হিস্টোরি</span>
        </button>
        <button onClick={onGoToNews} className="flex-shrink-0 bg-emerald-500 p-4 rounded-3xl text-white shadow-lg min-w-[120px] active:scale-95 transition-transform">
          <span className="block text-2xl">📰</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">সংবাদ</span>
        </button>
        <button onClick={onGoToTranslator} className="flex-shrink-0 bg-blue-500 p-4 rounded-3xl text-white shadow-lg min-w-[120px] active:scale-95 transition-transform">
          <span className="block text-2xl">🌍</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Translator</span>
        </button>
        <button onClick={onGoToPlanner} className="flex-shrink-0 bg-orange-500 p-4 rounded-3xl text-white shadow-lg min-w-[120px] active:scale-95 transition-transform">
          <span className="block text-2xl">📅</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">রুটিন</span>
        </button>
      </div>

      <div className="space-y-8">
        {SUBJECT_GROUPS.map((group, idx) => (
          <div key={idx} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center">
              <span className="w-8 h-[1px] bg-gray-200 mr-2"></span>
              {group.name}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {group.subjects.map((sub, sIdx) => (
                <button 
                  key={`${sub}-${idx}-${sIdx}`} 
                  onClick={() => onStartTutor(group.name === 'বিবিএ (BBA)' ? ClassLevel.BBA : ClassLevel.C10, Group.GENERAL, sub)}
                  className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center space-y-3 active:scale-95 transition-all hover:border-emerald-500 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{getEmojiForSub(sub)}</span>
                  <span className="text-[11px] font-black text-gray-700 dark:text-gray-200 leading-tight">{sub}</span>
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
