
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

  const currentSuggestions = [`সাঈদ সম্পর্কে জানাও`, `এই বিষয়টি সহজ করে বুঝাও`, `পরীক্ষায় আসার মতো প্রশ্ন`, `পড়া মনে রাখার টিপস` ];

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

    const context: TutorContext = { classLevel, group, subject, user };

    try {
      await getTutorResponseStream(
        textToSend, 
        context,
        updatedHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        selectedImage || undefined,
        (streamedText) => {
          onUpdateHistory([...updatedHistory, { ...aiPlaceholder, text: streamedText }]);
        }
      );
    } catch (err) { } finally { setLoading(false); }
  };

  const handleNewChat = () => {
    if (confirm('আপনি কি এই সাবজেক্টের চ্যাট হিস্টোরি ক্লিয়ার করে নতুন করে শুরু করতে চান?')) {
      onUpdateHistory([]);
    }
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmedLine = line.trim();
      if (!trimmedLine) return <div key={idx} className="h-4"></div>;
      
      const cleanLine = trimmedLine.replace(/^[*#\s]+|[*#\s]+$/g, '').trim();

      if (trimmedLine.startsWith('###') || (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length < 60)) {
        return <h1 key={idx} className="text-3xl font-black text-slate-900 dark:text-white mt-10 mb-5 leading-tight">{cleanLine}</h1>;
      }

      const isFormula = trimmedLine.match(/[=+\-*/^²³√∑∫πθαβγ]/) || trimmedLine.includes('$') || trimmedLine.includes('f(x)');
      if (isFormula && trimmedLine.length > 2 && !trimmedLine.includes(' ')) {
        return (
          <div key={idx} className="my-6 bg-slate-100 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono shadow-sm">
            <p className="text-[18px] font-black text-slate-800 dark:text-slate-100 text-center">{trimmedLine}</p>
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
          <div key={idx} className="flex items-start space-x-3 my-3 ml-2">
            <span className="text-slate-400 font-black mt-2 text-[10px]">●</span>
            <p className="text-[16px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{content}</p>
          </div>
        );
      }

      return <p key={idx} className="mb-6 text-[16px] font-medium leading-relaxed text-slate-700 dark:text-slate-300">{content}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950 font-['Hind_Siliguri']">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-600">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div>
             <h2 className="text-base font-black text-slate-900 dark:text-white mb-0.5">{subject}</h2>
             <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">বিশ্লেষণ মোড</span>
             </div>
          </div>
        </div>
        <button 
          onClick={handleNewChat}
          className="p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-[10px] font-black uppercase text-emerald-600 active:scale-95 transition-all shadow-sm"
        >
          নতুন আলাপ ➕
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-10 py-10 space-y-12 scrollbar-hide max-w-3xl mx-auto w-full">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 shadow-2xl shadow-emerald-500/20 font-black">S</div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">সাঈদ এআই</h1>
            <p className="text-lg text-slate-500 font-medium mb-12">পড়ালেখা হোক আরও সহজ।<br/>আমি আপনাকে আজ কীভাবে সাহায্য করতে পারি?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full px-4">
               {currentSuggestions.map((s, si) => (
                 <button key={si} onClick={() => handleSend(s)} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left shadow-sm hover:shadow-md">
                   ✨ {s}
                 </button>
               ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`w-full ${m.role === 'user' ? 'max-w-[85%] flex flex-col items-end' : ''}`}>
              {m.role === 'model' && (
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-black shadow-sm">S</div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">সাঈদ এআই</span>
                </div>
              )}
              <div className={`${m.role === 'user' ? 'bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl' : 'w-full'}`}>
                {m.image && <img src={m.image} className="w-full rounded-2xl mb-6 max-h-80 object-cover shadow-sm" alt="attachment" />}
                <div className="w-full">
                  {m.role === 'model' ? (
                    m.text ? renderFormattedText(m.text) : null
                  ) : (
                    <p className="text-[16px] font-bold text-slate-800 dark:text-slate-200">{m.text}</p>
                  )}
                </div>
              </div>
              {m.role === 'model' && i < history.length - 1 && history[i+1]?.role === 'user' && <div className="h-px bg-slate-100 dark:bg-slate-900 w-full my-12" />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col space-y-3 ml-11">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">সাঈদ এআই গভীর ভাবে বিশ্লেষণ করছে...</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-6 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md pb-12">
        {selectedImage && (
          <div className="max-w-3xl mx-auto mb-4 relative inline-block">
            <img src={selectedImage} className="w-20 h-20 object-cover rounded-2xl border-2 border-emerald-500 shadow-lg" alt="preview" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-black shadow-lg">✕</button>
          </div>
        )}
        <div className="max-w-3xl mx-auto relative flex items-center bg-slate-100 dark:bg-slate-900 p-2 rounded-[2rem] border dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <button onClick={() => fileInputRef.current?.click()} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
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
            placeholder="সাঈদ এআই-কে কিছু জিজ্ঞাসা করুন..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-[15px] dark:text-white"
          />
          <button 
            onClick={() => handleSend()} disabled={(!input.trim() && !selectedImage) || loading}
            className={`p-3 rounded-2xl transition-all ${input.trim() || selectedImage ? 'bg-emerald-600 text-white shadow-lg scale-105 active:scale-95' : 'text-slate-300'}`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <p className="text-center text-[8px] font-bold text-slate-400 mt-4 uppercase tracking-[0.3em]">AI can make mistakes. Verify important info.</p>
      </div>
    </div>
  );
};
export default Tutor;
