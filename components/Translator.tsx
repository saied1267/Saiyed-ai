
import React, { useState, useRef } from 'react';
import { getTranslationExtended } from '../geminiService';

interface TranslatorProps {
  onBack: () => void;
}

const TRANS_SUGGESTIONS = [
  "Education is the backbone of a nation.",
  "Digital Bangladesh goals.",
  "সাফল্য অর্জনে কঠোর পরিশ্রম প্রয়োজন।",
  "How can I improve my English?"
];

const Translator: React.FC<TranslatorProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState<'bn-en' | 'en-bn'>('bn-en');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTranslate = async (customText?: string) => {
    const textToProcess = customText || text;
    if (!textToProcess.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await getTranslationExtended(textToProcess, direction);
      setResult(res);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err) { alert('দুঃখিত, অনুবাদ করা সম্ভব হয়নি।'); }
    finally { setLoading(false); }
  };

  return (
    <div className="pb-32 space-y-6 animate-in slide-in-from-right-3 duration-300">
      <header className="flex items-center space-x-3 py-4 border-b dark:border-slate-800">
        <button onClick={onBack} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"/></svg></button>
        <h2 className="text-xl font-black text-blue-600 tracking-tight">সাঈদ এআই ট্রান্সলেটর</h2>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border dark:border-slate-700">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => setDirection(d => d === 'bn-en' ? 'en-bn' : 'bn-en')} className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 font-bold text-[12px] border border-blue-100 dark:border-blue-800 flex items-center space-x-3 active:scale-95 transition-all">
            <span className="font-black">{direction === 'bn-en' ? 'বাংলা' : 'English'}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none"><path d="M7 10l5 5 5-5"/></svg>
            <span className="font-black">{direction === 'bn-en' ? 'English' : 'বাংলা'}</span>
          </button>
          <button onClick={() => { setText(''); setResult(null); }} className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Reset</button>
        </div>
        <textarea 
          value={text} onChange={e => setText(e.target.value)}
          placeholder="এখানে এক বা একাধিক লাইন লিখুন..." 
          className="w-full h-36 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-[14px] dark:text-white resize-none transition-shadow"
        />
        <button onClick={() => handleTranslate()} disabled={loading} className="w-full mt-5 py-4 bg-blue-600 text-white rounded-2xl font-black text-[14px] shadow-lg disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center space-x-2">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>লাইন-বাই-লাইন বিশ্লেষণ ✨</span>}
        </button>
      </div>

      <div className="space-y-4 px-1">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center"><span className="mr-2">⚡</span> প্র্যাকটিস সাজেশন:</p>
        <div className="flex flex-wrap gap-2">
          {(result?.relatedSuggestions || TRANS_SUGGESTIONS).map((sug: string, i: number) => (
            <button key={i} onClick={() => { setText(sug); handleTranslate(sug); }} className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 text-[11px] font-bold rounded-xl shadow-sm hover:border-blue-400 transition-all active:scale-95">{sug}</button>
          ))}
        </div>
      </div>

      {result && result.lines && (
        <div ref={scrollRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {result.lines.map((line: any, idx: number) => (
            <section key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-blue-50 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-bl-3xl text-[10px] font-black text-blue-500">
                LINE {idx + 1}
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Original</p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic">"{line.original}"</p>
                </div>
                
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Translation</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">{line.translated}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center"><span className="mr-2">📊</span> Grammar Analysis</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-bold min-w-[300px]">
                      <thead>
                        <tr className="border-b dark:border-slate-700 text-slate-400 uppercase text-[8px] tracking-[0.2em]">
                          <th className="py-2">Word</th>
                          <th className="py-2">P.O.S</th>
                          <th className="py-2">Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-slate-700">
                        {line.grammarAnalysis.map((g: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 text-blue-600 dark:text-blue-400">{g.word}</td>
                            <td className="py-3"><span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border dark:border-slate-700">{g.pos}</span></td>
                            <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">{g.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {line.explanation && (
                  <div className="flex items-start space-x-3 text-sm text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
                    <span className="text-lg">💡</span>
                    <p className="font-bold leading-relaxed">{line.explanation}</p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
export default Translator;
