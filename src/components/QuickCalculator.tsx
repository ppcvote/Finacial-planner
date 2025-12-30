import React, { useState, useEffect } from 'react';
import { Calculator, Home, Percent, Coins } from 'lucide-react';

const QuickCalculator = () => {
    const [mode, setMode] = useState<'compound' | 'loan' | 'irr'>('compound');
    
    // 輸入狀態
    const [val1, setVal1] = useState<string>(''); // 本金 / 貸款總額 / 投入本金
    const [val2, setVal2] = useState<string>(''); // 年期
    const [val3, setVal3] = useState<string>(''); // 年利率 / 回收金額

    // 計算結果
    const [result, setResult] = useState<string>('---');

    const calculate = () => {
        const v1 = parseFloat(val1);
        const v2 = parseFloat(val2);
        const v3 = parseFloat(val3);

        // 防呆：如果有任何數值未填或不合法，顯示 ---
        if (isNaN(v1) || isNaN(v2) || isNaN(v3) || v1 <= 0 || v2 <= 0) {
            setResult('---');
            return;
        }

        if (mode === 'compound') {
            // 複利滾存 (Lump Sum Compound Interest)
            // 公式：FV = PV * (1 + r)^n
            const r = v3 / 100;
            const fv = v1 * Math.pow(1 + r, v2);
            setResult(`${Math.round(fv).toLocaleString()} 萬`);
        } else if (mode === 'loan') {
            // 房貸月付 (本息平均攤還)
            // 公式：PMT = (P * r * (1+r)^n) / ((1+r)^n - 1)
            // P = 總額(元), r = 月利率, n = 總月數
            const principal = v1 * 10000; // 萬轉元
            const monthlyRate = v3 / 100 / 12;
            const totalMonths = v2 * 12; // 年轉月

            if (monthlyRate === 0) {
                // 零利率狀況
                const pmt = principal / totalMonths;
                setResult(`$${Math.round(pmt).toLocaleString()} /月`);
            } else {
                const pmt = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
                setResult(`$${Math.round(pmt).toLocaleString()} /月`);
            }
        } else if (mode === 'irr') {
            // 簡易 IRR (CAGR 年化報酬率)
            // 公式：(FV / PV)^(1/n) - 1
            // v1: 投入(PV), v2: 年期(n), v3: 回收(FV)
            if (v3 <= 0) {
                 setResult('---');
                 return;
            }
            const cagr = (Math.pow(v3 / v1, 1 / v2) - 1) * 100;
            setResult(`${cagr.toFixed(2)} %`);
        }
    };

    // 當數值改變自動計算
    useEffect(() => {
        calculate();
    }, [val1, val2, val3, mode]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col h-full shadow-sm relative overflow-hidden">
            {/* 裝飾背景 */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Calculator size={100} />
            </div>

            <div className="flex items-center gap-2 mb-4 z-10">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    {mode === 'compound' && <Coins size={20}/>}
                    {mode === 'loan' && <Home size={20}/>}
                    {mode === 'irr' && <Percent size={20}/>}
                </div>
                <h4 className="font-bold text-slate-800">業務閃算機</h4>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 z-10">
                <button onClick={() => {setMode('compound'); setVal1(''); setVal2(''); setVal3(''); setResult('---');}} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'compound' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>複利滾存</button>
                <button onClick={() => {setMode('loan'); setVal1(''); setVal2(''); setVal3(''); setResult('---');}} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'loan' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>貸款月付</button>
                <button onClick={() => {setMode('irr'); setVal1(''); setVal2(''); setVal3(''); setResult('---');}} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'irr' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>IRR反推</button>
            </div>

            {/* Inputs */}
            <div className="space-y-3 z-10">
                <div className="flex items-center gap-2">
                    <label className="w-16 text-xs font-bold text-slate-500 text-right">
                        {mode === 'compound' ? '本金(萬)' : mode === 'loan' ? '總額(萬)' : '投入(萬)'}
                    </label>
                    <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0"/>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-16 text-xs font-bold text-slate-500 text-right">年期</label>
                    <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0"/>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-16 text-xs font-bold text-slate-500 text-right">
                        {mode === 'compound' ? '利率(%)' : mode === 'loan' ? '利率(%)' : '回收(萬)'}
                    </label>
                    <input type="number" value={val3} onChange={e => setVal3(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0"/>
                </div>
            </div>

            {/* Result */}
            <div className="mt-auto pt-4 text-center z-10">
                <div className="text-xs text-slate-400 mb-1">試算結果</div>
                <div className="text-3xl font-black text-blue-600 font-mono tracking-tight">{result}</div>
            </div>
        </div>
    );
};

export default QuickCalculator;