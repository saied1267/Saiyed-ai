
import React, { useState, useEffect } from 'react';
import { StudyPlan } from '../types';
import { getStudyPlan } from '../geminiService';

interface PlannerProps {
  initialWeakTopics: string[];
  onFlagTopic: (topic: string) => void;
}

const Planner: React.FC<PlannerProps> = ({ initialWeakTopics, onFlagTopic }) => {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [weakTopicsInput, setWeakTopicsInput] = useState(initialWeakTopics.join(', '));

  const generatePlan = async () => {
    setLoading(true);
    try {
      const topics = weakTopicsInput.split(',').map(t => t.trim()).filter(t => t);
      // Sync manual entries to global flagging
      topics.forEach(t => onFlagTopic(t));
      
      const data = await getStudyPlan(topics.length > 0 ? topics : ['Math Geometry', 'ICT Digital Logic']);
      setPlan(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
  }, []);

  return (
    <div className="space-y-6 pb-6">
      <header>
        <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">আপনার রুটিন</h2>
        <p className="text-sm opacity-60">দুর্বলতা কাটিয়ে ওঠার সঠিক পরিকল্পনা।</p>
      </header>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold opacity-70 uppercase tracking-wider">আপনার লক্ষ্য বিষয়সমূহ:</label>
          {initialWeakTopics.length > 0 && (
            <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded">Auto-filled from MCQs</span>
          )}
        </div>
        <div className="flex space-x-2">
          <input 
            type="text"
            value={weakTopicsInput}
            onChange={(e) => setWeakTopicsInput(e.target.value)}
            placeholder="যেমন: জ্যামিতি, এইচটিএমএল"
            className="flex-1 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition"
          />
          <button 
            onClick={generatePlan}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 shadow-md active:scale-95 transition"
          >
            তৈরি
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-600 font-medium">রুটিন বিশ্লেষণ করা হচ্ছে...</p>
        </div>
      ) : plan && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold mb-3 flex items-center text-emerald-600 dark:text-emerald-400">
              <span className="mr-2">🎯</span> আজকের লক্ষ্য
            </h3>
            <ul className="space-y-3">
              {plan.dailyGoals.map((goal, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm">
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                  <span className="leading-relaxed">{goal}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold mb-3 flex items-center text-orange-500">
              <span className="mr-2">💡</span> বিশেষ ফোকাস এলাকা
            </h3>
            <div className="flex flex-wrap gap-2">
              {plan.weakTopics.map((topic, i) => (
                <span key={i} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full border border-orange-100 dark:border-orange-900/30 font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </section>

          <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg transform transition hover:scale-[1.01] shadow-emerald-500/20">
            <h4 className="font-bold text-xs opacity-80 mb-1 uppercase tracking-widest">আগামীকাল যা পড়বেন</h4>
            <p className="text-lg font-bold leading-tight">{plan.nextStudy}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
