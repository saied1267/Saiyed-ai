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

const Tutor: React.FC<TutorProps> = ({ subject, history, onUpdateHistory, onBack, theme, onUpdateTheme, classLevel, group }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subject-specific suggestion map with "About Saiyed" added to each
  const getSubjectSuggestions = (sub: Subject) => {
    const common = [`সাঈদ সম্পর্কে জানাও`];
    let specific: string[] = [];
    
    switch (sub) {
      case Subject.MATH: 
        specific = [`জটিল জ্যামিতি সমাধান`, `বীজগণিতের মূল সূত্রসমূহ`, `সৃজনশীল প্রশ্নের কাঠামো`, `দ্রুত গণনার টিপস` ];
        break;
      case Subject.ENGLISH: 
        specific = [`Tense এর সহজ নিয়ম`, `প্রফেশনাল ট্রান্সলেশন`, `রাইটিং পার্টে ভালো করার উপায়`, `ভোকাবুলারি বাড়ানোর টিপস` ];
        break;
      case Subject.ICT: 
        specific = [`বাইনারি সংখ্যা পদ্ধতি`, `HTML এর বেসিক`, `ডিজিটাল লজিক গেট`, `প্রোগ্রামিং এর ধারণা` ];
        break;
      case Subject.ACCOUNTING: 
        specific = [`ডেবিট-ক্রেডিট নির্ণয়`, `জাবেদা দাখিলা`, `আর্থিক বিবরণী`, `হিসাববিজ্ঞান কেন প্রয়োজন?` ];
        break;
      case Subject.PHYSICS: 
        specific = [`গতির সূত্রসমূহ`, `নিউটনের ২য় সূত্র`, `কাজ ও শক্তি`, `ভেক্টর এর ধারণা` ];
        break;
      case Subject.BANGLA: 
        specific = [`সন্ধি বিচ্ছেদ`, `সৃজনশীল লেখার কৌশল`, `ব্যাকরণ এর মূল বিষয়`, `গদ্য ও পদ্যের সারসংক্ষেপ` ];
        break;
      default: 
        specific = [`এই বিষয়টি কিভাবে পড়ব?`, `গুরুত্বপূর্ণ কিছু টপিক`, `পড়া মনে রাখার কৌশল` ];
    }
    return [...common, ...specific];
  };

  const currentSuggestions = getSubjectSuggestions(subject);

  useEffect(() => {
    const win = window as any;
    if (win.renderMathInElement) {
      win.renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
        ],
        throwOnError : false
      });
    }
  }, [history, loading]);

  useEffect(() => { 
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' });
  }, [history, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !selectedImage) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend.trim(), image: selectedImage || undefined, timestamp: Date.now() };
    const updatedHistory = [...history, userMsg];
    onUpdateHistory(updatedHistory);
    setInput('');
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
          // Ensure "Saiyed" stays in suggestions if the response is about identity
          if (textToSend.includes('সাঈদ')) {
             suggestions = ['সাঈদ এর লক্ষ্য কি?', 'প্রজেক্টটি কেন তৈরি?', ...suggestions];
          }
          onUpdateHistory([...updatedHistory, { ...aiPlaceholder, text: cleanDisplay, suggestions }]);
        }
      );
    } catch (err) { } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#F9FAFB] dark:bg-slate-950 font-['Hind_Siliguri']">
      <header className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border-b dark:border-slate-800 shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-1 text-orange-500 active:scale-90 transition-transform">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-xl border dark:border-slate-700">
             <span className="text-sm">🎓</span>
             <div>
               <h2 className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{subject}</h2>
               <div className="flex items-center space-x-1">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[6.5px] font-black text-emerald-500 uppercase tracking-widest">ACTIVE</span>
               </div>
             </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-4 space-y-6 scrollbar-hide">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 opacity-90 animate-in fade-in zoom-in duration-500">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-md">🤖</div>
            <div className="text-center space-y-1">
              <p className="text-[12px] font-black text-slate-800 dark:text-white">{subject} নিয়ে সাঈদ এআই রেডি!</p>
              <p className="text-[11px] font-bold text-slate-400 px-6 leading-tight italic">হাটহাজারী কলেজের সাঈদ এর একটি বাস্তব প্রজেক্ট।</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center px-4">
               {currentSuggestions.map((s, si) => (
                 <button 
                  key={si} 
                  onClick={() => handleSend(s)} 
                  className={`px-3 py-1.5 border font-black text-[9px] rounded-lg shadow-sm active:scale-95 transition-all ${
                    s.includes('সাঈদ') 
                    ? 'bg-blue-600 border-blue-700 text-white' 
                    : 'bg-white dark:bg-slate-800 dark:border-slate-700 text-blue-600 dark:text-blue-400'
                  }`}
                 >
                   ✨ {s}
                 </button>
               ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
            {m.role === 'model' && m.text && (
               <div className="flex items-center space-x-1.5 ml-2 mb-1">
                 <div className="w-3 h-0.5 bg-blue-600 rounded-full"></div>
                 <span className="text-[7.5px] font-black text-blue-600 uppercase tracking-widest">বিশ্লেষণ</span>
               </div>
            )}
            <div className={`max-w-[96%] p-0.5 rounded-[1.2rem] ${m.role === 'user' ? 'bg-slate-800' : 'bg-white dark:bg-slate-900 shadow-sm border dark:border-slate-800'}`}>
              <div className={`p-3 rounded-[1.1rem] ${m.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                {m.image && <img src={m.image} className="w-full rounded-xl mb-3 shadow-sm max-h-40 object-cover" alt="input" />}
                <div className="space-y-3 text-[12px] font-bold leading-relaxed">
                  {m.text.split('\n').map((line, lIdx) => {
                    if (line.trim().startsWith('>') || line.includes('²') || line.includes('³')) {
                      return (
                        <div key={lIdx} className="my-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border-l-[3px] border-emerald-500 shadow-xs">
                          <p className="italic text-slate-700 dark:text-slate-200 text-[12px] font-black leading-tight">{line.replace('>', '').trim()}</p>
                        </div>
                      );
                    }
                    const numberedMatch = line.match(/^(\d+)\.\s(.*)/);
                    if (numberedMatch) {
                      return (
                        <div key={lIdx} className="flex items-start space-x-2 py-0.5">
                          <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">{numberedMatch[1]}</span>
                          <p className="flex-1 pt-0.5">{numberedMatch[2]}</p>
                        </div>
                      );
                    }
                    if (line.includes('সাঈদ এর বাস্তব পরামর্শ')) {
                      return <p key={lIdx} className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-3 border-t pt-2 border-dashed dark:border-slate-800">💡 {line.replace(/\*\*/g, '').trim()}</p>;
                    }
                    return line.trim() ? <p key={lIdx} className="whitespace-pre-wrap">{line}</p> : null;
                  })}
                </div>
              </div>
            </div>
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 px-1">
                {m.suggestions.map((s, si) => (
                  <button key={si} onClick={() => handleSend(s)} className="px-2.5 py-1 bg-white dark:bg-slate-800 border dark:border-slate-700 text-blue-600 dark:text-blue-400 font-black text-[9px] rounded-lg shadow-xs active:scale-95">✨ {s}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-2 py-2 bg-white/95 dark:bg-slate-900/95 border-t dark:border-slate-800 pb-6 backdrop-blur-md">
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-[2rem] border dark:border-slate-700">
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-white dark:bg-slate-700 rounded-full text-slate-400 shadow-xs shrink-0 active:scale-90 transition-transform">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
          <input 
            type="text" value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder={`${subject} নিয়ে প্রশ্ন করুন...`}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-2 py-2 outline-none font-bold text-[12px] dark:text-white placeholder-slate-400"
          />
          <button 
            onClick={() => handleSend()} disabled={!input.trim() && !selectedImage}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${input.trim() || selectedImage ? 'bg-slate-800 text-white shadow-md' : 'text-slate-300'}`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Tutor;
