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

const Tutor: React.FC<TutorProps> = ({
  subject,
  history,
  onUpdateHistory,
  onBack,
  classLevel,
  group,
  user
}) => {

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* =========================
     COPY CHAT FUNCTION
  ========================= */
  const handleCopyChat = () => {
    if (!history.length) return;

    const text = history
      .map(m => `${m.role === 'user' ? 'You' : 'AI'}:\n${m.text || ''}`)
      .join('\n\n');

    navigator.clipboard.writeText(text);
    alert('চ্যাট কপি হয়েছে ✅');
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  /* =========================
     SEND MESSAGE
  ========================= */
  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend.trim(),
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    const prevHistory = [...history];
    const newHistory = [...history, userMsg];

    onUpdateHistory(newHistory);
    setInput('');
    setSelectedImage(null);
    setLoading(true);

    const aiPlaceholder: ChatMessage = {
      role: 'model',
      text: '',
      timestamp: Date.now()
    };

    onUpdateHistory([...newHistory, aiPlaceholder]);

    try {
      await getTutorResponseStream(
        textToSend,
        { classLevel, group, subject, user },
        prevHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        selectedImage || undefined,
        (streamedText) => {
          onUpdateHistory([...newHistory, { ...aiPlaceholder, text: streamedText }]);
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     BEAUTIFUL TEXT RENDER
  ========================= */
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, idx) => {
      const t = line.trim();
      if (!t) return <div key={idx} className="h-3" />;

      /* ===== Heading ===== */
      if (t.startsWith('###')) {
        return (
          <h3
            key={idx}
            className="text-[17px] font-extrabold text-slate-900 dark:text-white mt-6 mb-3 border-l-4 border-slate-900 dark:border-white pl-3"
          >
            {t.replace(/###/g, '').replace(/\*\*/g, '').trim()}
          </h3>
        );
      }

      /* ===== Bullet List ===== */
      if (t.startsWith('-') || t.startsWith('•')) {
        return (
          <ul key={idx} className="ml-6 list-disc">
            <li className="text-[14px] leading-[1.9] text-slate-800 dark:text-slate-200 font-medium">
              {t.replace(/^[-•]/, '').replace(/\*\*/g, '').trim()}
            </li>
          </ul>
        );
      }

      /* ===== Numbered Step ===== */
      if (/^\d+\./.test(t)) {
        return (
          <div
            key={idx}
            className="ml-4 pl-4 border-l-2 border-slate-300 dark:border-slate-700 my-2"
          >
            <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
              {t.replace(/\*\*/g, '')}
            </p>
          </div>
        );
      }

      /* ===== Normal Paragraph ===== */
      return (
        <p
          key={idx}
          className="text-[14px] leading-[1.9] font-medium text-slate-800 dark:text-slate-200 mb-2"
        >
          {t.replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950">

      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-800">

        <div className="flex items-center space-x-3">
          <button onClick={onBack}>⬅</button>
          <div>
            <h2 className="font-bold text-[14px]">{subject}</h2>
            <span className="text-[10px] text-slate-400 font-bold">সাঈদ AI</span>
          </div>
        </div>

        {/* COPY CHAT BUTTON */}
        <button
          onClick={handleCopyChat}
          className="flex items-center space-x-1 text-slate-500 hover:text-slate-800"
        >
          📋 <span className="text-[12px] font-bold">Copy</span>
        </button>
      </header>

      {/* ================= CHAT ================= */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {history.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              {m.image && (
                <img
                  src={m.image}
                  className="max-w-xs rounded-xl mb-2 inline-block"
                />
              )}
              <div
                className={`inline-block px-4 py-2 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-slate-100'
                    : 'bg-transparent w-full'
                }`}
              >
                {m.role === 'model'
                  ? renderFormattedText(m.text)
                  : <p>{m.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= INPUT ================= */}
      <div className="p-4 border-t dark:border-slate-800">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={1}
            placeholder="প্রশ্ন লিখুন..."
            className="flex-1 p-2 rounded-xl border resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={() => handleSend()}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutor;