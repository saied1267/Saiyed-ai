
import React, { useState } from 'react';
import { AppUser } from '../types';

interface SettingsProps {
  user: AppUser;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onUpdateUser: (u: AppUser) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, darkMode, setDarkMode, onUpdateUser }) => {
  const [name, setName] = useState(user.name);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-['Hind_Siliguri']">
      <header>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">সেটিংস</h2>
        <p className="text-[11px] font-black text-emerald-500 uppercase mt-1 tracking-widest">ব্যক্তিগত প্রোফাইল ও অ্যাপ</p>
      </header>

      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6">ডেভেলপার তথ্য</h3>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl border border-white/10 backdrop-blur-md shadow-inner">👨‍💻</div>
          <div>
            <h4 className="text-2xl font-black tracking-tight">সাঈদ (Saiyed)</h4>
            <p className="text-[13px] font-bold text-emerald-400 opacity-90 italic">হিসাববিজ্ঞান বিভাগ</p>
            <p className="text-[11px] font-bold text-slate-400">হাটহাজারী কলেজ</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 opacity-70">
           <p className="text-[12px] font-medium leading-relaxed italic">"আমি সাঈদ, হাটহাজারী কলেজে হিসাববিজ্ঞান বিভাগে পড়ি। আমি আমার বন্ধুদের জন্য এই এআই অ্যাপটি তৈরি করেছি যাতে সবাই আধুনিক প্রযুক্তির সহায়তায় সহজে শিখতে পারে।"</p>
        </div>
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border dark:border-slate-800 shadow-sm space-y-8">
        <div>
          <label className="text-[11px] font-black uppercase text-slate-400 mb-3 block tracking-widest">আপনার নাম</label>
          <div className="flex space-x-2">
            <input 
              type="text" value={name} onChange={e=>setName(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none dark:text-white transition-all"
            />
            <button onClick={() => onUpdateUser({...user, name})} className="bg-slate-900 dark:bg-emerald-600 text-white px-6 rounded-2xl text-[11px] font-black uppercase active:scale-95 transition-all">সেভ</button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t dark:border-slate-800">
          <div>
            <p className="font-black text-[15px] text-slate-800 dark:text-slate-200">ডার্ক মোড</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">রাত বা কম আলোতে পড়ার জন্য</p>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-8 rounded-full transition-all relative ${darkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        
        <button onClick={() => { if(confirm('সব ডাটা মুছবেন?')) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4.5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/20 active:scale-95 transition-all">ক্লিয়ার অল ডাটা</button>
      </div>
      
      <p className="text-center text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-slate-700 py-10">Handcrafted by Saiyed</p>
    </div>
  );
};
export default Settings;
