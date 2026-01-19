
import React from 'react';

const SetupGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-['Hind_Siliguri'] overflow-y-auto pb-20">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mt-8 mb-10">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-blue-500/30">
              🚀
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 text-xs">
              ✓
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 mt-6">সাঈদ এআই সেটআপ গাইড</h1>
          <p className="text-sm text-slate-500 font-bold mt-2 leading-relaxed">
            অ্যাপটি সচল করতে Netlify-তে নিচের ভেরিয়েবলগুলো বসান।
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Section: AI Engine */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              ১. এআই ইঞ্জিন সেটআপ (Gemini)
            </h2>
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
               <p className="text-[11px] font-bold text-slate-500 mb-3">Netlify > Site Config > Environment Variables-এ গিয়ে এটি যোগ করুন:</p>
               <div className="bg-slate-50 p-3 rounded-xl font-mono text-[10px] border space-y-2">
                 <div className="flex justify-between border-b pb-1"><span className="text-blue-600 font-black">Key:</span> <span>API_KEY</span></div>
                 <div className="flex justify-between pt-1"><span className="text-emerald-600 font-black">Value:</span> <span className="truncate">আপনার Gemini Key</span></div>
               </div>
            </div>
          </section>

          {/* Section: Firebase Auth */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center">
              <span className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></span>
              ২. লগইন সিস্টেম সেটআপ (Firebase)
            </h2>
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
               <p className="text-[11px] font-bold text-slate-500">আপনার ফায়ারবেস কনসোল থেকে নিচের ৩টি তথ্য যোগ করুন:</p>
               
               <div className="bg-slate-50 p-3 rounded-xl font-mono text-[10px] border space-y-3">
                 <div>
                    <span className="text-orange-600 font-black block">Variable 1:</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="opacity-60 italic">FIREBASE_API_KEY</span>
                      <span className="text-[9px] bg-white px-2 rounded border">apiKey</span>
                    </div>
                 </div>
                 <div className="border-t pt-2">
                    <span className="text-orange-600 font-black block">Variable 2:</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="opacity-60 italic">FIREBASE_AUTH_DOMAIN</span>
                      <span className="text-[9px] bg-white px-2 rounded border">authDomain</span>
                    </div>
                 </div>
                 <div className="border-t pt-2">
                    <span className="text-orange-600 font-black block">Variable 3:</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="opacity-60 italic">FIREBASE_PROJECT_ID</span>
                      <span className="text-[9px] bg-white px-2 rounded border">projectId</span>
                    </div>
                 </div>
               </div>
            </div>
          </section>

          {/* Step 3: Refresh */}
          <section className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-white font-black text-center mb-4">সব সেট?</h3>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              অ্যাপ রিফ্রেশ করুন 🔄
            </button>
            <p className="text-[10px] text-slate-400 font-bold text-center mt-4">
              * পরিবর্তনগুলো কার্যকর হতে ১-২ মিনিট সময় লাগতে পারে।
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center pb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Developed by Saiyed</p>
          <div className="flex items-center justify-center space-x-4 opacity-40">
            <span className="text-xs font-bold text-slate-400">Hathazari College</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <span className="text-xs font-bold text-slate-400">01941652097</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SetupGuide;
