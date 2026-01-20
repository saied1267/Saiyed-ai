
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

    // Split text into Math blocks ($$ ... $$) and Regular text
    const mathRegex = /(\$\$.*?\$\$)/gs;
    const parts = text.split(mathRegex);

    return parts.map((part, idx) => {
      // If it's a Math Block
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return (
          <div key={idx} className="my-6 w-full animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 dark:bg-slate-900 border-l-4 border-blue-500 rounded-r-2xl p-6 shadow-sm overflow-x-auto">
               <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 opacity-70">গাণিতিক সূত্র / ফর্মুলা</div>
               <div className="math-container text-lg py-2 text-slate-900 dark:text-slate-100">
                 {part}
               </div>
            </div>
          </div>
        );
      }

      // If it's Regular Text
      return part.split('\n').map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={`${idx}-${lIdx}`} className="h-3"></div>;
        
        // Topic Headers (###)
        if (trimmed.startsWith('###')) {
          return (
            <div key={`${idx}-${lIdx}`} className="mt-8 mb-4 border-b-2 border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                {trimmed.replace('###', '')}
              </h3>
            </div>
          );
        }
        
        // Bold Text (**...**)
        const boldRegex = /\*\*(.*?)\*\*/g;
        const lineParts = line.split(boldRegex);
        
        return (
          <p key={`${idx}-${lIdx}`} className="mb-4 text-[17px] font-medium leading-[1.9] dark:text-slate-200 text-slate-800 break-words overflow-visible py-0.5">
            {lineParts.map((lp, i) => (
              i % 2 === 1 ? <strong key={i} className="font-black text-slate-950 dark:text-white underline decoration-blue-500/30 decoration-2 underline-offset-4">{lp}</strong> : lp
            ))}
          </p>
        );
      });
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950 font-['Hind_Siliguri']">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-50">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div>
             <h2 className="text-[16px] font-black text-slate-900 dark:text-white leading-tight">{subject}</h2>
             <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">সাঈদ এআই</p>
          </div>
        </div>
        <button onClick={() => { if(confirm('নতুন চ্যাট শুরু করবেন?')) onUpdateHistory([]); }} className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
           <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
           <span className="text-[11px] font-black uppercase">নিউ চ্যাট</span>
        </button>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-24 py-8 space-y-12 scrollbar-hide">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl flex items-center justify-center text-2xl shadow-lg font-black mb-6">S</div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">সাঈদ এআই টিউটর</h1>
            <p className="text-slate-500 font-bold mb-10">আজ আপনাকে কিভাবে সাহায্য করতে পারি?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
               {[`${subject} এর গুরুত্বপূর্ণ সূত্রগুলো দাও`, `${subject} সহজ করে বুঝিয়ে দাও`, `একটি উদাহরণ দিয়ে বুঝিয়ে বলো`, `এই বিষয়ের শর্টকাট টিপস দাও`].map((s, si) => (
                 <button key={si} onClick={() => handleSend(s)} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left shadow-sm">
                   {s}
                 </button>
               ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
            <div className={`${m.role === 'user' ? 'max-w-[85%]' : 'w-full'}`}>
              <div className={`px-4 py-4 rounded-2xl overflow-visible ${
                m.role === 'user' 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border dark:border-slate-700' 
                : 'bg-transparent w-full'
              }`}>
                {m.image && <img src={m.image} className="w-full rounded-2xl mb-6 max-h-96 object-cover border dark:border-slate-800 shadow-md" alt="uploaded" />}
                
                {m.role === 'model' ? (
                  <div className="w-full overflow-visible">
                    {m.text ? (
                      <div className="w-full text-left">
                        {renderFormattedText(m.text)}
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                         <div className="flex items-center space-x-2">
                           <span className="text-[15px] font-black text-blue-600 dark:text-blue-400 animate-pulse">সাঈদ এর এআই গভীর ভাবে বিশ্লেষণ করছে...</span>
                         </div>
                         <div className="flex space-x-1.5">
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[17px] font-medium leading-[1.8] whitespace-pre-wrap overflow-visible py-0.5">{m.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && history.length > 0 && history[history.length - 1].role === 'user' && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
             <div className="w-full">
                <p className="text-[15px] font-black text-blue-600 dark:text-blue-400 animate-pulse mb-4">
                  সাঈদ এর এআই গভীর ভাবে বিশ্লেষণ করছে...
                </p>
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex-shrink-0 px-4 md:px-24 py-6 border-t dark:border-slate-800 bg-white dark:bg-slate-950 pb-12">
        <div className="max-w-3xl mx-auto">
          {selectedImage && (
            <div className="relative inline-block mb-4 ml-2 group animate-in slide-in-from-left-2">
              <img src={selectedImage} className="w-28 h-28 object-cover rounded-2xl border-2 border-blue-500 shadow-2xl" alt="preview" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-slate-950 text-white w-8 h-8 rounded-full text-[12px] font-black shadow-lg flex items-center justify-center border-2 border-white">✕</button>
            </div>
          )}
          
          <div className="flex items-end bg-slate-50 dark:bg-slate-900 p-2.5 rounded-3xl border dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <button onClick={() => fileInputRef.current?.click()} className="p-3.5 text-slate-400 hover:text-blue-500 transition-colors">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
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
                e.target.style.height = e.target.scrollHeight + 'px';
              }} 
              placeholder="একটি প্রশ্ন লিখুন..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent px-3 py-3.5 outline-none font-bold text-[15px] dark:text-white resize-none max-h-48 leading-relaxed"
            />
            
            <button 
              onClick={() => handleSend()} disabled={(!input.trim() && !selectedImage) || loading}
              className={`p-3.5 rounded-2xl transition-all ${input.trim() || selectedImage ? 'bg-blue-600 text-white shadow-xl active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        textarea { scrollbar-width: none; }
        .katex-display { margin: 1em 0; overflow-x: auto; overflow-y: hidden; padding: 0.5em 0; }
        .math-container::-webkit-scrollbar { height: 4px; }
        .math-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};
export default Tutor;
