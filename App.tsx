
import React, { useState, useEffect } from 'react';
import { View, Subject, ClassLevel, Group, ChatMessage, ChatTheme } from './types';
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
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => JSON.parse(localStorage.getItem('chatHistories') || '{}'));
  const [subjectThemes, setSubjectThemes] = useState<Record<string, ChatTheme>>(() => JSON.parse(localStorage.getItem('subjectThemes') || '{}'));
  const [darkMode, setDarkMode] = useState<boolean>(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));
  const [weakTopics, setWeakTopics] = useState<string[]>(() => JSON.parse(localStorage.getItem('weakTopics') || '[]'));

  useEffect(() => { localStorage.setItem('chatHistories', JSON.stringify(chatHistories)); }, [chatHistories]);
  useEffect(() => { localStorage.setItem('subjectThemes', JSON.stringify(subjectThemes)); }, [subjectThemes]);
  useEffect(() => { 
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleStartTutor = (lvl: ClassLevel, grp: Group, sub: Subject) => {
    setSelectedClass(lvl);
    setSelectedGroup(grp);
    setSelectedSubject(sub);
    setCurrentView(View.TUTOR);
  };

  const updateHistory = (subject: string, msgs: ChatMessage[]) => {
    setChatHistories(prev => ({ ...prev, [subject]: msgs }));
  };

  const updateSubjectTheme = (subject: string, theme: ChatTheme) => {
    setSubjectThemes(prev => ({ ...prev, [subject]: theme }));
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard onStartTutor={handleStartTutor} onGoToPlanner={() => setCurrentView(View.PLANNER)} onGoToTranslator={() => setCurrentView(View.TRANSLATOR)} onGoToNews={() => setCurrentView(View.NEWS)} weakTopics={weakTopics} />;
      case View.TUTOR: 
        return (
          <Tutor 
            classLevel={selectedClass!} 
            group={selectedGroup!} 
            subject={selectedSubject!} 
            history={chatHistories[selectedSubject!] || []} 
            onUpdateHistory={(msgs) => updateHistory(selectedSubject!, msgs)} 
            onBack={() => setCurrentView(View.DASHBOARD)} 
            theme={subjectThemes[selectedSubject!] || 'emerald'} 
            onUpdateTheme={(t) => updateSubjectTheme(selectedSubject!, t)}
          />
        );
      case View.TRANSLATOR: return <Translator onBack={() => setCurrentView(View.DASHBOARD)} />;
      case View.NEWS: return <News onBack={() => setCurrentView(View.DASHBOARD)} />;
      case View.HISTORY: return <History chatHistories={chatHistories} onSelectSubject={(s) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }} onDeleteHistory={(s) => setChatHistories(p => { const u = {...p}; delete u[s]; return u; })} onClearAll={() => setChatHistories({})} />;
      case View.MCQ: return <MCQ subject={selectedSubject || Subject.MATH} onFlagTopic={t => setWeakTopics(p => [...new Set([...p, t])])} flaggedTopics={weakTopics} />;
      case View.PLANNER: return <Planner initialWeakTopics={weakTopics} onFlagTopic={t => setWeakTopics(p => [...new Set([...p, t])])} />;
      case View.SETTINGS: return <Settings darkMode={darkMode} setDarkMode={setDarkMode} language="bn" setLanguage={() => {}} chatTheme="blue" setChatTheme={() => {}} chatBackground="plain" setChatBackground={() => {}} isFullscreen={false} onToggleFullscreen={() => {}} onResetAll={() => { localStorage.clear(); window.location.reload(); }} />;
      default: return null;
    }
  };

  return (
    <div className={`flex flex-col fixed inset-0 w-full bg-gray-50 dark:bg-slate-950 transition-colors ${darkMode ? 'dark' : ''}`}>
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 pt-4 scrollbar-hide">{renderView()}</main>
      {currentView !== View.TUTOR && <Navbar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} />}
    </div>
  );
};
export default App;
