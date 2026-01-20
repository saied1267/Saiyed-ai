
import React, { useState, useRef, useEffect } from 'react';
import { Subject, ChatMessage, ChatTheme, ClassLevel, Group, AppUser } from '../types';
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

const Tutor: React.FC<TutorProps> = ({ subject, history, onUpdateHistory, onBack, classLevel, group, user }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(() => {
      const win = window as any;
      if (win.renderMathInElement) {
        win.renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [history, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !selectedImage) return;

    const userMsg: ChatMessage = { 
      role: 'user', 
      text: textToSend.trim(), 
      image: selectedImage || undefined, 
      timestamp: Date.now() 
    };
    
    const previousHistory = [...history];
    const newHistory = [...history, userMsg];
    
    onUpdateHistory(newHistory);
    setInput('');
    setSelectedImage(null);
    setLoading(true);

    const aiPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
    onUpdateHistory([...newHistory, aiPlaceholder]);

    try {
      await getTutorResponseStream(
        textToSend, 
        { classLevel, group, subject, user },
        previousHistory.map(m => ({ 
          role: m.role, 
          parts: [{ text: m.text }] 
        })),
        selectedImage || undefined,
        (streamedText) => {
          onUpdateHistory([...newHistory, { ...aiPlaceholder, text: streamedText }]);
        }
      );
    } catch (err) {
      console.error("Stream error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const mathRegex = /(\$\$.*?\$\$)/gs;
    const parts = text.split(mathRegex);

    return parts.map((part, idx) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return (
          <div key={idx} className="my-5 py-2 w-full overflow-x-auto math-container text-[15px]">
            {part}
          </div>
        );
      }

      const lines = part.split('\n');
      return lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={`${idx}-${lIdx}`} className="h-4"></div>;
        
        if (trimmed.startsWith('###')) {
          return (
            <h3 key={`${idx}-${lIdx}`} className="text-[16px] font-bold text-slate-900 dark:text-white mt-6 mb-3">
              {trimmed.replace('###', '').trim()}
            </h3>
          );
        }
        
        const boldRegex = /\*\*(.*?)\*\*/g;
        const lineParts = line.split(boldRegex);
        
        return (
          <p key={`${idx}-${lIdx}`} className="mb-2 text-[14px] font-medium leading-[1.8] dark:text-slate-200 text-slate-800 break-words">
            {lineParts.map((lp, i) => (
              i % 2 === 1 ? <strong key={i} className="font-bold text-slate-950 dark:text-white">{lp}</strong> : lp
            ))}
          </p>
        );
      });
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950 font-['Hind_Siliguri']">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-50 border-b dark:border-slate-900/50">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="flex flex-col">
             <h2 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-none">{subject}</h2>
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">সাঈদ এআই</span>
          </div>
        </div>
        <button onClick={() => { if(confirm('নতুন চ্যাট শুরু করবেন?')) onUpdateHistory([]); }} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
           <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
      </header>

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-0 scrollbar-hide">
        <div className="max-w-2xl mx-auto w-full pt-8 pb-10">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
              <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl flex items-center justify-center text-lg shadow-sm font-black mb-6">S</div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">সাঈদ এআই টিউটর</h1>
              <p className="text-slate-500 font-bold mb-10 text-[13px]">আজ আপনাকে কিভাবে সাহায্য করতে পারি?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full px-4">
                 {[`${subject} এর গুরুত্বপূর্ণ সূত্র`, `সহজ করে বোঝাও`, `একটি উদাহরণ দাও`, `শর্টকাট টিপস`].map((s, si) => (
                   <button key={si} onClick={() => handleSend(s)} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[12px] rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm">
                     {s}
                   </button>
                 ))}
              </div>
            </div>
          )}

          <div className="space-y-10">
            {history.map((m, i) => (
              <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500`}>
                <div className={`${m.role === 'user' ? 'max-w-[80%]' : 'w-full'}`}>
                  <div className={`px-4 py-2 ${
                    m.role === 'user' 
                    ? 'bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-slate-100' 
                    : 'bg-transparent w-full'
                  }`}>
                    {m.image && <img src={m.image} className="w-full rounded-xl mb-4 max-h-80 object-cover border dark:border-slate-800 shadow-sm" alt="uploaded" />}
                    
                    {m.role === 'model' ? (
                      <div className="w-full">
                        {m.text ? (
                          <div className="w-full">
                            {renderFormattedText(m.text)}
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-3 py-4">
                             <p className="text-[12px] font-bold text-slate-400 animate-pulse">সাঈদ এর এআই গভীর ভাবে বিশ্লেষণ করছে...</p>
                             <div className="flex items-center space-x-1.5">
                                <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                             </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[14px] font-medium leading-[1.8] whitespace-pre-wrap break-words py-1">{m.text}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading && history.length > 0 && history[history.length - 1].role === 'user' && (
            <div className="flex flex-col justify-start px-4 py-8 animate-in fade-in space-y-3">
               <p className="text-[12px] font-bold text-slate-400 animate-pulse">সাঈদ এর এআই গভীর ভাবে বিশ্লেষণ করছে...</p>
               <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-4 bg-white dark:bg-slate-950 pb-8">
        <div className="max-w-2xl mx-auto">
          {selectedImage && (
            <div className="relative inline-block mb-3 ml-1">
              <img src={selectedImage} className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm" alt="preview" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-slate-900 text-white w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white">✕</button>
            </div>
          )}
          
          <div className="flex items-end bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border dark:border-slate-800 shadow-sm transition-all focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-1 focus-within:ring-slate-200 dark:focus-within:ring-slate-700">
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
            
            <textarea 
              rows={1}
              value={input} 
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }} 
              placeholder="প্রশ্ন লিখুন..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent px-2 py-2.5 outline-none font-medium text-[14px] dark:text-white resize-none max-h-32 leading-relaxed"
            />
            
            <button 
              onClick={() => handleSend()} disabled={(!input.trim() && !selectedImage) || loading}
              className={`p-2.5 rounded-xl transition-all ${input.trim() || selectedImage ? 'text-slate-900 dark:text-white active:scale-90' : 'text-slate-200 dark:text-slate-800'}`}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        textarea { scrollbar-width: none; }
        .katex-display { margin: 1em 0; overflow-x: auto; overflow-y: hidden; }
        .math-container::-webkit-scrollbar { height: 3px; }
        .math-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        p, span, h3, div { 
          overflow-wrap: break-word; 
          word-wrap: break-word; 
          line-height: 1.85 !important;
        }
      `}</style>
    </div>
  );
};
export default Tutor;
