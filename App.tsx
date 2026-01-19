
import React, { useState, useEffect } from 'react';
import { View, Subject, ClassLevel, Group, ChatMessage, ChatTheme, User } from './types';
import Dashboard from './components/Dashboard';
import Tutor from './components/Tutor';
import Settings from './components/Settings';
import Translator from './components/Translator';
import News from './components/News';
import Navbar from './components/Navbar';
import History from './components/History';
import MCQ from './components/MCQ';
import Planner from './components/Planner';
import SetupGuide from './components/SetupGuide';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [subjectThemes, setSubjectThemes] = useState<Record<string, ChatTheme>>({});
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [showSetup, setShowSetup] = useState(false);

  const isApiConfigured = Boolean(
    (process.env.API_KEY && process.env.API_KEY !== "") ||
    (process.env.API_KEY_2 && process.env.API_KEY_2 !== "")
  );

  const isFirebaseConfigured = Boolean(
    process.env.FIREBASE_API_KEY && 
    process.env.FIREBASE_AUTH_DOMAIN && 
    process.env.FIREBASE_PROJECT_ID
  );

  useEffect(() => {
    const savedUser = localStorage.getItem('saiyed_ai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleStartTutor = (lvl: ClassLevel, grp: Group, sub: Subject) => {
    setSelectedClass(lvl);
    setSelectedGroup(grp);
    setSelectedSubject(sub);
    setCurrentView(View.TUTOR);
  };

  const handleFlagTopic = (topic: string) => {
    setWeakTopics((prev) => (prev.includes(topic) ? prev : [...prev, topic]));
  };

  const handleLogout = () => {
    localStorage.removeItem('saiyed_ai_user');
    setUser(null);
    setCurrentView(View.DASHBOARD);
  };

  if (showSetup) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowSetup(false)} 
          className="fixed top-4 right-4 z-[100] bg-white dark:bg-slate-900 p-2 rounded-full shadow-lg font-black text-xs border dark:border-slate-700"
        >
          বন্ধ করুন ✕
        </button>
        <SetupGuide />
      </div>
    );
  }

  return (
    <div className={`flex flex-col fixed inset-0 w-full bg-gray-50 dark:bg-slate-950 transition-colors ${darkMode ? 'dark' : ''}`}>
      {(!isApiConfigured || !isFirebaseConfigured) && currentView !== View.TUTOR && currentView !== View.AUTH && (
        <div className="bg-orange-500 text-white text-[10px] py-2 text-center font-black uppercase tracking-widest flex items-center justify-center space-x-2 shadow-md">
          <span>⚠️ {!isApiConfigured ? 'AI ইঞ্জিন' : 'লগইন সিস্টেম'} সেটআপ করা নেই</span>
          <button onClick={() => setShowSetup(true)} className="underline ml-2 bg-white/20 px-2 py-0.5 rounded">কিভাবে করবেন?</button>
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 pt-4 scrollbar-hide">
        {currentView === View.AUTH && (
          <Auth onLogin={(userData: User) => { setUser(userData); setCurrentView(View.DASHBOARD); }} onBack={() => setCurrentView(View.DASHBOARD)} />
        )}

        {currentView === View.DASHBOARD && (
          <Dashboard
            user={user}
            onStartTutor={handleStartTutor}
            onGoToPlanner={() => setCurrentView(View.PLANNER)}
            onGoToTranslator={() => setCurrentView(View.TRANSLATOR)}
            onGoToNews={() => setCurrentView(View.NEWS)}
            weakTopics={weakTopics}
          />
        )}

        {currentView === View.TUTOR && selectedSubject && selectedClass && selectedGroup && (
          <Tutor
            classLevel={selectedClass}
            group={selectedGroup}
            subject={selectedSubject}
            history={chatHistories[selectedSubject] || []}
            onUpdateHistory={(msgs: ChatMessage[]) => setChatHistories({ ...chatHistories, [selectedSubject]: msgs })}
            onBack={() => setCurrentView(View.DASHBOARD)}
            theme={subjectThemes[selectedSubject] || 'emerald'}
            onUpdateTheme={(t: ChatTheme) => setSubjectThemes({ ...subjectThemes, [selectedSubject]: t })}
          />
        )}

        {currentView === View.TRANSLATOR && <Translator onBack={() => setCurrentView(View.DASHBOARD)} />}
        
        {currentView === View.NEWS && <News onBack={() => setCurrentView(View.DASHBOARD)} />}

        {currentView === View.HISTORY && (
          <History
            chatHistories={chatHistories}
            onSelectSubject={(s: Subject) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }}
            onDeleteHistory={(s: string) => {
              const newHist = { ...chatHistories };
              delete newHist[s];
              setChatHistories(newHist);
            }}
            onClearAll={() => setChatHistories({})}
          />
        )}

        {currentView === View.MCQ && (
          <MCQ
            subject={selectedSubject || Subject.MATH}
            onFlagTopic={handleFlagTopic}
            flaggedTopics={weakTopics}
          />
        )}

        {currentView === View.PLANNER && (
          <Planner
            initialWeakTopics={weakTopics}
            onFlagTopic={handleFlagTopic}
          />
        )}

        {currentView === View.SETTINGS && (
          <Settings
            user={user}
            onGoToAuth={() => setCurrentView(View.AUTH)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            language="bn"
            setLanguage={() => {}}
            chatTheme="blue"
            setChatTheme={() => {}}
            chatBackground="plain"
            setChatBackground={() => {}}
            isFullscreen={false}
            onToggleFullscreen={() => {}}
            onResetAll={() => {
              setChatHistories({});
              setWeakTopics([]);
              handleLogout();
            }}
          />
        )}
      </main>

      {currentView !== View.TUTOR && currentView !== View.AUTH && (
        <Navbar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} />
      )}
    </div>
  );
};

export default App;
    
