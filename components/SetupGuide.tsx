
import React from 'react';

const SetupGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-6 font-['Hind_Siliguri'] overflow-y-auto pb-32">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mt-8 mb-10">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-blue-500/30">
              🛠️
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 text-xs font-black">
              FIX
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white mt-6">কনফিগারেশন সেটআপ</h1>
          <p className="text-sm text-slate-500 font-bold mt-2 leading-relaxed">
            এনভায়রনমেন্ট ভেরিয়েবল বাদ দিয়ে সরাসরি কোডে কি (Key) বসানোর নিয়ম।
          </p>
        </div>

        <div className="space-y-6">
          
          <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              কোথায় পাবেন এই কোডগুলো?
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">১</span>
                <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400">ফায়ারবেস কনসোলে গিয়ে উপরে বামে <span className="text-blue-600 font-black">Project Settings</span> (চাকা আইকন) এ ক্লিক করুন।</p>
              </div>
              <div className="flex space-x-3">
                <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">২</span>
                <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400">নিচে <span className="font-black text-slate-800 dark:text-white">Your Apps</span> সেকশনে আপনার ওয়েব অ্যাপের কনফিগ অবজেক্টটি পাবেন।</p>
              </div>
              <div className="flex space-x-3">
                <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">৩</span>
                <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400">সেখান থেকে <span className="text-emerald-600">apiKey</span>, <span className="text-emerald-600">appId</span> এবং <span className="text-emerald-600">messagingSenderId</span> কপি করে <span className="font-mono bg-slate-100 px-1">firebaseConfig.ts</span> ফাইলে বসিয়ে দিন।</p>
              </div>
            </div>
          </section>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">
              ✅ কোডে ভ্যালুগুলো বসিয়ে সেভ করার পর অ্যাপটি একবার রিফ্রেশ দিন। সবকিছু অটোমেটিক কাজ শুরু করবে!
            </p>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
          >
            সব সেট করা শেষ হলে রিফ্রেশ দিন 🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
