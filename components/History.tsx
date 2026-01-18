
import React from 'react';
import { Subject, ChatMessage } from '../types';

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

  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">চ্যাট হিস্টোরি</h2>
          <p className="text-sm opacity-60">আপনার পুরনো পড়ালেখা এবং আলাপচারিতা।</p>
        </div>
        {subjectsWithHistory.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-[10px] font-black uppercase text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl transition active:scale-95"
          >
            সব মুছুন
          </button>
        )}
      </header>

      {subjectsWithHistory.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-30">📜</div>
          <p className="text-gray-400 font-bold">এখনো কোনো হিস্টোরি নেই।</p>
          <p className="text-xs text-gray-400 mt-1">পড়ালেখা শুরু করলে এখানে দেখা যাবে।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjectsWithHistory.map(([subject, messages]) => {
            const lastMessage = messages[messages.length - 1];
            return (
              <div key={subject} className="relative group">
                <button
                  onClick={() => onSelectSubject(subject as Subject)}
                  className="w-full bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4 active:scale-[0.98] transition-all hover:border-emerald-500/30 text-left"
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                     {getEmojiForSubject(subject as Subject)}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-black text-sm text-gray-800 dark:text-gray-100 truncate">{subject.split(' ')[0]}</h3>
                      <span className="text-[9px] font-black text-gray-400 uppercase">{new Date(lastMessage.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                      {lastMessage.role === 'user' ? 'আপনি: ' : 'AI: '}
                      {lastMessage.text}
                    </p>
                  </div>
                </button>
                <button 
                  onClick={(e) => handleDelete(e, subject)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                  title="ডিলিট করুন"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
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
    case Subject.WORD: return '📄';
    case Subject.EXCEL: return '📉';
    case Subject.POWERPOINT: return '🎭';
    default: return '📚';
  }
};

export default History;
