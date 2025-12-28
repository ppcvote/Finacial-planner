import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { UserPlus, Lock, Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface SecretSignupPageProps {
  onSignupSuccess: () => void;
}

// [修正關鍵] 這裡必須是 export const，不能只有 const
export const SecretSignupPage: React.FC<SecretSignupPageProps> = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("兩次密碼輸入不一致");
      return;
    }
    if (password.length < 6) {
        setError("密碼長度需至少 6 碼");
        return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name || '菁英顧問' });

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: name || '菁英顧問',
        role: 'paid_user',
        plan: 'pro',
        createdAt: Timestamp.now(),
        status: 'active',
        system: {
            dashboard: {
                displayName: name || '菁英顧問'
            }
        }
      });

      onSignupSuccess(); 

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
          setError("此 Email 已被註冊過，請直接登入。");
      } else {
          setError("開通失敗，請稍後再試或聯繫客服。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-fade-in-up border-t-4 border-emerald-500">
        
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-emerald-50 rounded-full mb-4">
            <UserPlus size={48} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">會員帳號開通</h1>
          <p className="text-slate-500 text-sm mt-2">歡迎加入 Ultra Advisor</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">您的稱呼</label>
            <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="例如：陳經理"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Email (將作為登入帳號)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">設定密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="至少 6 位數"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">確認密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="再次輸入密碼"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>}
            {loading ? "開通中..." : "確認開通並登入"}
          </button>
        </form>
      </div>
    </div>
  );
};