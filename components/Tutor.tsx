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

  /* ================= COPY CHAT ================= */
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

  /* ================= SEND ================= */
  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend.trim(),
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    const prev = [...history];
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
        prev.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        selectedImage || undefined,
        streamedText => {
          onUpdateHistory([...newHistory, { ...aiPlaceholder, text: streamedText }]);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= TEXT FORMAT ================= */
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      const t = line.trim();
      if (!t) return <div key={idx} className="h-3" />;

      // Heading
      if (t.startsWith('###')) {
        return (
          <h3
            key={idx}
            className="text-[17px] font-extrabold mt-6 mb-3 pl-3 border-l-4 border-slate-900 dark:border-white"
          >
            {t.replace(/###|\*\*/g, '').trim()}
          </h3>
        );
      }

      // Bullet list
      if (t.startsWith('-') || t.startsWith('•')) {
        return (
          <ul key={idx} className="ml-6 list-disc">
            <li className="text-[14px] leading-[1.9]">
              {t.replace(/^[-•]|\*\*/g, '').trim()}
            </li>
          </ul>
        );
      }

      // Numbered steps
      if (/^\d+\./.test(t)) {
        return (
          <div key={idx} className="ml-4 pl-4 border-l-2 my-2">
            <p className="font-semibold">
              {t.replace(/\*\*/g, '')}
            </p>
          </div>
        );
      }

      return (
        <p key={idx} className="text-[14px] leading-[1.9] mb-2">
          {t.replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950">

      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center space-x-3">
          <button onClick={onBack}>⬅</button>
          <div>
            <h2 className="text-[14px] font-bold">{subject}</h2>
            <span className="text-[10px] font-bold text-slate-400">সাঈদ AI</span>
          </div>
        </div>

        <button onClick={handleCopyChat} className="text-[12px] font-bold">
          📋 Copy
        </button>
      </header>

      {/* ================= CHAT ================= */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4">
        <div className="max-w-2xl mx-auto pt-8 pb-10 space-y-8">

          {/* ===== Suggestions (UNCHANGED) ===== */}
          {history.length === 0 && (
            <div className="text-center space-y-6">
              <p className="font-bold text-slate-500">আজ কী জানতে চান?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[`${subject} এর গুরুত্বপূর্ণ সূত্র`, `একটি উদাহরণ দাও`, `শর্টকাট টিপস`, `স্টেপ বাই স্টেপ বুঝাও`]
                  .map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="p-3 border rounded-xl font-bold text-[12px]"
                    >
                      {s}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {history.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <div className={`inline-block px-4 py-2 rounded-2xl ${m.role === 'user' ? 'bg-slate-100' : ''}`}>
                {m.role === 'model'
                  ? renderFormattedText(m.text)
                  : <p>{m.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= INPUT ================= */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
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