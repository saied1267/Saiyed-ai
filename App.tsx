
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Subject, ClassLevel, Group, ChatMessage, ChatTheme, AppUser } from './types';
import Dashboard from './components/Dashboard';
import Tutor from './components/Tutor';
import Settings from './components/Settings';
import Translator from './components/Translator';
import News from './components/News';
import Navbar from './components/Navbar';
import History from './components/History';
import MCQ from './components/MCQ';
import Planner from './components/Planner';
import Auth from './components/Auth';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [subjectThemes, setSubjectThemes] = useState<Record<string, ChatTheme>>({});
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial local load
  useEffect(() => {
    const savedUser = localStorage.getItem('saiyed_ai_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedMode = localStorage.getItem('saiyed_ai_dark_mode');
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  // Sync from Cloud (Real-time)
  useEffect(() => {
    if (!user?.uid || !isFirebaseConfigured) return;

    setIsSyncing(true);
    const userDocRef = doc(db, 'users', user.uid);

    const unsubUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        
        // Comprehensive Sync
        if (cloudData.chatHistories) {
          setChatHistories(cloudData.chatHistories);
          localStorage.setItem('saiyed_ai_local_history', JSON.stringify(cloudData.chatHistories));
        }
        if (cloudData.weakTopics) setWeakTopics(cloudData.weakTopics);
        if (cloudData.subjectThemes) setSubjectThemes(cloudData.subjectThemes);
        
        // Sync Profile Data
        setUser(prev => {
          if (!prev) return null;
          const updated = { 
            ...prev, 
            name: cloudData.name || prev.name,
            interests: cloudData.interests || prev.interests || [],
            photoURL: cloudData.photoURL || prev.photoURL
          };
          localStorage.setItem('saiyed_ai_user', JSON.stringify(updated));
          return updated;
        });
      }
      setIsSyncing(false);
    }, (error) => {
      console.error("Firebase Sync Error:", error);
      setIsSyncing(false);
    });

    return () => unsubUser();
  }, [user?.uid]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('saiyed_ai_dark_mode', darkMode.toString());
  }, [darkMode]);

  const syncToCloud = useCallback(async (dataToSync: any) => {
    if (!user?.uid || !isFirebaseConfigured) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...dataToSync,
        lastUpdated: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error("Cloud Push Failed:", e);
    }
  }, [user?.uid]);

  const handleUpdateName = async (newName: string) => {
    if (!user) return;
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    localStorage.setItem('saiyed_ai_user', JSON.stringify(updatedUser));
    await syncToCloud({ name: newName });
  };

  const handleStartTutor = (lvl: ClassLevel, grp: Group, sub: Subject) => {
    setSelectedClass(lvl);
    setSelectedGroup(grp);
    setSelectedSubject(sub);
    setCurrentView(View.TUTOR);
  };

  const updateInterests = async (interests: string[]) => {
    if (!user) return;
    const updatedUser = { ...user, interests };
    setUser(updatedUser);
    localStorage.setItem('saiyed_ai_user', JSON.stringify(updatedUser));
    await syncToCloud({ interests });
  };

  const handleFlagTopic = (topic: string) => {
    const newTopics = weakTopics.includes(topic) ? weakTopics : [...weakTopics, topic];
    setWeakTopics(newTopics);
    syncToCloud({ weakTopics: newTopics });
  };

  const handleLogout = () => {
    localStorage.removeItem('saiyed_ai_user');
    localStorage.removeItem('saiyed_ai_local_history');
    setUser(null);
    setChatHistories({});
    setWeakTopics([]);
    setSubjectThemes({});
    setCurrentView(View.DASHBOARD);
  };

  return (
    <div className={`flex flex-col fixed inset-0 w-full bg-white dark:bg-slate-950 transition-colors overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Premium Loading Bar */}
      {isSyncing && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/10 z-[100] overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[sync_1.5s_infinite_linear] w-1/3"></div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 pt-2 scrollbar-hide">
        {currentView === View.AUTH && (
          <Auth onLogin={(userData: AppUser) => { setUser(userData); setCurrentView(View.DASHBOARD); }} onBack={() => setCurrentView(View.DASHBOARD)} />
        )}

        {currentView === View.DASHBOARD && (
          <Dashboard user={user} onStartTutor={handleStartTutor} onGoToPlanner={() => setCurrentView(View.PLANNER)} onGoToTranslator={() => setCurrentView(View.TRANSLATOR)} onGoToNews={() => setCurrentView(View.NEWS)} onGoToHistory={() => setCurrentView(View.HISTORY)} weakTopics={weakTopics} />
        )}

        {currentView === View.TUTOR && selectedSubject && (
          <Tutor user={user} classLevel={selectedClass || ClassLevel.C10} group={selectedGroup || Group.GENERAL} subject={selectedSubject} history={chatHistories[selectedSubject] || []} 
            onUpdateHistory={(msgs: ChatMessage[]) => {
              const newHist = { ...chatHistories, [selectedSubject]: msgs };
              setChatHistories(newHist);
              localStorage.setItem('saiyed_ai_local_history', JSON.stringify(newHist));
              syncToCloud({ chatHistories: newHist });
            }} 
            onBack={() => setCurrentView(View.DASHBOARD)} 
            theme={subjectThemes[selectedSubject] || 'emerald'} 
            onUpdateTheme={(t: ChatTheme) => {
              const newThemes = { ...subjectThemes, [selectedSubject]: t };
              setSubjectThemes(newThemes);
              syncToCloud({ subjectThemes: newThemes });
            }}
          />
        )}

        {currentView === View.TRANSLATOR && <Translator onBack={() => setCurrentView(View.DASHBOARD)} />}
        {currentView === View.NEWS && <News onBack={() => setCurrentView(View.DASHBOARD)} />}
        {currentView === View.HISTORY && (
          <History user={user} chatHistories={chatHistories} onSelectSubject={(s: Subject) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }} onDeleteHistory={(s: string) => {
              const newHist = { ...chatHistories };
              delete newHist[s];
              setChatHistories(newHist);
              localStorage.setItem('saiyed_ai_local_history', JSON.stringify(newHist));
              syncToCloud({ chatHistories: newHist });
            }} onClearAll={() => { if (confirm('সব ইতিহাস মুছবেন?')) { setChatHistories({}); localStorage.setItem('saiyed_ai_local_history', '{}'); syncToCloud({ chatHistories: {} }); } }} />
        )}
        {currentView === View.MCQ && <MCQ subject={selectedSubject || Subject.MATH} onFlagTopic={handleFlagTopic} flaggedTopics={weakTopics} />}
        {currentView === View.PLANNER && <Planner initialWeakTopics={weakTopics} onFlagTopic={handleFlagTopic} />}
        {currentView === View.SETTINGS && (
          <Settings user={user} onUpdateInterests={updateInterests} onGoToAuth={() => setCurrentView(View.AUTH)} darkMode={darkMode} setDarkMode={setDarkMode} onResetAll={handleLogout} onUpdateName={handleUpdateName} />
        )}
      </main>

      {currentView !== View.TUTOR && currentView !== View.AUTH && (
        <Navbar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} />
      )}
      
      <style>{`
        @keyframes sync { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        main { padding-bottom: 5.5rem; }
      `}</style>
    </div>
  );
};

export default App;
