import React, { useState, useEffect } from 'react';
import { Calculator, Home, TrendingUp, RefreshCw, DollarSign, Percent, Zap } from 'lucide-react';

// ----------------------------------------------------------------------
// 子组件：复利计算器
// ----------------------------------------------------------------------
const CompoundInterest = () => {
  const [principal, setPrincipal] = useState(100000);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(20);
  const [result, setResult] = useState(0);

  useEffect(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    const fvPrincipal = principal * Math.pow(1 + r, n);
    const fvMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r);
    setResult(Math.round(fvPrincipal + fvMonthly));
  }, [principal, monthly, rate, years]);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="單筆投入" value={principal} onChange={setPrincipal} prefix="$" />
        <InputGroup label="每月定期" value={monthly} onChange={setMonthly} prefix="$" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="年報酬率" value={rate} onChange={setRate} suffix="%" step={0.5} />
        <InputGroup label="投資年期" value={years} onChange={setYears} suffix="年" />
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 text-center">
        <p className="text-emerald-200 text-sm mb-1">預估未來資產</p>
        <p className="text-3xl font-bold text-emerald-400 font-mono tracking-tight">
          ${result.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 子组件：房贷试算
// ----------------------------------------------------------------------
const MortgageCalc = () => {
  const [loanAmount, setLoanAmount] = useState(10000000);
  const [rate, setRate] = useState(2.1);
  const [years, setYears] = useState(30);
  const [monthlyPay, setMonthlyPay] = useState(0);

  useEffect(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    const pmt = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setMonthlyPay(Math.round(pmt || 0));
  }, [loanAmount, rate, years]);

  return (
    <div className="space-y-4 animate-fadeIn">
      <InputGroup label="貸款總額" value={loanAmount} onChange={setLoanAmount} prefix="$" step={100000} />
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="房貸利率" value={rate} onChange={setRate} suffix="%" step={0.01} />
        <InputGroup label="貸款年期" value={years} onChange={setYears} suffix="年" />
      </div>

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-900/20 border border-blue-500/30 text-center">
        <p className="text-blue-200 text-sm mb-1">每月本息攤還</p>
        <p className="text-3xl font-bold text-blue-400 font-mono tracking-tight">
          ${monthlyPay.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 子组件：IRR 速算
// ----------------------------------------------------------------------
const IRRCalc = () => {
  const [totalPayment, setTotalPayment] = useState(1000000); 
  const [cashValue, setCashValue] = useState(1050000); 
  const [years, setYears] = useState(6);
  const [irr, setIrr] = useState(0);

  useEffect(() => {
    if(totalPayment > 0 && years > 0) {
        const res = (Math.pow(cashValue / totalPayment, 1 / years) - 1) * 100;
        setIrr(res);
    }
  }, [totalPayment, cashValue, years]);

  return (
    <div className="space-y-4 animate-fadeIn">
      <InputGroup label="總繳保費" value={totalPayment} onChange={setTotalPayment} prefix="$" />
      <InputGroup label="期滿領回" value={cashValue} onChange={setCashValue} prefix="$" />
      <InputGroup label="累積年期" value={years} onChange={setYears} suffix="年" />

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-900/20 border border-amber-500/30 text-center">
        <p className="text-amber-200 text-sm mb-1">年化報酬率 (CAGR)</p>
        <p className="text-3xl font-bold text-amber-400 font-mono tracking-tight">
          {irr.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 通用 Input 组件 (Glassmorphism Style - Fixed Contrast)
// ----------------------------------------------------------------------
const InputGroup = ({ label, value, onChange, prefix, suffix, step = 1 }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-400 font-medium ml-1">{label}</label>
    <div className="relative group">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        className={`w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 
          ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}
          text-white font-mono placeholder-gray-600 outline-none
          focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all`}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors">{suffix}</span>}
    </div>
  </div>
);

// ----------------------------------------------------------------------
// 主组件
// ----------------------------------------------------------------------
const QuickCalculator = () => {
  const [activeTab, setActiveTab] = useState<'compound' | 'mortgage' | 'irr'>('compound');

  const tabs = [
    { id: 'compound', label: '複利', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'mortgage', label: '房貸', icon: Home, color: 'text-blue-400' },
    { id: 'irr', label: 'IRR', icon: Percent, color: 'text-amber-400' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* FIX: 強制背景色 bg-gray-900，讓白色文字可見 */}
      <div className="relative flex-1 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header - FIX: 加回標題 */}
        <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-black/20">
             <div className="p-1.5 bg-indigo-500/20 rounded text-indigo-400">
                <Zap size={18} />
             </div>
             <h3 className="text-white font-bold tracking-wide">業務閃算機</h3>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative
                  ${isActive ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                `}
              >
                <Icon size={16} className={isActive ? tab.color : 'text-gray-500'} />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'compound' && <CompoundInterest />}
            {activeTab === 'mortgage' && <MortgageCalc />}
            {activeTab === 'irr' && <IRRCalc />}
        </div>
        
        {/* Footer Decor */}
        <div className="py-2 text-center border-t border-white/5 bg-black/20">
             <span className="text-[10px] text-gray-600 tracking-widest uppercase">Ultra Quick Calc v2.0</span>
        </div>
      </div>
    </div>
  );
};

export default QuickCalculator;