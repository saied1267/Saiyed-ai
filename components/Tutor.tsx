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
  isBookmarked?: boolean;
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
  "গণিত": ["গণিতের বেসিক ভয় দূর করার কিছু উপায় বলো", "বীজগণিতের সূত্রগুলো সহজে শিখার কৌশল"],
  "ইংরেজি": ["ইংরেজি গ্রামারের টেন্স (Tense) সহজে চেনার উপায় কী?", "সহজে নতুন নতুন ইংরেজি শব্দ শিখার উপায়"],
  "default": ["এই বিষয়ের মূল সিলেবাস এবং রোডম্যাপটি দাও", "পরীক্ষার জন্য কোন কোন অধ্যায় সবচেয়ে গুরুত্বপূর্ণ?"],
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
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showSettings, setShowSettings] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  // ফন্ট ইনজেকশন
  useEffect(() => {
    if (!document.getElementById('pdf-font-style')) {
      const style = document.createElement('style');
      style.id = 'pdf-font-style';
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        .katex { font-size: 1.1em !important; }
      `;
      document.head.appendChild(style);
    }
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
      return boldParts.map((part, pi) => pi % 2 === 1 ? <strong key={`${idx}-${pi}`} className="text-emerald-600 dark:text-emerald-400 font-bold">{part}</strong> : part);
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
        return token.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #059669; font-weight: 700;">$1</strong>');
      }).join('');
      return `<p style="font-size: 16px; margin-bottom: 15px; line-height: 1.8; color: #1e293b; font-family: 'Hind Siliguri', sans-serif;">${lineHtml}</p>`;
    }).join('');

    const htmlContent = `
      <div style="padding: 30px; background-color: #ffffff; font-family: 'Hind Siliguri', sans-serif;">
        <div style="border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 30px;">
          <h1 style="color: #059669; font-size: 24px; margin: 0;">${subject} লেকচার নোট</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 5px;">Generated by Saiyed AI Tutor | তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
        </div>
        ${formattedHtml}
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `${subject}_note_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
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

  const handleBookmark = (index: number) => {
    setBookmarks(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
    showToast(bookmarks.includes(index) ? "বুকমার্ক সরানো হয়েছে" : "বুকমার্ক করা হয়েছে");
  };

  const handleEditMessage = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleSaveEdit = (index: number) => {
    if (!editingText.trim()) return;
    const updatedHistory = [...history];
    (updatedHistory[index] as any).text = editingText;
    onUpdateHistory(updatedHistory);
    setEditingIndex(null);
    setEditingText('');
    showToast("মেসেজ আপডেট হয়েছে");
  };

  const handleClearHistory = () => {
    if (window.confirm("আপনি কি চ্যাট হিস্টরি মুছতে চান?")) {
      onUpdateHistory([]);
      setBookmarks([]);
      showToast("চ্যাট হিস্টরি মুছে দেওয়া হয়েছে");
    }
  };

  const handleSend = async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: msgText, timestamp: Date.now() };
    const currentHistory = [...history, userMsg];
    onUpdateHistory(currentHistory);
    setInput('');
    setLoading(true);
    const aiPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
    onUpdateHistory([...currentHistory, aiPlaceholder]);
    try {
      await getTutorResponseStream(msgText, { classLevel, group, subject, user }, currentHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })), (streamedText) => {
        let cleanText = streamedText;
        let suggestions: string[] = [];
        const sugMatch = streamedText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
        if (sugMatch) {
          cleanText = streamedText.replace(sugMatch[0], '').trim();
          suggestions = sugMatch[1].split(',').map(s => s.trim());
        }
        onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: cleanText, suggestions }]);
      });
    } catch (e) {
      onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: "⚠️ সমস্যা হয়েছে। আবার চেষ্টা করুন।" }]);
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
          <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h2 className="text-[16px] font-bold text-slate-800 dark:text-zinc-100">{subject}</h2>
            <p className="text-[11px] text-emerald-600 font-bold">সাঈদ AI সক্রিয়</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg"
            title="সেটিংস"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
            </svg>
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">ফন্ট সাইজ:</label>
            <div className="flex space-x-2">
              {['sm', 'base', 'lg'].map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size as 'sm' | 'base' | 'lg')}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    fontSize === size
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-zinc-800'
                  }`}
                >
                  {size === 'sm' ? 'ছোট' : size === 'lg' ? 'বড়' : 'মধ্যম'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleClearHistory}
              className="flex-1 px-2 py-2 text-xs font-bold bg-red-500 text-white rounded hover:bg-red-600"
            >
              সব মুছুন
            </button>
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
                    className="p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl text-left font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks Section */}
          {bookmarks.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">📌 বুকমার্ক করা ({bookmarks.length})</h3>
              <div className="space-y-2">
                {bookmarks.slice(0, 3).map(idx => (
                  <div key={idx} className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                    {history[idx]?.text?.substring(0, 100)}...
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {history.map((m, actualIdx) => {
            const isBookmarked = bookmarks.includes(actualIdx);
            const isEditing = editingIndex === actualIdx;

            return (
              <div key={actualIdx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
                <div className={`${m.role === 'user' ? 'max-w-[85%] bg-emerald-600 text-white p-4 rounded-2xl rounded-br-sm' : 'w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 rounded-2xl'}`}>
                  {isEditing && m.role === 'user' ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white rounded outline-none border dark:border-zinc-700"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(actualIdx)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                        >
                          সেভ
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-1 bg-slate-400 text-white rounded text-xs font-bold"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                        <div className={`prose dark:prose-invert max-w-none ${m.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-zinc-200'}`}>
                          {renderText(m.text)}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Message Actions */}
                {!isEditing && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleCopyMessage(m.text, actualIdx)}
                      className="px-2 py-1 text-xs bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 rounded"
                      title="কপি"
                    >
                      {copiedIndex === actualIdx ? '✓ copied' : 'Copy'}
                    </button>

                    {m.role === 'user' && (
                      <button
                        onClick={() => handleEditMessage(actualIdx, m.text)}
                        className="px-2 py-1 text-xs bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 rounded"
                        title="সম্পাদনা"
                      >
                        ✏️ সম্পাদনা
                      </button>
                    )}

                    <button
                      onClick={() => handleBookmark(actualIdx)}
                      className={`px-2 py-1 text-xs rounded ${
                        isBookmarked
                          ? 'bg-yellow-400 text-slate-800'
                          : 'bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700'
                      }`}
                      title="বুকমার্ক"
                    >
                      {isBookmarked ? '📌 বুকমার্ক করা' : 'Bookmark'}
                    </button>
                  </div>
                )}

                {/* PDF Download */}
                {m.role === 'model' && m.text && (
                  <div className="mt-4 pt-3 border-t dark:border-zinc-800 flex justify-end">
                    <button
                      onClick={() => handleDownloadPDF(m.text)}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500 text-white text-[12px] font-bold rounded-lg hover:bg-emerald-600"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      <span>PDF ডাউনলোড</span>
                    </button>
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
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-emerald-600 text-white rounded-lg disabled:opacity-50 hover:bg-emerald-700 transition"
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
