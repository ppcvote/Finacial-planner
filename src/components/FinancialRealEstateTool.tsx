import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Building2,
  Calculator,
  Scale,
  Landmark,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp,
  PiggyBank,
  Briefcase,
  ArrowDown,
  AlertTriangle,
  Clock,
  Target,
  Shield,
  Zap,
  Award,
  ChevronRight,
  Sparkles,
  DollarSign,
  Home,
  Wallet,
  TrendingDown,
  X,
  Banknote,
  Lock,
  Crown
} from 'lucide-react';
import { useMembership } from '../hooks/useMembership';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';

// ============================================================
// 輔助函式
// ============================================================
const formatMoney = (val: number) => {
  if (val >= 10000) {
    const yi = Math.floor(val / 10000);
    const wan = Math.round(val % 10000);
    return wan > 0 ? `${yi}億${wan.toLocaleString()}萬` : `${yi}億`;
  }
  return `${Math.round(val).toLocaleString()}萬`;
};

const formatMoneyYuan = (val: number) => {
  return `$${Math.round(val).toLocaleString()}`;
};

// 貸款計算
const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const p = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const y = Number(years) || 0;
  const r = rVal / 100 / 12;
  const n = y * 12;
  if (rVal === 0) return (p * 10000) / (n || 1);
  const result = (p * 10000 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return isNaN(result) ? 0 : result;
};

const calculateMonthlyIncome = (principal: number, rate: number) => {
  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  return (p * 10000 * (r / 100)) / 12;
};

const calculateRemainingBalance = (principal: number, rate: number, totalYears: number, yearsElapsed: number) => {
  const pVal = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const totalY = Number(totalYears) || 0;
  const elapsed = Number(yearsElapsed) || 0;
  const r = rVal / 100 / 12;
  const n = totalY * 12;
  const p = elapsed * 12;
  if (elapsed >= totalY || rVal === 0) return Math.max(0, pVal * 10000 * (1 - p / (n || 1)));
  const balance = (pVal * 10000) * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};

// ============================================================
// 預設配置
// ============================================================
const PRESET_CONFIGS = {
  conservative: {
    label: '穩健型',
    icon: Shield,
    color: 'blue',
    loanRate: 2.0,
    investReturnRate: 5,
    description: '低利率 + 穩定配息',
    riskLevel: 1,
    products: ['債券 ETF', '高評級公司債', '儲蓄險']
  },
  balanced: {
    label: '平衡型',
    icon: Target,
    color: 'emerald',
    loanRate: 2.2,
    investReturnRate: 6,
    description: '適中利率 + 合理報酬',
    riskLevel: 2,
    products: ['高股息 ETF', '債券型基金', 'REITs']
  },
  aggressive: {
    label: '積極型',
    icon: TrendingUp,
    color: 'amber',
    loanRate: 2.5,
    investReturnRate: 8,
    description: '追求高現金流',
    riskLevel: 3,
    products: ['高收益債', '新興市場債', '特別股 ETF']
  }
};

// ============================================================
// 主元件
// ============================================================
export const FinancialRealEstateTool = ({ data, setData, userId }: any) => {
  // 會員權限判斷
  const { membership } = useMembership(userId || null);
  const isPaidMember = membership?.isPaid || false;

  // --- 隱藏小抄狀態 ---
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  // --- 首次進入提示狀態 ---
  const [showTripleClickHint, setShowTripleClickHint] = useState(false);
  const HINT_STORAGE_KEY = 'ua_estate_cheatsheet_hint_seen';

  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClickCount(0), 800);
    if (clickCount >= 2) {
      setShowCheatSheet(true);
      setClickCount(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCheatSheet(false);
        setShowTripleClickHint(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 首次進入頁面顯示提示
  useEffect(() => {
    const hasSeenHint = localStorage.getItem(HINT_STORAGE_KEY);
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        setShowTripleClickHint(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 關閉提示並記錄已看過
  const dismissHint = () => {
    setShowTripleClickHint(false);
    localStorage.setItem(HINT_STORAGE_KEY, 'true');
  };

  // --- 資料初始化 ---
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 1000,
    loanTerm: Number(data?.loanTerm) || 30,
    loanRate: Number(data?.loanRate) || 2.2,
    investReturnRate: Number(data?.investReturnRate) || 6,

    // 轉增貸參數
    existingLoanBalance: Number(data?.existingLoanBalance) || 700,
    existingMonthlyPayment: Number(data?.existingMonthlyPayment) || 38000,

    // v2 新增
    planMode: data?.planMode || 'none', // 'none' | 'newLoan' | 'refinance'
    configType: data?.configType || 'balanced',
    clientAge: Number(data?.clientAge) || 45,
  };

  const {
    loanAmount, loanTerm, loanRate, investReturnRate,
    existingLoanBalance, existingMonthlyPayment,
    planMode, configType, clientAge
  } = safeData;

  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- 暫存輸入狀態（允許用戶自由輸入，onBlur 時驗證）---
  const [tempLoanAmount, setTempLoanAmount] = useState<string | number>(loanAmount);
  const [tempLoanTerm, setTempLoanTerm] = useState<string | number>(loanTerm);
  const [tempLoanRate, setTempLoanRate] = useState<string | number>(loanRate);
  const [tempInvestReturnRate, setTempInvestReturnRate] = useState<string | number>(investReturnRate);
  const [tempExistingLoanBalance, setTempExistingLoanBalance] = useState<string | number>(existingLoanBalance);
  const [tempExistingMonthlyPayment, setTempExistingMonthlyPayment] = useState<string | number>(existingMonthlyPayment);
  const [tempClientAge, setTempClientAge] = useState<string | number>(clientAge);

  // 同步外部資料變化
  useEffect(() => { setTempLoanAmount(loanAmount); }, [loanAmount]);
  useEffect(() => { setTempLoanTerm(loanTerm); }, [loanTerm]);
  useEffect(() => { setTempLoanRate(loanRate); }, [loanRate]);
  useEffect(() => { setTempInvestReturnRate(investReturnRate); }, [investReturnRate]);
  useEffect(() => { setTempExistingLoanBalance(existingLoanBalance); }, [existingLoanBalance]);
  useEffect(() => { setTempExistingMonthlyPayment(existingMonthlyPayment); }, [existingMonthlyPayment]);
  useEffect(() => { setTempClientAge(clientAge); }, [clientAge]);

  // --- 輸入驗證函數（onBlur 時觸發）---
  const finalizeLoanAmount = () => {
    let val = Number(tempLoanAmount) || 1000;
    val = Math.max(100, Math.min(10000, val));
    setData({ ...data, loanAmount: val });
    setTempLoanAmount(val);
  };

  const finalizeLoanTerm = () => {
    let val = Number(tempLoanTerm) || 30;
    val = Math.max(10, Math.min(40, val));
    setData({ ...data, loanTerm: val });
    setTempLoanTerm(val);
  };

  const finalizeLoanRate = () => {
    let val = Number(tempLoanRate) || 2.2;
    val = Math.max(1.5, Math.min(5, val));
    val = Math.round(val * 10) / 10; // 保留一位小數
    setData({ ...data, loanRate: val });
    setTempLoanRate(val);
  };

  const finalizeInvestReturnRate = () => {
    let val = Number(tempInvestReturnRate) || 6;
    val = Math.max(3, Math.min(12, val));
    val = Math.round(val * 10) / 10;
    setData({ ...data, investReturnRate: val });
    setTempInvestReturnRate(val);
  };

  const finalizeExistingLoanBalance = () => {
    let val = Number(tempExistingLoanBalance) || 700;
    val = Math.max(0, Math.min(10000, val));
    setData({ ...data, existingLoanBalance: val });
    setTempExistingLoanBalance(val);
  };

  const finalizeExistingMonthlyPayment = () => {
    let val = Number(tempExistingMonthlyPayment) || 38000;
    val = Math.max(10000, Math.min(300000, val));
    setData({ ...data, existingMonthlyPayment: val });
    setTempExistingMonthlyPayment(val);
  };

  const finalizeClientAge = () => {
    let val = Number(tempClientAge) || 45;
    val = Math.max(20, Math.min(99, val)); // 年齡上限 99
    setData({ ...data, clientAge: val });
    setTempClientAge(val);
  };

  const handleKeyDown = (finalizer: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finalizer();
      e.currentTarget.blur();
    }
  };

  // 處理輸入值，移除前導零（手機版相容）
  const sanitizeInput = (val: string): string => {
    if (val === '') return '';
    // 移除前導零，但保留 "0"、"0." 等情況
    return val.replace(/^0+(?=\d)/, '');
  };

  // --- 計算引擎 ---
  const calculations = useMemo(() => {
    // 每月貸款支出
    const monthlyPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
    
    // 每月配息收入
    const monthlyIncome = calculateMonthlyIncome(loanAmount, investReturnRate);
    
    // 淨現金流
    const netCashFlow = monthlyIncome - monthlyPayment;
    const isPositiveCashFlow = netCashFlow >= 0;
    
    // 需自行負擔金額
    const monthlyOutOfPocket = isPositiveCashFlow ? 0 : Math.abs(netCashFlow);
    const totalOutOfPocket = monthlyOutOfPocket * 12 * loanTerm;
    
    // 收益差額分析
    const rateSpread = investReturnRate - loanRate;
    const isPositiveSpread = rateSpread > 0;
    
    // 損益平衡配息率
    const breakEvenRate = (monthlyPayment * 12 / (loanAmount * 10000)) * 100;
    
    // 轉增貸計算
    const cashOutAmount = Math.max(0, loanAmount - existingLoanBalance);
    const monthlyIncomeFromCashOut = calculateMonthlyIncome(cashOutAmount, investReturnRate);
    const netNewMonthlyPayment = monthlyPayment - monthlyIncomeFromCashOut;
    const monthlySavings = existingMonthlyPayment - netNewMonthlyPayment;
    const totalSavingsOverTerm = monthlySavings * 12 * loanTerm;
    
    // 期滿累積效益
    const cumulativeCashFlow = netCashFlow * 12 * loanTerm;
    const totalWealthNewLoan = loanAmount * 10000 + cumulativeCashFlow;
    const totalWealthRefinance = cashOutAmount * 10000 + totalSavingsOverTerm;
    
    // 槓桿效益（以小博大）
    const leverageRatio = isPositiveCashFlow ? Infinity : loanAmount * 10000 / totalOutOfPocket;
    
    // 圖表數據生成
    const generateChartData = (isRefinance: boolean) => {
      const dataArr = [];
      let cumulative = 0;
      const step = loanTerm > 20 ? 3 : 1;
      
      for (let year = 0; year <= loanTerm; year++) {
        if (year === 0) {
          dataArr.push({
            year: '起點',
            資產價值: isRefinance ? cashOutAmount : 0,
            貸款餘額: isRefinance ? loanAmount : loanAmount,
            累積現金流: 0
          });
          continue;
        }
        
        const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
        
        if (isRefinance) {
          cumulative += monthlySavings * 12;
        } else {
          cumulative += netCashFlow * 12;
        }
        
        if (year === 1 || year % step === 0 || year === loanTerm) {
          dataArr.push({
            year: `${year}年`,
            資產價值: isRefinance 
              ? Math.round((cashOutAmount * 10000 + cumulative) / 10000)
              : Math.round((loanAmount * 10000 - remainingLoan + cumulative) / 10000),
            貸款餘額: Math.round(remainingLoan / 10000),
            累積現金流: Math.round(cumulative / 10000)
          });
        }
      }
      return dataArr;
    };

    // 智能推薦
    let recommendation: 'newLoan' | 'refinance' = 'newLoan';
    let recommendationReasons: string[] = [];
    
    if (existingLoanBalance > 0 && existingLoanBalance < loanAmount * 0.8) {
      recommendation = 'refinance';
      recommendationReasons.push('現有房貸可增貸空間大');
    }
    
    if (clientAge >= 50) {
      recommendationReasons.push('年齡因素，建議穩健配置');
    }
    
    if (rateSpread >= 3) {
      recommendationReasons.push(`收益差額 ${rateSpread.toFixed(1)}%，現金流空間佳`);
    }
    
    if (isPositiveCashFlow) {
      recommendationReasons.push('正現金流，配息完全支付房貸');
    }

    // 不同利率情境比較
    const scenarios = {
      low: calculateMonthlyIncome(loanAmount, 4) - monthlyPayment,
      mid: calculateMonthlyIncome(loanAmount, 6) - monthlyPayment,
      high: calculateMonthlyIncome(loanAmount, 8) - monthlyPayment,
    };

    return {
      // 基礎計算
      monthlyPayment,
      monthlyIncome,
      netCashFlow,
      isPositiveCashFlow,
      monthlyOutOfPocket,
      totalOutOfPocket,
      
      // 收益差額
      rateSpread,
      isPositiveSpread,
      breakEvenRate,
      
      // 轉增貸
      cashOutAmount,
      monthlyIncomeFromCashOut,
      netNewMonthlyPayment,
      monthlySavings,
      totalSavingsOverTerm,
      
      // 累積效益
      cumulativeCashFlow,
      totalWealthNewLoan,
      totalWealthRefinance,
      
      // 槓桿
      leverageRatio,
      
      // 圖表
      chartDataNewLoan: generateChartData(false),
      chartDataRefinance: generateChartData(true),
      
      // 推薦
      recommendation,
      recommendationReasons,
      
      // 情境
      scenarios,
    };
  }, [loanAmount, loanTerm, loanRate, investReturnRate, existingLoanBalance, existingMonthlyPayment, clientAge]);

  // --- UI Handlers ---
  const updateField = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  const updateFields = (updates: Record<string, any>) => {
    setData({ ...data, ...updates });
  };

  const applyConfig = (type: keyof typeof PRESET_CONFIGS) => {
    const config = PRESET_CONFIGS[type];
    updateFields({
      configType: type,
      loanRate: config.loanRate,
      investReturnRate: config.investReturnRate
    });
  };

  // ============================================================
  // UI 渲染
  // ============================================================
  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Building2 size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Passive Income
            </span>
            <div className="relative">
              <span
                onClick={handleSecretClick}
                className="bg-orange-400/20 text-orange-100 px-3 py-1 rounded-full text-xs font-bold border border-orange-400/30 cursor-default select-none"
              >
                以息養貸・數位包租公
              </span>
              {/* 首次進入提示氣泡 - 顯示在右側 */}
              {showTripleClickHint && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 animate-pulse">
                  <div className="relative bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-slate-900" />
                    <p className="text-sm font-bold flex items-center gap-2">
                      <span className="text-yellow-400">💡</span>
                      點三下可開啟業務小抄
                    </p>
                    <button
                      onClick={dismissHint}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight">
            金融房產專案
          </h1>
          <p className="text-emerald-100 text-sm opacity-90">
            運用配息收入支付房貸，輕鬆累積資產，打造真正的被動收入
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 第一區：現況分析 (三欄) */}
      {/* ============================================================ */}
      <div className="grid lg:grid-cols-3 gap-4">
        
        {/* 參數設定 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
            <Calculator size={16} className="text-emerald-600"/> 基本參數
          </h4>
          
          <div className="space-y-4">
            {/* 貸款金額 - 可點擊輸入 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-500">資產/貸款總額</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={tempLoanAmount}
                    onChange={(e) => setTempLoanAmount(sanitizeInput(e.target.value))}
                    onBlur={finalizeLoanAmount}
                    onKeyDown={handleKeyDown(finalizeLoanAmount)}
                    className="w-24 text-xl font-black text-emerald-600 text-right bg-transparent border-b-2 border-transparent hover:border-emerald-300 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <span className="text-sm text-slate-400">萬</span>
                </div>
              </div>
              <input
                type="range" min={100} max={10000} step={100}
                value={loanAmount}
                onChange={(e) => updateField('loanAmount', Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>100萬</span>
                <span>1億</span>
              </div>
            </div>

            {/* 貸款年期 - 可點擊輸入 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-500">貸款年期</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={tempLoanTerm}
                    onChange={(e) => setTempLoanTerm(sanitizeInput(e.target.value))}
                    onBlur={finalizeLoanTerm}
                    onKeyDown={handleKeyDown(finalizeLoanTerm)}
                    className="w-16 text-xl font-black text-teal-600 text-right bg-transparent border-b-2 border-transparent hover:border-teal-300 focus:border-teal-500 focus:outline-none transition-colors"
                  />
                  <span className="text-sm text-slate-400">年</span>
                </div>
              </div>
              <input
                type="range" min={10} max={40} step={1}
                value={loanTerm}
                onChange={(e) => updateField('loanTerm', Number(e.target.value))}
                className="w-full h-2 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
            
            {/* 進階設定 */}
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs ${
                showAdvanced ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="flex items-center gap-1"><Settings size={14}/> 進階參數</span>
              {showAdvanced ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
            
            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-500">貸款利率</span>
                    <div className="flex items-center gap-0.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        step={0.1}
                        value={tempLoanRate}
                        onChange={(e) => setTempLoanRate(sanitizeInput(e.target.value))}
                        onBlur={finalizeLoanRate}
                        onKeyDown={handleKeyDown(finalizeLoanRate)}
                        className="w-14 font-bold text-slate-700 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-500 focus:outline-none"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </div>
                  <input
                    type="range" min={1.5} max={5} step={0.1}
                    value={loanRate}
                    onChange={(e) => updateField('loanRate', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-500">投資配息率</span>
                    <div className="flex items-center gap-0.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        step={0.1}
                        value={tempInvestReturnRate}
                        onChange={(e) => setTempInvestReturnRate(sanitizeInput(e.target.value))}
                        onBlur={finalizeInvestReturnRate}
                        onKeyDown={handleKeyDown(finalizeInvestReturnRate)}
                        className="w-14 font-bold text-blue-600 text-right bg-transparent border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                  </div>
                  <input
                    type="range" min={3} max={12} step={0.1}
                    value={investReturnRate}
                    onChange={(e) => updateField('investReturnRate', Number(e.target.value))}
                    className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 每月現金流 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
            <DollarSign size={16} className="text-blue-500"/> 每月現金流試算
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">配息收入</span>
              <span className="font-bold text-emerald-600">+{formatMoneyYuan(calculations.monthlyIncome)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">貸款支出</span>
              <span className="font-bold text-red-500">-{formatMoneyYuan(calculations.monthlyPayment)}</span>
            </div>
            <div className="h-px bg-slate-100"></div>
            
            {/* 淨現金流大字 */}
            <div className={`p-4 rounded-xl text-center ${
              calculations.isPositiveCashFlow 
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
            }`}>
              <p className="text-xs text-slate-600 mb-1">
                {calculations.isPositiveCashFlow ? '每月淨現金流' : '每月只需負擔'}
              </p>
              <p className={`text-3xl font-black ${
                calculations.isPositiveCashFlow ? 'text-emerald-600' : 'text-blue-600'
              }`}>
                {calculations.isPositiveCashFlow ? '+' : ''}{formatMoneyYuan(Math.abs(calculations.netCashFlow))}
              </p>
            </div>
            
            {/* 收益差額提示 */}
            <div className={`p-2 rounded-lg text-center ${
              calculations.isPositiveSpread ? 'bg-emerald-50' : 'bg-slate-50'
            }`}>
              <p className="text-[10px] text-slate-600">
                收益差額：配息 {investReturnRate}% - 貸款 {loanRate}% = 
                <span className={`font-bold ml-1 ${calculations.isPositiveSpread ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {calculations.rateSpread.toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 資產累積效益 - 核心價值 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-emerald-500"/> 資產累積效益
          </h4>
          
          <div className="space-y-3">
            {calculations.isPositiveCashFlow ? (
              <>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-600 mb-1">🎉 配息完全支付房貸，還有盈餘！</p>
                  <p className="text-2xl font-black text-emerald-600">
                    每月多 {formatMoneyYuan(calculations.netCashFlow)}
                  </p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg text-center">
                  <p className="text-xs font-bold text-emerald-700">
                    {loanTerm}年累積現金流：{formatMoney(Math.round(calculations.cumulativeCashFlow / 10000))}
                  </p>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg text-center">
                  <p className="text-xs text-slate-700">
                    期滿擁有 <b className="text-emerald-600 text-lg">{formatMoney(loanAmount)}</b> 資產
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <p className="text-xs text-blue-600 mb-1">聰明理財：小額累積大資產</p>
                  <p className="text-xl font-black text-blue-600">
                    每月只需 {formatMoneyYuan(calculations.monthlyOutOfPocket)}
                  </p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-center border border-emerald-200">
                  <p className="text-xs text-emerald-700">
                    總投入 <b>{formatMoney(Math.round(calculations.totalOutOfPocket / 10000))}</b>
                    <br/>
                    累積 <b className="text-lg text-emerald-600">{formatMoney(loanAmount)}</b> 資產
                  </p>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg text-center">
                  <p className="text-[10px] text-slate-600">
                    當配息率達 <b>{calculations.breakEvenRate.toFixed(1)}%</b> 即可達成正現金流
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 第二區：智能推薦 + 方案選擇 */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-slate-700" />
              <h4 className="font-bold text-slate-800">選擇規劃模式</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {calculations.recommendationReasons.map((reason, idx) => (
                <span key={idx} className="px-2 py-1 bg-white rounded text-xs text-slate-600">
                  • {reason}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => updateField('planMode', 'newLoan')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${
                planMode === 'newLoan'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-emerald-600 border border-emerald-200 hover:border-emerald-400'
              }`}
            >
              <Building2 size={16} />
              金融房產
              {calculations.recommendation === 'newLoan' && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-amber-900 rounded text-[10px]">推薦</span>
              )}
            </button>
            <button
              onClick={() => updateField('planMode', 'refinance')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${
                planMode === 'refinance'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-orange-600 border border-orange-200 hover:border-orange-400'
              }`}
            >
              <RefreshCw size={16} />
              轉增貸
              {calculations.recommendation === 'refinance' && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-amber-900 rounded text-[10px]">推薦</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 第三區：方案詳情 */}
      {/* ============================================================ */}
      {planMode !== 'none' && (
        <div className="grid lg:grid-cols-5 gap-6">
          
          {/* 左側：參數 + 說明 */}
          <div className="lg:col-span-2 space-y-4">
            
            {planMode === 'refinance' && (
              <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-5">
                <h4 className="font-bold text-orange-700 mb-4 flex items-center gap-2 text-sm">
                  <RefreshCw size={16}/> 轉增貸參數
                </h4>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-orange-600">現有房貸餘額</span>
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={tempExistingLoanBalance}
                          onChange={(e) => setTempExistingLoanBalance(sanitizeInput(e.target.value))}
                          onBlur={finalizeExistingLoanBalance}
                          onKeyDown={handleKeyDown(finalizeExistingLoanBalance)}
                          className="w-20 font-bold text-orange-700 text-right bg-transparent border-b border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none"
                        />
                        <span className="text-orange-400">萬</span>
                      </div>
                    </div>
                    <input
                      type="range" min={0} max={10000} step={100}
                      value={existingLoanBalance}
                      onChange={(e) => updateField('existingLoanBalance', Number(e.target.value))}
                      className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-[10px] text-orange-400 mt-1">
                      <span>0</span>
                      <span>1億</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-orange-600">現有月付金</span>
                      <div className="flex items-center gap-0.5">
                        <span className="text-orange-400">$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={tempExistingMonthlyPayment}
                          onChange={(e) => setTempExistingMonthlyPayment(sanitizeInput(e.target.value))}
                          onBlur={finalizeExistingMonthlyPayment}
                          onKeyDown={handleKeyDown(finalizeExistingMonthlyPayment)}
                          className="w-24 font-bold text-orange-700 text-right bg-transparent border-b border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <input
                      type="range" min={10000} max={300000} step={1000}
                      value={existingMonthlyPayment}
                      onChange={(e) => updateField('existingMonthlyPayment', Number(e.target.value))}
                      className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-orange-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700">可增貸金額</span>
                      <span className="font-black text-orange-600">{formatMoney(calculations.cashOutAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-orange-600">增貸產生配息</span>
                      <span className="font-bold text-emerald-600">+{formatMoneyYuan(calculations.monthlyIncomeFromCashOut)}/月</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 核心效益展示 */}
            <div className={`rounded-xl shadow-sm border p-5 ${
              planMode === 'newLoan' 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <h4 className={`font-bold mb-4 flex items-center gap-2 text-sm ${
                planMode === 'newLoan' ? 'text-emerald-700' : 'text-orange-700'
              }`}>
                <TrendingUp size={16}/> 核心效益
              </h4>
              
              {planMode === 'newLoan' ? (
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">期滿擁有資產</p>
                    <p className="text-2xl font-black text-emerald-600">{formatMoney(loanAmount)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">{loanTerm}年累積現金流</p>
                    <p className={`text-xl font-black ${calculations.cumulativeCashFlow >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {calculations.cumulativeCashFlow >= 0 ? '+' : ''}{formatMoney(Math.round(calculations.cumulativeCashFlow / 10000))}
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-lg text-center border border-emerald-300">
                    <p className="text-xs text-emerald-700 mb-1">期滿總效益</p>
                    <p className="text-2xl font-black text-emerald-700">
                      {formatMoney(Math.round(calculations.totalWealthNewLoan / 10000))}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-lg text-center">
                      <p className="text-[10px] text-slate-500">原月付金</p>
                      <p className="text-lg font-bold text-slate-400 line-through">
                        {formatMoneyYuan(existingMonthlyPayment)}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg text-center">
                      <p className="text-[10px] text-emerald-600">新月付金</p>
                      <p className="text-lg font-black text-emerald-600">
                        {formatMoneyYuan(calculations.netNewMonthlyPayment)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg text-center border border-orange-300">
                    <p className="text-xs text-orange-700 mb-1">每月減輕負擔</p>
                    <p className="text-2xl font-black text-orange-700">
                      {formatMoneyYuan(calculations.monthlySavings)}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg text-center">
                    <p className="text-xs text-slate-600">
                      {loanTerm}年總計省下：<b className="text-orange-600">{formatMoney(Math.round(calculations.totalSavingsOverTerm / 10000))}</b>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 進階功能入口 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm border border-slate-700 p-4 text-white">
              <h4 className="font-bold mb-3 text-sm flex items-center gap-1">
                <Landmark size={14} className="text-amber-400"/> 配息標的研究
              </h4>
              <p className="text-[11px] text-slate-300 mb-3">
                深入分析高配息基金、ETF、債券等標的，找出最適合您的投資組合
              </p>
              <button 
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                onClick={() => alert('此功能僅限付費會員使用，敬請期待！')}
              >
                <Sparkles size={16} />
                進入基金戰情室
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">PRO</span>
              </button>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                付費會員專屬功能
              </p>
            </div>
          </div>

          {/* 右側：圖表 */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* 成長曲線圖 */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`font-bold text-sm pl-2 border-l-4 ${
                  planMode === 'newLoan' ? 'border-emerald-500 text-slate-700' : 'border-orange-500 text-slate-700'
                }`}>
                  {planMode === 'newLoan' ? '資產淨值成長模擬' : '轉增貸效益模擬'}
                </h4>
              </div>
              
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={planMode === 'newLoan' ? calculations.chartDataNewLoan : calculations.chartDataRefinance} 
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{fontSize: 10, fill: '#64748b'}} />
                    <YAxis unit="萬" tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                      formatter={(value: any) => [`${value.toLocaleString()}萬`, '']}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="資產價值" 
                      stroke={planMode === 'newLoan' ? '#10b981' : '#f97316'} 
                      fill={planMode === 'newLoan' ? '#10b981' : '#f97316'} 
                      fillOpacity={0.2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="貸款餘額" 
                      stroke="#94a3b8" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 配息率情境比較 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-bold text-blue-700 mb-4 flex items-center gap-2 text-sm">
                <Target size={16}/> 配息率情境分析
              </h4>
              
              {/* 資產累積提示 */}
              <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100 text-center">
                <p className="text-xs text-slate-600">
                  {calculations.isPositiveCashFlow ? (
                    <>
                      <span className="text-emerald-600">🎉 正現金流模式</span>
                      <br/>
                      {loanTerm}年累積 <b className="text-emerald-600">{formatMoney(Math.round(calculations.cumulativeCashFlow / 10000))}</b> 現金流 + <b className="text-emerald-600">{formatMoney(loanAmount)}</b> 資產
                    </>
                  ) : (
                    <>
                      總投入 <b className="text-blue-600">{formatMoney(Math.round(calculations.totalOutOfPocket / 10000))}</b> 累積 <b className="text-lg text-emerald-600">{formatMoney(loanAmount)}</b> 資產
                    </>
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '保守 4%', value: calculations.scenarios.low, color: 'blue' },
                  { label: '平衡 6%', value: calculations.scenarios.mid, color: 'emerald' },
                  { label: '積極 8%', value: calculations.scenarios.high, color: 'amber' },
                ].map((scenario, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg text-center">
                    <p className="text-[10px] text-slate-500 mb-1">{scenario.label}</p>
                    <p className={`text-lg font-black ${scenario.value >= 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {scenario.value >= 0 ? '+' : ''}{formatMoneyYuan(scenario.value)}
                    </p>
                    <p className="text-[10px] text-slate-400">/月</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 p-2 bg-white/50 rounded-lg text-center">
                <p className="text-xs text-blue-700">
                  當配息率達 <b>{calculations.breakEvenRate.toFixed(1)}%</b> 即可實現正現金流
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 未選擇方案時：雙選項卡片 */}
      {/* ============================================================ */}
      {planMode === 'none' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* 金融房產卡 */}
          <div 
            onClick={() => updateField('planMode', 'newLoan')}
            className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 p-6 cursor-pointer hover:border-emerald-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 size={24} className="text-emerald-600"/>
              </div>
              <div>
                <h4 className="font-bold text-emerald-800">金融房產</h4>
                <p className="text-xs text-emerald-600">以息養貸・數位包租公</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500"/>
                <span>運用長年期低利貸款累積資產</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500"/>
                <span>配息自動繳房貸</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500"/>
                <span>免頭期、免管理、免空租</span>
              </div>
            </div>
            
            <div className="p-3 bg-emerald-50 rounded-lg text-center">
              <span className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
                點擊開始規劃 <ChevronRight size={16}/>
              </span>
            </div>
          </div>

          {/* 轉增貸卡 */}
          <div 
            onClick={() => updateField('planMode', 'refinance')}
            className="bg-white rounded-xl shadow-sm border-2 border-orange-200 p-6 cursor-pointer hover:border-orange-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <RefreshCw size={24} className="text-orange-600"/>
              </div>
              <div>
                <h4 className="font-bold text-orange-800">轉增貸</h4>
                <p className="text-xs text-orange-600">資產活化・債務瘦身</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-orange-500"/>
                <span>將房產增值部分套現</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-orange-500"/>
                <span>配息補貼降低月付金</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-orange-500"/>
                <span>房子 + 一桶金雙享受</span>
              </div>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <span className="text-sm font-bold text-orange-600 flex items-center justify-center gap-1">
                點擊開始規劃 <ChevronRight size={16}/>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 第四區：四大施力點 */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500"/> 為什麼選擇金融房產？
        </h4>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-2xl mb-2">🏠</div>
            <h5 className="font-bold text-emerald-700 text-sm mb-1">免頭期款</h5>
            <p className="text-[10px] text-emerald-600">
              實體房產要 2-3 成頭期，金融房產 100% 融資
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">🔧</div>
            <h5 className="font-bold text-blue-700 text-sm mb-1">免管理</h5>
            <p className="text-[10px] text-blue-600">
              不用找房客、不用修繕、不用處理糾紛
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl mb-2">💰</div>
            <h5 className="font-bold text-amber-700 text-sm mb-1">收益差額</h5>
            <p className="text-[10px] text-amber-600">
              貸款 {loanRate}% vs 配息 {investReturnRate}%，正向差額 {calculations.rateSpread.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl mb-2">📈</div>
            <h5 className="font-bold text-purple-700 text-sm mb-1">抗通膨</h5>
            <p className="text-[10px] text-purple-600">
              負債被通膨稀釋，資產隨時間增值
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 第五區：運作機制 + 效益 */}
      {/* ============================================================ */}
      <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
        
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw size={18}/> 執行三部曲
          </h4>
          
          {[
            { num: '01', title: '建置期', desc: '透過銀行融資取得大筆資金，單筆投入穩健配息資產', color: 'emerald' },
            { num: '02', title: '持守期', desc: '讓配息自動償還貸款本息，時間是您最好的朋友', color: 'teal' },
            { num: '03', title: '自由期', desc: '貸款清償，資產與配息收入完全屬於您', color: 'green' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ 
                  backgroundColor: item.color === 'emerald' ? '#ecfdf5' : item.color === 'teal' ? '#f0fdfa' : '#f0fdf4',
                  color: item.color === 'emerald' ? '#059669' : item.color === 'teal' ? '#0d9488' : '#16a34a'
                }}
              >
                {item.num}
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">{item.title}</h5>
                <p className="text-[10px] text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500"/> 專案效益
          </h4>
          
          {[
            { title: '資產活化', desc: '將現金或不動產增值轉為配息資產' },
            { title: '現金流優化', desc: '配息收入降低月付負擔' },
            { title: '抗通膨', desc: '用負債對抗通膨，資產持續增值' },
            { title: '財富傳承', desc: '期滿擁有完整資產，可傳承下一代' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5"/>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">{item.title}</h5>
                <p className="text-[10px] text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 金句 */}
      <div className="bg-slate-800 rounded-xl p-4 text-center">
        <p className="text-slate-300 italic text-sm">
          「富人買資產，窮人買負債，中產階級買他們以為是資產的負債。金融房產，是真正的資產。」
        </p>
      </div>

      {/* ============================================================ */}
      {/* 隱藏小抄面板 */}
      {/* ============================================================ */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowCheatSheet(false)}
          />

          <div className="relative w-full max-w-md bg-slate-900 text-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center z-10">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  業務小抄
                  {isPaidMember && <Crown size={16} className="text-amber-400" />}
                </h3>
                <p className="text-xs text-slate-400">按 ESC 關閉</p>
              </div>
              <button onClick={() => setShowCheatSheet(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                <X size={20}/>
              </button>
            </div>

            {/* 內容區域 - 根據會員等級顯示 */}
            <div className="relative">
              {/* 非付費會員：模糊遮罩 */}
              {!isPaidMember && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Lock size={40} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">會員專屬功能</h4>
                    <p className="text-slate-400 text-sm mb-4">
                      業務小抄是付費會員專屬功能<br/>
                      升級後即可解鎖完整話術庫
                    </p>
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-bold text-sm">
                        <Crown size={16} />
                        升級成為付費會員
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {membership?.tier === 'referral_trial' ? '轉介紹試用會員可享升級折扣' : '解鎖所有工具與進階功能'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-4 space-y-6 text-sm ${!isPaidMember ? 'blur-sm pointer-events-none select-none' : ''}`}>
              
              {/* 當前數據 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">貸款金額</span>
                  <p className="font-bold text-emerald-400">{formatMoney(loanAmount)}</p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">收益差額</span>
                  <p className={`font-bold ${calculations.isPositiveSpread ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {calculations.rateSpread.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">月現金流</span>
                  <p className={`font-bold ${calculations.isPositiveCashFlow ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {formatMoneyYuan(calculations.netCashFlow)}
                  </p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">損益平衡</span>
                  <p className="font-bold text-blue-400">{calculations.breakEvenRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* 開場話術 */}
              <div>
                <h4 className="font-bold text-emerald-400 mb-2">🎬 開場</h4>
                <div className="bg-slate-800 p-3 rounded text-xs space-y-2">
                  <p className="text-slate-300">「王先生，您有聽過<b className="text-white">金融房產</b>嗎？」</p>
                  <p className="text-slate-300">「就是用銀行的錢，買<b className="text-white">會生錢的資產</b>，讓配息自動幫您繳房貸。」</p>
                </div>
              </div>

              {/* 核心賣點 */}
              <div>
                <h4 className="font-bold text-amber-400 mb-2">💡 核心賣點</h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-emerald-300 font-bold">收益差額</p>
                    <p className="text-slate-400">「貸款 {loanRate}%，配息 {investReturnRate}%，中間差 {calculations.rateSpread.toFixed(1)}% 就是您的獲利空間」</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-blue-300 font-bold">以息養貸</p>
                    <p className="text-slate-400">「每月配息 {formatMoneyYuan(calculations.monthlyIncome)}，房貸 {formatMoneyYuan(calculations.monthlyPayment)}」</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-purple-300 font-bold">免頭期款</p>
                    <p className="text-slate-400">「實體房產要 200-300 萬頭期，金融房產 0 頭期」</p>
                  </div>
                </div>
              </div>

              {/* 異議處理 */}
              <div>
                <h4 className="font-bold text-rose-400 mb-2">🛡️ 異議處理</h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-rose-300 font-bold">「會不會賠錢？」</p>
                    <p className="text-slate-400">→ 「配息只要 {calculations.breakEvenRate.toFixed(1)}% 就打平，我們選 {investReturnRate}% 的標的」</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-rose-300 font-bold">「借錢投資很危險」</p>
                    <p className="text-slate-400">→ 「房貸也是借錢，但沒人說買房危險。差別只在買什麼」</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-rose-300 font-bold">「配息會被砍」</p>
                    <p className="text-slate-400">→ 「我們選穩健標的，即使降息 1-2%，還是正現金流」</p>
                  </div>
                </div>
              </div>

              {/* 金句 */}
              <div>
                <h4 className="font-bold text-purple-400 mb-2">✨ 收尾金句</h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                    「富人買資產，窮人買負債」
                  </div>
                  <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                    「不是買房子出租，是買現金流」
                  </div>
                  <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                    「讓銀行的錢幫您賺錢」
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialRealEstateTool;