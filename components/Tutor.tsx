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
// প্রম্পট ব্যাংক
// ==========================================
const SAIYED_PROMPTS = [
  "সাঈদ সম্পর্কে বিস্তারিত জানতে চাই",
  "সাঈদ এআই এর নির্মাতা কে এবং এর লক্ষ্য কী?",
  "সাঈদ এর ব্যাকএন্ডে কোন প্রযুক্তির ব্যবহার করা হয়েছে?",
  "সাঈদ এআই কীভাবে জটিল সমস্যার সমাধান করে?",
  "সাঈদ এআই-এর বিশেষ ক্ষমতাগুলো কী কী?",
  "সাঈদ এআই কি আমাকে পরীক্ষার রুটিন বানাতে সাহায্য করতে পারবে?",
  "সাঈদ এআই তৈরি করার পেছনে মূল অনুপ্রেরণা কী ছিল?",
  "সাঈদ এআই এর ডাটা সিকিউরিটি বা নিরাপত্তা ব্যবস্থা কেমন?",
  "সাঈদ এআই কি বাংলা এবং ইংরেজি দুটোই ভালো বোঝে?",
  "সাঈদ এআই কে কীভাবে আরও কার্যকরভাবে ব্যবহার করা যায়?",
  "সাঈদ এর কাছ থেকে বেস্ট আউটপুট পাওয়ার ট্রিকস কী?",
  "সাঈদ এআই-এর ফিউচার বা আগামীতে কী কী ফিচার আসছে?",
  "সাঈদ এর সাথে ভয়েস চ্যাট বা কথা বলার কোনো সুযোগ আছে কি?",
  "সাঈদ কি কঠিন বিষয়ের নোট বা সামারি তৈরি করে দিতে পারে?"
];

const SUBJECT_PROMPTS: Record<string, string[]> = {
  "গণিত": [
    "গণিতের বেসিক ভয় দূর করার কিছু উপায় বলো",
    "বীজগণিতের সূত্রগুলো সহজে মনে রাখার ট্রিকস কী?",
    "জ্যামিতির উপপাদ্য মুখস্থ না করে কীভাবে বুঝবো?",
    "গণিত অলিম্পিয়াডের জন্য কীভাবে প্রস্তুতি নেওয়া উচিত?",
    "ক্যালকুলাসের মূল ধারণাটি সহজ ভাষায় বুঝিয়ে দাও",
    "ত্রিকোণমিতির বাস্তব জীবনের প্রয়োগগুলো কী কী?",
    "পাটিগণিতের জটিল লাভ-ক্ষতির অঙ্ক করার শর্টকাট নিয়ম দাও",
    "গণিত পরীক্ষার সময় টাইম ম্যানেজমেন্ট কীভাবে করব?"
  ],
  "ইংরেজি": [
    "ইংরেজি গ্রামারের টেন্স (Tense) সহজে চেনার উপায় কী?",
    "রাইটিং সেকশনে (Paragraph/Essay) ভালো করার কৌশল কী?",
    "সহজে নতুন নতুন English Vocabulary মনে রাখার উপায় কী?",
    "ইংরেজি ফ্রি-হ্যান্ড রাইটিং বা বানিয়ে লেখার দক্ষতা কীভাবে বাড়াবো?",
    "স্পোকেন ইংলিশ বা ইংরেজিতে কথা বলা শুরু করার গাইডলাইন দাও",
    "Right form of verbs এর প্রধান নিয়মগুলো সংক্ষেপে বুঝাও",
    "ইংরেজি রিডিং কমপ্রিহেনশন দ্রুত সলভ করার ট্রিকস কী?",
    "একটি ফরমাল ইমেইল লেখার সঠিক স্ট্রাকচার কেমন হওয়া উচিত?"
  ],
  "হিসাববিজ্ঞান": [
    "হিসাববিজ্ঞানের সোনালী সূত্র বা Golden Rules গুলো কী কী?",
    "ডেবিট ও ক্রেডিট নির্ণয় করার আধুনিক সমীকরণ পদ্ধতিটি বুঝাও",
    "দু-তরফা দাখিলা পদ্ধতি বা Double Entry System কেন এত জনপ্রিয়?",
    "হিসাব সমীকরণ A = L + OE এর প্রতিটি উপাদানের বিস্তারিত ব্যাখ্যা দাও",
    "রেওয়ামিল (Trial Balance) মেলা সত্ত্বেও কী কী ভুল থেকে যেতে পারে?",
    "আর্থিক বিবরণী (Financial Statements) এর ধাপগুলো সংক্ষেপে বলো",
    "অবচয় (Depreciation) ধার্য করার সরল রৈখিক ও ক্রমহ্রাসমান পদ্ধতির পার্থক্য কী?",
    "খতিয়ান এবং জাবেদার মধ্যে প্রধান গাঠনিক পার্থক্যগুলো কী কী?"
  ],
  "আইসিটি": [
    "আইসিটি বিষয়ের বাইনারি থেকে ডেসিমেলে রূপান্তরের নিয়মটি বুঝাও",
    "এইচটিএমএল (HTML) দিয়ে কীভাবে একটি বেসিক ওয়েবপেজ তৈরি করা হয়?",
    "সি প্রোগ্রামিং (C Programming) এর লুপ বা Loop কীভাবে কাজ করে?",
    "লজিক গেট (Logic Gates) যেমন: AND, OR, NOT গেট বুঝিয়ে দাও",
    "আইসিটির ডাটাবেজ ম্যানেজমেন্ট সিস্টেম (DBMS) এর কাজ কী?",
    "নেটওয়ার্ক টপোলজি (যেমন: Star, Mesh, Ring) এর মূল تফাতগুলো কী?",
    "সাইবার সিকিউরিটি বা তথ্যপ্রযুক্তি নিরাপত্তার প্রধান ঝুঁকিগুলো কী কী?",
    "ক্লাউড 컴퓨টিং কী এবং এটি বাস্তব জীবনে কেন গুরুত্বপূর্ণ?"
  ],
  "ফিন্যান্স": [
    "ফিন্যান্স ও ব্যাংকিং এর মূল ধারণাটি বুঝিয়ে দাও",
    "অর্থের সময়মূল্য (Time Value of Money) কী এবং এর গুরুত্ব কী?",
    "ঝুঁকি ও আয়ের মধ্যে মূল তফাত এবং সম্পর্কটি ব্যাখ্যা করো",
    "সরল মুনাফা এবং চক্রবৃদ্ধি মুনাফার মধ্যে পার্থক্য উদাহরণসহ দাও",
    "সুযোগ ব্যয় (Opportunity Cost) বলতে ফিন্যা্সে কী বোঝায়?",
    "শেয়ার, bond এবং ডিবেঞ্চারের মধ্যে প্রধান পার্থক্যগুলো কী?",
    "মূলধন বাজেটিং (Capital Budgeting) কেন করা হয় এবং এর পদ্ধতিগুলো কী?",
    "চলতি মূলধন এবং স্থায়ী মূলধনের মধ্যে পার্থক্য বুঝিয়ে বলো"
  ],
  "বাংলা": [
    "বাংলা ব্যাকরণের সমাস চেনার সহজ কোনো টেকনিক বা শর্টকাট আছে?",
    "বাংলা ২য় পত্রে সারাংশ বা সারসংক্ষেপ লেখার সঠিক নিয়ম কী?",
    "বাংলা প্রথম পত্রের সৃজনশীল প্রশ্নের 'গ' এবং 'ঘ' লেখার সঠিক কাঠামো দাও",
    "সন্ধি এবং সমাসের মধ্যে প্রধান পার্থক্যগুলো বুঝিয়ে বলো",
    "কারক ও বিভক্তি নির্ণয় করার সহজ উপায় কী?",
    "বাংলা বানানের নত্ব-বিধান ও ষত্ব-বিধান এর মূল নিয়মগুলো কী?",
    "শব্দের প্রকারভেদ (যৌগিক, রূঢ়ি, যোগরূঢ়) সহজে চেনার নিয়ম কী?",
    "বাংলা সাহিত্যের প্রধান প্রধান যুগবিভাগ সংক্ষেপে আলোচনা করো"
  ],
  "MS Word": [
    "MS Word-এ দ্রুত কাজ করার জন্য সেরা ১০টি কীবোর্ড শর্টকাট দাও",
    "একটি প্রফেশনাল জীবনবৃত্তান্ত বা Resume মেকিং গাইডলাইন দাও",
    "MS Word-এ টেবিল (Table) এবং কলাম কীভাবে কাস্টমাইজ করতে হয়?",
    "ডকুমেন্টে পেজ নাম্বার এবং হেডার-ফুটার সেট করার নিয়ম কী?",
    "MS Word-এ হাইপারলিংক এবং বুকমার্ক কীভাবে ব্যবহার করে?",
    "ম্যাক্রো (Macro) ব্যবহার করে কীভাবে কাজ অটোমেট করা যায়?"
  ],
  "MS Excel": [
    "MS Excel-এর সেরা ৫টি গাণিতিক ফর্মুলা (SUM, AVERAGE, IF) বুঝাও",
    "এক্সেলে VLOOKUP এবং XLOOKUP কীভাবে ব্যবহার করতে হয়?",
    "ডাটা ফিল্টারিং এবং সর্টিং (Sorting) করার সঠিক পদ্ধতি কী?",
    "এক্সেলে পিভট টেবিল (Pivot Table) দিয়ে কীভাবে বড় ডাটা এনালাইসিস করে?",
    "চার্ট বা গ্রাফের মাধ্যমে এক্সেলে ডাটা ভিজ্যুয়ালাইজ করার নিয়ম কী?",
    "কন্ডিশনাল ফরম্যাটিং (Conditional Formatting) এর চমৎকার কিছু ব্যবহার দেখাও"
  ],
  "PowerPoint": [
    "একটি আকর্ষণীয় ও প্রফেশনাল প্রেজেন্টেশন স্লাইড বানানোর ট্রিকস কী?",
    "পাওয়ারপয়েন্টে 'Morph Transition' এর চমৎকার ব্যবহার কীভাবে করে?",
    "স্লাইডে অ্যানিমেশন এবং ট্রানজিশনের মধ্যে মূল তফাত কী?",
    "প্রেজেন্টেশনে ভিডিও এবং অডিও ফাইল যুক্ত ও ট্রিম করার নিয়ম কী?",
    "স্লাইড মাস্টার (Slide Master) ব্যবহার করে কীভাবে কাস্টম টেমপ্লেট বানাবো?",
    "প্রেজেন্টেশন দেওয়ার সময় নার্ভাসনেস দূর করার কিছু কার্যকরী টিপস দাও"
  ],
  "default": [
    "এই বিষয়ের মূল সিলেবাস এবং রোডম্যাপটি দাও",
    "পরীক্ষার জন্য কোন কোন অধ্যায় সবচেয়ে গুরুত্বপূর্ণ?",
    "কঠিন টপিকগুলো সহজে মনে রাখার কোনো সাইকোলজিক্যাল ট্রিক আছে?",
    "এই বিষয়ের বেসিক থেকে অ্যাডভান্সড হওয়ার গাইডলাইন দাও"
  ]
};

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

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : 0));
      }, 1500); 
    }
    return () => clearInterval(interval);
  }, [loading]);

  // ==========================================
  // পিডিএফ তৈরীর ফাংশন
  // ==========================================
  const handleDownloadPDF = (messageText: string) => {
    const win = window as any;
    if (!win.html2pdf) {
      alert("পিডিএফ লাইব্রেরিটি এখনও লোড হয়নি। দয়া করে public/index.html ফাইলে স্ক্রিপ্ট ট্যাগটি যুক্ত করুন এবং পেজ রিফ্রেশ দিন।");
      return;
    }

    const element = document.createElement('div');
    let cleanText = messageText.replace(/\*\*/g, '').replace(/###/g, ''); 

    element.innerHTML = `
      <div style="font-family: 'Hind Siliguri', Arial, sans-serif; padding: 40px; color: #1e293b; background-color: #ffffff;">
        <div style="border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0; font-size: 26px; font-weight: 900;">${subject} — লেকচার নোট</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px; font-weight: 700;">Saiyed AI Tutor 🟢</p>
        </div>
        <div style="font-size: 16px; line-height: 1.9; white-space: pre-wrap; color: #334155;">
          ${cleanText}
        </div>
      </div>
    `;

    const options = {
      margin: 15,
      filename: `${subject}_সাঈদ_এআই_নোট_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    win.html2pdf().from(element).set(options).save();
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
      await getTutorResponseStream(  
        msgText, { classLevel, group, subject, user },  
        currentHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),  
        (streamedText) => {  
          let cleanText = streamedText;  
          let suggestions: string[] = [];  

          const sugMatch = streamedText.match(/\[SUGGESTIONS:\s*(.*?)\]/i); 
          if (sugMatch) {  
            cleanText = streamedText.replace(sugMatch[0], '').trim();  
            suggestions = sugMatch[1].split(',').map(s => s.trim());  
          }  

          onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: cleanText, suggestions }]);  
        }  
      );  
    } catch (e) {   
      console.error(e);  
      onUpdateHistory([...currentHistory, { ...aiPlaceholder, text: "⚠️ এআই সার্ভারে সংযোগ বিচ্ছিন্ন হয়েছে। সাঈদ এর সাথে যোগাযোগ করুন।" }]);  
    }  
    finally { setLoading(false); }
  };

  const renderText = (text: string) => {
    if (!text) return null;
    let processedText = text.replace(/\$/g, '');   

    return processedText.split('\n').map((line, i) => {  
      if (line.trim().startsWith('###')) {  
        return (  
          <h2 key={i} className="text-[28px] font-black text-slate-900 dark:text-white mt-10 mb-6 leading-tight tracking-tight border-l-8 border-emerald-500 pl-4 py-1">  
            {line.replace('###', '').trim()}  
          </h2>  
        );  
      }  

      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim());  
      const processBold = (content: string) => {  
        return content.split(/\*\*(.*?)\*\*/g).map((part, pi) =>   
          pi % 2 === 1 ? <strong key={pi} className="font-black text-emerald-600 dark:text-emerald-400">{part}</strong> : part  
        );  
      };  

      if (!line.trim()) return <div key={i} className="h-4" />;  

      return (  
        <p key={i} className={`text-[18px] font-medium leading-[1.8] text-slate-700 dark:text-slate-300 mb-4 ${isBullet ? 'pl-6 relative before:content-["•"] before:absolute before:left-0 before:text-emerald-500 before:font-black' : ''}`}>  
          {processBold(line)}  
        </p>  
      );  
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#0d0d0d] font-['Hind_Siliguri']">
      <header className="px-5 py-4 flex items-center justify-between border-b dark:border-white/5 bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h2 className="text-[16px] font-black dark:text-white leading-none">{subject}</h2>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 animate-pulse">Saiyed AI Tutor 🟢</p>
          </div>
        </div>
        <button onClick={() => { if(confirm('চ্যাট মুছবেন?')) onUpdateHistory([]) }} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-0 pt-8 pb-32 scroll-smooth">  
        <div className="max-w-2xl mx-auto space-y-12">  
          {history.length === 0 && (  
            <div className="py-24 text-center animate-in fade-in zoom-in-95">  
               <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto mb-8 shadow-2xl">S</div>  
               <h1 className="text-3xl font-black mb-4 dark:text-white">কি শিখতে চান?</h1>  
               <p className="text-slate-400 font-bold mb-10">আপনার যেকোনো প্রশ্ন এখানে করুন।</p>  
               <div className="grid grid-cols-1 gap-3">  
                  {initialSuggestions.map((s, i) => (  
                    <button key={i} onClick={() => handleSend(s)} className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-[15px] font-bold text-slate-600 dark:text-slate-400 text-left hover:border-emerald-500/50 transition-all cursor-pointer">{s}</button>  
                  ))}  
               </div>  
            </div>  
          )}  

          {history.map((m, i) => (  
            <div key={i} className={`flex flex-col space-y-4 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>  
              <div className={`${m.role === 'user' ? 'max-w-[85%] bg-slate-100 dark:bg-white/10 dark:text-white rounded-3xl px-6 py-4 shadow-sm' : 'w-full'}`}>  
                {m.role === 'model' && i === history.length - 1 && loading && !m.text ? (  
                   <div className="py-8 space-y-4">  
                     <div className="flex items-center space-x-3 text-emerald-500">  
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>  
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>  
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>  
                     </div>  
                     <p className="text-[13px] font-black text-emerald-600 tracking-tight uppercase animate-pulse">
                        {loadingStep === 0 && "Saiyed AI গভীরভাবে চিন্তা করছে..."}
                        {loadingStep === 1 && "সাঈদ এআই গভীরভাবে বিশ্লেষণ করছে..."}
                        {loadingStep === 2 && "প্রয়োজনীয় তথ্য খুঁজে দেখা হচ্ছে..."}
                        {loadingStep === 3 && "শুদ্ধতা যাচাই করে নেওয়া হচ্ছে..."}
                        {loadingStep === 4 && "সাঈদ এআই উত্তর লিখছে..."}
                     </p>  
                   </div>  
                ) : (  
                  <div className="prose dark:prose-invert max-w-none">  
                    {renderText(m.text)}  
                  </div>  
                )}  

                {/* এআই মেসেজ সফলভাবে শেষ হলে এবং টেক্সট থাকলে পিডিএফ বাটন রিণ্ডার হবে */}
                {m.role === 'model' && m.text && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDownloadPDF(m.text)}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 dark:bg-white/5 dark:hover:bg-emerald-500/10 dark:text-slate-300 dark:hover:text-emerald-400 text-[13px] font-bold rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none" className="mr-1">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                      </svg>
                      PDF ডাউনলোড করুন
                    </button>
                  </div>
                )}

                {m.suggestions && m.suggestions.length > 0 && (  
                   <div className="mt-12 flex flex-wrap gap-3 relative z-10">  
                     {m.suggestions.map((s, si) => (  
                       <button 
                         key={si} 
                         type="button"
                         onClick={() => handleSend(s)} 
                         className="px-5 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[13px] font-black rounded-full border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
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

      <div className="p-4 bg-white dark:bg-[#0d0d0d] pb-8 border-t dark:border-white/5">  
        <div className="max-w-2xl mx-auto flex items-end bg-slate-100 dark:bg-white/5 p-2 rounded-[2rem] border dark:border-white/10 shadow-inner">  
           <textarea   
             rows={1}  
             value={input}  
             onChange={(e) => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px'; }}  
             onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}  
             placeholder="Saiyed AI-কে প্রশ্ন করুন..."  
             className="flex-1 bg-transparent px-5 py-4 outline-none font-bold text-[18px] dark:text-white resize-none max-h-48"  
           />  
           <button   
             onClick={() => handleSend()} disabled={!input.trim() || loading}  
             className={`p-4 rounded-full transition-all flex-shrink-0 ${input.trim() ? 'bg-emerald-600 text-white shadow-lg active:scale-90' : 'text-slate-300 dark:text-white/10 bg-slate-200 dark:bg-white/5'}`}  
           >  
             <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>  
           </button>  
        </div>  
      </div>  
    </div>
  );
};

export default Tutor;