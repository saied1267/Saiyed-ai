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

const Tutor: React.FC<TutorProps> = ({ user, subject, history, onUpdateHistory, onBack, classLevel, group }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showSettings, setShowSettings] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  // ফন্ট এবং স্টাইল ইনজেকশন
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
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleDownloadPDF = async (messageText: string) => {
    const win = window as any;
    if (!win.html2pdf) { showToast("PDF লাইব্রেরি লোড হয়নি", "error"); return; }
    
    const htmlContent = `<div style="padding: 30px; font-family: 'Hind Siliguri', sans-serif;"><h1>${subject}</h1><p>${messageText.replace(/\n/g, '<br/>')}</p></div>`;
    win.html2pdf().from(htmlContent).save(`${subject}_note.pdf`);
    showToast("PDF ডাউনলোড শুরু হয়েছে");
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
        let suggestions: string[] = [];
        const sugMatch = streamedText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
        if (sugMatch) suggestions = sugMatch[1].split(',').map(s => s.trim());
        
        onUpdateHistory([...currentHistory, { role: 'model', text: streamedText, timestamp: Date.now(), suggestions } as any]);
      });
    } catch (e) { showToast("ত্রুটি হয়েছে", "error"); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-[#09090b]">
      {/* Header */}
      <header className="px-4 py-3.5 flex items-center justify-between border-b bg-white dark:bg-[#09090b]">
        <button onClick={onBack}>⬅️</button>
        <h2 className="font-bold">{subject}</h2>
        <button onClick={() => setShowHeaderMenu(!showHeaderMenu)}>⋮</button>
      </header>

      {/* Menu Dropdown */}
      {showHeaderMenu && (
        <div className="absolute right-4 top-14 bg-white shadow-lg border rounded-lg z-50">
          <button onClick={() => setShowSettings(!showSettings)} className="w-full px-4 py-2 text-sm">Settings</button>
          <button onClick={() => { onUpdateHistory([]); setShowHeaderMenu(false); }} className="w-full px-4 py-2 text-red-500 text-sm">Clear Chat</button>
        </div>
      )}

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {history.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-xl max-w-[90%] ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border'}`}>
                <p className={fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-lg' : 'text-sm'}>{m.text}</p>
              </div>
              
              {m.role === 'model' && (
                <div className="mt-2 flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(m.text)} className="text-[10px] bg-slate-200 px-2 py-1 rounded">Copy</button>
                  <button onClick={() => handleDownloadPDF(m.text)} className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded">PDF ডাউনলোড</button>
                </div>
              )}

              {m.role === 'model' && (m as any).suggestions && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(m as any).suggestions.map((s: string, i: number) => (
                    <button key={i} onClick={() => handleSend(s)} className="text-left text-xs p-2 bg-blue-50 border rounded-lg">{s}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white pb-8">
        <div className="max-w-2xl mx-auto flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 bg-slate-100 rounded-lg outline-none" placeholder="প্রশ্ন লিখুন..." />
          <button onClick={() => handleSend()} className="px-4 bg-emerald-600 text-white rounded-lg">পাঠান</button>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
