
import React, { useState } from 'react';
import { AppUser } from '../types';

interface SettingsProps {
  user: AppUser | null;
  onUpdateInterests: (interests: string[]) => void;
  onGoToAuth: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onResetAll: () => void;
  onUpdateName: (name: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, onUpdateInterests, onGoToAuth, darkMode, setDarkMode, onResetAll, onUpdateName
}) => {
  const [interestInput, setInterestInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');

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

  const handleSaveName = () => {
    if (tempName.trim() && tempName !== user?.name) {
      onUpdateName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 font-['Hind_Siliguri'] px-1 bg-white dark:bg-slate-950 min-h-screen">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">সেটিংস</h2>
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">প্রোফাইল ও অ্যাপ সেটিংস</p>
      </header>

      {/* Developer Information Card */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-emerald-950 dark:to-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 relative z-10">ডেভেলপার তথ্য</h3>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/10 backdrop-blur-sm">👨‍💻</div>
          <div>
            <h4 className="text-xl font-black leading-tight">সাঈদ (Saiyed)</h4>
            <p className="text-[11px] font-bold text-emerald-400">হাটহাজারী কলেজ, চট্টগ্রাম</p>
          </div>
        </div>
        <p className="text-[12px] font-medium text-slate-300 mt-4 leading-relaxed relative z-10">
          "সাঈদ এআই" একটি পার্সোনাল লার্নিং প্রজেক্ট যা বাংলাদেশি শিক্ষার্থীদের জন্য বিশেষভাবে তৈরি করা হয়েছে।
        </p>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border-2 border-slate-50 dark:border-slate-800">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">পার্সোনাল প্রোফাইল</h3>
        
        {user ? (
          <div className="space-y-10">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.8rem] flex items-center justify-center text-2xl font-black overflow-hidden border-2 border-white">
                {user.photoURL ? <img src={user.photoURL} alt="p" className="w-full h-full object-cover" /> : user.name[0]}
              </div>
              <div className="flex-1">
                {isEditingName ? (
                  <div className="space-y-2">
                    <input 
                      type="text" value={tempName} onChange={e => setTempName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500 rounded-xl px-4 py-2 text-sm font-bold outline-none dark:text-white"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button onClick={handleSaveName} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-[10px] font-black uppercase">সেভ করুন</button>
                      <button onClick={() => setIsEditingName(false)} className="px-4 bg-slate-100 text-slate-500 py-2 rounded-xl text-[10px] font-black uppercase">বাতিল</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-xl text-slate-800 dark:text-white">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                    </div>
                    <button onClick={() => setIsEditingName(true)} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">নাম বদলান</button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5 pt-8 border-t dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">আপনার আগ্রহসমূহ:</h4>
              <div className="flex flex-wrap gap-2.5">
                {user.interests?.map((interest, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-[11px] font-black rounded-2xl border border-slate-100 dark:border-slate-800">
                    {interest}
                  </span>
                ))}
              </div>
              
              <form onSubmit={handleAddInterest} className="flex space-x-2 pt-2">
                <input 
                  type="text" value={interestInput} onChange={e => setInterestInput(e.target.value)}
                  placeholder="যেমন: মহাকাশ বিজ্ঞান..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-emerald-500 rounded-[1.2rem] px-5 py-3 text-[12px] font-bold outline-none dark:text-white"
                />
                <button type="submit" className="bg-slate-900 dark:bg-emerald-600 text-white px-6 rounded-[1.2rem] text-[11px] font-black uppercase">যোগ</button>
              </form>
            </div>
          </div>
        ) : (
          <button onClick={onGoToAuth} className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl">লগইন করুন</button>
        )}
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-3 shadow-sm border-2 border-slate-50 dark:border-slate-800">
        <div className="flex items-center justify-between p-5">
          <p className="font-black text-[15px] text-slate-800 dark:text-slate-200">ডার্ক মোড</p>
          <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-7 rounded-full transition-all relative ${darkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${darkMode ? 'left-8' : 'left-1'}`} />
          </button>
        </div>
        <div className="p-2 pt-4">
          <button onClick={() => { if(confirm('লগআউট করতে চান?')) onResetAll(); }} className="w-full py-5 bg-red-50 text-red-500 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em]">লগআউট</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
