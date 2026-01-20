
import React, { useState, useEffect, useCallback } from 'react';
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
  const [isSyncing, setIsSyncing] = useState(false);

  const isAuthEnabled = isFirebaseConfigured;

  useEffect(() => {
    const savedUser = localStorage.getItem('saiyed_ai_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedHistory = localStorage.getItem('saiyed_ai_local_history');
    if (savedHistory) setChatHistories(JSON.parse(savedHistory));
    
    const savedMode = localStorage.getItem('saiyed_ai_dark_mode');
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (!user?.uid || !isAuthEnabled) return;

    setIsSyncing(true);
    const userDocRef = doc(db, 'users', user.uid);

    const unsubUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        if (cloudData.chatHistories) {
          setChatHistories(cloudData.chatHistories);
          localStorage.setItem('saiyed_ai_local_history', JSON.stringify(cloudData.chatHistories));
        }
        if (cloudData.weakTopics) setWeakTopics(cloudData.weakTopics);
        if (cloudData.subjectThemes) setSubjectThemes(cloudData.subjectThemes);
        if (cloudData.name && cloudData.name !== user.name) {
          const updatedUser = { ...user, ...cloudData };
          setUser(updatedUser);
          localStorage.setItem('saiyed_ai_user', JSON.stringify(updatedUser));
        }
      }
      setIsSyncing(false);
    }, (error) => {
      console.error("Firestore Sync Error:", error);
      setIsSyncing(false);
    });

    return () => unsubUser();
  }, [user?.uid, isAuthEnabled]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('saiyed_ai_dark_mode', darkMode.toString());
  }, [darkMode]);

  const syncToCloud = useCallback(async (dataToSync: any) => {
    if (!user?.uid || !isAuthEnabled) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...dataToSync,
        lastUpdated: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error("Cloud Sync Failed:", e);
    }
  }, [user?.uid, isAuthEnabled]);

  const handleStartTutor = (lvl: ClassLevel, grp: Group, sub: Subject) => {
    setSelectedClass(lvl);
    setSelectedGroup(grp);
    setSelectedSubject(sub);
    setCurrentView(View.TUTOR);
  };

  const updateInterests = async (interests: string[]) => {
    if (!user?.uid) return;
    const updatedUser = { ...user, interests };
    setUser(updatedUser);
    localStorage.setItem('saiyed_ai_user', JSON.stringify(updatedUser));
    await syncToCloud({ interests });
  };

  const handleFlagTopic = (topic: string) => {
    const newTopics = weakTopics.includes(topic) ? weakTopics : [...weakTopics, topic];
    setWeakTopics(newTopics);
    if (user?.uid) syncToCloud({ weakTopics: newTopics });
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
    <div className={`flex flex-col fixed inset-0 w-full bg-[#F3F4F6] dark:bg-slate-950 transition-colors ${darkMode ? 'dark' : ''}`}>
      {/* Discreet Sync Indicator */}
      {isSyncing && (
        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse z-[100]" title="Syncing..." />
      )}

      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 pt-4 scrollbar-hide">
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
              if (user?.uid) syncToCloud({ chatHistories: newHist });
            }} 
            onBack={() => setCurrentView(View.DASHBOARD)} 
            theme={subjectThemes[selectedSubject] || 'emerald'} 
            onUpdateTheme={(t: ChatTheme) => {
              const newThemes = { ...subjectThemes, [selectedSubject]: t };
              setSubjectThemes(newThemes);
              if (user?.uid) syncToCloud({ subjectThemes: newThemes });
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
            }} onClearAll={() => { if (confirm('সব চ্যাট ইতিহাস মুছে ফেলতে চান?')) { setChatHistories({}); localStorage.setItem('saiyed_ai_local_history', '{}'); syncToCloud({ chatHistories: {} }); } }} />
        )}
        {currentView === View.MCQ && <MCQ subject={selectedSubject || Subject.MATH} onFlagTopic={handleFlagTopic} flaggedTopics={weakTopics} />}
        {currentView === View.PLANNER && <Planner initialWeakTopics={weakTopics} onFlagTopic={handleFlagTopic} />}
        {currentView === View.SETTINGS && (
          <Settings 
            user={user} 
            onUpdateInterests={updateInterests} 
            onGoToAuth={() => setCurrentView(View.AUTH)} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            onResetAll={() => { if (confirm('এটি আপনার সব লোকাল ডেটা মুছে ফেলবে এবং আপনাকে লগআউট করে দিবে। নিশ্চিত তো?')) handleLogout(); }} 
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
