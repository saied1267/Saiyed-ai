
import React, { useState, useRef, useEffect } from 'react';
import { Subject, ChatMessage, ChatTheme, ClassLevel, Group, AppUser, TutorContext } from '../types';
import { getTutorResponseStream } from '../geminiService';

interface TutorProps {
  user: AppUser | null;
  classLevel: ClassLevel;
  group: Group;
  subject: Subject;
  history: ChatMessage[];
  onUpdateHistory: (messages: ChatMessage[]) => void;
  onBack: () => void;
  theme: ChatTheme;
  onUpdateTheme: (theme: ChatTheme) => void;
}

const Tutor: React.FC<TutorProps> = ({ subject, history, onUpdateHistory, onBack, theme, onUpdateTheme, classLevel, group, user }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSuggestionsForSubject = (sub: Subject) => {
    const subjectSpecific: Record<string, string[]> = {
      [Subject.MATH]: [`পিথাগোরাসের উপপাদ্য বুঝাও`, `বীজগণিতের সব সূত্র`, `জ্যামিতি সমাধান`],
      [Subject.ICT]: [`বাইনারি টু ডেসিমাল`, `HTML এর ধারণা`, `কম্পিউটার নেটওয়ার্ক`],
      [Subject.ENGLISH]: [`Tense মনে রাখার উপায়`, `Vocabulary বাড়ানো`, `Formal Letter`],
    };
    return [...(subjectSpecific[sub] || [`সাঈদ সম্পর্কে জানাও`, `পড়া মনে রাখার টিপস`]), `সহজ করে বুঝিয়ে দাও`].slice(0, 4);
  };

  const currentSuggestions = getSuggestionsForSubject(subject);

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
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
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
        textToSend, 
        { classLevel, group, subject, user },
        updatedHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        selectedImage || undefined,
        (streamedText) => {
          onUpdateHistory([...updatedHistory, { ...aiPlaceholder, text: streamedText }]);
        }
      );
    } catch (err) { } finally { setLoading(false); }
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmedLine = line.trim();
      if (!trimmedLine) return <div key={idx} className="h-4"></div>;
      
      const cleanLine = trimmedLine.replace(/^[*#\s]+|[*#\s]+$/g, '').trim();

      if (trimmedLine.startsWith('###') || (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length < 60)) {
        return <h1 key={idx} className="text-2xl font-black text-slate-900 dark:text-white mt-8 mb-4 leading-tight border-l-4 border-emerald-500 pl-4">{cleanLine}</h1>;
      }

      if (trimmedLine.match(/[=+\-*/^²³√∑∫πθαβγ]/) && trimmedLine.length > 2 && !trimmedLine.includes(' ')) {
        return (
          <div key={idx} className="my-6 bg-slate-100 dark:bg-slate-900 p-6 rounded-[2.2rem] border-2 border-slate-200 dark:border-slate-800 font-mono shadow-inner text-center">
            <p className="text-[18px] font-black text-emerald-600 dark:text-emerald-400">{trimmedLine}</p>
          </div>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*)/g);
      const content = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="text-slate-900 dark:text-white font-black">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
        return (
          <div key={idx} className="flex items-start space-x-3 my-3 ml-2 group">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
            <p className="text-[14px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{content}</p>
          </div>
        );
      }

      return <p key={idx} className="mb-5 text-[14px] font-bold leading-relaxed text-slate-700 dark:text-slate-300">{content}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950 font-['Hind_Siliguri']">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b dark:border-slate-900 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-2xl active:scale-90 transition-all text-slate-600">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div>
             <h2 className="text-sm font-black text-slate-900 dark:text-white">{subject}</h2>
             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">সাঈদ এআই এক্টিভ</span>
          </div>
        </div>
        <button onClick={() => { if(confirm('নতুন চ্যাট?')) onUpdateHistory([]); }} className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-2xl active:rotate-180 transition-all">🔄</button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-10 scrollbar-hide max-w-2xl mx-auto w-full">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2.2rem] flex items-center justify-center text-4xl shadow-2xl font-black mb-8">S</div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">সাঈদ এআই টিউটর</h1>
            <p className="text-xs text-slate-400 font-bold mb-10 max-w-[220px]">আজ আপনাকে এই বিষয়ে কোন সাহায্য করতে পারি?</p>
            
            <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
               {currentSuggestions.map((s, si) => (
                 <button 
                   key={si} 
                   onClick={() => handleSend(s)} 
                   className="group p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-black text-xs rounded-[1.8rem] hover:border-emerald-500 hover:shadow-lg transition-all text-left flex items-center justify-between"
                 >
                   <span>✨ {s}</span>
                   <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                 </button>
               ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`w-full ${m.role === 'user' ? 'max-w-[85%] flex flex-col items-end' : ''}`}>
              {m.role === 'model' && (
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[8px] font-black">S</div>
                  <span className="text-[9px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">সাঈদ এআই</span>
                </div>
              )}
              <div className={`${m.role === 'user' ? 'bg-slate-100 dark:bg-slate-900 p-5 rounded-[2rem] rounded-tr-sm' : 'w-full'}`}>
                {m.image && <img src={m.image} className="w-full rounded-2xl mb-4 max-h-80 object-cover shadow-sm border dark:border-slate-800" alt="at" />}
                <div className="w-full">
                  {m.role === 'model' ? (
                    m.text ? renderFormattedText(m.text) : <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce"></div>
                  ) : (
                    <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{m.text}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="ml-8 text-[9px] font-black text-emerald-500 animate-pulse uppercase tracking-widest">সাঈদ এআই ভাবছে...</div>}
      </div>

      <div className="px-6 py-6 border-t dark:border-slate-900 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl pb-10">
        {selectedImage && (
          <div className="relative inline-block mb-4 animate-in zoom-in-75">
            <img src={selectedImage} className="w-20 h-20 object-cover rounded-2xl border-2 border-emerald-500 shadow-xl" alt="p" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-black border-2 border-white">✕</button>
          </div>
        )}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-2 rounded-[2.2rem] border dark:border-slate-800 shadow-inner">
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-emerald-500 shadow-sm active:scale-90 transition-all">📸</button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setSelectedImage(reader.result as string);
              reader.readAsDataURL(file);
            }
          }} />
          <input 
            type="text" value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="আপনার প্রশ্ন লিখুন..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-[14px] dark:text-white"
          />
          <button 
            onClick={() => handleSend()} disabled={(!input.trim() && !selectedImage) || loading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${input.trim() || selectedImage ? 'bg-emerald-600 text-white shadow-xl scale-100 active:scale-90' : 'text-slate-300 scale-90'}`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
export default Tutor;
