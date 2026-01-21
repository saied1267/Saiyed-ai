
import React, { useState } from 'react';
import { getTranslationModern } from '../geminiService';

const Translator: React.FC<{onBack:()=>void}> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState<'bn-en'|'en-bn'>('bn-en');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async (t?: string) => {
    const inputText = t || text;
    if(!inputText.trim() || loading) return;
    setLoading(true);
    try {
      const res = await getTranslationModern(inputText, direction);
      setResult(res);
    } catch(e) { alert('দুঃখিত, অনুবাদ করতে সমস্যা হয়েছে।'); }
    finally { setLoading(false); }
  };

  return (
    <div className="pb-32 space-y-8 font-['Hind_Siliguri'] animate-in slide-in-from-right-4 duration-500">
      <header className="flex items-center space-x-4 py-4">
        <button onClick={onBack} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-[1.2rem] text-slate-500 active:scale-90 transition-all">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h2 className="text-3xl font-black dark:text-white tracking-tight">অনুবাদ এআই ✨</h2>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">গভীর ব্যাকরণ বিশ্লেষণসহ</p>
        </div>
      </header>

      {!result && !loading && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {['আপনি কেমন আছেন?', 'I love learning', 'সাফল্য পরিশ্রমের ফল', 'Hathazari College'].map(t => (
            <button key={t} onClick={() => {setText(t); handleTranslate(t);}} className="p-4 text-[13px] font-bold bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-slate-500 text-left hover:border-indigo-500/30 transition-all shadow-sm">{t}</button>
          ))}
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-7 border dark:border-slate-800 shadow-inner">
        <div className="flex items-center justify-between mb-6 px-2">
          <button onClick={() => setDirection(d => d==='bn-en'?'en-bn':'bn-en')} className="px-6 py-3 bg-white dark:bg-slate-800 rounded-full text-[13px] font-black border dark:border-slate-700 flex items-center space-x-4 text-indigo-600 shadow-sm active:scale-95 transition-all">
            <span className="uppercase tracking-widest">{direction==='bn-en'?'Bengali':'English'}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none"><path d="M7 10l5 5 5-5"/></svg>
            <span className="uppercase tracking-widest">{direction==='bn-en'?'English':'Bengali'}</span>
          </button>
          {text && <button onClick={() => setText('')} className="text-[11px] font-black text-red-400 uppercase tracking-widest">মুছুন</button>}
        </div>
        <textarea 
          value={text} onChange={e=>setText(e.target.value)}
          placeholder="এখানে টেক্সট লিখুন..."
          className="w-full h-40 bg-transparent outline-none font-bold text-[20px] dark:text-white resize-none leading-relaxed placeholder:opacity-30"
        />
        <button onClick={() => handleTranslate()} disabled={loading} className="w-full mt-6 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[14px] uppercase shadow-xl shadow-indigo-500/30 active:scale-95 transition-all">
          {loading ? 'সাঈদ এর এআই বিশ্লেষণ করছে...' : 'গভীর অনুবাদ ও গ্রামার চেক'}
        </button>
      </div>

      {result && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Main Translations */}
          <div className="grid grid-cols-1 gap-4">
             {[
               { label: 'ফরমাল (Formal)', text: result.formal, color: 'indigo' },
               { label: 'ক্যাসুয়াল (Casual)', text: result.casual, color: 'emerald' },
               { label: 'ইনফরমাল (Informal)', text: result.informal, color: 'orange' }
             ].map((item, idx) => (
               <div key={idx} className={`p-6 bg-${item.color}-50/30 dark:bg-${item.color}-900/10 rounded-[2rem] border border-${item.color}-100 dark:border-${item.color}-900/30`}>
                 <p className={`text-[10px] font-black text-${item.color}-500 uppercase tracking-widest mb-3`}>{item.label}</p>
                 <p className="text-[19px] font-black dark:text-white leading-relaxed">{item.text}</p>
               </div>
             ))}
          </div>

          {/* Grammar Analysis Section */}
          <section className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center relative z-10">
               <span className="mr-3">📚</span> গ্রামার বিশ্লেষণ (Grammar Breakdown)
             </h3>
             <div className="relative z-10 text-[15px] font-medium leading-[1.8] text-slate-300 whitespace-pre-wrap">
                {result.grammarAnalysis}
             </div>
          </section>

          {/* Line by Line Breakdown */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">শব্দ ও বাক্য বিশ্লেষণ</h3>
            {result.breakdown.map((line:any, i:number) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.01]">
                 <p className="text-[15px] font-bold text-slate-400 mb-3 italic">"{line.original}"</p>
                 <p className="text-[18px] font-black text-indigo-600 dark:text-indigo-400 mb-4">➡️ {line.translated}</p>
                 <p className="text-[14px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border dark:border-slate-800">{line.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Translator;
