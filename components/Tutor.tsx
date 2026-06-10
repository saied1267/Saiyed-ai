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

interface ChatMessageExtended extends ChatMessage {
  suggestions?: string[];
  followUpQuestions?: string[];
  importantTopics?: string[];
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

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

const LOADING_MESSAGES = [
  "সাঈদ এআই গভীরভাবে ভাবছে...",
  "আপনার প্রশ্নটি বিশ্লেষণ করা হচ্ছে...",
  "সঠিক এবং তথ্যবহুল উত্তর সাজানো হচ্ছে...",
  "আপনার ক্লাসের মান অনুযায়ী লেকচার নোট তৈরি হচ্ছে...",
  "আর মাত্র কয়েক মুহূর্ত, উত্তর প্রস্তুত করা হচ্ছে...",
];

const Tutor: React.FC<TutorProps> = ({ user, subject, history, onUpdateHistory, onBack, classLevel, group }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showSettings, setShowSettings] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // ফন্ট ইনজেকশন
  useEffect(() => {
    if (!document.getElementById('pdf-font-style')) {
      const style = document.createElement('style');
      style.id = 'pdf-font-style';
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        .katex { font-size: 1.1em !important; }
        .important-highlight {
          background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%);
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 600;
          color: #92400e;
        }
        .dark .important-highlight {
          background: linear-gradient(120deg, #78350f 0%, #92400e 100%);
          color: #fef3c7;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // হেডার মেনু বাইরের ক্লিক ডিটেক্ট করুন
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const shuffledSaiyed = [...SAIYED_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, 2);
    const subjectPool = SUBJECT_PROMPTS[subject] || SUBJECT_PROMPTS["default"];
    const shuffledSubject = [...subjectPool].sort(() => 0.5 - Math.random()).slice(0, 2);
    const finalMixed = [...shuffledSaiyed, ...shuffledSubject].sort(() => 0.5 - Math.random());
    setInitialSuggestions(finalMixed);
  }, [subject, history.length === 0]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history, loading]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : 0));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = toastIdRef.current++;
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const extractImportantTopics = (text: string): string[] => {
    const matches = text.match(/\*\*([^*]+)\*\*/g) || [];
    return matches.map(m => m.replace(/\*\*/g, '')).slice(0, 3);
  };

  const extractFollowUpQuestions = (text: string): string[] => {
    const keywordQuestions: Record<string, string[]> = {
      'সূত্র': ['এই সূত্রটি কিভাবে কাজ করে?', 'এর প্রমাণ কী?', 'এর প্রয়োগ দেখান'],
      'সংজ্ঞা': ['এর বাস্তব জীবনের উদাহরণ কী?', 'এটি কেন গুরুত্বপূর্ণ?', 'এর বিপরীত কী?'],
      'তত্ত্ব': ['এটি কিভাবে প্রমাণিত হয়?', 'এর ব্যবহার কোথায়?', 'এর ব্যতিক্রম আছে?'],
      'প্রক্রিয়া': ['পরবর্তী ধাপ কী?', 'এর বৈকল্পিক পদ্ধতি আছে?', 'এতে কোন ত্রুটি থাকতে পারে?'],
    };

    for (const [keyword, questions] of Object.entries(keywordQuestions)) {
      if (text.toLowerCase().includes(keyword)) {
        return questions;
      }
    }

    return ['এই বিষয়ে আরও জানতে চান?', 'এর উপর কোন প্রশ্ন আছে?', 'আরও গভীরভাবে বুঝতে চান?'];
  };

  const autoWrapMathDelimiters = (text: string): string => {
    if (!text) return '';
    return text.split('\n').map(line => {
      if (line.includes('$')) return line;
      return line.replace(/([A-Za-z0-9\s\+\-\*\/\^\(\)\[\]\{\}\\\<\>\.\,\:\;\=]+(?:=|\^|\\Rightarrow|\\pmod|\\frac|\\sqrt)[A-Za-z0-9\s\+\-\*\/\^\(\)\[\]\{\}\\\<\>\.\,\:\;\=]*)/g, (match) => {
        const trimmed = match.trim();
        if (trimmed.length > 1 && !/^[A-Za-z\s]+$/.test(trimmed)) return `$${trimmed}$`;
        return match;
      });
    }).join('\n');
  };

  const renderLineContent = (line: string) => {
    const win = window as any;
    const tokens = line.split(/(\$\$.*?\$\$|\$.*?\$)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('$$') && token.endsWith('$$')) {
        const math = token.slice(2, -2);
        const html = win.katex ? win.katex.renderToString(math, { displayMode: true, throwOnError: false }) : math;
        return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} className="block my-2" />;
      }
      if (token.startsWith('$') && token.endsWith('$')) {
        const math = token.slice(1, -1);
        const html = win.katex ? win.katex.renderToString(math, { displayMode: false, throwOnError: false }) : math;
        return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} className="inline-block mx-0.5" />;
      }
      const boldParts = token.split(/\*\*(.*?)\*\*/g);
      return boldParts.map((part, pi) => 
        pi % 2 === 1 ? (
          <span key={`${idx}-${pi}`} className="important-highlight">
            {part}
          </span>
        ) : part
      );
    });
  };

  const renderText = (text: string) => {
    if (!text) return null;
    const processedText = autoWrapMathDelimiters(text);
    const fontSizeClass = fontSize === 'sm' ? 'text-[13px]' : fontSize === 'lg' ? 'text-[17px]' : 'text-[15px]';
    return processedText.split('\n').map((line, i) => {
      if (line.trim().startsWith('###')) {
        return <h2 key={i} className="text-[19px] font-bold mt-5 mb-2 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500 pl-3">{line.replace('###', '').trim()}</h2>;
      }
      return <p key={i} className={`${fontSizeClass} mb-3 leading-relaxed`}>{renderLineContent(line)}</p>;
    });
  };

const handleDownloadPDF = async (messageText: string) => {
    const win = window as any;
    if (!win.html2pdf) {
      showToast("PDF লাইব্রেরি লোড হয়নি", "error");
      return;
    }

    const processedText = autoWrapMathDelimiters(messageText);
    const formattedHtml = processedText.split('\n').map((line) => {
      if (line.trim().startsWith('###')) {
        return `<h2 style="font-size: 22px; font-weight: 700; margin: 25px 0 15px 0; border-left: 5px solid #10b981; padding-left: 12px; color: #059669; font-family: 'Hind Siliguri', sans-serif;">${line.replace('###', '').trim()}</h2>`;
      }
      const tokens = line.split(/(\$\$.*?\$\$|\$.*?\$)/g);
      const lineHtml = tokens.map((token) => {
        if (token.startsWith('$$') && token.endsWith('$$')) return win.katex ? win.katex.renderToString(token.slice(2, -2), { displayMode: true }) : token;
        if (token.startsWith('$') && token.endsWith('$')) return win.katex ? win.katex.renderToString(token.slice(1, -1), { displayMode: false }) : token;
        return token.replace(/\*\*(.*?)\*\*/g, '<span style="background: #fef3c7; color: #92400e; font-weight: 700; padding: 2px 6px; border-radius: 3px;">$1</span>');
      }).join('');
      return `<p style="font-size: 16px; margin-bottom: 15px; line-height: 1.8; color: #1e293b; font-family: 'Hind Siliguri', sans-serif;">${lineHtml}</p>`;
    }).join('');

    const watermarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><text x="300" y="300" fill="rgba(0,0,0,0.09)" font-size="45" font-family="sans-serif" font-weight="700" transform="rotate(-45 300 300)" text-anchor="middle">Kaisir ahamed Saiyed (Saiyed Ai)</text></svg>`;
    
    const watermarkBase64 = btoa(unescape(encodeURIComponent(watermarkSvg)));
    const watermarkUrl = `data:image/svg+xml;base64,${watermarkBase64}`;

    const htmlContent = `
      <div style="padding: 30px; background-color: #ffffff; font-family: 'Hind Siliguri', sans-serif; background-image: url('${watermarkUrl}'); background-repeat: repeat; background-size: 600px 600px; -webkit-print-color-adjust: exact; print-color-adjust: exact; min-height: 100vh;">
        <div style="border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 30px; position: relative; z-index: 10;">
          <h1 style="color: #059669; font-size: 24px; margin: 0;">${subject} লেকচার নোট</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 5px;">Generated by Saiyed AI Tutor | তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
        </div>
        <div style="position: relative; z-index: 10;">
          ${formattedHtml}
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `${subject}_note_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true }, 
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    win.html2pdf().from(htmlContent).set(opt).save();
    showToast("PDF ডাউনলোড শুরু হয়েছে");
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast("মেসেজ কপি করা হয়েছে");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm("আপনি কি চ্যাট হিস্টরি মুছতে চান?")) {
      onUpdateHistory([]);
      setShowHeaderMenu(false);
      showToast("চ্যাট হিস্টরি মুছে দেওয়া হয়েছে");
    }
  };

  const handleSend = async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim() || loading) return;
    
    // UI-তে শো করার জন্য নরমাল মেসেজ
    const userMsg: ChatMessage = { role: 'user', text: msgText, timestamp: Date.now() };
    const currentHistory = [...history, userMsg];
    onUpdateHistory(currentHistory);
    setInput('');
    setLoading(true);
    
    const aiPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
    onUpdateHistory([...currentHistory, aiPlaceholder]);
    
    try {
      // এআই কে বিস্তারিত উত্তরের জন্য হিডেন ইনস্ট্রাকশন যুক্ত করা হলো (যাতে বিস্তারিত উত্তর দেয়)
      const detailedPrompt = msgText + "\n\n[Instruction: অনুগ্রহ করে উত্তরটি খুব বিস্তারিত, তথ্যবহুল, ধাপে ধাপে এবং উদাহরণসহ গুছিয়ে দিন।]";

      await getTutorResponseStream(
        detailedPrompt, 
        { classLevel, group, subject, user }, 
        currentHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })), 
        (streamedText) => {
        let cleanText = streamedText;
        let suggestions: string[] = [];
        const sugMatch = streamedText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
        if (sugMatch) {
          cleanText = streamedText.replace(sugMatch[0], '').trim();
          suggestions = sugMatch[1].split(',').map(s => s.trim());
        }
        
        const importantTopics = extractImportantTopics(cleanText);
        const followUpQuestions = extractFollowUpQuestions(cleanText);
        
        const enhancedMessage: any = { 
          ...aiPlaceholder, 
          text: cleanText, 
          suggestions,
          importantTopics,
          followUpQuestions
        };
        onUpdateHistory([...currentHistory, enhancedMessage]);
      });
    } catch (e) {
      onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: "⚠️ সার্ভার ডাউন হয়েছে। পরে আবার চেষ্টা করুন।" }]);
      showToast("কিছু ত্রুটি ঘটেছে", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-[#09090b]">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-lg shadow-lg text-white text-sm font-medium animate-in slide-in-from-top pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-emerald-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg transition">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h2 className="text-[16px] font-bold text-slate-800 dark:text-zinc-100">{subject}</h2>
            <p className="text-[11px] text-emerald-600 font-bold">সাঈদ AI সক্রিয়</p>
          </div>
        </div>

        {/* Header 3-Dot Menu */}
        <div className="flex items-center space-x-2">
          <div ref={headerMenuRef} className="relative">
            <button
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg transition"
              title="মেনু"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {/* Header Menu Dropdown */}
            {showHeaderMenu && (
              <div className="absolute right-0 top-10 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setShowHeaderMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 flex items-center space-x-2 border-b border-slate-200 dark:border-zinc-700"
                >
                  <span>📝</span>
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    handleClearHistory();
                    setShowHeaderMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 flex items-center space-x-2"
                >
                  <span>🗑️</span>
                  <span>Clear Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 animate-in slide-in-from-top">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Font Size </label>
            <div className="flex space-x-2">
              {['sm', 'base', 'lg'].map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size as 'sm' | 'base' | 'lg')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                    fontSize === size
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {size === 'sm' ? 'ছোট' : size === 'lg' ? 'বড়' : 'মধ্যম'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {history.length === 0 && (
            <div className="py-12 text-center">
              <h1 className="text-2xl font-bold mb-8 text-slate-800 dark:text-white">আজকে কী শিখতে চান?</h1>
              <div className="flex flex-col space-y-3">
                {initialSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-left font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md dark:hover:bg-zinc-800/70 transition duration-200"
                  >
                    {renderLineContent(autoWrapMathDelimiters(s))}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {history.map((m, actualIdx) => {
            const hasImportantTopics = (m as any).importantTopics && (m as any).importantTopics.length > 0;
            const followUpQuestions = (m as any).followUpQuestions || [];
            const aiSuggestions = (m as any).suggestions || [];

            return (
              <div key={actualIdx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                
                {/* User & AI Message Bubble Design Fix */}
                <div className={`${m.role === 'user' ? 'max-w-[85%] bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-5 py-3.5 rounded-2xl rounded-br-sm shadow-sm text-[15px]' : 'w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 rounded-xl'}`}>
                  {m.role === 'model' && actualIdx === history.length - 1 && loading && !m.text ? (
                    <div className="flex items-center space-x-2 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-emerald-500 font-bold text-sm">{LOADING_MESSAGES[loadingStep]}</span>
                    </div>
                  ) : (
                    <div className={`prose dark:prose-invert max-w-none ${m.role === 'user' ? 'text-white dark:text-slate-900 font-medium' : 'text-slate-800 dark:text-zinc-200'}`}>
                      {renderText(m.text)}
                    </div>
                  )}
                </div>

                {/* Important Topics Highlight */}
                {m.role === 'model' && hasImportantTopics && (
                  <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 animate-in slide-in-from-bottom-2">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-2">⭐ গুরুত্বপূর্ণ বিষয়গুলো:</p>
                    <div className="flex flex-wrap gap-2">
                      {(m as any).importantTopics.map((topic: string, idx: number) => (
                        <span key={idx} className="text-xs bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-3 py-1 rounded-full font-semibold">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Actions (Copy / PDF) */}
                <div className="flex items-center space-x-2 mt-1">
                  <button
                    onClick={() => handleCopyMessage(m.text, actualIdx)}
                    className={`px-2 py-1 text-xs rounded transition ${m.role === 'user' ? 'bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300' : 'bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300'}`}
                    title="কপি"
                  >
                    {copiedIndex === actualIdx ? '✓ Copied' : 'Copy'}
                  </button>

                  {m.role === 'model' && m.text && (
                    <button
                      onClick={() => handleDownloadPDF(m.text)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
                      title="PDF ডাউনলোড"
                    >
                      <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="3" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      <span>PDF</span>
                    </button>
                  )}
                </div>

                {/* Follow-Up Questions */}
                {m.role === 'model' && m.text && followUpQuestions.length > 0 && aiSuggestions.length === 0 && (
                  <div className="w-full mt-3 space-y-2 animate-in slide-in-from-bottom-2">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">💡 পরবর্তী প্রশ্ন:</p>
                    <div className="flex flex-col gap-2">
                      {followUpQuestions.slice(0, 2).map((question: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(question)}
                          className="text-left text-xs px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                        >
                          {renderLineContent(autoWrapMathDelimiters(question))}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Dynamic Suggestions */}
                {m.role === 'model' && m.text && aiSuggestions.length > 0 && (
                  <div className="w-full mt-3 space-y-2 animate-in slide-in-from-bottom-2">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✨ সাজেশন্স:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.slice(0, 4).map((suggestion: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(suggestion)}
                          className="text-left text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition"
                        >
                          {renderLineContent(autoWrapMathDelimiters(suggestion))}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#09090b] border-t dark:border-zinc-800 pb-8">
        <div className="max-w-2xl mx-auto flex items-center bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-xl border dark:border-zinc-800">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="আপনার প্রশ্ন লিখুন..."
            className="flex-1 bg-transparent px-3 py-2 outline-none font-medium text-[15px] dark:text-white resize-none"
          />
          {/* Send Button Design Fix */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg disabled:opacity-50 hover:bg-slate-900 dark:hover:bg-white transition shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
