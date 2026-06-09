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

const AI_STEPS = [
  "Saiyed AI গভীরভাবে বিশ্লেষণ করছে...",
  "Saiyed AI চিন্তা করছে...",
  "Saiyed AI উত্তর তৈরি করছে..."
];

const Tutor: React.FC<TutorProps> = ({
  user,
  subject,
  history,
  onUpdateHistory,
  onBack,
  classLevel,
  group
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStep, setAiStep] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

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

  // ✅ AI STEP LOADING EFFECT
  useEffect(() => {
    let interval: number;

    if (loading) {
      setAiStep(0);

      interval = window.setInterval(() => {
        setAiStep(prev => {
          if (prev < AI_STEPS.length - 1) {
            return prev + 1;
          } else {
            return prev; // stop at last step
          }
        });
      }, 1500);
    }

    return () => clearInterval(interval);
  }, [loading]);

  const handleSend = async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: msgText,
      timestamp: Date.now()
    };

    const newHistory = [...history, userMsg];
    onUpdateHistory(newHistory);
    setInput('');
    setLoading(true);

    const aiPlaceholder: ChatMessage = {
      role: 'model',
      text: '',
      timestamp: Date.now()
    };

    onUpdateHistory([...newHistory, aiPlaceholder]);

    try {
      await getTutorResponseStream(
        msgText,
        { classLevel, group, subject, user },
        newHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        (streamedText) => {
          let cleanText = streamedText;
          let suggestions: string[] = [];

          const sugMatch = streamedText.match(/\[SUGGESTIONS: (.*?)\]/);

          if (sugMatch) {
            cleanText = streamedText.replace(sugMatch[0], '').trim();
            suggestions = sugMatch[1].split(',').map(s => s.trim());
          }

          onUpdateHistory([
            ...newHistory,
            { ...aiPlaceholder, text: cleanText, suggestions }
          ]);
        }
      );
    } catch (e) {
      console.error(e);
      onUpdateHistory([
        ...newHistory,
        {
          ...aiPlaceholder,
          text: "⚠️ এআই সার্ভারে সংযোগ বিচ্ছিন্ন হয়েছে। সাঈদ এর সাথে যোগাযোগ করুন।"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderText = (text: string) => {
    if (!text) return null;

    let processedText = text.replace(/\$/g, '');

    return processedText.split('\n').map((line, i) => {
      if (line.trim().startsWith('###')) {
        return (
          <h2
            key={i}
            className="text-[28px] font-black text-slate-900 dark:text-white mt-10 mb-6 leading-tight tracking-tight border-l-8 border-emerald-500 pl-4 py-1"
          >
            {line.replace('###', '').trim()}
          </h2>
        );
      }

      const isBullet =
        line.trim().startsWith('-') ||
        line.trim().startsWith('•') ||
        /^\d+\./.test(line.trim());

      const processBold = (content: string) => {
        return content.split(/\*\*(.*?)\*\*/g).map((part, pi) =>
          pi % 2 === 1 ? (
            <strong
              key={pi}
              className="font-black text-emerald-600 dark:text-emerald-400"
            >
              {part}
            </strong>
          ) : (
            part
          )
        );
      };

      if (!line.trim()) return <div key={i} className="h-4" />;

      return (
        <p
          key={i}
          className={`text-[18px] font-medium leading-[1.8] text-slate-700 dark:text-slate-300 mb-4 ${
            isBullet
              ? 'pl-6 relative before:content-["•"] before:absolute before:left-0 before:text-emerald-500 before:font-black'
              : ''
          }`}
        >
          {processBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#0d0d0d] font-['Hind_Siliguri']">
      {/* HEADER */}
      <header className="px-5 py-4 flex items-center justify-between border-b dark:border-white/5 bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div>
            <h2 className="text-[16px] font-black dark:text-white leading-none">
              {subject}
            </h2>

            {/* ✅ CHANGED HERE */}
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 animate-pulse">
              {AI_STEPS[aiStep]}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('চ্যাট মুছবেন?')) onUpdateHistory([]);
          }}
          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
        >
          🗑
        </button>
      </header>

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto space-y-12">
          {history.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] bg-slate-100 dark:bg-white/10 dark:text-white rounded-3xl px-6 py-4'
                    : 'w-full'
                }
              >
                {renderText(m.text)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t dark:border-white/5">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-white/5 text-black dark:text-white"
            placeholder="প্রশ্ন করুন..."
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-6 py-4 bg-emerald-600 text-white rounded-xl"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutor;