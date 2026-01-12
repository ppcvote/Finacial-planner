import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Waves, 
  Calculator, 
  Database, 
  TrendingUp, 
  Droplets, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  Landmark,
  Coins,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  Shield,
  TrendingDown,
  Banknote,
  PiggyBank,
  Award,
  ChevronRight,
  Sparkles,
  Calendar,
  DollarSign,
  ArrowRight,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  BarChart,
  Bar,
  Cell
} from 'recharts';

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

// ============================================================
// 配置預設值
// ============================================================
const PRESET_CONFIGS = {
  conservative: {
    label: '穩健配置',
    icon: Shield,
    color: 'blue',
    dividendRate: 4,
    reinvestRate: 6,
    description: '適合退休族、保守型投資人',
    riskLevel: 1,
    products: {
      big: ['債券型基金', '高評級公司債', '定存'],
      small: ['平衡型基金', '高股息 ETF']
    }
  },
  balanced: {
    label: '平衡配置',
    icon: Target,
    color: 'emerald',
    dividendRate: 5,
    reinvestRate: 8,
    description: '適合中年累積、穩健成長',
    riskLevel: 2,
    products: {
      big: ['高股息 ETF', '債券 ETF', '儲蓄險'],
      small: ['市值型 ETF', '成長型基金']
    }
  },
  aggressive: {
    label: '積極配置',
    icon: TrendingUp,
    color: 'amber',
    dividendRate: 6,
    reinvestRate: 12,
    description: '適合年輕人、積極成長',
    riskLevel: 3,
    products: {
      big: ['高股息 ETF', 'REITs', '特別股'],
      small: ['成長型 ETF', '產業 ETF', '個股']
    }
  }
};

// ============================================================
// 主元件
// ============================================================
export const BigSmallReservoirTool = ({ data, setData }: any) => {
  // --- 隱藏小抄狀態 ---
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

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
      if (e.key === 'Escape') setShowCheatSheet(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- 資料初始化 ---
  const safeData = {
    initialCapital: Number(data?.initialCapital) || 1000,
    years: Number(data?.years) || 20,
    
    // v2 新增：配置模式
    configMode: data?.configMode || 'none', // 'none' | 'conservative' | 'balanced' | 'aggressive'
    
    // 自訂參數
    dividendRate: Number(data?.dividendRate) || 5,
    reinvestRate: Number(data?.reinvestRate) || 8,
    
    // 客戶條件
    clientAge: Number(data?.clientAge) || 45,
    startDelay: Number(data?.startDelay) || 0,
  };

  const { 
    initialCapital, years, configMode,
    dividendRate, reinvestRate,
    clientAge, startDelay
  } = safeData;

  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- 計算引擎 ---
  const calculations = useMemo(() => {
    // 根據配置模式決定實際利率
    const activeConfig = configMode !== 'none' ? PRESET_CONFIGS[configMode as keyof typeof PRESET_CONFIGS] : null;
    const actualDividend = activeConfig ? activeConfig.dividendRate : dividendRate;
    const actualReinvest = activeConfig ? activeConfig.reinvestRate : reinvestRate;

    // 生成成長數據
    const generateGrowthData = (delayYears: number = 0) => {
      const dataArr = [];
      let smallReservoir = 0;
      let totalDividendsSpent = 0;
      let doubleYear: number | null = null;

      dataArr.push({
        year: 0,
        大水庫本金: initialCapital,
        小水庫累積: 0,
        總資產: initialCapital,
        花掉配息: initialCapital
      });

      for (let year = 1; year <= years + 5; year++) {
        const effectiveYear = year - delayYears;
        
        if (effectiveYear > 0 && effectiveYear <= years) {
          const annualDividend = initialCapital * (actualDividend / 100);
          smallReservoir = (smallReservoir + annualDividend) * (1 + actualReinvest / 100);
          totalDividendsSpent += annualDividend;
        } else if (effectiveYear > years) {
          smallReservoir = smallReservoir * (1 + actualReinvest / 100);
        }

        if (smallReservoir >= initialCapital && doubleYear === null) {
          doubleYear = year;
        }

        dataArr.push({
          year,
          大水庫本金: initialCapital,
          小水庫累積: Math.round(smallReservoir),
          總資產: Math.round(initialCapital + smallReservoir),
          花掉配息: initialCapital
        });
      }

      return { dataArr, doubleYear, finalSmall: Math.round(smallReservoir), totalDividends: Math.round(totalDividendsSpent) };
    };

    // 現在開始
    const nowResult = generateGrowthData(0);
    
    // 延遲開始（計算時間成本）
    const delay5Result = generateGrowthData(5);
    const delay10Result = generateGrowthData(10);

    // 年配息金額
    const annualDividend = Math.round(initialCapital * (actualDividend / 100));

    // 目標年份的數據
    const targetIndex = Math.min(years, nowResult.dataArr.length - 1);
    const currentData = nowResult.dataArr[targetIndex];
    
    // 機會成本
    const opportunityCost = currentData.總資產 - initialCapital;
    
    // 時間成本
    const timeCost5 = currentData.總資產 - delay5Result.dataArr[targetIndex].總資產;
    const timeCost10 = currentData.總資產 - delay10Result.dataArr[targetIndex].總資產;

    // 智能推薦
    let recommendation: 'conservative' | 'balanced' | 'aggressive' = 'balanced';
    let recommendationReasons: string[] = [];

    if (clientAge >= 55) {
      recommendation = 'conservative';
      recommendationReasons.push('年齡較高，建議穩健為主');
    } else if (clientAge <= 40) {
      recommendation = 'aggressive';
      recommendationReasons.push('年齡優勢，可承受較高波動');
    } else {
      recommendation = 'balanced';
      recommendationReasons.push('中年累積期，平衡配置最佳');
    }

    if (initialCapital >= 3000) {
      recommendationReasons.push('資金規模大，可考慮傳承規劃');
    }

    if (years >= 20) {
      recommendationReasons.push('投資年限長，複利效果顯著');
    }

    return {
      actualDividend,
      actualReinvest,
      annualDividend,
      dataArr: nowResult.dataArr,
      doubleYear: nowResult.doubleYear,
      totalAsset: currentData.總資產,
      smallReservoir: currentData.小水庫累積,
      opportunityCost,
      opportunityCostRate: ((opportunityCost / initialCapital) * 100).toFixed(0),
      timeCost5,
      timeCost10,
      delay5Total: delay5Result.dataArr[targetIndex].總資產,
      delay10Total: delay10Result.dataArr[targetIndex].總資產,
      recommendation,
      recommendationReasons,
      activeConfig: activeConfig || PRESET_CONFIGS.balanced,
    };
  }, [initialCapital, years, configMode, dividendRate, reinvestRate, clientAge]);

  // --- UI Handlers ---
  const updateField = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  const updateFields = (updates: Record<string, any>) => {
    setData({ ...data, ...updates });
  };

  const applyConfig = (mode: 'conservative' | 'balanced' | 'aggressive') => {
    const config = PRESET_CONFIGS[mode];
    updateFields({
      configMode: mode,
      dividendRate: config.dividendRate,
      reinvestRate: config.reinvestRate
    });
  };

  // ============================================================
  // UI 渲染
  // ============================================================
  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Waves size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Asset Allocation
            </span>
            <span 
              onClick={handleSecretClick}
              className="bg-amber-400/20 text-amber-100 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30 cursor-default select-none"
            >
              母子基金・自動平衡
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight">
            大小水庫專案
          </h1>
          <p className="text-cyan-100 text-sm opacity-90">
            大水庫穩健生息，小水庫積極複利，讓資產像水流一樣源源不絕
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 第一區：現況分析 (三欄) */}
      {/* ============================================================ */}
      <div className="grid lg:grid-cols-3 gap-4">
        
        {/* 資金設定 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
            <Calculator size={16} className="text-cyan-600"/> 資金設定
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-500">大水庫本金</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => updateField('initialCapital', Number(e.target.value))}
                    className="w-24 text-xl font-black text-cyan-600 text-right bg-transparent border-b-2 border-transparent hover:border-cyan-300 focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                  <span className="text-sm text-slate-400">萬</span>
                </div>
              </div>
              <input 
                type="range" 
                min={100} max={10000} step={100}
                value={initialCapital}
                onChange={(e) => updateField('initialCapital', Number(e.target.value))}
                className="w-full h-2 bg-cyan-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>100萬</span>
                <span>1億</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-500">運作年限</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => updateField('years', Number(e.target.value))}
                    className="w-16 text-xl font-black text-blue-600 text-right bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <span className="text-sm text-slate-400">年</span>
                </div>
              </div>
              <input 
                type="range" 
                min={5} max={40} step={1}
                value={years}
                onChange={(e) => updateField('years', Number(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-500">客戶年齡</label>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={clientAge}
                    onChange={(e) => updateField('clientAge', Number(e.target.value))}
                    className="w-14 p-1 border rounded text-sm font-bold text-center"
                  />
                  <span className="text-xs text-slate-400">歲</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 預估成果 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-emerald-500"/> {years}年後預估成果
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">大水庫本金</span>
              <span className="font-bold text-cyan-600">{formatMoney(initialCapital)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">小水庫累積</span>
              <span className="font-bold text-amber-500">+{formatMoney(calculations.smallReservoir)}</span>
            </div>
            <div className="h-px bg-slate-100"></div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl text-center border border-emerald-200">
              <p className="text-xs text-emerald-600 mb-1">總資產</p>
              <p className="text-3xl font-black text-emerald-600">{formatMoney(calculations.totalAsset)}</p>
              <p className="text-xs text-emerald-500 mt-1">
                成長 {calculations.opportunityCostRate}%
              </p>
            </div>
            
            {calculations.doubleYear && calculations.doubleYear <= years && (
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-center">
                <p className="text-[10px] text-amber-600">🎉 第 {calculations.doubleYear} 年達成翻倍</p>
              </div>
            )}
          </div>
        </div>

        {/* 機會成本 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className="text-rose-500"/> 花掉配息的代價
          </h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-100 rounded-lg text-center">
                <p className="text-[10px] text-slate-500">花掉配息</p>
                <p className="text-lg font-bold text-slate-600">{formatMoney(initialCapital)}</p>
                <p className="text-[10px] text-slate-400">永遠只有本金</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-center border border-emerald-200">
                <p className="text-[10px] text-emerald-600">大小水庫</p>
                <p className="text-lg font-bold text-emerald-600">{formatMoney(calculations.totalAsset)}</p>
                <p className="text-[10px] text-emerald-500">複利滾雪球</p>
              </div>
            </div>
            
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
              <p className="text-xs text-rose-600 mb-1">您放棄的未來財富</p>
              <p className="text-2xl font-black text-rose-600">{formatMoney(calculations.opportunityCost)}</p>
            </div>
            
            <div className="p-2 bg-amber-50 rounded-lg text-center">
              <p className="text-[10px] text-amber-700">
                每年配息 {formatMoney(calculations.annualDividend)}，
                {years}年共 {formatMoney(calculations.annualDividend * years)}
              </p>
              <p className="text-[10px] text-amber-600 font-bold">
                花掉 = 放棄 {formatMoney(calculations.opportunityCost)} 的複利成長！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 第二區：智能推薦 */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-slate-700" />
              <h4 className="font-bold text-slate-800">智能推薦配置</h4>
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
            {Object.entries(PRESET_CONFIGS).map(([key, config]) => {
              const isSelected = configMode === key;
              const isRecommended = calculations.recommendation === key;
              const Icon = config.icon;
              const bgColor = isSelected ? (key === 'conservative' ? '#2563eb' : key === 'balanced' ? '#059669' : '#d97706') : 'white';
              const textColor = isSelected ? 'white' : (key === 'conservative' ? '#2563eb' : key === 'balanced' ? '#059669' : '#d97706');
              
              return (
                <button
                  key={key}
                  onClick={() => applyConfig(key as keyof typeof PRESET_CONFIGS)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${isSelected ? 'shadow-lg' : 'border hover:shadow'}`}
                  style={{ backgroundColor: bgColor, color: textColor, borderColor: textColor }}
                >
                  <Icon size={16} />
                  {config.label}
                  {isRecommended && (
                    <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-amber-900 rounded text-[10px]">推薦</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {configMode !== 'none' && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600">
              <Sparkles size={12} className="inline mr-1 text-amber-500" />
              <b>目前配置：</b>大水庫 {calculations.actualDividend}% 配息 + 小水庫 {calculations.actualReinvest}% 成長
              <span className="text-slate-400 ml-2">| {calculations.activeConfig.description}</span>
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 第三區：配置詳情 */}
      {/* ============================================================ */}
      {configMode !== 'none' && (
        <div className="grid lg:grid-cols-5 gap-6">
          
          {/* 左側 */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* 雙引擎參數 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                  <Settings size={16}/> 雙引擎參數
                </h4>
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-700"
                >
                  {showAdvanced ? '收起' : '自訂'} 
                  {showAdvanced ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-cyan-700 flex items-center gap-1">
                      <Database size={12}/> 大水庫配息率
                    </span>
                    <div className="flex items-center gap-0.5">
                      <input
                        type="number"
                        step={0.5}
                        value={calculations.actualDividend}
                        onChange={(e) => updateFields({ dividendRate: Number(e.target.value), configMode: 'none' })}
                        className="w-14 text-lg font-black text-cyan-600 text-right bg-transparent border-b border-transparent hover:border-cyan-300 focus:border-cyan-500 focus:outline-none"
                      />
                      <span className="text-cyan-400">%</span>
                    </div>
                  </div>
                  {showAdvanced && (
                    <input 
                      type="range" 
                      min={2} max={12} step={0.5}
                      value={dividendRate}
                      onChange={(e) => updateFields({ dividendRate: Number(e.target.value), configMode: 'none' })}
                      className="w-full h-1.5 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 mt-2"
                    />
                  )}
                  <p className="text-[10px] text-cyan-600 mt-1">
                    年配息：{formatMoney(calculations.annualDividend)}
                  </p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                      <TrendingUp size={12}/> 小水庫成長率
                    </span>
                    <div className="flex items-center gap-0.5">
                      <input
                        type="number"
                        step={0.5}
                        value={calculations.actualReinvest}
                        onChange={(e) => updateFields({ reinvestRate: Number(e.target.value), configMode: 'none' })}
                        className="w-14 text-lg font-black text-amber-600 text-right bg-transparent border-b border-transparent hover:border-amber-300 focus:border-amber-500 focus:outline-none"
                      />
                      <span className="text-amber-400">%</span>
                    </div>
                  </div>
                  {showAdvanced && (
                    <input 
                      type="range" 
                      min={4} max={20} step={0.5}
                      value={reinvestRate}
                      onChange={(e) => updateFields({ reinvestRate: Number(e.target.value), configMode: 'none' })}
                      className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600 mt-2"
                    />
                  )}
                  <p className="text-[10px] text-amber-600 mt-1">
                    複利滾存，{years}年累積 {formatMoney(calculations.smallReservoir)}
                  </p>
                </div>
              </div>
            </div>

            {/* 資金流動示意圖 */}
            <div className="bg-slate-800 rounded-xl p-5 shadow-lg text-white">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <RefreshCw size={16} className="text-cyan-400"/>
                <span className="font-bold text-sm">資金流動系統</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center w-1/3">
                  <div className="w-14 h-16 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-lg border-2 border-cyan-300 shadow-lg flex items-center justify-center">
                    <Database size={24} className="text-white"/>
                  </div>
                  <p className="mt-2 text-xs font-bold text-cyan-300">大水庫</p>
                  <p className="text-[10px] text-slate-400">{formatMoney(initialCapital)}</p>
                </div>

                <div className="flex-1 flex flex-col items-center -mt-4">
                  <div className="text-[10px] text-cyan-200 mb-1">{calculations.actualDividend}%</div>
                  <div className="h-1 w-full bg-cyan-500/30 rounded-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1/2 bg-cyan-400 animate-pulse"></div>
                  </div>
                  <Droplets size={14} className="text-cyan-400 mt-1 animate-bounce"/>
                </div>

                <div className="flex flex-col items-center w-1/3">
                  <div className="w-14 h-16 bg-slate-700 rounded-lg border-2 border-amber-400/50 flex flex-col justify-end relative overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-amber-500 to-yellow-300 transition-all duration-1000" 
                      style={{height: `${Math.min(100, (calculations.smallReservoir / initialCapital) * 100)}%`}}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Coins size={24} className="text-white/90"/>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-bold text-amber-400">小水庫</p>
                  <p className="text-[10px] text-slate-400">{formatMoney(calculations.smallReservoir)}</p>
                </div>
              </div>
            </div>
            
            {/* 進階功能入口 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm border border-slate-700 p-4 text-white">
              <h4 className="font-bold mb-3 text-sm flex items-center gap-1">
                <Landmark size={14} className="text-amber-400"/> 投資標的研究
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-800/60 rounded p-2">
                  <p className="text-[10px] text-cyan-400 font-bold">大水庫</p>
                  <p className="text-[10px] text-slate-400">穩健配息型標的</p>
                </div>
                <div className="bg-slate-800/60 rounded p-2">
                  <p className="text-[10px] text-amber-400 font-bold">小水庫</p>
                  <p className="text-[10px] text-slate-400">積極成長型標的</p>
                </div>
              </div>
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
                <h4 className="font-bold text-slate-700 text-sm pl-2 border-l-4 border-cyan-500">
                  資產成長模擬
                </h4>
                <div className="flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-full"></div> 小水庫</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-600/40 rounded-full"></div> 大水庫</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-emerald-500"></div> 總資產</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-slate-400"></div> 花掉配息</span>
                </div>
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={calculations.dataArr} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorSmall2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="year" 
                      tick={{fontSize: 10, fill: '#64748b'}} 
                      tickFormatter={(val) => val === 0 ? '起點' : `${val}年`}
                    />
                    <YAxis unit="萬" tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                      formatter={(value: any) => [`${value.toLocaleString()}萬`, '']}
                    />
                    
                    {calculations.doubleYear && (
                      <ReferenceLine 
                        x={calculations.doubleYear} 
                        stroke="#f59e0b" 
                        strokeDasharray="3 3"
                        label={{ value: '翻倍點', fill: '#d97706', fontSize: 10 }}
                      />
                    )}
                    
                    <Area type="monotone" dataKey="大水庫本金" stroke="none" fill="#0891b2" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="小水庫累積" stroke="#f59e0b" fill="url(#colorSmall2)" />
                    <Line type="monotone" dataKey="總資產" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="花掉配息" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 時間成本警示 */}
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-5 border border-rose-200">
              <h4 className="font-bold text-rose-700 mb-4 flex items-center gap-2 text-sm">
                <Clock size={16}/> 時間成本：晚開始的代價
              </h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg text-center border-2 border-emerald-300">
                  <p className="text-[10px] text-emerald-600 font-bold">現在開始</p>
                  <p className="text-xl font-black text-emerald-600">{formatMoney(calculations.totalAsset)}</p>
                  <p className="text-[10px] text-emerald-500">✓ 最佳時機</p>
                </div>
                <div className="bg-white p-3 rounded-lg text-center border border-rose-200">
                  <p className="text-[10px] text-rose-600">晚 5 年開始</p>
                  <p className="text-xl font-black text-rose-600">{formatMoney(calculations.delay5Total)}</p>
                  <p className="text-[10px] text-rose-500">少賺 {formatMoney(calculations.timeCost5)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg text-center border border-rose-200">
                  <p className="text-[10px] text-rose-600">晚 10 年開始</p>
                  <p className="text-xl font-black text-rose-600">{formatMoney(calculations.delay10Total)}</p>
                  <p className="text-[10px] text-rose-500">少賺 {formatMoney(calculations.timeCost10)}</p>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-rose-100 rounded-lg text-center">
                <p className="text-xs font-bold text-rose-700">
                  ⏰ 每晚 1 年開始，{years}年後就少 {formatMoney(Math.round(calculations.timeCost5 / 5))}！
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 未選擇配置時 */}
      {/* ============================================================ */}
      {configMode === 'none' && (
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(PRESET_CONFIGS).map(([key, config]) => {
            const Icon = config.icon;
            const isRecommended = calculations.recommendation === key;
            const bgColor = key === 'conservative' ? '#dbeafe' : key === 'balanced' ? '#d1fae5' : '#fef3c7';
            const iconColor = key === 'conservative' ? '#2563eb' : key === 'balanced' ? '#059669' : '#d97706';
            
            return (
              <div 
                key={key}
                onClick={() => applyConfig(key as keyof typeof PRESET_CONFIGS)}
                className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${
                  isRecommended ? 'border-amber-400' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                      <Icon size={20} style={{ color: iconColor }}/>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{config.label}</h4>
                      <p className="text-[10px] text-slate-500">{config.description}</p>
                    </div>
                  </div>
                  {isRecommended && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">推薦</span>
                  )}
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">大水庫配息</span>
                    <span className="font-bold text-cyan-600">{config.dividendRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">小水庫成長</span>
                    <span className="font-bold text-amber-600">{config.reinvestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">風險等級</span>
                    <span>{'⭐'.repeat(config.riskLevel)}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-2 bg-slate-50 rounded-lg text-center">
                  <span className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                    點擊選擇 <ChevronRight size={14}/>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 第四區：四大施力點 */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500"/> 花掉配息的四大代價
        </h4>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <div className="text-2xl mb-2">🍔</div>
            <h5 className="font-bold text-rose-700 text-sm mb-1">生活膨脹</h5>
            <p className="text-[10px] text-rose-600">
              配息花掉就沒了，{years}年後還是只有 {formatMoney(initialCapital)} 本金
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl mb-2">📉</div>
            <h5 className="font-bold text-orange-700 text-sm mb-1">複利斷裂</h5>
            <p className="text-[10px] text-orange-600">
              中斷 1 年複利，{years}年後少 {formatMoney(Math.round(calculations.timeCost5 / 5))}
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl mb-2">🎰</div>
            <h5 className="font-bold text-amber-700 text-sm mb-1">機會成本</h5>
            <p className="text-[10px] text-amber-600">
              花掉 = 放棄 {formatMoney(calculations.opportunityCost)} 未來財富
            </p>
          </div>
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
            <div className="text-2xl mb-2">👨‍👩‍👧</div>
            <h5 className="font-bold text-slate-700 text-sm mb-1">傳承歸零</h5>
            <p className="text-[10px] text-slate-600">
              花光配息 = 沒有增值資產留給下一代
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
            <RefreshCw size={18}/> 運作機制
          </h4>
          
          {[
            { num: '01', title: '大水庫（母金）', desc: '投入穩健配息標的，專注「保本」與「產生現金流」', color: 'cyan' },
            { num: '02', title: '自動轉存（紀律）', desc: '配息第一時間投入小水庫，避免被隨意花掉', color: 'slate' },
            { num: '03', title: '小水庫（子金）', desc: '零成本的錢可以冒險，博取超額報酬，複利成長', color: 'amber' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ 
                  backgroundColor: item.color === 'cyan' ? '#ecfeff' : item.color === 'amber' ? '#fffbeb' : '#f8fafc',
                  color: item.color === 'cyan' ? '#0891b2' : item.color === 'amber' ? '#d97706' : '#475569'
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
            { title: '本金零風險', desc: '小水庫都是賺來的錢，虧了不心疼' },
            { title: '自動養大', desc: '不需額外投入，光靠複利就能翻倍' },
            { title: '攻守兼備', desc: '大水庫防守，小水庫進攻，完美配置' },
            { title: '資產傳承', desc: '花掉小水庫享受，留下大水庫傳承' },
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
          「不要吃掉種子，要讓種子長成大樹。大水庫是您的糧倉，小水庫是您的果園。」
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
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">📋 業務小抄</h3>
                <p className="text-xs text-slate-400">按 ESC 關閉</p>
              </div>
              <button onClick={() => setShowCheatSheet(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-4 space-y-6 text-sm">
              
              {/* 當前數據 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">本金</span>
                  <p className="font-bold text-cyan-400">{formatMoney(initialCapital)}</p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">{years}年後總資產</span>
                  <p className="font-bold text-emerald-400">{formatMoney(calculations.totalAsset)}</p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">機會成本</span>
                  <p className="font-bold text-rose-400">{formatMoney(calculations.opportunityCost)}</p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <span className="text-slate-500">翻倍年份</span>
                  <p className="font-bold text-amber-400">{calculations.doubleYear ? `第${calculations.doubleYear}年` : '-'}</p>
                </div>
              </div>

              {/* 開場話術 */}
              <div>
                <h4 className="font-bold text-cyan-400 mb-2">🎬 開場</h4>
                <div className="bg-slate-800 p-3 rounded text-xs space-y-2">
                  <p className="text-slate-300">「王先生，您目前的配息是<b className="text-white">花掉</b>還是<b className="text-white">再投資</b>？」</p>
                  <p className="text-slate-400">（等回答）</p>
                  <p className="text-slate-300">「花掉？那我幫您算一下，這個決定 {years} 年後會差多少...」</p>
                </div>
              </div>

              {/* 衝擊話術 */}
              <div>
                <h4 className="font-bold text-rose-400 mb-2">💥 數字衝擊</h4>
                <div className="bg-rose-900/50 p-3 rounded border border-rose-700 text-xs">
                  <p>「您看，同樣 {formatMoney(initialCapital)} 本金：</p>
                  <p className="mt-2">花掉配息：{years}年後還是 <b className="text-rose-300">{formatMoney(initialCapital)}</b></p>
                  <p>大小水庫：{years}年後變成 <b className="text-emerald-300">{formatMoney(calculations.totalAsset)}</b></p>
                  <p className="mt-2 text-rose-300 font-bold">差距 {formatMoney(calculations.opportunityCost)}！這就是花掉配息的代價。」</p>
                </div>
              </div>

              {/* 四大施力點 */}
              <div>
                <h4 className="font-bold text-amber-400 mb-2">🎯 四大施力點</h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-amber-300 font-bold">🍔 生活膨脹</p>
                    <p className="text-slate-400">「配息花掉就沒了，{years}年後還是只有本金」</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-orange-300 font-bold">📉 複利斷裂</p>
                    <p className="text-slate-400">「中斷1年，{years}年後少 {formatMoney(Math.round(calculations.timeCost5/5))}」</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-rose-300 font-bold">🎰 機會成本</p>
                    <p className="text-slate-400">「花掉 = 放棄 {formatMoney(calculations.opportunityCost)} 未來財富」</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <p className="text-slate-300 font-bold">👨‍👩‍👧 傳承歸零</p>
                    <p className="text-slate-400">「花光配息 = 沒有增值資產留給下一代」</p>
                  </div>
                </div>
              </div>

              {/* 時間緊迫 */}
              <div>
                <h4 className="font-bold text-orange-400 mb-2">⏰ 時間緊迫</h4>
                <div className="bg-orange-900/50 p-3 rounded border border-orange-700 text-xs">
                  <p>「而且您看這個時間成本——</p>
                  <p className="mt-1">現在開始：{formatMoney(calculations.totalAsset)}</p>
                  <p>晚5年：{formatMoney(calculations.delay5Total)} <span className="text-rose-400">(-{formatMoney(calculations.timeCost5)})</span></p>
                  <p className="mt-1 text-orange-300 font-bold">每晚1年，就少賺 {formatMoney(Math.round(calculations.timeCost5/5))}！」</p>
                </div>
              </div>

              {/* 金句 */}
              <div>
                <h4 className="font-bold text-purple-400 mb-2">✨ 收尾金句</h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                    「不要吃掉種子，讓種子長成大樹」
                  </div>
                  <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                    「大水庫是糧倉，小水庫是果園」
                  </div>
                  <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                    「讓錢去工作，不要讓錢去度假」
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

export default BigSmallReservoirTool;