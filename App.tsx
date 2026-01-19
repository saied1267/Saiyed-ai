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
import SetupGuide from './components/SetupGuide';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [subjectThemes, setSubjectThemes] = useState<Record<string, ChatTheme>>({});
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);

  const isApiConfigured = !!(process.env.API_KEY || process.env.API_KEY_2 || process.env.API_KEY_3);

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

  if (!isApiConfigured) {
    return <SetupGuide />;
  }

  return (
    <div className={`flex flex-col fixed inset-0 w-full bg-gray-50 dark:bg-slate-950 transition-colors ${darkMode ? 'dark' : ''}`}>
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 pt-4 scrollbar-hide">
        {currentView === View.DASHBOARD && (
          <Dashboard
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
            onUpdateHistory={(msgs) => setChatHistories({ ...chatHistories, [selectedSubject]: msgs })}
            onBack={() => setCurrentView(View.DASHBOARD)}
            theme={subjectThemes[selectedSubject] || 'emerald'}
            onUpdateTheme={(t) => setSubjectThemes({ ...subjectThemes, [selectedSubject]: t })}
          />
        )}

        {currentView === View.TRANSLATOR && <Translator onBack={() => setCurrentView(View.DASHBOARD)} />}
        
        {currentView === View.NEWS && <News onBack={() => setCurrentView(View.DASHBOARD)} />}

        {currentView === View.HISTORY && (
          <History
            chatHistories={chatHistories}
            onSelectSubject={(s) => { setSelectedSubject(s); setCurrentView(View.TUTOR); }}
            onDeleteHistory={(s) => {
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
            }}
          />
        )}
      </main>

      {currentView !== View.TUTOR && (
        <Navbar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} />
      )}
    </div>
  );
};

export default App;
