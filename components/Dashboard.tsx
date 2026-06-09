import React, { useState, useEffect } from 'react';
import { Subject, ClassLevel, Group, AppUser } from '../types';

interface DashboardProps {
  user: AppUser;
  isServerActive: boolean; // স্টেট এখন প্যারেন্ট থেকে আসবে
  setIsServerActive: (val: boolean) => void;
  onStartTutor: (lvl: ClassLevel, grp: Group, sub: Subject) => void;
  onGoToTranslator: () => void;
  onGoToNews: () => void;
  onGoToHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, isServerActive, setIsServerActive, onStartTutor, onGoToTranslator, onGoToNews, onGoToHistory 
}) => {
  const [activeUsers, setActiveUsers] = useState(4);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  // ... (infoSlides এবং useEffect আগের মতোই রাখুন)
  
  const subjectList = [/* আপনার লিস্ট আগের মতোই রাখুন */];

  return (
    <div className="space-y-8 pb-32 font-['Hind_Siliguri']">
      {/* হেডার যেখানে সার্ভার স্ট্যাটাস দেখাবে */}
      <span className={`px-2 py-0.5 text-[9px] rounded-full font-black uppercase ${isServerActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
        {isServerActive ? "Server Active 🟢" : "Server Down 🔴"}
      </span>

      {/* বাটন যা এখন সার্ভার ডাউন থাকলে ডিজেবল থাকবে */}
      {subjectList.map((sub, i) => (
        <button 
          key={i} 
          disabled={!isServerActive}
          onClick={() => onStartTutor(ClassLevel.C10, Group.GENERAL, sub.name)}
          className={`${!isServerActive ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {sub.name}
        </button>
      ))}
    </div>
  );
};
export default Dashboard;
