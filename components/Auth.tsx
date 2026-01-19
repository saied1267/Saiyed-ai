
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
        userData = userSnap.data() as AppUser;
      } else {
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'ইউজার',
          isPremium: true,
          interests: [],
          photoURL: firebaseUser.photoURL || undefined
        };
        await setDoc(userDocRef, userData);
      }
      
      localStorage.setItem('saiyed_ai_user', JSON.stringify(userData));
      onLogin(userData);
    } catch (err: any) {
      console.error("Profile Sync Error:", err);
      setError({ msg: 'প্রোফাইল সিঙ্ক করতে সমস্যা হয়েছে। ডাটাবেস রুলস চেক করুন।', code: err.code });
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
            setError({ msg: 'লিঙ্কটি কাজ করছে না অথবা মেয়াদ শেষ হয়ে গেছে।', code: err.code });
            setLoading(false);
          });
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) {
      setError({ msg: 'ফায়ারবেস এপিআই কি (API Key) পাওয়া যায়নি। দয়া করে Netlify সেটিংস চেক করুন।', code: 'CONFIG_MISSING' });
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user);
    } catch (err: any) {
      console.error("Login Error Details:", err);
      let message = 'লগইন প্রক্রিয়ায় সমস্যা হয়েছে।';
      if (err.code === 'auth/popup-closed-by-user') message = 'লগইন উইন্ডোটি বন্ধ করে দেওয়া হয়েছে।';
      if (err.code === 'auth/unauthorized-domain') message = 'এই ডোমেইনটি ফায়ারবেসে অনুমোদিত নয়।';
      if (err.code === 'auth/operation-not-allowed') message = 'গুগল লগইন ফায়ারবেসে ইনেবল করা নেই।';
      if (err.code === 'auth/api-key-not-valid') message = 'আপনার দেওয়া ফায়ারবেস এপিআই কি-টি সঠিক নয়।';
      
      setError({ msg: message, code: err.code });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setError({ msg: 'কনফিগারেশন মিসিং। ইমেইল পাঠানো সম্ভব নয়।', code: 'CONFIG_MISSING' });
      return;
    }

    setLoading(true);
    setError(null);

    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (err: any) {
      setError({ msg: 'ভেরিফিকেশন ইমেইল পাঠানো সম্ভব হয়নি।', code: err.code });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-['Hind_Siliguri'] relative">
      <button 
        onClick={onBack}
        className="absolute top-10 left-6 p-3 bg-white dark:bg-slate-900 rounded-full shadow-lg text-slate-500 active:scale-90 transition-all border dark:border-slate-800"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-emerald-500/20 mb-6 font-black">S</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">সাঈদ এআই একাউন্ট</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">আপনার পার্সোনাল লার্নিং টিউটর</p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center">
             <p className="text-xs font-black text-orange-700">⚠️ কনফিগারেশন সতর্কবার্তা</p>
             <p className="text-[10px] text-orange-600 font-bold mt-1">Netlify-তে FIREBASE_API_KEY সেট করা নেই অথবা সেটি ভুল।</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
          {!emailSent ? (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
                  <p className="text-[11px] font-black">⚠️ {error.msg}</p>
                  {error.code && <p className="text-[8px] opacity-60 mt-1 font-mono uppercase tracking-tighter">এরর কোড: {error.code}</p>}
                </div>
              )}

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center space-x-3 shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.83l3.48-3.48C18.1 1.44 15.3 0 12 0 7.31 0 3.25 2.69 1.25 6.63l3.96 3.07C6.15 7.18 8.84 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.89 3.01c2.27-2.09 3.53-5.17 3.53-8.83z"/>
                  <path fill="#FBBC05" d="M5.21 14.3C4.9 13.3 4.75 12.2 4.75 11s.15-2.3.46-3.3L1.25 4.63C.45 6.47 0 8.5 0 11s.45 4.53 1.25 6.37l3.96-3.07z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.01c-1.08.73-2.47 1.16-4.04 1.16-3.11 0-5.75-2.1-6.7-4.94L1.25 17.37C3.25 21.31 7.31 24 12 24z"/>
                </svg>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">গুগল দিয়ে প্রবেশ করুন</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">অথবা ইমেইল</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
              </div>

              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none rounded-2xl font-bold text-sm transition-all dark:text-white"
                  placeholder="আপনার ইমেইল দিন"
                />
                <button 
                  type="submit" disabled={loading || !email}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>ম্যাজিক লিঙ্ক পাঠান</span>}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto text-3xl">📧</div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">ইমেইল চেক করুন</h2>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">
                আমরা <span className="text-emerald-600">{email}</span> ঠিকানায় একটি লগইন লিঙ্ক পাঠিয়েছি।
              </p>
              <button onClick={() => setEmailSent(false)} className="text-[10px] font-black text-blue-500 underline">আবার চেষ্টা করুন</button>
            </div>
          )}
        </div>
        <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">সুরক্ষিত লগইন প্রযুক্তি | সাঈদ এআই</p>
      </div>
    </div>
  );
};

export default Auth;
                                           
