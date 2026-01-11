import React, { useState } from 'react';
import { 
  Calculator, Lock, Star, Sparkles, Home, TrendingUp, Coins, 
  AlertCircle, Check, Eye, EyeOff, Info, Zap
} from 'lucide-react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

// 與官網一致的深色科技風格
const MarketWarRoom = ({ user, userName }: { user: any; userName?: any }) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'password' | 'feature1' | 'feature2'>('calculator');
  const [calcMode, setCalcMode] = useState<'loan' | 'savings' | 'irr'>('loan');
  
  // 密碼修改狀態
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 快速試算狀態
  const [loanAmount, setLoanAmount] = useState<number>(10000000);
  const [loanRate, setLoanRate] = useState<number>(2.2);
  const [loanYears, setLoanYears] = useState<number>(30);
  
  const [initialCapital, setInitialCapital] = useState<number>(1000000);
  const [monthlyInvest, setMonthlyInvest] = useState<number>(10000);
  const [expectedRate, setExpectedRate] = useState<number>(6);
  const [investYears, setInvestYears] = useState<number>(20);
  
  const [totalPremium, setTotalPremium] = useState<number>(1000000);
  const [maturityValue, setMaturityValue] = useState<number>(1350000);
  const [irrYears, setIrrYears] = useState<number>(10);

  // 計算邏輯
  const getLoanResult = () => {
    const i = loanRate / 100 / 12;
    const n = loanYears * 12;
    if (i === 0) return { monthly: loanAmount / n, totalInterest: 0 };
    const m = (loanAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const totalInterest = m * n - loanAmount;
    return { monthly: Math.round(m), totalInterest: Math.round(totalInterest) };
  };

  const getSavingsResult = () => {
    const r = expectedRate / 100 / 12;
    const n = investYears * 12;
    const fvInitial = initialCapital * Math.pow(1 + r, n);
    const fvMonthly = r === 0 ? monthlyInvest * n : monthlyInvest * ((Math.pow(1 + r, n) - 1) / r);
    const totalMaturity = fvInitial + fvMonthly;
    const totalCost = initialCapital + (monthlyInvest * n);
    return { total: Math.round(totalMaturity), profit: Math.round(totalMaturity - totalCost) };
  };

  const getIrrResult = () => {
    if (totalPremium <= 0 || maturityValue <= 0 || irrYears <= 0) return "0.00";
    return ((Math.pow(maturityValue / totalPremium, 1 / irrYears) - 1) * 100).toFixed(2);
  };

  // 密碼驗證
  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  // 修改密碼
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validatePassword(newPassword)) {
      setMessage({ 
        type: 'error', 
        text: '密碼必須至少 8 位，包含英文和數字' 
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '新密碼與確認密碼不符' });
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        throw new Error('未登入');
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        oldPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      setMessage({ 
        type: 'success', 
        text: '密碼修改成功！3 秒後將重新登入' 
      });

      setTimeout(() => {
        auth.signOut();
        window.location.href = '/login';
      }, 3000);

    } catch (error: any) {
      console.error('修改密碼失敗:', error);
      
      let errorMessage = '修改失敗，請稍後再試';
      if (error.code === 'auth/wrong-password') {
        errorMessage = '目前密碼錯誤';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '新密碼強度不足';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Tab 配置
  const tabs = [
    { id: 'calculator' as const, label: '快速試算', icon: <Calculator size={18} /> },
    { id: 'password' as const, label: '密碼修改', icon: <Lock size={18} /> },
    { id: 'feature1' as const, label: '敬請期待', icon: <Star size={18} /> },
    { id: 'feature2' as const, label: '敬請期待', icon: <Sparkles size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-[#050b14] 
                    bg-[linear-gradient(rgba(77,163,255,0.05)_1px,transparent_1px),
                       linear-gradient(90deg,rgba(77,163,255,0.05)_1px,transparent_1px)]
                    bg-[length:40px_40px] text-white">
      
      {/* Header */}
      <div className="border-b border-white/10 bg-[#050b14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <Zap className="text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Ultra <span className="text-blue-400">戰情室</span>
              </h1>
              <p className="text-slate-500 text-sm">
                {user?.email || userName || '專業財務顧問工具'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)]'
                  : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          
          {/* Tab 1: 快速試算 */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              
              {/* 計算模式選擇 */}
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'loan' as const, name: '貸款月付', icon: <Home size={16} /> },
                  { id: 'savings' as const, name: '複利增值', icon: <TrendingUp size={16} /> },
                  { id: 'irr' as const, name: '儲蓄年化', icon: <Coins size={16} /> }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setCalcMode(mode.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all
                      ${calcMode === mode.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-900/50 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                  >
                    {mode.icon}
                    <span>{mode.name}</span>
                  </button>
                ))}
              </div>

              {/* 計算器內容 */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* 輸入區 */}
                <div className="bg-slate-900/50 rounded-[2rem] p-8 border border-slate-800">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Calculator size={20} className="text-blue-400" />
                    輸入參數
                  </h3>

                  {calcMode === 'loan' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-400 font-bold mb-2 block">
                          貸款總額 (TWD)
                        </label>
                        <input
                          type="number"
                          value={loanAmount}
                          onChange={e => setLoanAmount(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                   text-white font-bold focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400 font-bold mb-2 block">
                            年利率 (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={loanRate}
                            onChange={e => setLoanRate(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                     outline-none focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 font-bold mb-2 block">
                            貸款年期
                          </label>
                          <input
                            type="number"
                            value={loanYears}
                            onChange={e => setLoanYears(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                     outline-none focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {calcMode === 'savings' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400 font-bold mb-2 block">
                            單筆本金
                          </label>
                          <input
                            type="number"
                            value={initialCapital}
                            onChange={e => setInitialCapital(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                     outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 font-bold mb-2 block">
                            每月投入
                          </label>
                          <input
                            type="number"
                            value={monthlyInvest}
                            onChange={e => setMonthlyInvest(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                     outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400 font-bold mb-2 block">
                            年報酬率 (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={expectedRate}
                            onChange={e => setExpectedRate(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                     outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 font-bold mb-2 block">
                            投資年期
                          </label>
                          <input
                            type="number"
                            value={investYears}
                            onChange={e => setInvestYears(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                     outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {calcMode === 'irr' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-400 font-bold mb-2 block">
                          累積繳交保費
                        </label>
                        <input
                          type="number"
                          value={totalPremium}
                          onChange={e => setTotalPremium(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                   outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400 font-bold mb-2 block">
                            滿期領回
                          </label>
                          <input
                            type="number"
                            value={maturityValue}
                            onChange={e => setMaturityValue(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                     text-blue-400 font-bold outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 font-bold mb-2 block">
                            總年期
                          </label>
                          <input
                            type="number"
                            value={irrYears}
                            onChange={e => setIrrYears(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                     outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 結果區 */}
                <div className="bg-slate-900/50 rounded-[2rem] p-8 border border-slate-800">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-400" />
                    計算結果
                  </h3>

                  {calcMode === 'loan' && (
                    <div className="space-y-6">
                      <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
                        <p className="text-slate-400 text-sm font-bold mb-2">預估月付金</p>
                        <p className="text-4xl font-black text-blue-400">
                          {getLoanResult().monthly.toLocaleString()}
                          <span className="text-lg text-slate-500 ml-2">TWD</span>
                        </p>
                      </div>
                      <div className="border-t border-slate-800 pt-6">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold">累積利息支出</span>
                          <span className="text-xl font-bold text-white">
                            {getLoanResult().totalInterest.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {calcMode === 'savings' && (
                    <div className="space-y-6">
                      <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6">
                        <p className="text-slate-400 text-sm font-bold mb-2">滿期資產總額</p>
                        <p className="text-4xl font-black text-emerald-400">
                          {getSavingsResult().total.toLocaleString()}
                          <span className="text-lg text-slate-500 ml-2">TWD</span>
                        </p>
                      </div>
                      <div className="border-t border-slate-800 pt-6">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold">累積淨回報</span>
                          <span className="text-xl font-bold text-emerald-400">
                            +{getSavingsResult().profit.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {calcMode === 'irr' && (
                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-8">
                      <p className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-widest text-center">
                        實質年化報酬率 (IRR)
                      </p>
                      <p className="text-6xl font-black text-blue-400 text-center">
                        {getIrrResult()}
                        <span className="text-2xl ml-2">%</span>
                      </p>
                    </div>
                  )}

                  {/* 提示區 */}
                  <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex gap-3 items-start">
                      <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 leading-relaxed">
                        數據僅供參考，實際數值請以合約或各金融機構最終核定為準。
                        此工具能幫助您在面談現場快速試算。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 密碼修改 */}
          {activeTab === 'password' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-slate-900/50 rounded-[2rem] p-8 border border-slate-800">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Lock className="text-blue-400" />
                  修改密碼
                </h3>
                <p className="text-slate-400 text-sm mb-8">
                  為了您的帳戶安全，請定期更換密碼
                </p>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  
                  {/* 目前密碼 */}
                  <div>
                    <label className="text-sm text-slate-400 font-bold mb-2 block">
                      目前密碼
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pr-12
                                 outline-none focus:border-blue-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* 新密碼 */}
                  <div>
                    <label className="text-sm text-slate-400 font-bold mb-2 block">
                      新密碼
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pr-12
                                 outline-none focus:border-blue-500 transition-all"
                        placeholder="至少 8 位，包含英文和數字"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* 確認密碼 */}
                  <div>
                    <label className="text-sm text-slate-400 font-bold mb-2 block">
                      確認新密碼
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pr-12
                                 outline-none focus:border-blue-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* 訊息提示 */}
                  {message.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${
                      message.type === 'success' 
                        ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-600/10 border border-red-500/20 text-red-400'
                    }`}>
                      {message.type === 'success' ? (
                        <Check size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      <span className="font-bold">{message.text}</span>
                    </div>
                  )}

                  {/* 送出按鈕 */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg
                             hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]
                             transition-all"
                  >
                    {loading ? '處理中...' : '修改密碼'}
                  </button>
                </form>

                {/* 安全提示 */}
                <div className="mt-8 p-6 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="text-blue-400" size={18} />
                    <p className="text-sm font-bold text-slate-300">安全提示</p>
                  </div>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>密碼長度至少 8 位</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>必須包含英文字母和數字</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>不要使用容易猜測的密碼</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>定期更換密碼以確保安全</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3 & 4: 敬請期待 */}
          {(activeTab === 'feature1' || activeTab === 'feature2') && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-slate-900/50 rounded-[2rem] p-16 border border-slate-800 text-center">
                <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                  <Sparkles className="text-blue-400" size={40} />
                </div>
                <h3 className="text-3xl font-black mb-4">新功能開發中</h3>
                <p className="text-slate-400 text-lg mb-8">
                  我們正在努力開發更多強大功能，敬請期待！
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 font-bold">
                  <Info size={18} />
                  <span>預計 Phase 2 推出</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MarketWarRoom;