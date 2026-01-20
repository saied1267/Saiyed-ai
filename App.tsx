
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
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
  
  const isInitialSyncDone = useRef(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('saiyed_ai_user');
    const savedHistory = localStorage.getItem('saiyed_ai_local_history');
    const savedMode = localStorage.getItem('saiyed_ai_dark_mode');
    const savedWeak = localStorage.getItem('saiyed_ai_weak_topics');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHistory) setChatHistories(JSON.parse(savedHistory));
    if (savedMode === 'true') setDarkMode(true);
    if (savedWeak) setWeakTopics(JSON.parse(savedWeak));
  }, []);

  // 2. Cloud Sync Utility
  const syncToCloud = useCallback(async (dataToSync: any) => {
    if (!user?.uid || !isFirebaseConfigured || !navigator.onLine) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...dataToSync,
        lastUpdated: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error("Firebase Sync failed:", e);
    }
  }, [user?.uid]);

  // 3. Real-time Cloud Listener (Sync Down)
  useEffect(() => {
    if (!user?.uid || !isFirebaseConfigured || !navigator.onLine) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        
        // Only update if it's the first sync from cloud to avoid overwriting local unsynced changes
        if (!isInitialSyncDone.current) {
          if (cloudData.chatHistories) {
            setChatHistories(cloudData.chatHistories);
            localStorage.setItem('saiyed_ai_local_history', JSON.stringify(cloudData.chatHistories));
          }
          if (cloudData.weakTopics) {
            setWeakTopics(cloudData.weakTopics);
            localStorage.setItem('saiyed_ai_weak_topics', JSON.stringify(cloudData.weakTopics));
          }
          isInitialSyncDone.current = true;
        }
      }
    });

    return () => unsubUser();
  }, [user?.uid]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('saiyed_ai_dark_mode', String(darkMode));
  }, [darkMode]);

  const handleUpdateHistory = async (msgs: ChatMessage[]) => {
    if (!selectedSubject) return;
    const newHist = { ...chatHistories, [selectedSubject]: msgs };
    setChatHistories(newHist);
    localStorage.setItem('saiyed_ai_local_history', JSON.stringify(newHist));
    // Immediately sync this change to cloud
    await syncToCloud({ chatHistories: newHist });
  };

  const handleStartTutor = (lvl: ClassLevel, grp: Group, sub: Subject) => {
    setSelectedClass(lvl);
    setSelectedGroup(grp);
    setSelectedSubject(sub);
    setCurrentView(View.TUTOR);
  };

  const handleLogout = () => {
    if(confirm('সব ডেটা মুছে যাবে। লগআউট করবেন?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={`flex flex-col fixed inset-0 w-full bg-white dark:bg-slate-950 transition-colors overflow-hidden`}>
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 pt-2 scrollbar-hide relative bg-white dark:bg-slate-950">
        {currentView === View.AUTH && (
          <Auth onLogin={(userData: AppUser) => { setUser(userData); setCurrentView(View.DASHBOARD); }} onBack={() => setCurrentView(View.DASHBOARD)} />
        )}

        {currentView === View.DASHBOARD && (
          <Dashboard user={user} onStartTutor={handleStartTutor} onGoToPlanner={() => setCurrentView(View.PLANNER)} onGoToTranslator={() => setCurrentView(View.TRANSLATOR)} onGoToNews={() => setCurrentView(View.NEWS)} onGoToHistory={() => setCurrentView(View.HISTORY)} weakTopics={weakTopics} />
        )}

        {currentView === View.TUTOR && selectedSubject && (
          <Tutor 
            user={user} 
            classLevel={selectedClass || ClassLevel.C10} 
            group={selectedGroup || Group.GENERAL} 
            subject={selectedSubject} 
            history={chatHistories[selectedSubject] || []} 
            onUpdateHistory={handleUpdateHistory} 
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
          <History 
            user={user} 
            chatHistories={chatHistories} 
            onSelectSubject={(s: Subject) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }} 
            onDeleteHistory={(s: string) => {
              const newHist = { ...chatHistories };
              delete newHist[s];
              setChatHistories(newHist);
              localStorage.setItem('saiyed_ai_local_history', JSON.stringify(newHist));
              syncToCloud({ chatHistories: newHist });
            }} 
            onClearAll={() => { if (confirm('সব ইতিহাস মুছবেন?')) { setChatHistories({}); localStorage.setItem('saiyed_ai_local_history', '{}'); syncToCloud({ chatHistories: {} }); } }} 
          />
        )}
        {currentView === View.MCQ && <MCQ subject={selectedSubject || Subject.MATH} onFlagTopic={(t) => {
          const nt = [...weakTopics, t];
          setWeakTopics(nt);
          syncToCloud({ weakTopics: nt });
        }} flaggedTopics={weakTopics} />}
        {currentView === View.PLANNER && <Planner initialWeakTopics={weakTopics} onFlagTopic={(t) => {}} />}
        {currentView === View.SETTINGS && (
          <Settings user={user} onUpdateInterests={(i) => syncToCloud({ interests: i })} onGoToAuth={() => setCurrentView(View.AUTH)} darkMode={darkMode} setDarkMode={setDarkMode} onResetAll={handleLogout} onUpdateName={(n) => syncToCloud({ name: n })} />
        )}
      </main>

      {currentView !== View.TUTOR && currentView !== View.AUTH && (
        <Navbar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} />
      )}
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        main { padding-bottom: 5.5rem; height: 100%; }
        nav { position: fixed; bottom: 0; left: 0; right: 0; }
      `}</style>
    </div>
  );
};

export default App;
