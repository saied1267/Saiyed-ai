
import React, { useState, useEffect } from 'react';
import { getRecentEvents } from '../geminiService';

interface NewsProps {
  onBack: () => void;
}

const News: React.FC<NewsProps> = ({ onBack }) => {
  const [newsType, setNewsType] = useState<'bn' | 'en'>('bn');
  const [newsContent, setNewsContent] = useState<Record<'bn' | 'en', { text: string; sources: any[] } | null>>({
    bn: null,
    en: null
  });
  const [loading, setLoading] = useState(false);

  const fetchNews = async (type: 'bn' | 'en') => {
    setLoading(true);
    try {
      const { text, groundingChunks } = await getRecentEvents(type);
      setNewsContent(prev => ({
        ...prev,
        [type]: { text, sources: groundingChunks }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!newsContent[newsType]) {
      fetchNews(newsType);
    }
  }, [newsType]);

  const currentNews = newsContent[newsType];

  // Simple function to extract sections if the model follows the Markdown format
  const formatNewsText = (text: string) => {
    // We can use regex to split by bold titles or double newlines to create modern cards
    const items = text.split(/\n(?=\*\*)/g).filter(item => item.trim().length > 10);
    
    return items.map((item, idx) => {
      // Look for key points section within the item
      const parts = item.split(/(?:Key Points|গুরুত্বপূর্ণ পয়েন্ট):/i);
      const mainText = parts[0];
      const keyPoints = parts[1];

      return (
        <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-700 transition-transform hover:scale-[1.01] mb-6">
          <div className="prose dark:prose-invert max-w-none mb-4">
             <div className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">
               {mainText}
             </div>
          </div>
          
          {keyPoints && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 flex items-center">
                 <span className="mr-2">⚡</span> {newsType === 'bn' ? 'গুরুত্বপূর্ণ পয়েন্ট' : 'Key Points'}
              </h4>
              <div className="text-[13px] font-bold text-gray-700 dark:text-emerald-50 leading-relaxed whitespace-pre-wrap">
                {keyPoints.trim()}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="pb-10 space-y-6 animate-in slide-in-from-right-4 duration-500">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <h2 className="text-2xl font-black text-emerald-600">সাম্প্রতিক সংবাদ</h2>
          </div>
          <button 
            onClick={() => fetchNews(newsType)} 
            disabled={loading}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition ${loading ? 'animate-spin' : ''}`}
          >
            🔄
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-gray-100 dark:bg-slate-900 rounded-[1.5rem] border dark:border-slate-800">
          <button 
            onClick={() => setNewsType('bn')}
            className={`flex-1 py-3 px-2 rounded-[1.2rem] text-[12px] font-black transition-all duration-300 ${
              newsType === 'bn' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' 
                : 'text-gray-400'
            }`}
          >
            বাংলা খবর (Bangla)
          </button>
          <button 
            onClick={() => setNewsType('en')}
            className={`flex-1 py-3 px-2 rounded-[1.2rem] text-[12px] font-black transition-all duration-300 ${
              newsType === 'en' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' 
                : 'text-gray-400'
            }`}
          >
            English News
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-emerald-600 font-black animate-pulse">খবর সংগ্রহ করা হচ্ছে...</p>
        </div>
      ) : currentNews ? (
        <div className="space-y-6">
          {/* News Cards */}
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {formatNewsText(currentNews.text)}
          </div>

          {/* Grounding Sources Box */}
          {currentNews.sources.length > 0 && (
            <section className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-7 shadow-2xl border-2 border-emerald-500/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center relative z-10">
                <span className="mr-3">🔗</span> তথ্যের উৎসসমূহ (Sources)
              </h3>
              <div className="grid grid-cols-1 gap-3 relative z-10">
                {currentNews.sources.map((chunk, i) => (
                  chunk.web && (
                    <a 
                      key={i} 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 bg-white/5 hover:bg-emerald-500/10 rounded-[1.5rem] border border-white/10 transition-all active:scale-95"
                    >
                      <div className="flex-1 truncate mr-4">
                        <p className="text-emerald-400 font-black text-xs truncate">{chunk.web.title || (newsType === 'bn' ? 'সংবাদ সূত্র' : 'News Source')}</p>
                        <p className="text-[10px] text-gray-500 truncate opacity-60">{chunk.web.uri}</p>
                      </div>
                      <span className="text-emerald-500 text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  )
                ))}
              </div>
            </section>
          )}

          <div className="p-5 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800/30">
            <p className="text-[10px] text-gray-400 font-bold text-center leading-relaxed">
              {newsType === 'bn' 
                ? 'গুগল সার্চ গ্রাউন্ডিং এর মাধ্যমে লাইভ তথ্য সংগ্রহ করা হয়েছে।' 
                : 'Data collected live via Google Search grounding.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed dark:border-slate-700">
          <p className="text-gray-500 font-bold">খবর লোড করা সম্ভব হয়নি।</p>
          <button onClick={() => fetchNews(newsType)} className="text-emerald-500 font-black underline mt-3">আবার চেষ্টা করুন</button>
        </div>
      )}
    </div>
  );
};

export default News;
