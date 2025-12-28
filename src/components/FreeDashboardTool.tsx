import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, // [修正] 改用 LayoutDashboard 避免版本衝突
  Plus, 
  X, 
  Trash2,
  Maximize2
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
  savedLayout?: (string | null)[]; // [修正] 允許 null
  onSaveLayout?: (layout: (string | null)[]) => void;
}

const FreeDashboardTool: React.FC<FreeDashboardProps> = ({ allData, setAllData, savedLayout, onSaveLayout }) => {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [isSelectorOpen, setIsSelectorOpen] = useState<number | null>(null); 

  useEffect(() => {
    if (savedLayout && savedLayout.length === 4) {
        setSlots(savedLayout);
    }
  }, [savedLayout]);

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

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <LayoutDashboard size={180} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            自由組合戰情室
          </h1>
          <p className="text-slate-300 text-lg opacity-90 max-w-2xl">
            拖拉組合您的諮詢場景。同時呈現多種工具，打造客製化的視覺說服力。
          </p>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {slots.map((toolId, index) => {
          const toolConfig = TOOL_REGISTRY.find(t => t.id === toolId);
          
          return (
            <div 
              key={index} 
              className={`min-h-[400px] rounded-2xl border-2 border-dashed transition-all relative flex flex-col
                ${toolId 
                  ? 'bg-transparent border-transparent shadow-none' 
                  : 'bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 justify-center items-center' 
                }`}
            >
              {toolId && toolConfig ? (
                <div className="w-full h-full relative group">
                   <div className="relative bg-white/50 rounded-3xl p-1 h-full overflow-hidden shadow-sm border border-slate-200">
                       <div className="absolute top-4 right-4 z-[50] opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleRemoveTool(index)}
                            className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            title="移除此區塊"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>

                       <div className="origin-top scale-[0.95] xl:scale-[0.85] 2xl:scale-100 w-full h-full overflow-y-auto scrollbar-thin">
                           {toolConfig.dataKey ? (
                               <toolConfig.component 
                                  data={allData[toolConfig.dataKey]} 
                                  setData={setAllData[toolConfig.dataKey]} 
                               />
                           ) : (
                               <toolConfig.component />
                           )}
                       </div>
                   </div>
                </div>
              ) : (
                <div className="text-center w-full max-w-xs">
                   {isSelectorOpen === index ? (
                      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                             <span className="font-bold text-slate-700">選擇工具</span>
                             <button onClick={() => setIsSelectorOpen(null)}><X size={18} className="text-slate-400 hover:text-slate-600"/></button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                             {TOOL_REGISTRY.map(tool => (
                                <button
                                  key={tool.id}
                                  onClick={() => handleSelectTool(index, tool.id)}
                                  className="text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm"
                                >
                                   {tool.name}
                                </button>
                             ))}
                          </div>
                      </div>
                   ) : (
                      <button 
                        onClick={() => setIsSelectorOpen(index)}
                        className="flex flex-col items-center gap-3 text-slate-400 hover:text-blue-500 transition-colors group"
                      >
                         <div className="w-16 h-16 rounded-full bg-slate-200 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Plus size={32} />
                         </div>
                         <span className="font-bold">點擊新增工具</span>
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