import React from 'react';

const SetupGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-['Hind_Siliguri']">
      <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm animate-bounce">
        🚀
      </div>
      <h1 className="text-3xl font-black text-emerald-600 mb-2">সাঈদ এআই </h1>
      <p className="text-gray-500 font-bold mb-8 max-w-xs leading-relaxed">
        \
      </p>

      <div className="w-full max-w-sm space-y-3 text-left">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4">
          <p className="text-[10px] font-black uppercase text-blue-600 mb-2 tracking-widest">জরুরি ভেরিয়েবলসমূহ</p>
          <div className="space-y-1 text-[11px] font-bold text-blue-800">
            <p>• ইঞ্জিন ১ </p>
            <p>• ইঞ্জিন ৩ </p>
            <p>• ইঞ্জিন ২ </p>
          </div>
        </div>

        {[
          { step: "১", text: "।" },
          { step: "২", text: "" },
          { step: "৩", text: "" },
          { step: "৪", text: "" },
          { step: "৫", text: "" },
          { step: "৬", text: "" },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:border-emerald-200">
            <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black flex-shrink-0 text-sm">
              {item.step}
            </span>
            <p className="text-[12px] font-bold text-gray-700 leading-snug">{item.text}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="mt-8 w-full max-w-sm py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
      >
        সেটআপ শেষ🔄
      </button>

      <div className="mt-8 border-t border-gray-200 pt-6 w-full max-w-sm">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">ডেভলপার সাপোর্ট</p>
        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-xl">
          <span className="text-sm font-bold text-gray-800">সাঈদ (হাটহাজারী কলেজ)</span>
          <span className="text-[10px] font-black text-emerald-600">০১৯৪১৬৫২০৯৭</span>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
