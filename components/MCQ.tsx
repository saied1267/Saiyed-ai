
import React, { useState, useEffect } from 'react';
import { Subject, MCQQuestion } from '../types';
import { generateMCQs } from '../geminiService';

interface MCQProps {
  subject: Subject;
  onFlagTopic: (topic: string) => void;
  flaggedTopics: string[];
}

const MCQ_STEPS = [
 "সাঈদ এর সার্ভার এর সাথে সংযোগ করা হচ্ছে...",
  "বিষয়বস্তু বিশ্লেষণ করা হচ্ছে...",
  "NCTB সিলেবাস যাচাই করা হচ্ছে...",
  "৫টি সৃজনশীল প্রশ্ন তৈরি হচ্ছে...",
  "সঠিক উত্তর ও ব্যাখ্যা সাজানো হচ্ছে...",
  "আপনার জন্য প্রশ্নগুলো লোড হচ্ছে..."
];

const MCQ: React.FC<MCQProps> = ({ subject, onFlagTopic, flaggedTopics }) => {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval: number;
    if (loading) {
      setLoadingStep(0);
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev < MCQ_STEPS.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await generateMCQs(subject);
      setQuestions(data);
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subject]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-xl">📝</div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-emerald-600 font-bold text-lg">সাঈদ এর AI প্রশ্ন তৈরি করছে</p>
        <p className="text-sm text-gray-500 animate-pulse font-medium">{MCQ_STEPS[loadingStep]}</p>
      </div>
    </div>
  );
  
  if (questions.length === 0) return (
    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700">
      <p className="text-gray-500">কোনো প্রশ্ন পাওয়া যায়নি। আবার চেষ্টা করুন।</p>
      <button onClick={fetchQuestions} className="mt-4 text-emerald-500 font-bold underline">Try Again</button>
    </div>
  );

  const currentQ = questions[currentIndex];
  const isWrong = selectedAnswer !== null && selectedAnswer !== currentQ.correctAnswer;
  const isFlagged = flaggedTopics.includes(currentQ.topic);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">{subject.split(' ')[0]} অনুশীলন</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{currentQ.topic}</p>
        </div>
        <span className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full font-bold">
          {score}/{questions.length}
        </span>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs font-bold text-gray-400">প্রশ্ন {currentIndex + 1} / {questions.length}</p>
          {isWrong && !isFlagged && (
            <button 
              onClick={() => onFlagTopic(currentQ.topic)}
              className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-1 rounded-md animate-bounce"
            >
              ⚠️ Flag as Weak Topic?
            </button>
          )}
          {isFlagged && (
             <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 px-2 py-1 rounded-md">
                🚩 Flagged
             </span>
          )}
        </div>
        <h3 className="text-lg font-bold leading-relaxed mb-8">{currentQ.question}</h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 transform ${
                selectedAnswer === idx 
                  ? idx === currentQ.correctAnswer 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-[1.02]' 
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20 scale-[1.02]'
                  : selectedAnswer !== null && idx === currentQ.correctAnswer
                    ? 'border-green-500 bg-green-50/50'
                    : 'border-gray-50 dark:border-slate-700/50 hover:border-emerald-500 active:scale-95 bg-gray-50 dark:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  selectedAnswer === idx ? 'bg-white text-gray-900' : 'bg-white dark:bg-slate-700 text-gray-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 animate-in slide-in-from-top-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">💡</span>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">ব্যাখ্যা</p>
            </div>
            <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100 opacity-90">{currentQ.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-2">
        <button 
          onClick={fetchQuestions}
          className="text-gray-400 font-bold text-sm hover:text-emerald-500 transition-colors"
        >
          🔄 নতুন সেট
        </button>
        {currentIndex < questions.length - 1 && selectedAnswer !== null ? (
          <button 
            onClick={nextQuestion}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            পরবর্তী প্রশ্ন ➡️
          </button>
        ) : selectedAnswer !== null && (
          <button 
            onClick={fetchQuestions}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold"
          >
            আবার শুরু করুন
          </button>
        )}
      </div>
    </div>
  );
};

export default MCQ;
