
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
import { db } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
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
  const [lastSyncStatus, setLastSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const isApiConfigured = Boolean(process.env.API_KEY && process.env.API_KEY !== "");
  const isAuthEnabled = Boolean(process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID);

  useEffect(() => {
    const savedUser = localStorage.getItem('saiyed_ai_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    let gId = localStorage.getItem('saiyed_ai_guest_id');
    if (!gId) {
      gId = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('saiyed_ai_guest_id', gId);
    }
    setGuestId(gId);

    const savedHistory = localStorage.getItem('saiyed_ai_local_history');
    if (savedHistory) setChatHistories(JSON.parse(savedHistory));
    
    const savedMode = localStorage.getItem('saiyed_ai_dark_mode');
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    setIsSyncing(true);
    // Now we listen to only ONE document in the 'users' collection for everything
    const userDocRef = doc(db, 'users', user.uid);

    const unsubUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        // Update user profile info
        setUser(prev => prev ? ({ ...prev, name: cloudData.name, photoURL: cloudData.photoURL, interests: cloudData.interests || [] }) : null);
        
        // Update chat histories and other data stored in the same doc
        if (cloudData.chatHistories) {
          setChatHistories(cloudData.chatHistories);
          localStorage.setItem('saiyed_ai_local_history', JSON.stringify(cloudData.chatHistories));
        }
        if (cloudData.weakTopics) setWeakTopics(cloudData.weakTopics);
        if (cloudData.subjectThemes) setSubjectThemes(cloudData.subjectThemes);
      }
      setIsSyncing(false);
    });

    return () => unsubUser();
  }, [user?.uid]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('saiyed_ai_dark_mode', darkMode.toString());
  }, [darkMode]);

  const syncChatHistoryToCloud = useCallback(async (newHistories: Record<string, ChatMessage[]>) => {
    localStorage.setItem('saiyed_ai_local_history', JSON.stringify(newHistories));
    setLastSyncStatus('syncing');
    
    try {
      if (user?.uid) {
        // Saving everything to the 'users' collection directly
        await setDoc(doc(db, 'users', user.uid), {
          chatHistories: newHistories,
          weakTopics,
          subjectThemes,
          lastUpdated: Date.now()
        }, { merge: true });
        setLastSyncStatus('success');
      }
    } catch (e) {
      console.error("Cloud Sync Error:", e);
      setLastSyncStatus('error');
    }
    
    setTimeout(() => setLastSyncStatus('idle'), 2000);
  }, [user?.uid, weakTopics, subjectThemes]);

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
    await setDoc(doc(db, 'users', user.uid), { interests, lastUpdated: Date.now() }, { merge: true });
  };

  const handleFlagTopic = (topic: string) => {
    const newTopics = weakTopics.includes(topic) ? weakTopics : [...weakTopics, topic];
    setWeakTopics(newTopics);
    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid), { weakTopics: newTopics }, { merge: true });
    }
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
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center space-x-2 border ${
            lastSyncStatus === 'syncing' ? 'bg-blue-500 text-white border-blue-400' :
            lastSyncStatus === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
            'bg-red-500 text-white border-red-400'
          }`}>
            <span>{lastSyncStatus === 'syncing' ? '🔄 সিঙ্ক হচ্ছে...' : lastSyncStatus === 'success' ? '✅ ক্লাউডে সংরক্ষিত' : '❌ সিঙ্ক এরর'}</span>
          </div>
        </div>
      )}

      {isSyncing && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/20 z-[100] overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[sync_1.5s_infinite_linear] w-1/3 origin-left"></div>
        </div>
      )}

      {(!isApiConfigured || !isAuthEnabled) && currentView !== View.TUTOR && currentView !== View.AUTH && (
        <div className="bg-orange-500 text-white text-[10px] py-2 text-center font-black uppercase tracking-widest flex items-center justify-center space-x-2 shadow-md">
          <span>⚠️ সিস্টেম সেটআপ অসম্পূর্ণ</span>
          <button onClick={() => setShowSetup(true)} className="underline ml-2 bg-white/20 px-2 py-0.5 rounded">নির্দেশনা দেখুন</button>
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
              syncChatHistoryToCloud(newHist);
            }} 
            onBack={() => setCurrentView(View.DASHBOARD)} 
            theme={subjectThemes[selectedSubject] || 'emerald'} 
            onUpdateTheme={(t: ChatTheme) => {
              const newThemes = { ...subjectThemes, [selectedSubject]: t };
              setSubjectThemes(newThemes);
              if (user?.uid) setDoc(doc(db, 'users', user.uid), { subjectThemes: newThemes }, { merge: true });
            }}
          />
        )}

        {currentView === View.TRANSLATOR && <Translator onBack={() => setCurrentView(View.DASHBOARD)} />}
        {currentView === View.NEWS && <News onBack={() => setCurrentView(View.DASHBOARD)} />}
        {currentView === View.HISTORY && <History user={user} chatHistories={chatHistories} isSyncing={lastSyncStatus === 'syncing'} onSelectSubject={(s: Subject) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }} onDeleteHistory={(s: string) => {
              const newHist = { ...chatHistories };
              delete newHist[s];
              setChatHistories(newHist);
              syncChatHistoryToCloud(newHist);
            }} onClearAll={() => { if (confirm('আপনি কি নিশ্চিত যে সব কনভারসেশন মুছে ফেলতে চান?')) { setChatHistories({}); syncChatHistoryToCloud({}); } }} />}
        {currentView === View.MCQ && <MCQ subject={selectedSubject || Subject.MATH} onFlagTopic={handleFlagTopic} flaggedTopics={weakTopics} />}
        {currentView === View.PLANNER && <Planner initialWeakTopics={weakTopics} onFlagTopic={handleFlagTopic} />}
        {currentView === View.SETTINGS && <Settings user={user} onUpdateInterests={updateInterests} onGoToAuth={() => setCurrentView(View.AUTH)} darkMode={darkMode} setDarkMode={setDarkMode} language="bn" setLanguage={() => {}} chatTheme="blue" setChatTheme={() => {}} chatBackground="plain" setChatBackground={() => {}} isFullscreen={false} onToggleFullscreen={() => {}} onResetAll={() => { if (confirm('এটি আপনার সব লোকাল ডেটা মুছে ফেলবে এবং আপনাকে লগআউট করে দিবে। নিশ্চিত তো?')) handleLogout(); }} />}
      </main>

      {currentView !== View.TUTOR && currentView !== View.AUTH && (
        <Navbar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} />
      )}
      
      <style>{`@keyframes sync { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      {showSetup && (
        <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
          <button onClick={() => setShowSetup(false)} className="fixed top-4 right-4 z-[210] bg-slate-900 text-white p-2 rounded-full shadow-lg font-black text-xs">বন্ধ করুন ✕</button>
          <SetupGuide />
        </div>
      )}
    </div>
  );
};

export default App;
                                 
