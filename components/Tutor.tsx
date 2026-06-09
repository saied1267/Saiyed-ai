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

interface Toast { id: number; message: string; type: 'success' | 'info' | 'error'; }

const SAIYED_PROMPTS = [
  "সাঈদ সম্পর্কে বিস্তারিত জানতে চাই",
  "সাঈদ এআই এর নির্মাতা কে এবং এর লক্ষ্য কী?",
  "সাঈদ এর ব্যাকএন্ডে কোন প্রযুক্তির ব্যবহার করা হয়েছে?",
  "সাঈদ এআই-এর বিশেষ ক্ষমতাগুলো কী কী?",
  "সাঈদ এআই তৈরি করার পেছনে মূল অনুপ্রেরণা কী ছিল?",
  "সাঈদ এর কাছ থেকে বেস্ট আউটপুট পাওয়ার ট্রিকস কী?",
];

const SUBJECT_PROMPTS: Record<string, string[]> = {
  "গণিত": ["গণিতের বেসিক ভয় দূর করার কিছু উপায় বলো", "বীজগণিতের সূত্রগুলো সহজে চেনার উপায় কী?", "ত্রিকোণমিতি কেন গুরুত্বপূর্ণ?"],
  "ইংরেজি": ["ইংরেজি গ্রামারের টেন্স (Tense) সহজে চেনার উপায় কী?", "সহজে নতুন নতুন ইংরেজি শব্দ মনে রাখার কৌশল", "রিডিং কম্প্রিহেনশন উন্নত করার টিপস"],
  "default": ["এই বিষয়ের মূল সিলেবাস এবং রোডম্যাপটি দাও", "পরীক্ষার জন্য কোন কোন অধ্যায় গুরুত্বপূর্ণ?", "এই বিষয়ের ভিত্তিগত ধারণা বুঝিয়ে দিন"],
};

const Tutor: React.FC<TutorProps> = ({ user, subject, history, onUpdateHistory, onBack, classLevel, group }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showSettings, setShowSettings] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  // অটো-স্ক্রল লজিক
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history, loading]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast("মেসেজ কপি করা হয়েছে");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: msgText, timestamp: Date.now() };
    const currentHistory = [...history, userMsg];
    onUpdateHistory(currentHistory);
    setInput('');
    setLoading(true);

    try {
      await getTutorResponseStream(msgText, { classLevel, group, subject, user }, currentHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })), (streamedText) => {
        let cleanText = streamedText;
        let suggestions: string[] = [];
        const sugMatch = streamedText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
        if (sugMatch) {
          cleanText = streamedText.replace(sugMatch[0], '').trim();
          suggestions = sugMatch[1].split(',').map(s => s.trim()).slice(0, 4);
        } else {
          suggestions = (SUBJECT_PROMPTS[subject] || SUBJECT_PROMPTS["default"]).slice(0, 4);
        }
        
        onUpdateHistory([...currentHistory, { role: 'model', text: cleanText, timestamp: Date.now(), suggestions } as any]);
      });
    } catch (e) {
      showToast("কিছু ত্রুটি ঘটেছে", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-[#09090b]">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="p-3 rounded-lg shadow-lg text-white bg-emerald-500 text-sm font-medium">
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 text-slate-500">⬅️</button>
        <h2 className="text-[16px] font-bold text-slate-800 dark:text-zinc-100">{subject}</h2>
        <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} className="p-2 text-slate-500">⋮</button>
      </header>

      {/* Settings Panel */}
      {showHeaderMenu && (
        <div className="absolute right-4 top-14 bg-white dark:bg-zinc-800 border rounded-lg shadow-lg z-50">
          <button onClick={() => { setShowSettings(!showSettings); setShowHeaderMenu(false); }} className="block w-full text-left px-4 py-2 text-sm">Settings</button>
          <button onClick={() => { onUpdateHistory([]); setShowHeaderMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-500">Clear Chat</button>
        </div>
      )}

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {history.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-xl max-w-[90%] ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-zinc-900 border'}`}>
                <p className={`${fontSize === 'sm' ? 'text-[13px]' : fontSize === 'lg' ? 'text-[17px]' : 'text-[15px]'}`}>{m.text}</p>
              </div>
              
              {m.role === 'model' && (
                <button onClick={() => handleCopyMessage(m.text, idx)} className="mt-1 text-[10px] bg-slate-200 px-2 py-1 rounded">
                  {copiedIndex === idx ? '✓ Copied' : 'Copy'}
                </button>
              )}

              {m.role === 'model' && (m as any).suggestions && (
                <div className="mt-3 grid grid-cols-2 gap-2 w-full max-w-[90%]">
                  {(m as any).suggestions.map((s: string, i: number) => (
                    <button key={i} onClick={() => handleSend(s)} className="text-left text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border hover:border-blue-400">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#09090b] border-t dark:border-zinc-800 pb-8">
        <div className="max-w-2xl mx-auto flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 bg-slate-100 dark:bg-zinc-900 rounded-lg outline-none" placeholder="আপনার প্রশ্ন লিখুন..." />
          <button onClick={() => handleSend()} className="px-4 bg-emerald-600 text-white rounded-lg">পাঠান</button>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
