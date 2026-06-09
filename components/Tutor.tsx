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

// ==========================================
// প্রম্পট ব্যাংক (আগের মতোই অপরিবর্তিত)
// ==========================================
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

// ৫টি ভিন্ন ভিন্ন লোডিং মেসেজ
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

  useEffect(() => {
    const shuffledSaiyed = [...SAIYED_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, 2);
    const subjectPool = SUBJECT_PROMPTS[subject] || SUBJECT_PROMPTS["default"];
    const shuffledSubject = [...subjectPool].sort(() => 0.5 - Math.random()).slice(0, 2);
    const finalMixed = [...shuffledSaiyed, ...shuffledSubject].sort(() => 0.5 - Math.random());
    setInitialSuggestions(finalMixed);
  }, [subject, history.length === 0]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    const win = window as any;  
    if (win.renderMathInElement) {  
      setTimeout(() => {  
        win.renderMathInElement(document.body, {  
          delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
          throwOnError: false  
        });  
      }, 100);  
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

  // ✅ ফিক্সড: পিডিএফে সমীকরণ রেন্ডার এবং বাংলা ফন্ট ঠিক রাখার ফাংশন
  const handleDownloadPDF = (messageText: string) => {
    const win = window as any;
    if (!win.html2pdf) {
      alert("পিডিএফ লাইব্রেরিটি লোড হচ্ছে, ১ সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।");
      return;
    }

    // পিডিএফ জেনারেট করার জন্য একটি অফ-স্ক্রিন টেম্পোরারি এলিমেন্ট তৈরি
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '800px'; // স্ট্যান্ডার্ড পিডিএফ উইডথ

    // সমীকরণগুলোর জন্য $ বা $$ বজায় রেখে HTML তৈরি করা হচ্ছে
    const formattedHtml = messageText
      .split('\n')
      .map((line) => {
        if (line.trim().startsWith('###')) {
          return `<h2 style="font-size: 20px; font-weight: 800; margin-top: 22px; margin-bottom: 12px; border-left: 4px solid #10b981; padding-left: 10px; color: #059669; font-family: 'Hind Siliguri', sans-serif;">${line.replace('###', '').trim()}</h2>`;
        }
        const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #059669; font-weight: 700;">$1</strong>');
        return `<p style="font-size: 15px; margin-bottom: 12px; line-height: 1.8; color: #1e293b; font-family: 'Hind Siliguri', sans-serif;">${processedLine}</p>`;
      })
      .join('');

    // গুগল ফন্ট লিংক সহ লেআউট স্ট্রাকচার ইনজেক্ট করা হচ্ছে
    element.innerHTML = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;700&display=swap" rel="stylesheet">
      <div style="font-family: 'Hind Siliguri', sans-serif; padding: 40px; color: #1e293b; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 24px;">
          <h1 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800;">${subject} — লেকচার নোট</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">Generated by Saiyed AI Tutor</p>
        </div>
        <div class="pdf-content" style="letter-spacing: 0.2px;">${formattedHtml}</div>
      </div>
    `;

    document.body.appendChild(element);

    // পিডিএফ ডাউনলোডের আগে এই নির্দিষ্ট এলিমেন্টের ভেতর KaTeX সমীকরণ রেন্ডার করা হচ্ছে
    if (win.renderMathInElement) {
      win.renderMathInElement(element, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        throwOnError: false
      });
    }

    const options = {
      margin: 10,
      filename: `${subject}_Note.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: false // বাংলায় যুক্তাক্ষর ভেঙে যাওয়া রোধ করতে এটি 'false' রাখা জরুরি
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // ফন্ট এবং সমীকরণ লোড হওয়ার জন্য ৩০০ মিলিসেকেন্ড সময় দিয়ে পিডিএফ সেভ করা হচ্ছে
    setTimeout(() => {
      win.html2pdf().from(element).set(options).save().then(() => {
        document.body.removeChild(element);
      });
    }, 300);
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
    } catch (e) { onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: "⚠️ ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" }]); } finally { setLoading(false); }
  };

  // ✅ ফিক্সড: সমীকরণ সচল রাখতে এখান থেকে .replace(/\$/g, '') মুছে ফেলা হয়েছে
  const renderText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {  
      if (line.trim().startsWith('###')) return <h2 key={i} className="text-[20px] font-black mt-6 mb-3 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500 pl-3">{line.replace('###', '').trim()}</h2>;
      const processBold = (content: string) => content.split(/\*\*(.*?)\*\*/g).map((part, pi) => pi % 2 === 1 ? <strong key={pi} className="text-emerald-600 dark:text-emerald-400 font-extrabold">{part}</strong> : part);
      return <p key={i} className="text-[16px] mb-3 leading-relaxed tracking-normal">{processBold(line)}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-[#09090b]">
      {/* হেডার */}
      <header className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h2 className="text-[16px] font-black text-slate-800 dark:text-zinc-100">{subject}</h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">সাঈদ AI টিউটর সক্রিয়</p>
          </div>
        </div>
      </header>

      {/* চ্যাট বডি */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">  
        <div className="max-w-2xl mx-auto space-y-6">  
          
          {/* শুরুর সাজেশন স্ক্রিন */}
          {history.length === 0 && (
            <div className="py-12 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-inner">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <h1 className="text-2xl font-black mb-2 text-slate-800 dark:text-white tracking-tight">আজকে কি শিখতে চান?</h1>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8">নিচের যেকোনো একটি প্রশ্ন দিয়ে শুরু করতে পারেন</p>
              <div className="flex flex-col space-y-3 max-w-lg mx-auto">
                {initialSuggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)} className="p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl text-left font-bold text-[14px] text-slate-700 dark:text-zinc-300 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md hover:scale-[1.01] transition-all duration-200">{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* মেসেজ বাবল */}
          {history.map((m, i) => (  
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>  
              <div className={`${m.role === 'user' ? 'max-w-[85%] bg-emerald-600 text-white p-4 rounded-2xl rounded-br-sm shadow-sm' : 'w-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm'}`}>  
                
                {/* ডায়নামিক ৫-ধাপের লোডার */}
                {m.role === 'model' && i === history.length - 1 && loading && !m.text ? (
                  <div className="flex items-center space-x-3 py-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm transition-all duration-300">
                    <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="animate-pulse">{LOADING_MESSAGES[loadingStep]}</span>
                  </div>
                ) : (
                  <div className={`prose dark:prose-invert max-w-none ${m.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-zinc-200'}`}>
                    {renderText(m.text)}
                  </div>
                )}

                {/* PDF ডাউনলোড বাটন */}
                {m.role === 'model' && m.text && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                    <button
                      onClick={() => handleDownloadPDF(m.text)}
                      className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-black rounded-lg shadow-sm active:scale-95 transition-all"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      <span>PDF ডাউনলোড</span>
                    </button>
                  </div>
                )}
              </div>  

              {/* সাজেস্টেড প্রশ্নসমূহ */}
              {m.suggestions && m.suggestions.length > 0 && (  
                 <div className="mt-3 pt-1 flex flex-wrap gap-2 w-full">  
                   {m.suggestions.map((s, si) => (  
                     <button key={si} onClick={() => handleSend(s)} className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 text-[13px] font-bold rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 shadow-2xs transition-colors">{s}</button>  
                   ))}  
                 </div>  
              )}  
            </div>  
          ))}  
        </div>  
      </div>  

      {/* ইনপুট প্যানেল */}
      <div className="p-4 bg-white dark:bg-[#09090b] border-t border-slate-200 dark:border-zinc-800/80 pb-6 shadow-md backdrop-blur-lg">  
        <div className="max-w-2xl mx-auto flex items-center bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-200/50 dark:border-zinc-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-all duration-200">  
           <textarea   
             rows={1} 
             value={input} 
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSend();
               }
             }}
             placeholder="আপনার প্রশ্নটি এখানে লিখুন..."  
             className="flex-1 bg-transparent px-3 py-2.5 outline-none font-medium text-[15px] text-slate-800 dark:text-white resize-none placeholder-slate-400"  
           />  
           <button 
             onClick={() => handleSend()} 
             disabled={!input.trim() || loading} 
             className={`p-3 rounded-xl transition-all duration-200 ${!input.trim() || loading ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95'}`}
           >
             <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
           </button>  
        </div>  
      </div>  
    </div>
  );
};

export default Tutor;