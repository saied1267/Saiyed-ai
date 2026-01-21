
import React from 'react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  darkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, darkMode }) => {
  const navItems = [
    { 
      view: View.DASHBOARD, 
      label: 'হোম', 
      icon: (isActive: boolean) => (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"></path>
          <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"></polyline>
        </svg>
      )
    },
    { 
      view: View.HISTORY, 
      label: 'ইতিহাস', 
      icon: (isActive: boolean) => (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"></circle>
          <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"></polyline>
        </svg>
      )
    },
    { 
      view: View.MCQ, 
      label: 'অনুশীলন', 
      icon: (isActive: boolean) => (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" strokeLinecap="round" strokeLinejoin="round"></rect>
        </svg>
      )
    },
    { 
      view: View.PLANNER, 
      label: 'রুটিন', 
      icon: (isActive: boolean) => (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"></rect>
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"></line>
          <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"></line>
          <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"></line>
        </svg>
      )
    },
    { 
      view: View.SETTINGS, 
      label: 'সেটিংস', 
      icon: (isActive: boolean) => (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      )
    },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 w-full h-[4.8rem] border-t flex items-center justify-around px-1 z-[100] transition-all pb-safe ${
      darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]' : 'bg-white/95 backdrop-blur-md border-slate-100 shadow-[0_-10px_35px_rgba(0,0,0,0.03)]'
    }`}>
      {navItems.map((item) => {
        const isActive = currentView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`group relative flex flex-col items-center justify-center space-y-1 w-full h-full transition-all active:scale-90 ${
              isActive 
                ? 'text-emerald-600 dark:text-emerald-500' 
                : darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {isActive && (
              <div className="absolute top-0 w-10 h-[3.5px] bg-emerald-500 rounded-b-full shadow-[0_3px_12px_rgba(16,185,129,0.3)] animate-in slide-in-from-top-1" />
            )}
            <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon(isActive)}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navbar;
