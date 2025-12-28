import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  X, 
  Trash2,
  Grid,
  Columns,
  Square,
  Maximize2,
  Minimize2
} from 'lucide-react';

// --- 引入所有工具元件 ---
import GoldenSafeVault from './GoldenSafeVault';
import MarketDataZone from './MarketDataZone';
import FundTimeMachine from './FundTimeMachine';
import MillionDollarGiftTool from './MillionDollarGiftTool';
import { FinancialRealEstateTool } from './FinancialRealEstateTool';
import { StudentLoanTool } from './StudentLoanTool';
import { SuperActiveSavingTool } from './SuperActiveSavingTool';
import { CarReplacementTool } from './CarReplacementTool';
import { LaborPensionTool } from './LaborPensionTool';
import { BigSmallReservoirTool } from './BigSmallReservoirTool';
import { TaxPlannerTool } from './TaxPlannerTool';

// 工具定義表
const TOOL_REGISTRY = [
  { id: 'golden_safe', name: '黃金保險箱', component: GoldenSafeVault, dataKey: 'goldenSafeData' },
  { id: 'market_data', name: '市場數據戰情', component: MarketDataZone, dataKey: null }, 
  { id: 'fund_machine', name: '基金時光機', component: FundTimeMachine, dataKey: null }, 
  { id: 'pension', name: '退休缺口試算', component: LaborPensionTool, dataKey: 'pensionData' },
  { id: 'gift', name: '百萬禮物專案', component: MillionDollarGiftTool, dataKey: 'giftData' },
  { id: 'estate', name: '金融房產專案', component: FinancialRealEstateTool, dataKey: 'estateData' },
  { id: 'student', name: '學貸活化專案', component: StudentLoanTool, dataKey: 'studentData' },
  { id: 'super_active', name: '超積極存錢法', component: SuperActiveSavingTool, dataKey: 'superActiveData' },
  { id: 'car', name: '五年換車專案', component: CarReplacementTool, dataKey: 'carData' },
  { id: 'reservoir', name: '大小水庫專案', component: BigSmallReservoirTool, dataKey: 'reservoirData' },
  { id: 'tax', name: '稅務傳承專案', component: TaxPlannerTool, dataKey: 'taxData' },
];

interface FreeDashboardProps {
  allData: any;      
  setAllData: any;   
  savedLayout?: (string | null)[]; 
  onSaveLayout?: (layout: (string | null)[]) => void;
}

// ----------------------------------------------------------------------
// 內部元件：智慧縮放容器 (解決文字擠壓問題)
// ----------------------------------------------------------------------
const SmartScaleWrapper = ({ children, scaleRatio = 0.75 }: { children: React.ReactNode, scaleRatio?: number }) => {
    // scaleRatio 0.75 代表：內部渲染寬度是容器的 133% (1/0.75)，然後縮小回 75%
    // 這樣可以讓內部元件覺得空間很大，不會強制換行，然後視覺上縮小塞進去
    const inverseScale = (1 / scaleRatio) * 100; 

    return (
        <div className="w-full h-full overflow-hidden relative bg-white/50 rounded-xl">
            <div 
                className="origin-top-left absolute top-0 left-0 h-full overflow-y-auto overflow-x-hidden scrollbar-thin"
                style={{
                    width: `${inverseScale}%`, // 寬度放大
                    height: `${inverseScale}%`, // 高度放大 (讓 scrollbar 正常運作)
                    transform: `scale(${scaleRatio})`, // 視覺縮小
                }}
            >
                <div className="p-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

const FreeDashboardTool: React.FC<FreeDashboardProps> = ({ allData, setAllData, savedLayout, onSaveLayout }) => {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [isSelectorOpen, setIsSelectorOpen] = useState<number | null>(null); 
  
  // 版面模式: 'auto' | '1col' | '2col' | 'grid2x2'
  const [layoutMode, setLayoutMode] = useState<'auto' | '1col' | '2col' | 'grid2x2'>('grid2x2');

  useEffect(() => {
    if (savedLayout && savedLayout.length === 4) {
        setSlots(savedLayout);
    }
  }, [savedLayout]);

  // 計算有效工具數量，用於自動模式
  const activeToolCount = slots.filter(s => s !== null).length;

  const handleSelectTool = (slotIndex: number, toolId: string) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = toolId;
    setSlots(newSlots);
    setIsSelectorOpen(null);
    if (onSaveLayout) onSaveLayout(newSlots);
  };

  const handleRemoveTool = (slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
    if (onSaveLayout) onSaveLayout(newSlots);
  };

  // 決定 Grid Class
  const getGridClass = () => {
      switch (layoutMode) {
          case '1col': return 'grid-cols-1';
          case '2col': return 'grid-cols-1 md:grid-cols-2'; // 強制並排
          case 'grid2x2': return 'grid-cols-1 lg:grid-cols-2'; // 標準四格
          case 'auto': 
          default:
              // 自動判斷：如果只有1個工具就全寬，2個就並排，3個以上就四格
              if (activeToolCount <= 1) return 'grid-cols-1';
              if (activeToolCount === 2) return 'grid-cols-1 lg:grid-cols-2';
              return 'grid-cols-1 lg:grid-cols-2';
      }
  };

  // 決定顯示多少個插槽 (Slots)
  // 如果選 2col 模式，我們只顯示前 2 個 slot (不管後面有沒有東西)
  // 如果選 1col 模式，只顯示前 1 個 slot
  const visibleSlots = () => {
      if (layoutMode === '1col') return slots.slice(0, 1);
      if (layoutMode === '2col') return slots.slice(0, 2);
      return slots; // grid2x2 或 auto 顯示全部 4 格
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <LayoutDashboard size={24} />
            </div>
            <div>
                <h1 className="text-xl font-extrabold text-slate-800">自由組合戰情室</h1>
                <p className="text-xs text-slate-500">拖拉組合工具，打造客製化諮詢場景</p>
            </div>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button 
                onClick={() => setLayoutMode('1col')}
                className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${layoutMode === '1col' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="單欄聚焦"
            >
                <Square size={16} /> 1欄
            </button>
            <button 
                onClick={() => setLayoutMode('2col')}
                className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${layoutMode === '2col' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="雙欄比對"
            >
                <Columns size={16} /> 2欄
            </button>
            <button 
                onClick={() => setLayoutMode('grid2x2')}
                className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${layoutMode === 'grid2x2' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="四格總覽"
            >
                <Grid size={16} /> 4格
            </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className={`grid gap-6 transition-all duration-300 ${getGridClass()}`}>
        {visibleSlots().map((toolId, index) => {
          const toolConfig = TOOL_REGISTRY.find(t => t.id === toolId);
          
          return (
            <div 
              key={index} 
              className={`rounded-3xl transition-all relative flex flex-col overflow-hidden
                ${toolId 
                  ? 'bg-white border border-slate-200 shadow-sm h-[500px]' // 固定高度確保排版整齊
                  : 'h-[200px] md:h-[500px] border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 justify-center items-center' 
                }`}
            >
              {toolId && toolConfig ? (
                // --- 已選擇工具 ---
                <div className="w-full h-full flex flex-col">
                   {/* Tool Header */}
                   <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                       <span className="font-bold text-slate-700 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                           {toolConfig.name}
                       </span>
                       <div className="flex items-center gap-1">
                           <button 
                             onClick={() => handleRemoveTool(index)}
                             className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                             title="移除"
                           >
                              <X size={16} />
                           </button>
                       </div>
                   </div>

                   {/* Tool Body with Smart Scale */}
                   <div className="flex-1 relative overflow-hidden bg-slate-50/30">
                       {/* scaleRatio = 0.75 是關鍵
                          這會讓內容以 133% 的寬度渲染 (例如本來 500px -> 變成 666px)，
                          然後再縮小放進去。
                          這能有效解決圖表被擠壓、文字折行難看的問題。
                       */}
                       <SmartScaleWrapper scaleRatio={0.8}> 
                           {toolConfig.dataKey ? (
                               <toolConfig.component 
                                  data={allData[toolConfig.dataKey]} 
                                  setData={setAllData[toolConfig.dataKey]} 
                               />
                           ) : (
                               <toolConfig.component />
                           )}
                       </SmartScaleWrapper>
                   </div>
                </div>
              ) : (
                // --- 空插槽 ---
                <div className="text-center w-full max-w-xs relative z-10">
                   {isSelectorOpen === index ? (
                      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200 mx-4">
                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                             <span className="font-bold text-slate-700">選擇工具</span>
                             <button onClick={() => setIsSelectorOpen(null)}><X size={18} className="text-slate-400 hover:text-slate-600"/></button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                             {TOOL_REGISTRY.map(tool => {
                                // 檢查工具是否已經被選過 (避免重複)
                                const isSelected = slots.includes(tool.id);
                                return (
                                    <button
                                    key={tool.id}
                                    onClick={() => handleSelectTool(index, tool.id)}
                                    disabled={isSelected}
                                    className={`text-left px-4 py-3 rounded-lg font-medium transition-colors text-sm flex justify-between items-center
                                        ${isSelected 
                                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
                                            : 'hover:bg-blue-50 text-slate-600 hover:text-blue-600'
                                        }`}
                                    >
                                    {tool.name}
                                    {isSelected && <span className="text-[10px] bg-slate-200 px-1.5 rounded">已選</span>}
                                    </button>
                                )
                             })}
                          </div>
                      </div>
                   ) : (
                      <button 
                        onClick={() => setIsSelectorOpen(index)}
                        className="flex flex-col items-center gap-3 text-slate-400 hover:text-blue-500 transition-colors group w-full h-full"
                      >
                         <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                            <Plus size={28} />
                         </div>
                         <span className="font-bold text-sm">新增工具</span>
                      </button>
                   )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FreeDashboardTool;