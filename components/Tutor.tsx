
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
    const win = window as any;
    if (win.renderMathInElement) {
      win.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ]
      });
    }
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
    
    // Save current history BEFORE adding the new message to pass it as 'previous conversation'
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
        // Pass only the previous turns. The current turn is handled inside getTutorResponseStream.
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
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2"></div>;
      
      if (trimmed.startsWith('###')) {
        return <h3 key={idx} className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-5 mb-3">{trimmed.replace('###', '')}</h3>;
      }
      
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);
      
      return (
        <p key={idx} className="mb-4 text-[14px] font-medium leading-relaxed dark:text-slate-300 text-slate-700">
          {parts.map((part, i) => (
            i % 2 === 1 ? <strong key={i} className="font-black text-slate-900 dark:text-white">{part}</strong> : part
          ))}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950 font-['Hind_Siliguri']">
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-50">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl active:scale-90 transition-all text-slate-600">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div>
             <h2 className="text-[15px] font-black text-slate-900 dark:text-white leading-tight">{subject}</h2>
             <div className="flex items-center space-x-1">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">সাঈদ এআই এক্টিভ</span>
             </div>
          </div>
        </div>
        <button onClick={() => { if(confirm('নতুন চ্যাট শুরু করবেন?')) onUpdateHistory([]); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl active:rotate-90 transition-all">🔄</button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl font-black mb-6">S</div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">সাঈদ এআই টিউটর</h1>
            <p className="text-[12px] text-slate-400 font-bold mb-8 max-w-[200px]">আজ এই বিষয়ে কী জানতে চান?</p>
            
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
               {[`${subject} কী?`, `সহজ করে বুঝিয়ে দাও`, `গুরুত্বপূর্ণ কিছু টিপস`].map((s, si) => (
                 <button key={si} onClick={() => handleSend(s)} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl hover:border-emerald-500 transition-all text-left">
                   ✨ {s}
                 </button>
               ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[90%] ${m.role === 'user' ? 'bg-emerald-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md' : 'w-full'}`}>
              {m.image && <img src={m.image} className="w-full rounded-xl mb-3 max-h-60 object-cover border dark:border-slate-800" alt="uploaded" />}
              <div className="w-full">
                {m.role === 'model' ? (
                  <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
                    <div className="prose dark:prose-invert max-w-none">
                      {m.text ? renderFormattedText(m.text) : (
                        <div className="flex items-center space-x-2 text-emerald-500 py-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] font-bold leading-relaxed">{m.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && history.length > 0 && history[history.length - 1].role === 'user' && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-2 text-emerald-500 py-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 py-4 border-t dark:border-slate-800 bg-white dark:bg-slate-950 pb-8">
        {selectedImage && (
          <div className="relative inline-block mb-3">
            <img src={selectedImage} className="w-16 h-16 object-cover rounded-xl border-2 border-emerald-500" alt="preview" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] font-black shadow-lg">✕</button>
          </div>
        )}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border dark:border-slate-800">
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm active:scale-90 transition-all">📸</button>
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
            placeholder="আপনার প্রশ্নটি এখানে লিখুন..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-3 py-2 outline-none font-bold text-sm dark:text-white"
          />
          <button 
            onClick={() => handleSend()} disabled={(!input.trim() && !selectedImage) || loading}
            className={`p-2.5 rounded-xl transition-all ${input.trim() || selectedImage ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-300'}`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Tutor;
