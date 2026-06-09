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
  "গণিত": ["গণিতের বেসিক ভয় দূর করার কিছু উপায় বলো", "বীজগণিতের সূত্রগুলো সহজে চেনার উপায় কী?", "ত্রিকোণমিতি কেন গুরুত্বপূর্ণ?", "ক্যালকুলাস শেখার শুরুর টিপস"],
  "ইংরেজি": ["ইংরেজি গ্রামারের টেন্স (Tense) সহজে চেনার উপায় কী?", "সহজে নতুন নতুন ইংরেজি শব্দ মনে রাখার কৌশল", "রিডিং কম্প্রিহেনশন উন্নত করার টিপস", "রাইটিং স্কিল বাড়ানোর উপায়"],
  "default": ["এই বিষয়ের মূল সিলেবাস এবং রোডম্যাপটি দাও", "পরীক্ষার জন্য কোন কোন অধ্যায় গুরুত্বপূর্ণ?", "এই বিষয়ের ভিত্তিগত ধারণা বুঝিয়ে দিন", "কিভাবে এই বিষয়ে ভালো করা যায়?"],
};

const LOADING_MESSAGES = ["সাঈদ এআই গভীরভাবে ভাবছে...", "আপনার প্রশ্নটি বিশ্লেষণ করা হচ্ছে...", "সঠিক এবং তথ্যবহুল উত্তর সাজানো হচ্ছে...", "আপনার ক্লাসের মান অনুযায়ী লেকচার নোট তৈরি হচ্ছে..."];

const Tutor: React.FC<TutorProps> = ({ user, subject, history, onUpdateHistory, onBack, classLevel, group }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showSettings, setShowSettings] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const shuffledSaiyed = [...SAIYED_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, 2);
    const subjectPool = SUBJECT_PROMPTS[subject] || SUBJECT_PROMPTS["default"];
    const shuffledSubject = [...subjectPool].sort(() => 0.5 - Math.random()).slice(0, 2);
    setInitialSuggestions([...shuffledSaiyed, ...shuffledSubject]);
  }, [subject]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => setLoadingStep((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : 0)), 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
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
        
        const enhancedMessage: any = { role: 'model', text: cleanText, timestamp: Date.now(), suggestions };
        onUpdateHistory([...currentHistory, enhancedMessage]);
      });
    } catch (e) {
      showToast("কিছু ত্রুটি ঘটেছে", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (text: string) => {
    const win = window as any;
    if (!win.html2pdf) return;
    const opt = { filename: `${subject}_note_${Date.now()}.pdf`, jsPDF: { format: 'a4' } };
    win.html2pdf().from(`<div style="padding:20px;">${text.replace(/\n/g, '<br/>')}</div>`).set(opt).save();
    showToast("PDF ডাউনলোড শুরু হয়েছে");
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-[#09090b]">
      {/* Toast */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => <div key={t.id} className="p-3 bg-emerald-500 text-white rounded-lg shadow-lg">{t.message}</div>)}
      </div>

      {/* Header */}
      <header className="px-4 py-3.5 flex items-center justify-between border-b bg-white dark:bg-[#09090b] dark:border-zinc-800">
        <button onClick={onBack} className="p-2 text-slate-500">⬅️</button>
        <div><h2 className="text-sm font-bold">{subject}</h2><p className="text-[10px] text-emerald-600">সাঈদ AI সক্রিয়</p></div>
        <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} className="p-2">⋮</button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b bg-white dark:bg-zinc-900">
          <div className="flex gap-2">
            {(['sm', 'base', 'lg'] as const).map(s => <button key={s} onClick={() => setFontSize(s)} className={`px-3 py-1 rounded text-xs ${fontSize === s ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>ফন্ট: {s}</button>)}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {history.length === 0 && (
            <div className="text-center py-12">
              <h1 className="text-xl font-bold mb-6">আজকে কী শিখতে চান?</h1>
              {initialSuggestions.map((s, i) => <button key={i} onClick={() => handleSend(s)} className="block w-full p-4 mb-3 border rounded-xl text-left hover:border-emerald-500">{s}</button>)}
            </div>
          )}

          {history.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-xl max-w-[90%] ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-zinc-900 border'}`}>
                {m.text.split('\n').map((l, i) => <p key={i} className={`mb-2 ${fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-lg' : 'text-sm'}`}>{l}</p>)}
              </div>
              
              {m.role === 'model' && (m as any).suggestions && (
                <div className="mt-3 grid grid-cols-1 gap-2 w-full max-w-[90%]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">সম্পর্কিত প্রশ্ন:</p>
                  {(m as any).suggestions.map((s: string, i: number) => (
                    <button key={i} onClick={() => handleSend(s)} className="text-left text-xs p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30">{s}</button>
                  ))}
                </div>
              )}

              {m.role === 'model' && (
                <button onClick={() => handleDownloadPDF(m.text)} className="mt-2 text-[10px] font-bold text-emerald-600">📥 PDF ডাউনলোড</button>
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
