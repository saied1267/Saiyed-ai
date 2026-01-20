
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
import SetupGuide from './components/SetupGuide';
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
  const [showSetup, setShowSetup] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'permission-denied' | 'missing-config'>('idle');

  // Gemini API still relies on env, but Firebase now uses our hardcoded check
  const isApiConfigured = Boolean(process.env.API_KEY && process.env.API_KEY !== "");
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
    if (!user?.uid) return;
    if (!isAuthEnabled) {
      setLastSyncStatus('missing-config');
      return;
    }

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
        setUser(prev => prev ? ({ ...prev, name: cloudData.name || prev.name, interests: cloudData.interests || prev.interests }) : null);
      }
      setIsSyncing(false);
      setLastSyncStatus('success');
      setTimeout(() => setLastSyncStatus('idle'), 2000);
    }, (error: any) => {
      console.error("Firestore Listen Error:", error);
      setIsSyncing(false);
      if (error.code === 'permission-denied') setLastSyncStatus('permission-denied');
      else setLastSyncStatus('error');
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
    
    setLastSyncStatus('syncing');
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...dataToSync,
        lastUpdated: Date.now()
      }, { merge: true });
      setLastSyncStatus('success');
    } catch (e: any) {
      console.error("Cloud Sync Write Error:", e);
      if (e.code === 'permission-denied') {
        setLastSyncStatus('permission-denied');
      } else {
        setLastSyncStatus('error');
      }
    }
    setTimeout(() => { if (lastSyncStatus !== 'permission-denied') setLastSyncStatus('idle'); }, 4000);
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
    setCurrentView(View.DASHBOARD);
  };

  return (
    <div className={`flex flex-col fixed inset-0 w-full bg-gray-50 dark:bg-slate-950 transition-colors ${darkMode ? 'dark' : ''}`}>
      {lastSyncStatus !== 'idle' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 w-max">
          <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center space-x-2 border-2 ${
            lastSyncStatus === 'syncing' ? 'bg-blue-500 text-white border-blue-400' :
            lastSyncStatus === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
            lastSyncStatus === 'permission-denied' ? 'bg-red-600 text-white border-red-400' :
            lastSyncStatus === 'missing-config' ? 'bg-orange-500 text-white border-orange-400' :
            'bg-red-500 text-white border-red-400 animate-pulse'
          }`}>
            <span>
              {lastSyncStatus === 'syncing' ? '🔄 সিঙ্ক হচ্ছে...' : 
               lastSyncStatus === 'success' ? '✅ ক্লাউডে সংরক্ষিত' : 
               lastSyncStatus === 'permission-denied' ? '❌ পারমিশন এরর' :
               lastSyncStatus === 'missing-config' ? '⚠️ এপিআই কী নেই' :
               '❌ কানেকশন এরর'}
            </span>
            {lastSyncStatus === 'permission-denied' && (
              <button 
                onClick={() => { setShowSetup(true); setLastSyncStatus('idle'); }} 
                className="bg-white text-red-600 px-3 py-1 rounded-full ml-2 border border-white font-black animate-pulse"
              >
                ফিক্স করুন
              </button>
            )}
          </div>
        </div>
      )}

      {isSyncing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 z-[100] overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[sync_1.5s_infinite_linear] w-1/3 origin-left"></div>
        </div>
      )}

      {!isApiConfigured && currentView !== View.TUTOR && currentView !== View.AUTH && (
        <div className="bg-orange-500 text-white text-[10px] py-2 text-center font-black uppercase tracking-widest flex items-center justify-center space-x-2 shadow-md">
          <span>⚠️ জেমিনি এপিআই নেই</span>
          <p className="opacity-80">অ্যাপ ঠিকমতো কাজ নাও করতে পারে</p>
        </div>
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
          <History user={user} chatHistories={chatHistories} isSyncing={lastSyncStatus === 'syncing'} onSelectSubject={(s: Subject) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }} onDeleteHistory={(s: string) => {
              const newHist = { ...chatHistories };
              delete newHist[s];
              setChatHistories(newHist);
              syncToCloud({ chatHistories: newHist });
            }} onClearAll={() => { if (confirm('আপনি কি নিশ্চিত যে সব কনভারসেশন মুছে ফেলতে চান?')) { setChatHistories({}); syncToCloud({ chatHistories: {} }); } }} />
        )}
        {currentView === View.MCQ && <MCQ subject={selectedSubject || Subject.MATH} onFlagTopic={handleFlagTopic} flaggedTopics={weakTopics} />}
        {currentView === View.PLANNER && <Planner initialWeakTopics={weakTopics} onFlagTopic={handleFlagTopic} />}
        {currentView === View.SETTINGS && <Settings user={user} onUpdateInterests={updateInterests} onGoToAuth={() => setCurrentView(View.AUTH)} darkMode={darkMode} setDarkMode={setDarkMode} language="bn" setLanguage={() => {}} chatTheme="blue" setChatTheme={() => {}} chatBackground="plain" setChatBackground={() => {}} isFullscreen={false} onToggleFullscreen={() => {}} onResetAll={() => { if (confirm('এটি আপনার সব লোকাল ডেটা মুছে ফেলবে এবং আপনাকে লগআউট করে দিবে। নিশ্চিত তো?')) handleLogout(); }} />}
      </main>

      {currentView !== View.TUTOR && currentView !== View.AUTH && (
        <Navbar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} />
      )}
      
      <style>{`@keyframes sync { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      {showSetup && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-900 overflow-y-auto pb-20">
          <button onClick={() => setShowSetup(false)} className="fixed top-6 right-6 z-[210] bg-red-500 text-white w-10 h-10 rounded-full shadow-xl font-black text-lg flex items-center justify-center">✕</button>
          <SetupGuide />
        </div>
      )}
    </div>
  );
};

export default App;
