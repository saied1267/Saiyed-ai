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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.getElementById('pdf-font-style')) {
      const style = document.createElement('style');
      style.id = 'pdf-font-style';
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        .katex { font-size: 1.1em !important; }
        .important-highlight { background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%); padding: 2px 6px; border-radius: 3px; font-weight: 600; color: #92400e; }
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
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, loading]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const generateRelatedQuestions = (previousQuestion: string): string[] => {
    const mainTopic = previousQuestion.toLowerCase().split(/\s+/).slice(0, 2).join(' ');
    return [
      `${mainTopic} এর উপর বিস্তারিত উদাহরণ দিন`,
      `${mainTopic} কীভাবে ব্যবহার করা হয়?`,
      `${mainTopic} এর গুরুত্ব ব্যাখ্যা করুন`,
      `${mainTopic} এর সহজ সমাধান কী?`
    ];
  };

  const autoWrapMathDelimiters = (text: string): string => {
    if (!text) return '';
    return text.split('\n').map(line => {
      if (line.includes('$')) return line;
      return line.replace(/([A-Za-z0-9\s\+\-\*\/\^\(\)\[\]\{\}\\\<\>\.\,\:\;\=]+(?:=|\^|\\Rightarrow|\\pmod|\\frac|\\sqrt)[A-Za-z0-9\s\+\-\*\/\^\(\)\[\]\{\}\\\<\>\.\,\:\;\=]*)/g, (match) => {
        const trimmed = match.trim();
        return (trimmed.length > 1 && !/^[A-Za-z\s]+$/.test(trimmed)) ? `$${trimmed}$` : match;
      });
    }).join('\n');
  };

  const renderLineContent = (line: string) => {
    const win = window as any;
    return line.split(/(\$\$.*?\$\$|\$.*?\$)/g).map((token, idx) => {
      if (token.startsWith('$$')) {
        const html = win.katex ? win.katex.renderToString(token.slice(2, -2), { displayMode: true }) : token;
        return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} className="block my-2" />;
      }
      if (token.startsWith('$')) {
        const html = win.katex ? win.katex.renderToString(token.slice(1, -1), { displayMode: false }) : token;
        return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} className="inline-block mx-0.5" />;
      }
      return token.split(/\*\*(.*?)\*\*/g).map((p, pi) => pi % 2 === 1 ? <span key={`${idx}-${pi}`} className="important-highlight">{p}</span> : p);
    });
  };

  const renderText = (text: string) => {
    if (!text) return null;
    const fontSizeClass = fontSize === 'sm' ? 'text-[13px]' : fontSize === 'lg' ? 'text-[17px]' : 'text-[15px]';
    return autoWrapMathDelimiters(text).split('\n').map((line, i) => (
      <p key={i} className={`${fontSizeClass} mb-3 leading-relaxed`}>{renderLineContent(line)}</p>
    ));
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
      const aiPlaceholder: any = { role: 'model', text: '', timestamp: Date.now(), followUpQuestions: generateRelatedQuestions(msgText) };
      onUpdateHistory([...currentHistory, aiPlaceholder]);
      
      await getTutorResponseStream(msgText, { classLevel, group, subject, user }, currentHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })), (streamedText) => {
        onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: streamedText }]);
      });
    } catch (e) {
      showToast("কিছু ত্রুটি ঘটেছে", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-[#09090b]">
        {/* Header, Settings, Chat Area, Input Area Logic here... */}
        {/* (আপনার আগের কোডের বাকি অংশ ঠিক এভাবেই এখানে বসিয়ে দিন) */}
    </div>
  );
};

export default Tutor;
