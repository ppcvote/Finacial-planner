/**
 * Ultra Advisor - 傲創計算機（公開頁面）
 * 不需登入即可使用，用於引流
 * 
 * 檔案位置：src/pages/PublicCalculator.tsx
 */

import React from 'react';
import { ArrowLeft, Zap, LogIn } from 'lucide-react';
import MortgageCalculator from '../components/MortgageCalculator';

interface PublicCalculatorProps {
  onBack: () => void;
  onLogin: () => void;
}

const PublicCalculator: React.FC<PublicCalculatorProps> = ({ onBack, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* 頂部導航 */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">返回首頁</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">
              想要更多專業工具？
            </span>
            <button
              onClick={onLogin}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
            >
              <LogIn size={16} />
              免費試用
            </button>
          </div>
        </div>
      </div>

      {/* 傲創計算機主體 */}
      <MortgageCalculator />

      {/* 底部 CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="text-amber-400" size={24} />
            <h3 className="text-xl font-bold text-white">解鎖 18 種專業理財工具</h3>
          </div>
          <p className="text-slate-300 mb-4">
            大小水庫、金融房產、節稅規劃、退休試算...
            <br />
            一站式解決客戶所有理財規劃需求
          </p>
          <button
            onClick={onLogin}
            className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
          >
            立即免費試用 7 天
          </button>
          <p className="text-xs text-slate-400 mt-3">
            無需信用卡 · 隨時可取消
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCalculator;
