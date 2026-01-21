
import React, { useState, useEffect } from 'react';
import { View, Subject, ClassLevel, Group, ChatMessage, AppUser } from './types';
import Dashboard from './components/Dashboard';
import Tutor from './components/Tutor';
import Settings from './components/Settings';
import Translator from './components/Translator';
import News from './components/News';
import Navbar from './components/Navbar';
import History from './components/History';
import MCQ from './components/MCQ';
import Planner from './components/Planner';

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser>({ 
    name: 'সাঈদ এর ছাত্র', 
    department: 'হিসাববিজ্ঞান', 
    college: 'হাটহাজারী কলেজ' 
  });
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('saiyed_user_v2');
    const savedHistory = localStorage.getItem('saiyed_history_v2');
    const savedMode = localStorage.getItem('saiyed_dark_v2');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHistory) setChatHistories(JSON.parse(savedHistory));
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('saiyed_dark_v2', String(darkMode));
  }, [darkMode]);

  const handleUpdateHistory = (msgs: ChatMessage[]) => {
    if (!selectedSubject) return;
    const newHist = { ...chatHistories, [selectedSubject]: msgs };
    setChatHistories(newHist);
    localStorage.setItem('saiyed_history_v2', JSON.stringify(newHist));
  };

  const handleUpdateUser = (u: AppUser) => {
    setUser(u);
    localStorage.setItem('saiyed_user_v2', JSON.stringify(u));
  };

  return (
    <div className="flex flex-col fixed inset-0 w-full bg-white dark:bg-slate-950 transition-colors overflow-hidden font-['Hind_Siliguri']">
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 pt-4 scrollbar-hide relative">
        {currentView === View.DASHBOARD && (
          <Dashboard 
            user={user} 
            onStartTutor={(lvl, grp, sub) => { setSelectedSubject(sub); setCurrentView(View.TUTOR); }} 
            onGoToTranslator={() => setCurrentView(View.TRANSLATOR)} 
            onGoToNews={() => setCurrentView(View.NEWS)} 
            onGoToHistory={() => setCurrentView(View.HISTORY)} 
          />
        )}

        {currentView === View.TUTOR && selectedSubject && (
          <Tutor 
            user={user} 
            classLevel={ClassLevel.C10} 
            group={Group.GENERAL} 
            subject={selectedSubject} 
            history={chatHistories[selectedSubject] || []} 
            onUpdateHistory={handleUpdateHistory} 
            onBack={() => setCurrentView(View.DASHBOARD)} 
          />
        )}

        {currentView === View.TRANSLATOR && <Translator onBack={() => setCurrentView(View.DASHBOARD)} />}
        {currentView === View.NEWS && <News onBack={() => setCurrentView(View.DASHBOARD)} />}
        {currentView === View.HISTORY && (
          <History 
            user={user} chatHistories={chatHistories} 
            onSelectSubject={(s) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }} 
            onDeleteHistory={(s) => {
              const newHist = { ...chatHistories };
              delete newHist[s];
              setChatHistories(newHist);
              localStorage.setItem('saiyed_history_v2', JSON.stringify(newHist));
            }}
            onClearAll={() => { setChatHistories({}); localStorage.setItem('saiyed_history_v2', '{}'); }}
          />
        )}
        {currentView === View.SETTINGS && (
          <Settings user={user} darkMode={darkMode} setDarkMode={setDarkMode} onUpdateUser={handleUpdateUser} />
        )}
        {currentView === View.MCQ && <MCQ subject={selectedSubject || Subject.MATH} onFlagTopic={() => {}} flaggedTopics={[]} />}
        {currentView === View.PLANNER && <Planner initialWeakTopics={[]} onFlagTopic={() => {}} />}
      </main>

      {currentView !== View.TUTOR && (
        <Navbar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} />
      )}
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        main { padding-bottom: 6rem; height: 100%; }
      `}</style>
    </div>
  );
};

export default App;
