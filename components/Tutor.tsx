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
  const [isTyping, setIsTyping] = useState(false);
  const [aiStep, setAiStep] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

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

  // ✅ AI STEP CONTROLLER
  useEffect(() => {
    let interval: number;

    if (isTyping) {
      setAiStep(0);

      interval = window.setInterval(() => {
        setAiStep(prev =>
          prev < AI_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 1500);
    }

    return () => clearInterval(interval);
  }, [isTyping]);

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
    setIsTyping(true);

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

          onUpdateHistory(prev =>
            prev.map((m, i) =>
              i === newHistory.length
                ? { ...m, text: cleanText, suggestions }
                : m
            )
          );
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
      setIsTyping(false);
    }
  };

  const renderText = (text: string) => {
    if (!text) return null;

    const processedText = text.replace(/\$/g, '');

    return processedText.split('\n').map((line, i) => {
      if (line.trim().startsWith('###')) {
        return (
          <h2 key={i} className="text-[28px] font-black text-slate-900 dark:text-white mt-10 mb-6 border-l-8 border-emerald-500 pl-4">
            {line.replace('###', '').trim()}
          </h2>
        );
      }

      const isBullet =
        line.trim().startsWith('-') ||
        line.trim().startsWith('•') ||
        /^\d+\./.test(line.trim());

      const processBold = (content: string) =>
        content.split(/\*\*(.*?)\*\*/g).map((part, pi) =>
          pi % 2 === 1 ? (
            <strong key={pi} className="text-emerald-600 dark:text-emerald-400 font-black">
              {part}
            </strong>
          ) : (
            part
          )
        );

      if (!line.trim()) return <div key={i} className="h-4" />;

      return (
        <p
          key={i}
          className={`text-[18px] leading-[1.8] text-slate-700 dark:text-slate-300 mb-4 ${
            isBullet ? 'pl-6 before:content-["•"] before:absolute before:text-emerald-500' : ''
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
      <header className="px-5 py-4 flex items-center justify-between border-b bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2">
            ←
          </button>

          <div>
            <h2 className="text-[16px] font-black">{subject}</h2>

            {/* ✅ FIXED STATUS */}
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-2">
              {isTyping ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute h-full w-full bg-emerald-400 rounded-full"></span>
                    <span className="relative h-2 w-2 bg-emerald-500 rounded-full"></span>
                  </span>
                  {AI_STEPS[aiStep]}
                </>
              ) : (
                "Saiyed AI Ready 🟢"
              )}
            </p>
          </div>
        </div>
      </header>

      {/* CHAT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto space-y-10">

          {history.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <div className="inline-block">
                {renderText(m.text)}

                {/* ✅ Suggestions FIXED */}
                {m.suggestions?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {m.suggestions.map((s, si) => (
                      <button
                        key={si}
                        onClick={() => handleSend(s)}
                        className="px-4 py-2 text-sm bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-white/5"
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