
import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';
import { auth, googleProvider, db, isFirebaseConfigured } from '../firebaseConfig';
import { 
  signInWithPopup, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthProps {
  onLogin: (user: AppUser) => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<{msg: string, code?: string} | null>(null);

  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);
      
      let userData: AppUser;
      
      if (userSnap.exists()) {
        const cloudData = userSnap.data();
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: cloudData.name || firebaseUser.displayName || 'ইউজার',
          isPremium: true,
          interests: cloudData.interests || [],
          photoURL: cloudData.photoURL || firebaseUser.photoURL || undefined
        };
        
        // Critical: Restore cloud histories to local immediately on login
        if (cloudData.chatHistories) {
          localStorage.setItem('saiyed_ai_local_history', JSON.stringify(cloudData.chatHistories));
        }
      } else {
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'ইউজার',
          isPremium: true,
          interests: [],
          photoURL: firebaseUser.photoURL || undefined
        };
        await setDoc(userDocRef, { ...userData, chatHistories: {}, created: Date.now() });
      }
      
      localStorage.setItem('saiyed_ai_user', JSON.stringify(userData));
      onLogin(userData);
    } catch (err: any) {
      console.error("Auth Data Sync Error:", err);
      setError({ msg: 'প্রোফাইল সিঙ্ক করতে সমস্যা হয়েছে। ডাটাবেস পারমিশন চেক করুন।', code: err.code });
    }
  };

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('ভেরিফিকেশনের জন্য আপনার ইমেইলটি আবার লিখুন:');
      }
      if (emailForSignIn) {
        setLoading(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            await syncUserProfile(result.user);
          })
          .catch((err) => {
            setError({ msg: 'লিঙ্কটি কাজ করছে না।', code: err.code });
            setLoading(false);
          });
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user);
    } catch (err: any) {
      setError({ msg: 'লগইন প্রক্রিয়ায় সমস্যা হয়েছে।', code: err.code });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendSignInLinkToEmail(auth, email, { url: window.location.origin, handleCodeInApp: true });
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (err: any) {
      setError({ msg: 'ইমেইল পাঠানো সম্ভব হয়নি।', code: err.code });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-['Hind_Siliguri'] relative">
      <button onClick={onBack} className="absolute top-10 left-6 p-3 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-500 border dark:border-slate-800">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2.2rem] flex items-center justify-center text-4xl mx-auto shadow-2xl mb-8 font-black">S</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">সাঈদ এআই একাউন্ট</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">আপনার পার্সোনাল টিউটর</p>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border dark:border-slate-800">
          {!emailSent ? (
            <div className="space-y-6">
              {error && <p className="text-[11px] font-black text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error.msg}</p>}
              <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-[1.2rem] flex items-center justify-center space-x-3 shadow-sm active:scale-95 transition-all">
                <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" className="w-5 h-5" alt="g" />
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">গুগল দিয়ে প্রবেশ করুন</span>
              </button>
              <div className="flex items-center space-x-4"><div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div><span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">অথবা</span><div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div></div>
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-transparent focus:border-emerald-500 outline-none rounded-2xl font-bold text-sm transition-all dark:text-white" placeholder="আপনার ইমেইল দিন" />
                <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
                  {loading ? 'অপেক্ষা করুন...' : 'ম্যাজিক লিঙ্ক পাঠান'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center space-y-4 py-4">
              <span className="text-4xl">📧</span>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">ইমেইল চেক করুন</h2>
              <p className="text-[12px] text-slate-500 font-bold">লগইন লিঙ্ক পাঠানো হয়েছে।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
