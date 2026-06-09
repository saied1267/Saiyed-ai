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

const SAIYED_PROMPTS = ["সাঈদ সম্পর্কে বিস্তারিত জানতে চাই", "সাঈদ এআই এর নির্মাতা কে এবং এর লক্ষ্য কী?", "সাঈদ এআই-এর বিশেষ ক্ষমতাগুলো কী কী?"];
const SUBJECT_PROMPTS: Record<string, string[]> = {
  "গণিত": ["গণিতের বেসিক ভয় দূর করার উপায়", "বীজগণিতের সূত্র", "ত্রিকোণমিতি কেন গুরুত্বপূর্ণ?", "ক্যালকুলাস টিপস"],
  "default": ["এই বিষয়ের সিলেবাস", "গুরুত্বপূর্ণ অধ্যায়", "ভিত্তিগত ধারণা", "পড়ার রোডম্যাপ"]
};

const Tutor: React.FC<TutorProps> = ({ user, subject, history, onUpdateHistory, onBack, classLevel, group }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showSettings, setShowSettings] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  const showToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("মেসেজ কপি করা হয়েছে");
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
    } catch (e) { showToast("ত্রুটি হয়েছে"); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-[#09090b]">
      {/* Toast */}
      <div className="fixed top-4 right-4 z-[100]">{toasts.map(t => <div key={t.id} className="p-3 bg-emerald-600 text-white rounded-lg shadow-lg mb-2">{t.message}</div>)}</div>

      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b dark:border-zinc-800 bg-white dark:bg-[#09090b]">
        <button onClick={onBack} className="p-2">⬅️</button>
        <h2 className="font-bold">{subject}</h2>
        <div className="relative">
          <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} className="p-2">⋮</button>
          {showHeaderMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-800 shadow-xl rounded-lg border">
              <button onClick={() => { setShowSettings(!showSettings); setShowHeaderMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-zinc-700">Settings</button>
              <button onClick={() => { onUpdateHistory([]); setShowHeaderMenu(false); showToast("চ্যাট মুছে ফেলা হয়েছে"); }} className="w-full text-left px-4 py-2 text-red-500">Clear Chat</button>
            </div>
          )}
        </div>
      </header>

      {/* Settings */}
      {showSettings && (
        <div className="p-4 border-b flex gap-2">
          {(['sm', 'base', 'lg'] as const).map(s => <button key={s} onClick={() => setFontSize(s)} className={`px-3 py-1 rounded ${fontSize === s ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>ফন্ট: {s}</button>)}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {history.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-xl max-w-[90%] ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border dark:bg-zinc-900'}`}>
                {m.text.split('\n').map((l, i) => <p key={i} className={fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-lg' : 'text-sm'}>{l}</p>)}
              </div>
              {m.role === 'model' && (
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleCopy(m.text)} className="text-[10px] bg-slate-200 px-2 py-1 rounded">Copy</button>
                  <button onClick={() => { /* PDF Logic */ }} className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded">PDF</button>
                </div>
              )}
              {m.role === 'model' && (m as any).suggestions && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(m as any).suggestions.map((s: string, i: number) => <button key={i} onClick={() => handleSend(s)} className="text-[10px] text-left p-2 bg-blue-50 rounded border">{s}</button>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white dark:bg-[#09090b] pb-8">
        <div className="max-w-2xl mx-auto flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 bg-slate-100 dark:bg-zinc-900 rounded-lg outline-none" placeholder="আপনার প্রশ্ন..." />
          <button onClick={() => handleSend()} className="px-4 bg-emerald-600 text-white rounded-lg">পাঠান</button>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
