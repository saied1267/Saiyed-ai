
import React, { useState, useRef, useEffect } from 'react';
import { Subject, ChatMessage, ChatTheme, ClassLevel, Group } from '../types';
import { getTutorResponseStream } from '../geminiService';

interface TutorProps {
  classLevel: ClassLevel;
  group: Group;
  subject: Subject;
  history: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
  onBack: () => void;
  theme: ChatTheme;
  onUpdateTheme: (theme: ChatTheme) => void;
}

const THEME_CONFIG = {
  blue: { primary: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-100', light: 'bg-blue-50', userText: 'text-white' },
  emerald: { primary: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-100', light: 'bg-emerald-50', userText: 'text-white' },
  purple: { primary: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-100', light: 'bg-purple-50', userText: 'text-white' },
  orange: { primary: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-100', light: 'bg-orange-50', userText: 'text-white' },
  pink: { primary: 'bg-pink-600', text: 'text-pink-600', border: 'border-pink-100', light: 'bg-pink-50', userText: 'text-white' },
  white: { primary: 'bg-white', text: 'text-slate-900', border: 'border-slate-200', light: 'bg-slate-50', userText: 'text-slate-900' },
  black: { primary: 'bg-black', text: 'text-white', border: 'border-slate-800', light: 'bg-slate-900', userText: 'text-white' }
};

const getInitialSuggestions = (subject: Subject): string[] => {
  if (subject === Subject.ACCOUNTING) return ['Journal ও Ledger এন্ট্রি', 'Financial Statement তৈরি', 'Cash Flow Statement বুঝিয়ে দিন', 'Accounting Cycle কি?'];
  if (subject === Subject.FINANCE) return ['Time Value of Money কি?', 'Capital Budgeting এর নিয়ম', 'Risk and Return এর সম্পর্ক', 'Cost of Capital নির্ণয়'];
  if (subject === Subject.ECONOMICS) return ['চাহিদা ও যোগান বিধি', 'Gross Domestic Product (GDP) কি?', 'মুদ্রাস্ফীতি ও এর প্রভাব', 'বাজারের শ্রেণিবিভাগ'];
  if (subject === Subject.EXCEL) return ['VLOOKUP ফাংশন কিভাবে কাজ করে?', 'Pivot Table তৈরি করার নিয়ম', 'SUMIF এবং COUNTIF এর ব্যবহার', 'স্যালারি শিট তৈরি করা'];
  return ['এই বিষয়ের গুরুত্বপূর্ণ টপিক', 'পরীক্ষার জন্য বিশেষ প্রশ্ন', 'সহজভাবে পাঠ্যবই বুঝতে চাই', 'মূল কনসেপ্টগুলো সংক্ষেপে বলুন'];
};

const Tutor: React.FC<TutorProps> = ({ classLevel, group, subject, history, onUpdateHistory, onBack, theme, onUpdateTheme }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEME_CONFIG[theme] || THEME_CONFIG.emerald;

  useEffect(() => { 
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, loading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !selectedImage) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend.trim(), image: selectedImage || undefined, timestamp: Date.now() };
    const updatedHistory = [...history, userMsg];
    onUpdateHistory(updatedHistory);
    setInput('');
    setShowMenu(false);
    setSelectedImage(null);
    setLoading(true);

    const aiPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
    onUpdateHistory([...updatedHistory, aiPlaceholder]);

    try {
      await getTutorResponseStream(
        textToSend, { classLevel, group, subject },
        updatedHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        selectedImage || undefined,
        (streamedText) => {
          let cleanDisplay = streamedText;
          let suggestions: string[] = [];
          if (streamedText.includes('[SUGGESTIONS]')) {
            const parts = streamedText.split('[SUGGESTIONS]');
            cleanDisplay = parts[0].trim();
            suggestions = parts[1].split('|').map(s => s.trim()).filter(s => s.length > 0);
          }
          onUpdateHistory([...updatedHistory, { ...aiPlaceholder, text: cleanDisplay, suggestions }]);
        }
      );
    } catch (err) { } finally { setLoading(false); }
  };

  const initialSuggestions = getInitialSuggestions(subject);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300">
      <header className={`flex-shrink-0 flex items-center justify-between px-5 py-4 border-b dark:border-slate-800 ${theme === 'white' ? 'bg-white' : 'bg-white/95 dark:bg-slate-900/95'} backdrop-blur-md sticky top-0 z-50`}>
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className={`p-2 -ml-1 ${activeTheme.text} hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition`}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div>
            <h2 className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight">{subject}</h2>
            <p className={`text-[10px] font-bold ${activeTheme.text} uppercase tracking-wider`}>Personal Tutor</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-sm transition active:scale-95">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-150 z-[70]">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">সাঈদ এআই মেনু</p>
                </div>
                <div className="p-4 border-b dark:border-slate-700">
                   <p className="text-[11px] font-bold text-slate-500 mb-3 uppercase">থিম পরিবর্তন:</p>
                   <div className="grid grid-cols-4 gap-2">
                     {(['blue', 'emerald', 'purple', 'orange', 'pink', 'white', 'black'] as ChatTheme[]).map(t => (
                       <button key={t} onClick={() => onUpdateTheme(t)} className={`w-full h-8 rounded-lg border-2 ${theme === t ? 'border-slate-800 dark:border-white scale-105 shadow-md' : 'border-slate-100 dark:border-slate-700'} ${THEME_CONFIG[t].primary}`} />
                     ))}
                   </div>
                </div>
                <div className="p-4">
                   <button onClick={() => { if(confirm('চ্যাট ক্লিয়ার করবেন?')) onUpdateHistory([]); }} className="w-full py-2 bg-red-50 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">হিস্টোরি মুছুন</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5 scrollbar-hide">
        {history.length === 0 && (
          <div className="flex flex-col h-full items-center justify-center animate-in fade-in zoom-in-95 duration-700">
            <div className={`w-16 h-16 ${activeTheme.light} dark:bg-slate-800 border-2 ${activeTheme.border} rounded-3xl flex items-center justify-center text-3xl mb-5 shadow-sm transform hover:rotate-6 transition-all`}>
              📖
            </div>
            <h3 className="text-[18px] font-black text-slate-800 dark:text-slate-100 mb-2">{subject} সেশনে স্বাগতম</h3>
            <p className="text-[12px] font-bold text-slate-400 text-center max-w-[280px] mb-8 leading-relaxed">
              আমি সাঈদ এআই, আপনার পার্সোনাল টিউটর। আজ আমরা কি নিয়ে আলোচনা করবো?
            </p>
            <div className="grid grid-cols-1 gap-3 w-full max-w-sm px-4">
              {initialSuggestions.map((sug, idx) => (
                <button key={idx} onClick={() => handleSend(sug)} className={`p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left font-bold text-[12px] text-slate-800 dark:text-slate-200 shadow-sm hover:border-emerald-500 transition-all flex items-center justify-between group active:scale-[0.98]`}>
                  <span>{sug}</span>
                  <div className={`w-6 h-6 rounded-full ${activeTheme.light} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
                    <span className={`${activeTheme.text} text-xs`}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {history.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-3`}>
            <div className={`max-w-[94%] px-4 py-3 rounded-2xl shadow-sm text-[13px] leading-relaxed font-bold ${
              m.role === 'user' ? `${activeTheme.primary} ${activeTheme.userText} rounded-br-none` : `bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-bl-none text-slate-800 dark:text-slate-100 overflow-x-auto`
            }`}>
              {m.image && <img src={m.image} className="max-w-full rounded-lg mb-3 shadow-md" alt="Attached" />}
              <div className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700 prose-td:p-3 prose-th:p-3 prose-th:bg-slate-50 dark:prose-th:bg-slate-900 prose-table:w-full prose-table:my-5 prose-th:text-emerald-600 prose-tr:border-b prose-p:my-2 prose-li:my-1">
                {m.text}
                {loading && i === history.length - 1 && m.role === 'model' && <span className={`inline-block w-2 h-4 ${activeTheme.primary} ml-2 animate-pulse rounded-full align-middle`}></span>}
              </div>
            </div>
            {m.suggestions && m.suggestions.length > 0 && !loading && (
              <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-1">
                {m.suggestions.map((sug, sIdx) => (
                  <button key={sIdx} onClick={() => handleSend(sug)} className={`px-4 py-2 ${activeTheme.light} dark:bg-slate-800 border ${activeTheme.border} text-[10px] font-black ${activeTheme.text} rounded-xl shadow-sm active:scale-95 transition-all hover:${activeTheme.primary} hover:text-white`}>✨ {sug}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`p-4 border-t dark:border-slate-800 safe-bottom ${theme === 'white' ? 'bg-white' : 'bg-white/98 dark:bg-slate-900/98'} backdrop-blur-md`}>
        {selectedImage && (
          <div className="mb-3 relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-lg animate-in zoom-in-50">
            <img src={selectedImage} className="w-full h-full object-cover" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg text-[10px] font-bold">✕</button>
          </div>
        )}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 shadow-inner">
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-500 shadow-sm active:scale-90 hover:text-emerald-500 transition-colors">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onloadend = () => setSelectedImage(r.result as string); r.readAsDataURL(f); } }} className="hidden" accept="image/*" />
          <textarea 
            rows={1} value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="আপনার প্রশ্নটি এখানে লিখুন..." 
            className="flex-1 bg-transparent py-2.5 px-2 outline-none font-bold text-[13px] dark:text-white resize-none max-h-24 placeholder-slate-400"
          />
          <button 
            onClick={() => handleSend()} disabled={!input.trim() && !selectedImage}
            className={`p-3.5 rounded-xl transition-all active:scale-95 ${input.trim() || selectedImage ? `${activeTheme.primary} text-white shadow-lg` : 'bg-slate-300 text-slate-500'}`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3.5"><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Tutor;
