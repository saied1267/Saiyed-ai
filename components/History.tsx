
import React from 'react';
import { Subject, ChatMessage, AppUser } from '../types';

interface HistoryProps {
  user: AppUser | null;
  chatHistories: Record<string, ChatMessage[]>;
  onSelectSubject: (subject: Subject) => void;
  onDeleteHistory: (subject: string) => void;
  onClearAll: () => void;
}

const History: React.FC<HistoryProps> = ({ user, chatHistories, onSelectSubject, onDeleteHistory, onClearAll }) => {
  const subjectsWithHistory = (Object.entries(chatHistories) as [string, ChatMessage[]][])
    .filter(([_, msgs]) => msgs.length > 0)
    .sort((a, b) => {
      const lastA = a[1][a[1].length - 1]?.timestamp || 0;
      const lastB = b[1][b[1].length - 1]?.timestamp || 0;
      return lastB - lastA;
    });

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'এইমাত্র';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return new Date(timestamp).toLocaleDateString('bn-BD');
  };

  const getSubjectIcon = (s: string) => {
    const mapping: Record<string, string> = {
      [Subject.MATH]: 'https://cdn-icons-png.flaticon.com/128/3771/3771278.png',
      [Subject.ICT]: 'https://cdn-icons-png.flaticon.com/128/919/919827.png',
      [Subject.ENGLISH]: 'https://cdn-icons-png.flaticon.com/128/3898/3898082.png',
      [Subject.PHYSICS]: 'https://cdn-icons-png.flaticon.com/128/2921/2921131.png',
      [Subject.BANGLA]: 'https://cdn-icons-png.flaticon.com/128/2921/2921118.png',
      [Subject.WORD]: 'https://cdn-icons-png.flaticon.com/128/732/732228.png',
      [Subject.EXCEL]: 'https://cdn-icons-png.flaticon.com/128/732/732220.png',
      [Subject.POWERPOINT]: 'https://cdn-icons-png.flaticon.com/128/732/732224.png',
    };
    return mapping[s] || 'https://cdn-icons-png.flaticon.com/128/2921/2921124.png';
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500 font-['Hind_Siliguri']">
      <header className="flex justify-between items-end py-4 border-b dark:border-slate-800">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">ইতিহাস</h2>
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">আপনার অগ্রযাত্রা</p>
        </div>
        {subjectsWithHistory.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-[9px] font-black uppercase text-red-500 bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/20 active:scale-95 transition-all"
          >
            ক্লিয়ার
          </button>
        )}
      </header>

      {subjectsWithHistory.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800">
          <span className="text-5xl mb-6 grayscale opacity-20">📖</span>
          <h3 className="text-xl font-black text-slate-400">কোনো ইতিহাস নেই</h3>
          <p className="text-[12px] text-slate-400 mt-2 max-w-[200px] leading-relaxed font-bold">পড়া শুরু করলে তার তালিকা এখানে দেখা যাবে।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjectsWithHistory.map(([subject, messages]) => {
            const lastMessage = messages[messages.length - 1];
            return (
              <div key={subject} className="relative group animate-in slide-in-from-bottom-2">
                <button
                  onClick={() => onSelectSubject(subject as Subject)}
                  className="w-full bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border-2 border-slate-50 dark:border-slate-800 flex items-center space-x-4 active:scale-[0.98] transition-all hover:border-emerald-500/30 text-left"
                >
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center p-2.5 flex-shrink-0">
                     <img src={getSubjectIcon(subject)} className="w-full h-full object-contain" alt="s" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-black text-[14px] text-slate-800 dark:text-gray-100 truncate">{subject}</h3>
                      <span className="text-[7px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase">{getTimeAgo(lastMessage.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-bold opacity-70">
                      {lastMessage.text}
                    </p>
                  </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm('মুছতে চান?')) onDeleteHistory(subject); }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
