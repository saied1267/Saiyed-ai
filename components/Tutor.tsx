import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [loadingStep, setLoadingStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // অটো স্ক্রল এবং ম্যাথ রেন্ডারিং
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

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

  // ৫টি পর্যায়ক্রমিক লোডিং টেক্সট লজিক
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : 0)); 
      }, 1500); // ১.৫ সেকেন্ড পর পর পরিবর্তন
    }
    return () => clearInterval(interval);
  }, [loading]);

  // handleSend ফাংশনটিকে useCallback দিয়ে র‍্যাপ করা হয়েছে যাতে বাটন ক্লিক মিস না হয়
  const handleSend = useCallback(async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: msgText, timestamp: Date.now() };
    const currentHistory = [...history, userMsg];
    
    onUpdateHistory(currentHistory);
    setInput('');
    setLoading(true);

    const aiPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
    const historyWithPlaceholder = [...currentHistory, aiPlaceholder];
    onUpdateHistory(historyWithPlaceholder);

    try {
      await getTutorResponseStream(
        msgText, 
        { classLevel, group, subject, user },
        currentHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        (streamedText) => {
          let cleanText = streamedText;
          let suggestions: string[] = [];
          const sugMatch = streamedText.match(/SUGGESTIONS: (.*?)/);
          
          if (sugMatch) {
            cleanText = streamedText.replace(sugMatch[0], '').trim();
            suggestions = sugMatch[1].split(',').map(s => s.trim());
          }
          
          onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: cleanText, suggestions }]);
        }
      );
    } catch (e) {
      console.error(e);
      onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: "⚠️ এআই সার্ভারে সংযোগ বিচ্ছিন্ন হয়েছে।" }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, history, onUpdateHistory, classLevel, group, subject, user]);

  const renderText = (text: string) => {
    if (!text) return null;
    let processedText = text.replace(/\$/g, '');

    return processedText.split('\n').map((line, i) => {
      if (line.trim().startsWith('###')) {
        return (
          <h2 key={i} className="text-[24px] font-black text-slate-900 dark:text-white mt-8 mb-4 border-l-4 border-emerald-500 pl-3">
            {line.replace('###', '').trim()}
          </h2>
        );
      }

      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim());

      const processBold = (content: string) => {
        return content.split(/\*\*(.*?)\*\*/g).map((part, pi) =>
          pi % 2 === 1 ? <strong key={pi} className="font-bold text-emerald-600 dark:text-emerald-400">{part}</strong> : part
        );
      };

      if (!line.trim()) return <div key={i} className="h-4" />;

      return (
        <p key={i} className={`text-[17px] leading-[1.7] text-slate-700 dark:text-slate-300 mb-3 ${isBullet ? 'pl-5 relative before:content-["•"] before:absolute before:left-0 before:text-emerald-500' : ''}`}>
          {processBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#0d0d0d] font-['Hind_Siliguri']">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b dark:border-white/5 bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h2 className="text-[16px] font-bold dark:text-white leading-none">{subject}</h2>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Saiyed AI Tutor 🟢</p>
          </div>
        </div>
        <button onClick={() => confirm('চ্যাট মুছবেন?') && onUpdateHistory([])} className="p-2 text-slate-400 hover:text-red-500">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </header>

      {/* Chat Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-0 pt-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-8">
          {history.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">S</div>
              <h1 className="text-2xl font-black mb-2 dark:text-white">কি শিখতে চান আজকে?</h1>
              <div className="grid grid-cols-1 gap-2 mt-8">
                {[`${subject} এর মূল ধারণা দাও`, 'সাঈদ এআই এর পরিচয়', 'সহজ উদাহরণ দাও', 'কিভাবে পড়া শুরু করব?'].map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)} className="p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-left font-bold text-slate-600 dark:text-slate-400 hover:border-emerald-500 transition-all">{s}</button>
                ))}
              </div>
            </div>
          )}

          {history.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.role === 'user' ? 'max-w-[85%] bg-emerald-600 text-white rounded-2xl rounded-tr-none px-5 py-3' : 'w-full'}`}>
                
                {m.role === 'model' && i === history.length - 1 && loading && !m.text ? (
                  <div className="py-6 space-y-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <p className="text-sm font-bold text-emerald-600 animate-pulse">
                      {loadingStep === 0 && "⌛ সাঈদ এআই বিশ্লেষণ করছে..."}
                      {loadingStep === 1 && "🧠 আপনার জন্য চিন্তা করছে..."}
                      {loadingStep === 2 && "🔍 সঠিক তথ্য খুঁজছে..."}
                      {loadingStep === 3 && "📝 উত্তরটি সাজিয়ে নিচ্ছে..."}
                      {loadingStep === 4 && "✨ এখনই উত্তর দিচ্ছে..."}
                    </p>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    {renderText(m.text)}
                  </div>
                )}

                {/* Suggestions Section */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {m.suggestions.map((s, si) => (
                      <button 
                        key={si} 
                        onClick={(e) => {
                          e.preventDefault();
                          handleSend(s);
                        }}
                        className="px-4 py-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="p-4 bg-white dark:bg-[#0d0d0d] border-t dark:border-white/5 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-end bg-slate-100 dark:bg-white/5 p-2 rounded-3xl border dark:border-white/10">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="আপনার প্রশ্ন লিখুন..."
            className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-lg dark:text-white resize-none max-h-32"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`p-4 rounded-full transition-all ${input.trim() && !loading ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-white/10 text-slate-400'}`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutor;