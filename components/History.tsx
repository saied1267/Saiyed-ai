
import React from 'react';
import { Subject, ChatMessage, View, AppUser } from '../types';

interface HistoryProps {
  user: AppUser | null;
  chatHistories: Record<string, ChatMessage[]>;
  onSelectSubject: (subject: Subject) => void;
  onDeleteHistory: (subject: string) => void;
  onClearAll: () => void;
  isSyncing?: boolean;
}

const History: React.FC<HistoryProps> = ({ user, chatHistories, onSelectSubject, onDeleteHistory, onClearAll, isSyncing }) => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('UID কপি হয়েছে! এটি ফায়ারবেস কনসোলে খুঁজুন।');
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
          <div className="flex items-center mt-1 space-x-2">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isSyncing ? 'ক্লাউডে সিঙ্ক হচ্ছে...' : 'সব তথ্য ক্লাউডে নিরাপদ'}
            </p>
          </div>
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

      {/* Simplified Database Location Info with UID */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border-2 border-emerald-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3">ফায়ারবেসে ডাটা দেখার নিয়ম</h3>
        <p className="text-[12px] font-bold leading-relaxed mb-4 text-slate-300">
          আপনার ডাটাবেসে নিজেকে খুঁজে পেতে নিচের ধাপগুলো অনুসরণ করুন:
        </p>
        
        <div className="bg-white/5 p-4 rounded-2xl font-mono text-[10px] space-y-3 break-all border border-white/10">
          <div>
            <p className="text-emerald-400 font-black mb-1">১. আপনার ইউনিক আইডি (UID):</p>
            <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-lg">
              <code className="flex-1 text-[9px] text-slate-300 truncate">{user?.uid || 'লগইন করুন'}</code>
              {user?.uid && (
                <button onClick={() => copyToClipboard(user.uid)} className="bg-emerald-500 text-white px-2 py-1 rounded text-[8px] font-black uppercase">Copy</button>
              )}
            </div>
          </div>
          <p className="opacity-70">২. ফায়ারবেস কনসোলে **Firestore Database** এ যান।</p>
          <p className="opacity-70">৩. **users** কালেকশনে ক্লিক করে উপরের কপি করা আইডিটি খুঁজুন।</p>
          <p className="opacity-70">৪. ডানপাশে **chatHistories** ফিল্ডে ক্লিক করলে আপনার সব মেসেজ দেখতে পাবেন।</p>
        </div>
      </div>

      {subjectsWithHistory.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
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
