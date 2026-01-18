
import React from 'react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  darkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, darkMode }) => {
  const navItems = [
    { view: View.DASHBOARD, label: 'হোম', icon: '🏠' },
    { view: View.HISTORY, label: 'হিস্টোরি', icon: '📜' },
    { view: View.MCQ, label: 'অনুশীলন', icon: '📝' },
    { view: View.PLANNER, label: 'পরিকল্পনা', icon: '📅' },
    { view: View.SETTINGS, label: 'সেটিংস', icon: '⚙️' },
  ];

  return (
    <nav className={`w-full h-16 border-t flex items-center justify-around px-2 z-50 transition-all flex-shrink-0 ${
      darkMode ? 'bg-slate-800 border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'
    }`}>
      {navItems.map((item) => (
        <button
          key={item.view}
          onClick={() => setCurrentView(item.view)}
          className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-all active:scale-75 ${
            currentView === item.view 
              ? 'text-emerald-500 font-bold' 
              : darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          <span className={`text-xl transition-transform ${currentView === item.view ? 'scale-125 -translate-y-1' : ''}`}>{item.icon}</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          {currentView === item.view && <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1 animate-pulse" />}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
