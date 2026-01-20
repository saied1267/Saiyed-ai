
import React, { useState } from 'react';
import { getTranslationExtended } from '../geminiService';

interface TranslatorProps {
  onBack: () => void;
}

const Translator: React.FC<TranslatorProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState<'bn-en' | 'en-bn'>('bn-en');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await getTranslationExtended(text, direction);
      setResult(res);
    } catch (err) { alert('অনুবাদে সমস্যা হয়েছে।'); }
    finally { setLoading(false); }
  };

  return (
    <div className="pb-32 space-y-4 animate-in slide-in-from-right-3 duration-300 px-1 font-['Hind_Siliguri']">
      <header className="flex items-center space-x-3 py-3 border-b dark:border-slate-800">
        <button onClick={onBack} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-all active:scale-90"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"/></svg></button>
        <h2 className="text-base font-black text-blue-600">সাঈদ এআই ট্রান্সলেটর</h2>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border dark:border-slate-800">
        <button onClick={() => setDirection(d => d === 'bn-en' ? 'en-bn' : 'bn-en')} className="mb-3 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-100 flex items-center space-x-2">
          <span>{direction === 'bn-en' ? 'বাংলা' : 'English'}</span>
          <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="3" fill="none"><path d="M7 10l5 5 5-5"/></svg>
          <span>{direction === 'bn-en' ? 'English' : 'বাংলা'}</span>
        </button>
        <textarea 
          value={text} onChange={e => setText(e.target.value)}
          placeholder="এখানে অনুবাদের জন্য টেক্সট লিখুন..." 
          className="w-full h-28 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none focus:ring-1 focus:ring-blue-400 font-bold text-[12px] dark:text-white resize-none"
        />
        <button onClick={handleTranslate} disabled={loading} className="w-full mt-3 py-3 bg-blue-600 text-white rounded-xl font-black text-[12px] shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>৩-ধাপে গভীর বিশ্লেষণ ✨</span>}
        </button>
      </div>

      {result && result.overall && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border-l-[4px] border-blue-500">
            <h3 className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center"><span className="mr-2">📝</span> সার্বিক অনুবাদ</h3>
            <div className="space-y-4 divide-y dark:divide-slate-800">
              <div className="pt-1">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">১. আক্ষরিক (Literal)</p>
                <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100">{result.overall.literal}</p>
              </div>
              <div className="pt-2">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">২. ভাবার্থ (Contextual)</p>
                <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 italic">{result.overall.contextual}</p>
              </div>
              <div className="pt-2">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">৩. প্রফেশনাল (Professional)</p>
                <p className="text-[12px] font-black text-blue-600 dark:text-blue-400">{result.overall.professional}</p>
              </div>
            </div>
          </section>

          <h4 className="text-[10px] font-black text-slate-400 uppercase px-2 mb-1 tracking-[0.2em]">বিস্তারিত বিশ্লেষণ (Breakdown)</h4>
          {result.lines && result.lines.map((line: any, idx: number) => (
            <section key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center text-[9px] font-black">{idx + 1}</span>
                <p className="text-[11px] font-black text-slate-500 italic">"{line.original}"</p>
              </div>
              <p className="text-[13px] font-black text-slate-800 dark:text-white mb-2 ml-7">➡️ {line.translated}</p>
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20 ml-7">
                 <p className="text-[8.5px] font-black text-blue-600 uppercase mb-1">সাঈদ এআই ব্যাখ্যা:</p>
                 <p className="text-[11.5px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{line.explanation}</p>
              </div>
            </section>
          ))}
          
          <div className="flex flex-col items-center py-8 opacity-30">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">Analyzed by Saiyed AI</p>
            <p className="text-[8px] font-bold">Hathazari College</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Translator;
