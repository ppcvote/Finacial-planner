import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Calculator, 
  ShieldAlert, 
  Scale, 
  AlertTriangle, 
  FileText, 
  Users, 
  Coins, 
  Siren, 
  CheckCircle2, 
  XCircle,
  PieChart,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Cell
} from 'recharts';

export const TaxPlannerTool = ({ data, setData }: any) => {
  const safeData = {
    // 家庭成員
    spouse: Boolean(data?.spouse), // 有無配偶
    // 修正：允許輸入 0 (原本的 || 2 會把 0 變成 2)
    children: data?.children !== undefined ? Number(data.children) : 2, 
    parents: Number(data?.parents) || 0, // 父母人數
    handicapped: Number(data?.handicapped) || 0, // 重度身障人數 (扣除額 693萬)
    
    // 資產配置 (萬)
    cash: Number(data?.cash) || 3000, // 現金存款
    // realEstateOfficial 已移除，改由市價內部估算
    realEstateMarket: Number(data?.realEstateMarket) || 4000, // 不動產(市價)
    stocks: Number(data?.stocks) || 1000, // 股票/基金
    otherAssets: Number(data?.otherAssets) || 0, // 其他資產
    
    // 規劃參數
    insurancePlan: Number(data?.insurancePlan) || 0, // 規劃移轉至保險的金額
    
    // 風險評估參數 (實質課稅原則)
    age: Number(data?.age) || 60, // 投保年齡
    healthStatus: data?.healthStatus || 'normal', // normal, ill, critical
    paymentType: data?.paymentType || 'installment', // installment(分期), lumpSum(躉繳)
    insurancePurpose: data?.insurancePurpose || 'estate', // estate(資產傳承), tax(純節稅)
  };

  const { 
    spouse, children, parents, handicapped,
    cash, realEstateMarket, stocks, otherAssets,
    insurancePlan,
    age, healthStatus, paymentType
  } = safeData;

  const [showRiskDetail, setShowRiskDetail] = useState(false);

  // --- 計算核心 (2025年/114年起適用新制) ---
  const calculations = useMemo(() => {
      // 0. 不動產計稅價值估算
      // 由於使用者只輸入市價，這裡假設公告現值約為市價的 70% 進行保守估稅 (可調整)
      const estimatedOfficialRealEstate = Math.round(realEstateMarket * 0.7);

      // 1. 遺產總額 (Estate Total)
      // 規劃前：所有資產加總 (使用估算的公告現值)
      const totalEstateBefore = cash + estimatedOfficialRealEstate + stocks + otherAssets;
      // 規劃後：現金減少，轉入保險 (保險不計入遺產總額，但需注意實質課稅)
      const totalEstateAfter = Math.max(0, cash - insurancePlan) + estimatedOfficialRealEstate + stocks + otherAssets;

      // 2. 扣除額與免稅額 (Deductions & Exemptions) - 113/114年標準
      const exemption = 1333; // 免稅額
      const deductSpouse = spouse ? 553 : 0; // 配偶扣除額
      const deductChildren = children * 56; // 直系卑親屬 (未成年加扣暫不計)
      const deductParents = parents * 138; // 父母
      const deductHandicapped = handicapped * 693; // 重度身障
      const deductFuneral = 138; // 喪葬費
      
      const totalDeductions = exemption + deductSpouse + deductChildren + deductParents + deductHandicapped + deductFuneral;

      // 3. 課稅遺產淨額 (Net Taxable Estate)
      const netEstateBefore = Math.max(0, totalEstateBefore - totalDeductions);
      const netEstateAfter = Math.max(0, totalEstateAfter - totalDeductions);

      // 4. 遺產稅計算 (Tax Calculation) - 2025新級距
      // 5621萬以下 10%
      // 5621萬 ~ 1億1242萬 15% (累進差額 281.05萬) -> 公式: (Net * 0.15) - 281.05
      // 1億1242萬以上 20% (累進差額 843.15萬) -> 公式: (Net * 0.20) - 843.15
      
      const calculateTax = (net: number) => {
          if (net <= 5621) return net * 0.10;
          if (net <= 11242) return (net * 0.15) - 281.05;
          return (net * 0.20) - 843.15;
      };

      const taxBefore = calculateTax(netEstateBefore);
      const taxAfter = calculateTax(netEstateAfter);
      const taxSaved = taxBefore - taxAfter;

      // 5. 最低稅負制檢核 (AMT Check)
      // 死亡給付每一申報戶全年合計數在 3740 萬元以下免予計入 (113年起)
      const amtThreshold = 3740;
      const isAmtRisk = insurancePlan > amtThreshold;
      const amtExcess = Math.max(0, insurancePlan - amtThreshold);

      // 6. 流動性風險分析 (Liquidity Analysis)
      // 需繳稅金 vs 手邊現金 (規劃前)
      const liquidityGapBefore = taxBefore - cash; 
      // 需繳稅金 vs 手邊現金 + 保險理賠現金 (規劃後)
      // 假設身故後，保險理賠金可快速下來救急 (雖需完稅證明，但部分保單可申請墊繳或快速理賠)
      const liquidityAvailableAfter = Math.max(0, cash - insurancePlan) + insurancePlan; // 其實總現金量不變，但保險指定受益人可不經遺產分割直接領取
      const liquidityGapAfter = taxAfter - liquidityAvailableAfter;

      // 7. 實質課稅風險評分 (Risk Radar Data)
      // 滿分100，越高越危險
      let riskScore = 0;
      
      // A. 高齡投保
      if (age > 80) riskScore += 40;
      else if (age > 70) riskScore += 25;
      else if (age > 65) riskScore += 10;

      // B. 帶病/重病投保
      if (healthStatus === 'critical') riskScore += 50; // 重病幾乎必中
      else if (healthStatus === 'ill') riskScore += 30;

      // C. 躉繳/密集
      if (paymentType === 'lumpSum') riskScore += 20;

      // D. 保費 > 保額 (簡易判斷：若純儲蓄險可能會有此狀況，這裡假設如果是為了傳承，通常有槓桿)
      // 這裡暫以輸入金額作為判斷基礎

      const riskLevel = riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';

      return {
          estimatedOfficialRealEstate, // 導出的估算值
          totalEstateBefore,
          totalDeductions,
          netEstateBefore,
          taxBefore,
          taxAfter,
          taxSaved,
          isAmtRisk,
          amtExcess,
          liquidityGapBefore,
          riskScore,
          riskLevel
      };
  }, [spouse, children, parents, handicapped, cash, realEstateMarket, stocks, otherAssets, insurancePlan, age, healthStatus, paymentType]);

  // --- 圖表數據 ---
  const taxCompareData = [
      { name: '規劃前', 遺產稅: Math.round(calculations.taxBefore), 剩餘資產: Math.round(safeData.realEstateMarket + safeData.cash + safeData.stocks + safeData.otherAssets - calculations.taxBefore) },
      { name: '規劃後', 遺產稅: Math.round(calculations.taxAfter), 剩餘資產: Math.round(safeData.realEstateMarket + safeData.cash + safeData.stocks + safeData.otherAssets - calculations.taxAfter) } // 注意：剩餘資產用市價算比較有感
  ];

  const riskData = [
    { subject: '高齡投保', A: Math.min(100, (age - 50) * 2), fullMark: 100 },
    { subject: '健康狀況', A: healthStatus === 'critical' ? 100 : healthStatus === 'ill' ? 60 : 10, fullMark: 100 },
    { subject: '繳費型態', A: paymentType === 'lumpSum' ? 90 : 20, fullMark: 100 },
    { subject: '鉅額投保', A: Math.min(100, (insurancePlan / 1000) * 20), fullMark: 100 }, // 假設1000萬以上開始有風險
    { subject: '密集投保', A: 10, fullMark: 100 }, // 需更多參數，暫定低
  ];

  // --- UI 更新 ---
  const updateField = (field: string, value: any) => { 
      setData({ ...safeData, [field]: value }); 
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-700 to-zinc-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Landmark size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Estate Tax Planning
            </span>
            <span className="bg-yellow-400/20 text-yellow-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-yellow-400/30">
              預留稅源・資產保全
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            稅務傳承專案
          </h1>
          <p className="text-slate-300 text-lg opacity-90 max-w-2xl">
            富過三代的秘密。合法運用免稅額度與保險工具，避免辛苦打拼的資產被稅金與流動性風險吞噬。
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：資產盤點與參數 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-slate-600"/> 
              資產掃描器
            </h4>
            <div className="space-y-6">
               
               {/* 1. 家庭成員 (影響扣除額) */}
               <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <h5 className="text-xs font-bold text-slate-500 uppercase">繼承人結構</h5>
                   <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-600">配偶健在 (扣553萬)</span>
                       <input type="checkbox" checked={spouse} onChange={(e) => updateField('spouse', e.target.checked)} className="w-5 h-5 accent-blue-600 rounded" />
                   </div>
                   <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-600">子女人數 (扣56萬/人)</span>
                       <div className="flex items-center gap-2">
                           <button onClick={() => updateField('children', Math.max(0, children-1))} className="w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center font-bold">-</button>
                           <span className="w-4 text-center font-bold">{children}</span>
                           <button onClick={() => updateField('children', children+1)} className="w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center font-bold">+</button>
                       </div>
                   </div>
                   <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-600">父母人數 (扣138萬/人)</span>
                       <div className="flex items-center gap-2">
                           <button onClick={() => updateField('parents', Math.max(0, parents-1))} className="w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center font-bold">-</button>
                           <span className="w-4 text-center font-bold">{parents}</span>
                           <button onClick={() => updateField('parents', parents+1)} className="w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center font-bold">+</button>
                       </div>
                   </div>
               </div>

               {/* 2. 資產輸入 */}
               <div className="space-y-4">
                   <div>
                       <label className="text-xs font-bold text-slate-500 mb-1 block">現金存款 (萬)</label>
                       <input type="number" value={cash} onChange={(e) => updateField('cash', Number(e.target.value))} className="w-full p-2 border rounded-lg font-bold text-slate-700" />
                   </div>
                   {/* 移除公告現值輸入，僅保留市價 */}
                   <div>
                       <label className="text-xs font-bold text-slate-500 mb-1 block">不動產 (市價)</label>
                       <input type="number" value={realEstateMarket} onChange={(e) => updateField('realEstateMarket', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg font-bold text-slate-700" placeholder="請輸入市價" />
                       <p className="text-[10px] text-slate-400 mt-1">* 系統將自動概抓市價 70% 作為課稅用公告現值估算</p>
                   </div>
                   <div>
                       <label className="text-xs font-bold text-slate-500 mb-1 block">股票/基金 (萬)</label>
                       <input type="number" value={stocks} onChange={(e) => updateField('stocks', Number(e.target.value))} className="w-full p-2 border rounded-lg font-bold text-slate-700" />
                   </div>
               </div>

               {/* 3. 保險規劃 */}
               <div className="pt-4 border-t border-slate-100">
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck size={16}/> 保險規劃 (挪移現金)</label>
                       <span className="font-mono font-bold text-emerald-600 text-lg">${insurancePlan}萬</span>
                   </div>
                   <input 
                      type="range" 
                      min={0} 
                      max={cash} 
                      step={100} 
                      value={insurancePlan} 
                      onChange={(e) => updateField('insurancePlan', Number(e.target.value))} 
                      className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                   />
                   <p className="text-xs text-slate-400 mt-1">將應稅現金轉為免稅保險給付</p>
               </div>

            </div>
          </div>
        </div>

        {/* 右側：稅務分析儀表板 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. 稅金與流動性分析 */}
          <div className="grid md:grid-cols-2 gap-6">
              
              {/* 遺產稅計算結果 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                      <FileText size={100} className="text-slate-900"/>
                  </div>
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Scale size={18} className="text-blue-500"/> 應納稅額分析</h4>
                  
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">遺產總額 <span className="text-xs opacity-60">(含不動產估值)</span></span>
                          <span className="font-mono font-bold text-slate-700">${calculations.totalEstateBefore.toLocaleString()} 萬</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">免稅+扣除額</span>
                          <span className="font-mono font-bold text-green-600">-${calculations.totalDeductions.toLocaleString()} 萬</span>
                      </div>
                      <div className="h-px bg-slate-100 my-2"></div>
                      
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-500 mb-1">未規劃 預估稅金</p>
                          <p className="text-2xl font-black text-slate-700 font-mono">${Math.round(calculations.taxBefore).toLocaleString()} 萬</p>
                      </div>

                      {insurancePlan > 0 && (
                          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                              <p className="text-xs text-emerald-800 mb-1">規劃後 預估稅金</p>
                              <div className="flex justify-center items-baseline gap-2">
                                  <p className="text-2xl font-black text-emerald-600 font-mono">${Math.round(calculations.taxAfter).toLocaleString()} 萬</p>
                                  <span className="text-xs text-emerald-500 font-bold bg-white px-1.5 rounded">省 ${Math.round(calculations.taxSaved).toLocaleString()}</span>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* 流動性風險分析 */}
              <div className={`p-6 rounded-2xl shadow-sm border relative overflow-hidden flex flex-col justify-between ${calculations.liquidityGapBefore > 0 ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div>
                      <h4 className={`font-bold mb-2 flex items-center gap-2 ${calculations.liquidityGapBefore > 0 ? 'text-rose-700' : 'text-blue-700'}`}>
                          {calculations.liquidityGapBefore > 0 ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
                          流動性風險檢測
                      </h4>
                      <p className={`text-sm mb-4 ${calculations.liquidityGapBefore > 0 ? 'text-rose-600' : 'text-blue-600'}`}>
                          {calculations.liquidityGapBefore > 0 
                            ? "警訊：現金不足以繳納遺產稅，恐需變賣家產！" 
                            : "安全：預留現金充裕，可順利完稅。"}
                      </p>
                  </div>

                  <div className="space-y-3">
                      <div>
                          <div className="flex justify-between text-xs font-bold mb-1 opacity-70">
                              <span>應納稅額</span>
                              <span>手邊現金</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-4 overflow-hidden flex">
                              {/* 稅額條 */}
                              <div className="h-full bg-slate-400" style={{width: `${Math.min(100, calculations.taxBefore / (Math.max(calculations.taxBefore, cash) || 1) * 100)}%`}}></div>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-4 overflow-hidden flex mt-1">
                              {/* 現金條 */}
                              <div className={`h-full ${calculations.liquidityGapBefore > 0 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{width: `${Math.min(100, cash / (Math.max(calculations.taxBefore, cash) || 1) * 100)}%`}}></div>
                          </div>
                      </div>

                      {insurancePlan > 0 && (
                          <div className="pt-2 border-t border-black/5">
                              <p className="text-xs font-bold mb-1 opacity-80">規劃後：預留稅源 (保險理賠)</p>
                              <div className="flex items-center gap-2">
                                  <ShieldCheck size={16} className="text-emerald-600"/>
                                  <span className="text-lg font-black font-mono text-emerald-700">
                                      +${insurancePlan} 萬
                                  </span>
                                  <span className="text-xs text-emerald-600">(指定受益人現金)</span>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* 2. 實質課稅風險雷達 (Risk Radar) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <Siren size={20} className={calculations.riskLevel === 'High' ? 'text-red-500' : calculations.riskLevel === 'Medium' ? 'text-orange-500' : 'text-green-500'}/> 
                      實質課稅風險雷達
                  </h4>
                  <div className="flex gap-2 text-xs">
                      <button 
                        onClick={() => setShowRiskDetail(!showRiskDetail)}
                        className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors text-slate-600"
                      >
                        {showRiskDetail ? '隱藏設定' : '調整風險參數'}
                      </button>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Radar Chart */}
                  <div className="h-[250px] w-[300px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false}/>
                              <Radar
                                  name="Risk"
                                  dataKey="A"
                                  stroke={calculations.riskLevel === 'High' ? '#ef4444' : '#f59e0b'}
                                  fill={calculations.riskLevel === 'High' ? '#ef4444' : '#f59e0b'}
                                  fillOpacity={0.4}
                              />
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>

                  {/* Risk Config / Warning */}
                  <div className="flex-1 w-full">
                      {showRiskDetail ? (
                          <div className="space-y-4 bg-slate-50 p-4 rounded-xl animate-in slide-in-from-right-2">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs font-bold text-slate-500 mb-1">投保年齡</label>
                                      <input type="number" value={age} onChange={(e) => updateField('age', Number(e.target.value))} className="w-full p-2 border rounded text-sm"/>
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-slate-500 mb-1">健康狀況</label>
                                      <select value={healthStatus} onChange={(e) => updateField('healthStatus', e.target.value)} className="w-full p-2 border rounded text-sm">
                                          <option value="normal">健康標準體</option>
                                          <option value="ill">次標準體(帶病)</option>
                                          <option value="critical">重病/安寧</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-slate-500 mb-1">繳費方式</label>
                                      <select value={paymentType} onChange={(e) => updateField('paymentType', e.target.value)} className="w-full p-2 border rounded text-sm">
                                          <option value="installment">分期繳納</option>
                                          <option value="lumpSum">躉繳 (一次清)</option>
                                      </select>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className={`p-4 rounded-xl border-l-4 ${calculations.riskLevel === 'High' ? 'bg-red-50 border-red-500' : calculations.riskLevel === 'Medium' ? 'bg-orange-50 border-orange-500' : 'bg-green-50 border-green-500'}`}>
                              <h5 className={`font-bold text-lg mb-2 ${calculations.riskLevel === 'High' ? 'text-red-700' : calculations.riskLevel === 'Medium' ? 'text-orange-700' : 'text-green-700'}`}>
                                  風險評級：{calculations.riskLevel}
                              </h5>
                              <p className="text-sm text-slate-600 mb-2">
                                  {calculations.riskLevel === 'High' 
                                    ? "警告：極高機率被國稅局依「實質課稅原則」計入遺產課稅！請避免高齡、帶病或躉繳投保。"
                                    : calculations.riskLevel === 'Medium'
                                    ? "注意：部分特徵符合八大態樣，建議採分期繳納並提早規劃以降低疑慮。"
                                    : "安全：規劃符合常規，具有資產傳承與保障之實質意義。"}
                              </p>
                              {calculations.isAmtRisk && (
                                  <div className="mt-3 pt-3 border-t border-black/5 text-xs text-orange-600 font-bold flex items-center gap-1">
                                      <AlertTriangle size={12}/> 最低稅負制警示：死亡給付超過 3,740 萬，超額部分需計入基本所得額。
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </div>
          </div>

        </div>
      </div>
      
      {/* 底部策略區 */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 稅務策略三部曲 */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
             <Activity className="text-slate-700" size={24} />
             <h3 className="text-xl font-bold text-slate-800">稅務傳承三部曲</h3>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-slate-300 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-slate-100 text-slate-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">01</span>
                   <span>壓縮</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">資產壓縮 (降稅基)</h4>
                   <p className="text-sm text-slate-600 mt-1">善用不動產公告現值與市價的落差，以及保險給付不計入遺產總額的特性，合法降低課稅遺產總額。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">02</span>
                   <span>預留</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">預留稅源 (保流動)</h4>
                   <p className="text-sm text-slate-600 mt-1">透過人壽保險指定受益人，身故理賠金可快速變現，提供家人繳納遺產稅的現金來源，避免變賣祖產。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">03</span>
                   <span>分配</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">指定分配 (避紛爭)</h4>
                   <p className="text-sm text-slate-600 mt-1">保險金給付不受民法特留分限制（需留意極端案例），可依照您的意願精準分配財富給想照顧的人。</p>
                </div>
             </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「沒有規劃的財富是遺產（稅），有規劃的財富才是傳承（愛）。」
             </p>
           </div>
        </div>

        {/* 2. 專案效益 */}
        <div className="space-y-4 lg:col-span-1">
           <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="text-slate-700" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "資產保全", desc: "避免因現金不足繳稅，被迫以低價變賣不動產或股票，導致資產大幅縮水。" },
                { title: "稅務優化", desc: "將應稅資產（現金/定存）轉為免稅資產（保險），直接降低遺產稅級距與稅額。" },
                { title: "控制權", desc: "透過要保人與受益人的安排，您可以完全掌控資產的去向，直到最後一刻。" },
                { title: "隱私保護", desc: "遺產須經全體繼承人協議分割，保險金則直接給付受益人，保有高度隱私與獨立性。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-200 transition-colors">
                  <CheckCircle2 className="text-slate-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};