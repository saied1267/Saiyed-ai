
import React, { useState, useEffect } from 'react';
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
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    setIsSyncing(true);
    const userDocRef = doc(db, 'users', user.uid);
    const historyDocRef = doc(db, 'histories', user.uid);

    const unsubUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data() as AppUser;
        setUser(prev => prev ? ({ ...prev, ...cloudData }) : cloudData);
      }
    });

    const unsubHistory = onSnapshot(historyDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.chatHistories) {
          setChatHistories(data.chatHistories);
          localStorage.setItem('saiyed_ai_local_history', JSON.stringify(data.chatHistories));
        }
        if (data.weakTopics) setWeakTopics(data.weakTopics);
        if (data.subjectThemes) setSubjectThemes(data.subjectThemes);
      }
      setIsSyncing(false);
    });

    return () => {
      unsubUser();
      unsubHistory();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleStartTutor = (lvl: ClassLevel, grp: Group, sub: Subject) => {
    setSelectedClass(lvl);
    setSelectedGroup(grp);
    setSelectedSubject(sub);
    setCurrentView(View.TUTOR);
  };

  const syncChatHistoryToCloud = async (newHistories: Record<string, ChatMessage[]>) => {
    localStorage.setItem('saiyed_ai_local_history', JSON.stringify(newHistories));
    if (!isAuthEnabled) return;

    try {
      if (user?.uid) {
        await setDoc(doc(db, 'histories', user.uid), {
          chatHistories: newHistories,
          weakTopics,
          subjectThemes,
          lastUpdated: Date.now(),
          userEmail: user.email
        }, { merge: true });
      } else if (guestId) {
        await setDoc(doc(db, 'guest_sessions', guestId), {
          chatHistories: newHistories,
          lastUpdated: Date.now(),
          deviceInfo: navigator.userAgent,
          type: 'guest'
        }, { merge: true });
      }
    } catch (e) {
      console.error("Cloud Sync Error:", e);
    }
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
    if (user?.uid) setDoc(doc(db, 'histories', user.uid), { weakTopics: newTopics }, { merge: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('saiyed_ai_user');
    localStorage.removeItem('saiyed_ai_local_history');
    setUser(null);
    setChatHistories({});
    setWeakTopics([]);
    setCurrentView(View.DASHBOARD);
  };

  if (showSetup) {
    return (
      <div className="relative">
        <button onClick={() => setShowSetup(false)} className="fixed top-4 right-4 z-[100] bg-white dark:bg-slate-900 p-2 rounded-full shadow-lg font-black text-xs border dark:border-slate-700">বন্ধ করুন ✕</button>
        <SetupGuide />
      </div>
    );
  }

  return (
    <div className={`flex flex-col fixed inset-0 w-full bg-gray-50 dark:bg-slate-950 transition-colors ${darkMode ? 'dark' : ''}`}>
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
          <Dashboard user={user} onStartTutor={handleStartTutor} onGoToPlanner={() => setCurrentView(View.PLANNER)} onGoToTranslator={() => setCurrentView(View.TRANSLATOR)} onGoToNews={() => setCurrentView(View.NEWS)} weakTopics={weakTopics} />
        )}

        {currentView === View.TUTOR && selectedSubject && (
          <Tutor user={user} classLevel={selectedClass || ClassLevel.C10} group={selectedGroup || Group.GENERAL} subject={selectedSubject} history={chatHistories[selectedSubject] || []} onUpdateHistory={(msgs: ChatMessage[]) => {
              const newHist = { ...chatHistories, [selectedSubject]: msgs };
              setChatHistories(newHist);
              syncChatHistoryToCloud(newHist);
            }} onBack={() => setCurrentView(View.DASHBOARD)} theme={subjectThemes[selectedSubject] || 'emerald'} onUpdateTheme={(t: ChatTheme) => {
              const newThemes = { ...subjectThemes, [selectedSubject]: t };
              setSubjectThemes(newThemes);
              if (user?.uid) setDoc(doc(db, 'histories', user.uid), { subjectThemes: newThemes }, { merge: true });
            }}
          />
        )}

        {currentView === View.TRANSLATOR && <Translator onBack={() => setCurrentView(View.DASHBOARD)} />}
        {currentView === View.NEWS && <News onBack={() => setCurrentView(View.DASHBOARD)} />}
        {currentView === View.HISTORY && <History chatHistories={chatHistories} onSelectSubject={(s: Subject) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }} onDeleteHistory={(s: string) => {
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
    </div>
  );
};

export default App;
  
