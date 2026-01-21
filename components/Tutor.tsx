
import React, { useState, useRef, useEffect } from 'react';
import { Subject, ChatMessage, AppUser, ClassLevel, Group } from '../types';
import { getTutorResponseStream } from '../geminiService';

interface TutorProps {
  user: AppUser;
  classLevel: ClassLevel;
  group: Group;
  subject: Subject;
  history: ChatMessage[];
  onUpdateHistory: (msgs: ChatMessage[]) => void;
  onBack: () => void;
}

const Tutor: React.FC<TutorProps> = ({ user, subject, history, onUpdateHistory, onBack, classLevel, group }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    
    const win = window as any;
    if (win.renderMathInElement) {
      setTimeout(() => {
        win.renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false
        });
      }, 100);
    }
  }, [history, loading]);

  const handleSend = async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: msgText, timestamp: Date.now() };
    const newHistory = [...history, userMsg];
    onUpdateHistory(newHistory);
    setInput('');
    setLoading(true);

    const aiPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
    onUpdateHistory([...newHistory, aiPlaceholder]);

    try {
      await getTutorResponseStream(
        msgText, { classLevel, group, subject, user },
        newHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        (streamedText) => {
          let cleanText = streamedText;
          let suggestions: string[] = [];
          const sugMatch = streamedText.match(/\[SUGGESTIONS: (.*?)\]/);
          if (sugMatch) {
            cleanText = streamedText.replace(sugMatch[0], '').trim();
            suggestions = sugMatch[1].split(',').map(s => s.trim());
          }
          onUpdateHistory([...newHistory, { ...aiPlaceholder, text: cleanText, suggestions }]);
        }
      );
    } catch (e) { 
      console.error(e);
      onUpdateHistory([...newHistory, { ...aiPlaceholder, text: "⚠️ এআই সার্ভারে সংযোগ বিচ্ছিন্ন হয়েছে। আবার চেষ্টা করুন।" }]);
    }
    finally { setLoading(false); }
  };

  const renderText = (text: string) => {
    if (!text) return null;

    // Clean up unnecessary stars and formatting symbols
    let processedText = text.replace(/\$/g, ''); 

    return processedText.split('\n').map((line, i) => {
      // Big Bold Heading Style (###)
      if (line.trim().startsWith('###')) {
        return (
          <h2 key={i} className="text-[28px] font-black text-slate-900 dark:text-white mt-10 mb-6 leading-tight tracking-tight border-l-8 border-emerald-500 pl-4 py-1">
            {line.replace('###', '').trim()}
          </h2>
        );
      }
      
      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim());
      
      const processBold = (content: string) => {
        return content.split(/\*\*(.*?)\*\*/g).map((part, pi) => 
          pi % 2 === 1 ? <strong key={pi} className="font-black text-emerald-600 dark:text-emerald-400">{part}</strong> : part
        );
      };

      if (!line.trim()) return <div key={i} className="h-4" />;

      return (
        <p key={i} className={`text-[18px] font-medium leading-[1.8] text-slate-700 dark:text-slate-300 mb-4 ${isBullet ? 'pl-6 relative before:content-["•"] before:absolute before:left-0 before:text-emerald-500 before:font-black' : ''}`}>
          {processBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#0d0d0d] font-['Hind_Siliguri']">
      <header className="px-5 py-4 flex items-center justify-between border-b dark:border-white/5 bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h2 className="text-[16px] font-black dark:text-white leading-none">{subject}</h2>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">সাঈদ এআই টিউটর</p>
          </div>
        </div>
        <button onClick={() => { if(confirm('চ্যাট মুছবেন?')) onUpdateHistory([]) }} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-0 pt-8 pb-32 scroll-smooth">
        <div className="max-w-2xl mx-auto space-y-12">
          {history.length === 0 && (
            <div className="py-24 text-center animate-in fade-in zoom-in-95">
               <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto mb-8 shadow-2xl">S</div>
               <h1 className="text-3xl font-black mb-4 dark:text-white">কি শিখতে চান?</h1>
               <p className="text-slate-400 font-bold mb-10">আপনার যেকোনো প্রশ্ন এখানে করুন।</p>
               <div className="grid grid-cols-1 gap-3">
                  {[`${subject} এর বেসিক বুঝিয়ে দাও`, 'একটি উদাহরণ দাও', 'গুরুত্বপূর্ণ সূত্রগুলো কী?'].map((s, i) => (
                    <button key={i} onClick={() => handleSend(s)} className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-[15px] font-bold text-slate-600 dark:text-slate-400 text-left hover:border-emerald-500/50 transition-all">{s}</button>
                  ))}
               </div>
            </div>
          )}

          {history.map((m, i) => (
            <div key={i} className={`flex flex-col space-y-4 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`${m.role === 'user' ? 'max-w-[85%] bg-slate-100 dark:bg-white/10 dark:text-white rounded-3xl px-6 py-4 shadow-sm' : 'w-full'}`}>
                {m.role === 'model' && i === history.length - 1 && loading && !m.text ? (
                   <div className="py-8 space-y-4">
                     <div className="flex items-center space-x-3 text-emerald-500">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     </div>
                     <p className="text-[13px] font-black text-slate-400 tracking-tight uppercase">সাঈদ এআই প্রসেস করছে...</p>
                   </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    {renderText(m.text)}
                  </div>
                )}
                
                {m.suggestions && m.suggestions.length > 0 && (
                   <div className="mt-12 flex flex-wrap gap-3">
                     {m.suggestions.map((s, si) => (
                       <button key={si} onClick={() => handleSend(s)} className="px-5 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[13px] font-black rounded-full border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">{s}</button>
                     ))}
                   </div>
                )}
              </div>
            </div>
          ))}

          {loading && history[history.length-1]?.role === 'user' && (
            <div className="flex items-center space-x-3 text-emerald-500 py-4">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
               <p className="text-[12px] font-black tracking-[0.2em] uppercase">আপনার উত্তর তৈরি হচ্ছে</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-[#0d0d0d] pb-8 border-t dark:border-white/5">
        <div className="max-w-2xl mx-auto flex items-end bg-slate-100 dark:bg-white/5 p-2 rounded-[2rem] border dark:border-white/10 shadow-inner">
           <textarea 
             rows={1}
             value={input}
             onChange={(e) => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px'; }}
             onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
             placeholder="সাঈদ এআই-কে প্রশ্ন করুন..."
             className="flex-1 bg-transparent px-5 py-4 outline-none font-bold text-[18px] dark:text-white resize-none max-h-48"
           />
           <button 
             onClick={() => handleSend()} disabled={!input.trim() || loading}
             className={`p-4 rounded-full transition-all flex-shrink-0 ${input.trim() ? 'bg-emerald-600 text-white shadow-lg active:scale-90' : 'text-slate-300 dark:text-white/10 bg-slate-200 dark:bg-white/5'}`}
           >
             <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
           </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-4 font-bold opacity-40">সাঈদ এআই মাঝে মাঝে ভুল তথ্য দিতে পারে। গুরুত্বপূর্ণ তথ্য যাচাই করে নিন।</p>
      </div>
      
      <style>{`
        .katex { font-size: 1.2em; color: #10b981; }
        .katex-display { background: rgba(16, 185, 129, 0.05); padding: 1.5rem; border-radius: 1.5rem; margin: 1.5rem 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};
export default Tutor;
