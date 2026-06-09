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

const SAIYED_PROMPTS = [
  "সাঈদ সম্পর্কে বিস্তারিত জানতে চাই", "সাঈদ এআই এর নির্মাতা কে এবং এর লক্ষ্য কী?", 
  "সাঈদ এর ব্যাকএন্ডে কোন প্রযুক্তির ব্যবহার করা হয়েছে?", "সাঈদ এআই কীভাবে জটিল সমস্যার সমাধান করে?", 
  "সাঈদ এআই-এর বিশেষ ক্ষমতাগুলো কী কী?", "সাঈদ এআই কি আমাকে পরীক্ষার রুটিন বানাতে সাহায্য করতে পারবে?", 
  "সাঈদ এআই তৈরি করার পেছনে মূল অনুপ্রেরণা কী ছিল?", "সাঈদ এআই এর ডাটা সিকিউরিটি বা নিরাপত্তা ব্যবস্থা কেমন?", 
  "সাঈদ এআই কি বাংলা এবং ইংরেজি দুটোই ভালো বোঝে?", "সাঈদ এআই কে কীভাবে আরও কার্যকরভাবে ব্যবহার করা যায়?", 
  "সাঈদ এর কাছ থেকে বেস্ট আউটপুট পাওয়ার ট্রিকস কী?", "সাঈদ এআই-এর ফিউচার বা আগামীতে কী কী ফিচার আসছে?", 
  "সাঈদ এর সাথে ভয়েস চ্যাট বা কথা বলার কোনো সুযোগ আছে কি?", "সাঈদ কি কঠিন বিষয়ের নোট বা সামারি তৈরি করে দিতে পারে?"
];

const SUBJECT_PROMPTS: Record<string, string[]> = {
  "গণিত": ["গণিতের বেসিক ভয় দূর করার কিছু উপায় বলো", "বীজগণিতের সূত্রগুলো সহজে মনে রাখার ট্রিকস কী?", "জ্যামিতির উপপাদ্য মুখস্থ না করে কীভাবে বুঝবো?"],
  "ইংরেজি": ["ইংরেজি গ্রামারের টেন্স (Tense) সহজে চেনার উপায় কী?", "সহজে নতুন নতুন English Vocabulary মনে রাখার উপায় কী?"],
  "default": ["এই বিষয়ের মূল সিলেবাস এবং রোডম্যাপটি দাও", "পরীক্ষার জন্য কোন কোন অধ্যায় সবচেয়ে গুরুত্বপূর্ণ?"]
};

const LOADING_MESSAGES = [
  "সাঈদ এআই গভীরভাবে ভাবছে...",
  "আপনার প্রশ্নটি বিশ্লেষণ করা হচ্ছে...",
  "সঠিক এবং তথ্যবহুল উত্তর সাজানো হচ্ছে...",
  "আপনার ক্লাসের মান অনুযায়ী লেকচার নোট তৈরি হচ্ছে...",
  "আর মাত্র কয়েক মুহূর্ত, উত্তর প্রস্তুত করা হচ্ছে..."
];

const Tutor: React.FC<TutorProps> = ({ user, subject, history, onUpdateHistory, onBack, classLevel, group }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); 
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]); 
  const scrollRef = useRef<HTMLDivElement>(null);

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
    return processedText.split('\n').map((line, i) => {  
      if (line.trim().startsWith('###')) {
        return <h2 key={i} className="text-[19px] font-bold mt-5 mb-2 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500 pl-3">{line.replace('###', '').trim()}</h2>;
      }
      return <p key={i} className="text-[15px] mb-3 leading-relaxed">{renderLineContent(line)}</p>;
    });
  };

  const handleDownloadPDF = async (messageText: string) => {
    const win = window as any;
    if (!win.html2pdf) {
      alert("PDF Library not loaded");
      return;
    }

    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '800px',
      backgroundColor: '#ffffff',
      zIndex: '-10000',
      opacity: '1'
    });

    const processedText = autoWrapMathDelimiters(messageText);
    const formattedHtml = processedText.split('\n').map((line) => {
      if (line.trim().startsWith('###')) {
        return `<h2 style="font-size: 22px; font-weight: 700; margin: 25px 0 15px 0; border-left: 5px solid #10b981; padding-left: 12px; color: #059669; font-family: 'Hind Siliguri', sans-serif;">${line.replace('###', '').trim()}</h2>`;
      }
      const tokens = line.split(/(\$\$.*?\$\$|\$.*?\$)/g);
      const lineHtml = tokens.map((token) => {
        if (token.startsWith('$$') && token.endsWith('$$')) return win.katex.renderToString(token.slice(2, -2), { displayMode: true });
        if (token.startsWith('$') && token.endsWith('$')) return win.katex.renderToString(token.slice(1, -1), { displayMode: false });
        return token.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #059669; font-weight: 700;">$1</strong>');
      }).join('');
      return `<p style="font-size: 16px; margin-bottom: 15px; line-height: 1.8; color: #1e293b; font-family: 'Hind Siliguri', sans-serif;">${lineHtml}</p>`;
    }).join('');

    container.innerHTML = `
      <div style="padding: 50px; background-color: #white; font-family: 'Hind Siliguri', sans-serif;">
        <div style="border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 30px;">
          <h1 style="color: #059669; font-size: 24px; margin: 0;">${subject} লেকচার নোট</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 5px;">Generated by Saiyed AI Tutor | তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
        </div>
        ${formattedHtml}
      </div>
    `;

    document.body.appendChild(container);
    await document.fonts.ready;

    const opt = {
      margin: 10,
      filename: `${subject}_note.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(async () => {
      await win.html2pdf().from(container).set(opt).save();
      document.body.removeChild(container);
    }, 500);
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
        if (sugMatch) { cleanText = streamedText.replace(sugMatch[0], '').trim(); suggestions = sugMatch[1].split(',').map(s => s.trim()); }  
        onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: cleanText, suggestions }]);  
      });  
    } catch (e) { onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: "⚠️ সমস্যা হয়েছে। আবার চেষ্টা করুন।" }]); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-[#09090b]">
      <header className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h2 className="text-[16px] font-bold text-slate-800 dark:text-zinc-100">{subject}</h2>
            <p className="text-[11px] text-emerald-600 font-bold">সাঈদ AI সক্রিয়</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">  
        <div className="max-w-2xl mx-auto space-y-6">  
          {history.length === 0 && (
            <div className="py-12 text-center">
              <h1 className="text-2xl font-bold mb-8 text-slate-800 dark:text-white">আজকে কী শিখতে চান?</h1>
              <div className="flex flex-col space-y-3">
                {initialSuggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)} className="p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl text-left font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-500 transition-all">{s}</button>
                ))}
              </div>
            </div>
          )}

          {history.map((m, i) => (  
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>  
              <div className={`${m.role === 'user' ? 'max-w-[85%] bg-emerald-600 text-white p-4 rounded-2xl rounded-br-sm' : 'w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 rounded-2xl shadow-sm'}`}>  
                {m.role === 'model' && i === history.length - 1 && loading && !m.text ? (
                  <div className="flex items-center space-x-3 py-3 text-emerald-500 font-bold animate-pulse">
                    <span>{LOADING_MESSAGES[loadingStep]}</span>
                  </div>
                ) : (
                  <div className={`prose dark:prose-invert max-w-none ${m.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-zinc-200'}`}>
                    {renderText(m.text)}
                  </div>
                )}
                {m.role === 'model' && m.text && (
                  <div className="mt-4 pt-3 border-t dark:border-zinc-800 flex justify-end">
                    <button onClick={() => handleDownloadPDF(m.text)} className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500 text-white text-[12px] font-bold rounded-lg hover:bg-emerald-600 transition-all">
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      <span>PDF ডাউনলোড</span>
                    </button>
                  </div>
                )}
              </div>  
              {m.suggestions && m.suggestions.length > 0 && (  
                 <div className="mt-3 flex flex-wrap gap-2 w-full">  
                   {m.suggestions.map((s, si) => (  
                     <button key={si} onClick={() => handleSend(s)} className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[13px] font-bold rounded-xl border border-emerald-100 dark:border-emerald-900/30">{s}</button>  
                   ))}  
                 </div>  
              )}  
            </div>  
          ))}  
        </div>  
      </div>  

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
           <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="p-2.5 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
             <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
           </button>  
        </div>  
      </div>  
    </div>
  );
};

export default Tutor;