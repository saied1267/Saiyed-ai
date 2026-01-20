
import React from 'react';
import { Subject, ChatMessage, View } from '../types';

interface HistoryProps {
  chatHistories: Record<string, ChatMessage[]>;
  onSelectSubject: (subject: Subject) => void;
  onDeleteHistory: (subject: string) => void;
  onClearAll: () => void;
}

const History: React.FC<HistoryProps> = ({ chatHistories, onSelectSubject, onDeleteHistory, onClearAll }) => {
  const subjectsWithHistory = (Object.entries(chatHistories) as [string, ChatMessage[]][])
    .filter(([_, msgs]) => msgs.length > 0)
    .sort((a, b) => {
      const lastA = a[1][a[1].length - 1]?.timestamp || 0;
      const lastB = b[1][b[1].length - 1]?.timestamp || 0;
      return lastB - lastA;
    });

  const handleDelete = (e: React.MouseEvent, subject: string) => {
    e.stopPropagation();
    if (confirm(`আপনি কি "${subject.split(' ')[0]}" এর হিস্টোরি মুছে ফেলতে চান?`)) {
      onDeleteHistory(subject);
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'এইমাত্র';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return new Date(timestamp).toLocaleDateString('bn-BD');
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-['Hind_Siliguri']">
      <header className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">হিস্টোরি</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">আপনার সব আলাপচারিতা সংরক্ষিত আছে</p>
        </div>
        {subjectsWithHistory.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-[10px] font-black uppercase text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-2xl border border-red-100 dark:border-red-900/30 transition active:scale-95"
          >
            সব মুছুন
          </button>
        )}
      </header>

      {subjectsWithHistory.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-40">📝</div>
          <h3 className="text-xl font-black text-slate-400">কোনো হিস্টোরি নেই</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-[200px] leading-relaxed font-medium">পড়ালেখা শুরু করলে আপনার সব চ্যাট এখানে জমা হবে।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subjectsWithHistory.map(([subject, messages]) => {
            const lastMessage = messages[messages.length - 1];
            return (
              <div key={subject} className="relative group animate-in fade-in slide-in-from-right-4">
                <button
                  onClick={() => onSelectSubject(subject as Subject)}
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4 active:scale-[0.98] transition-all hover:border-emerald-500/30 hover:shadow-lg text-left"
                >
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border dark:border-slate-700">
                     {getEmojiForSubject(subject as Subject)}
                  </div>
                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-black text-[15px] text-slate-800 dark:text-gray-100 truncate">{subject}</h3>
                      <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full uppercase">{getTimeAgo(lastMessage.timestamp)}</span>
                    </div>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate font-medium">
                      <span className="opacity-40">{lastMessage.role === 'user' ? 'আপনি: ' : 'সাঈদ এআই: '}</span>
                      {lastMessage.text}
                    </p>
                  </div>
                </button>
                <button 
                  onClick={(e) => handleDelete(e, subject)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 border border-red-100 dark:border-red-900/30"
                  title="ডিলিট করুন"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      
  );
};

const getEmojiForSubject = (sub: Subject): string => {
  switch (sub) {
    case Subject.MATH: return '🔢';
    case Subject.ICT: return '💻';
    case Subject.ACCOUNTING: return '📊';
    case Subject.FINANCE: return '💰';
    case Subject.ENGLISH: return '🔤';
    case Subject.GK: return '🌍';
    case Subject.PHYSICS: return '⚛️';
    case Subject.CHEMISTRY: return '🧪';
    case Subject.BIOLOGY: return '🧬';
    case Subject.BANGLA: return '🖋️';
    case Subject.WORD: return '📄';
    case Subject.EXCEL: return '📉';
    case Subject.POWERPOINT: return '🎭';
    default: return '📚';
  }
};

export default History;
  
