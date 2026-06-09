import React, { useState, useEffect, useCallback } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (type: 'bn' | 'en') => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRecentEvents(type);
      
      // ডেটা ভ্যালিডেশন
      if (!response || !response.text) {
        throw new Error("সার্ভার থেকে কোনো তথ্য পাওয়া যায়নি।");
      }

      setNewsContent(prev => ({
        ...prev,
        [type]: { 
          text: response.text, 
          sources: response.groundingChunks || [] 
        }
      }));
    } catch (err) {
      console.error("News Fetching Error:", err);
      setError(type === 'bn' ? "খবর লোড করতে সমস্যা হচ্ছে!" : "Failed to load news!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!newsContent[newsType]) {
      fetchNews(newsType);
    }
  }, [newsType, fetchNews, newsContent]);

  const currentNews = newsContent[newsType];

  const formatNewsText = (text: string) => {
    return text.split(/\n(?=\*\*)/g).filter(item => item.trim().length > 10).map((item, idx) => {
      const parts = item.split(/(?:Key Points|গুরুত্বপূর্ণ পয়েন্ট):/i);
      const mainText = parts[0];
      const keyPoints = parts[1];

      return (
        <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-700 mb-6 animate-in fade-in duration-500">
          <div className="prose dark:prose-invert max-w-none mb-4 whitespace-pre-wrap text-[15px] font-medium leading-relaxed">
            {mainText.replace(/\*\*/g, '')}
          </div>
          {keyPoints && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 flex items-center">
                <span className="mr-2">⚡</span> {newsType === 'bn' ? 'গুরুত্বপূর্ণ পয়েন্ট' : 'Key Points'}
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 pb-10 space-y-6">
      <header className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md pt-6 pb-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 transition-all">
              ⬅️
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">সাম্প্রতিক সংবাদ</h2>
          </div>
          <button onClick={() => fetchNews(newsType)} disabled={loading} className={`p-3 bg-emerald-500 text-white rounded-2xl shadow-lg active:scale-90 transition-all ${loading ? 'animate-spin' : ''}`}>
            🔄
          </button>
        </div>

        <div className="flex p-1.5 bg-gray-200 dark:bg-slate-900 rounded-3xl">
          {(['bn', 'en'] as const).map((type) => (
            <button key={type} onClick={() => setNewsType(type)} className={`flex-1 py-3 rounded-2xl text-[12px] font-black transition-all ${newsType === type ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-gray-500'}`}>
              {type === 'bn' ? 'বাংলা খবর' : 'English News'}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold">সংবাদ আপডেট করা হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-red-200 dark:border-red-900">
          <p className="text-red-500 font-bold">{error}</p>
          <button onClick={() => fetchNews(newsType)} className="text-emerald-600 font-black mt-4 underline">আবার চেষ্টা করুন</button>
        </div>
      ) : currentNews ? (
        <div className="space-y-6">
          {formatNewsText(currentNews.text)}
          
          {currentNews.sources.length > 0 && (
            <section className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-emerald-500/20">
              <h3 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest">🔗 তথ্যের উৎসসমূহ</h3>
              <div className="space-y-2">
                {currentNews.sources.map((chunk, i) => chunk.web && (
                  <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white/5 rounded-2xl hover:bg-emerald-500/10 transition-all truncate text-[11px] text-emerald-300">
                    {chunk.web.title || "External Source"}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default News;