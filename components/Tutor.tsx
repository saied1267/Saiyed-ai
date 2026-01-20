
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
    }, 100);
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
          <div key={idx} className="my-3 w-full animate-in fade-in duration-300">
            <div className="bg-slate-50 dark:bg-slate-900 border-l-[3px] border-blue-600 rounded-r-lg p-3 shadow-sm overflow-x-auto">
               <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 opacity-60">সূত্র / Formula</div>
               <div className="math-container text-[15px] text-slate-900 dark:text-slate-100 break-words py-1">
                 {part}
               </div>
            </div>
          </div>
        );
      }

      return part.split('\n').map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={`${idx}-${lIdx}`} className="h-2"></div>;
        
        if (trimmed.startsWith('###')) {
          return (
            <div key={`${idx}-${lIdx}`} className="mt-5 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
              <h3 className="text-[17px] font-black text-slate-900 dark:text-white flex items-center">
                <span className="w-1 h-4 bg-blue-600 rounded-full mr-2"></span>
                {trimmed.replace('###', '')}
              </h3>
            </div>
          );
        }
        
        const boldRegex = /\*\*(.*?)\*\*/g;
        const lineParts = line.split(boldRegex);
        
        return (
          <p key={`${idx}-${lIdx}`} className="mb-2.5 text-[15px] font-medium leading-[1.85] dark:text-slate-200 text-slate-800 break-words overflow-visible py-0.5">
            {lineParts.map((lp, i) => (
              i % 2 === 1 ? <strong key={i} className="font-black text-slate-950 dark:text-white bg-blue-50/50 dark:bg-blue-900/10 px-0.5 rounded">{lp}</strong> : lp
            ))}
          </p>
        );
      });
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950 font-['Hind_Siliguri']">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-50">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div>
             <h2 className="text-[14px] font-black text-slate-900 dark:text-white leading-tight">{subject}</h2>
             <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">সাঈদ এআই</p>
          </div>
        </div>
        <button onClick={() => { if(confirm('নতুন চ্যাট শুরু করবেন?')) onUpdateHistory([]); }} className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
           <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
           <span className="text-[10px] font-black uppercase">নিউ চ্যাট</span>
        </button>
      </header>

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 py-6 scrollbar-hide overflow-x-hidden">
        <div className="max-w-2xl mx-auto w-full space-y-8">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl flex items-center justify-center text-xl shadow-lg font-black mb-4">S</div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">সাঈদ এআই টিউটর</h1>
              <p className="text-slate-500 font-bold mb-8 text-[13px] px-4">আজ আপনাকে কিভাবে সাহায্য করতে পারি?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full px-4">
                 {[`${subject} এর গুরুত্বপূর্ণ সূত্রগুলো`, `${subject} সহজ করে বোঝাও`, `একটি উদাহরণ দাও`, `শর্টকাট টিপস`].map((s, si) => (
                   <button key={si} onClick={() => handleSend(s)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[12px] rounded-xl hover:bg-slate-50 transition-all text-left shadow-sm">
                     {s}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {history.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-1 duration-300`}>
              <div className={`${m.role === 'user' ? 'max-w-[85%]' : 'w-full'}`}>
                <div className={`px-4 py-3 rounded-2xl overflow-visible ${
                  m.role === 'user' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border dark:border-slate-700 shadow-sm' 
                  : 'bg-transparent w-full'
                }`}>
                  {m.image && <img src={m.image} className="w-full rounded-xl mb-3 max-h-72 object-cover border dark:border-slate-800 shadow-md" alt="uploaded" />}
                  
                  {m.role === 'model' ? (
                    <div className="w-full overflow-visible">
                      {m.text ? (
                        <div className="w-full text-left">
                          {renderFormattedText(m.text)}
                        </div>
                      ) : (
                        <div className="space-y-2 py-2">
                           <span className="text-[12px] font-black text-blue-600 animate-pulse">সাঈদ বিশ্লেষণ করছে...</span>
                           <div className="flex space-x-1">
                             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[15px] font-medium leading-[1.8] whitespace-pre-wrap break-words">{m.text}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && history.length > 0 && history[history.length - 1].role === 'user' && (
            <div className="flex justify-start px-2 animate-in fade-in">
               <div className="w-full">
                  <p className="text-[12px] font-black text-blue-600 animate-pulse mb-2">সাঈদ বিশ্লেষণ করছে...</p>
                  <div className="flex space-x-1.5">
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Input */}
      <div className="flex-shrink-0 px-4 py-4 md:py-6 bg-white dark:bg-slate-950 pb-6 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {selectedImage && (
            <div className="relative inline-block mb-3 ml-1 animate-in slide-in-from-left-2">
              <img src={selectedImage} className="w-20 h-20 object-cover rounded-xl border-2 border-blue-500 shadow-lg" alt="preview" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-slate-900 text-white w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white">✕</button>
            </div>
          )}
          
          <div className="flex items-end bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
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
              className="flex-1 bg-transparent px-2 py-2.5 outline-none font-bold text-[13.5px] dark:text-white resize-none max-h-32 leading-relaxed"
            />
            
            <button 
              onClick={() => handleSend()} disabled={(!input.trim() && !selectedImage) || loading}
              className={`p-2.5 rounded-xl transition-all ${input.trim() || selectedImage ? 'bg-blue-600 text-white shadow-md active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        textarea { scrollbar-width: none; }
        .katex-display { margin: 0.5em 0; overflow-x: auto; overflow-y: hidden; padding: 0.2em 0; }
        .math-container::-webkit-scrollbar { height: 3px; }
        .math-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        /* Prevent font cutting for Bengali Glyphs */
        p, span, h3, div { 
          overflow-wrap: break-word; 
          word-wrap: break-word; 
          hyphens: auto;
          line-height: 1.85 !important;
        }
      `}</style>
    </div>
  );
};
export default Tutor;
