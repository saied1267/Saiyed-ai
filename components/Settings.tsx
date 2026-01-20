
import React, { useState } from 'react';
import { AppUser } from '../types';

interface SettingsProps {
  user: AppUser | null;
  onUpdateInterests: (interests: string[]) => void;
  onGoToAuth: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onResetAll: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, onUpdateInterests, onGoToAuth, darkMode, setDarkMode, onResetAll
}) => {
  const [interestInput, setInterestInput] = useState('');

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = interestInput.trim();
    if (!cleanInput || !user) return;
    
    const current = user.interests || [];
    if (!current.includes(cleanInput)) {
      onUpdateInterests([...current, cleanInput]);
    }
    setInterestInput('');
  };

  const removeInterest = (interest: string) => {
    if (!user) return;
    onUpdateInterests(user.interests.filter(i => i !== interest));
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-['Hind_Siliguri']">
      <header className="px-1">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">সেটিংস</h2>
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">আপনার প্রোফাইল ও অ্যাপ সেটিংস</p>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">পার্সোনাল প্রোফাইল</h3>
        
        {user ? (
          <div className="space-y-10">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.8rem] flex items-center justify-center text-2xl font-black shadow-xl shadow-emerald-500/10 overflow-hidden border-2 border-white dark:border-slate-800">
                {user.photoURL ? (
                   <img src={user.photoURL} alt="p" className="w-full h-full object-cover" />
                ) : (
                  user.name[0]
                )}
              </div>
              <div>
                <p className="font-black text-xl text-slate-800 dark:text-white leading-tight">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">{user.email}</p>
              </div>
            </div>

            <div className="space-y-5 pt-8 border-t dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">আপনার আগ্রহসমূহ:</h4>
                <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">স্মার্ট লার্নিং</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, i) => (
                    <span key={i} className="group px-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-[11px] font-black rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center transition-all hover:border-red-200">
                      {interest}
                      <button onClick={() => removeInterest(interest)} className="ml-3 text-red-500/40 hover:text-red-500 transition-colors">✕</button>
                    </span>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 font-bold italic py-2">এখনো কোনো আগ্রহ যোগ করা হয়নি।</p>
                )}
              </div>
              
              <form onSubmit={handleAddInterest} className="flex space-x-2 pt-2">
                <input 
                  type="text" value={interestInput} onChange={e => setInterestInput(e.target.value)}
                  placeholder="যেমন: মহাকাশ বিজ্ঞান..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-emerald-500 rounded-[1.2rem] px-5 py-3 text-[12px] font-bold outline-none dark:text-white transition-all shadow-inner"
                />
                <button type="submit" className="bg-slate-900 dark:bg-emerald-600 text-white px-6 rounded-[1.2rem] text-[11px] font-black uppercase shadow-lg active:scale-95 transition-all">যোগ</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 space-y-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl grayscale opacity-30">👤</div>
            <p className="text-xs text-slate-400 font-bold text-center px-6">প্রোফাইল সেভ করতে এবং সব ডাটা ক্লাউডে রাখতে লগইন করুন।</p>
            <button onClick={onGoToAuth} className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">লগইন করুন</button>
          </div>
        )}
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-3 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-colors">
          <div className="flex items-center space-x-5">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-lg">🌙</div>
            <div>
              <p className="font-black text-[15px] text-slate-800 dark:text-slate-200">ডার্ক মোড</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">অন্ধকারে পড়ার জন্য</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-7 rounded-full transition-all relative ${darkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${darkMode ? 'left-8' : 'left-1'}`} />
          </button>
        </div>

        <div className="p-2 pt-4">
          <button onClick={onResetAll} className="w-full py-5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] active:scale-[0.98] transition-all border border-red-100/50 dark:border-red-900/20">
            রিসেট ও লগআউট
          </button>
        </div>
      </div>

      <div className="text-center pt-6 opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.4em]">Saiyed AI • v2.0.1</p>
      </div>
    </div>
  );
};

export default Settings;
