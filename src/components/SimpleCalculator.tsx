import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Calculator,
  History,
  Trash2,
  Copy,
  Check,
  Percent,
  Users,
  PiggyBank,
  ChevronRight,
  RotateCcw,
  StickyNote,
  X,
  Download,
  FileText,
  Undo2,
} from 'lucide-react';

// ============================================================
// 類型定義
// ============================================================
interface CalculationRecord {
  id: string;
  expression: string;
  result: string;
  rawResult: number;
  timestamp: Date;
  type: 'basic' | 'percent' | 'split' | 'interest';
  note?: string;  // 備註
}

// ============================================================
// 簡易計算機元件
// ============================================================
export default function SimpleCalculator() {
  // 狀態
  const [currentInput, setCurrentInput] = useState('0');
  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [copied, setCopied] = useState(false);
  // 🆕 持久化 activeTab：重新整理後保持在原工具標籤
  const [activeTab, setActiveTab] = useState<'basic' | 'percent' | 'split' | 'interest'>(() => {
    const saved = localStorage.getItem('simple_calculator_tab');
    if (saved && ['basic', 'percent', 'split', 'interest'].includes(saved)) {
      return saved as 'basic' | 'percent' | 'split' | 'interest';
    }
    return 'basic';
  });

  // 🆕 當 activeTab 變化時儲存到 localStorage
  useEffect(() => {
    localStorage.setItem('simple_calculator_tab', activeTab);
  }, [activeTab]);

  // 百分比計算狀態
  const [percentBase, setPercentBase] = useState('');
  const [percentRate, setPercentRate] = useState('');

  // 分帳計算狀態
  const [splitAmount, setSplitAmount] = useState('');
  const [splitPeople, setSplitPeople] = useState('2');

  // 利息計算狀態
  const [interestPrincipal, setInterestPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestYears, setInterestYears] = useState('1');

  // 格式化數字（顯示用）- 保留小數點後兩位
  const formatNumber = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) return 'Error';
    if (Math.abs(num) >= 1e12) return num.toExponential(2);
    // 四捨五入到小數點後兩位
    const rounded = Math.round(num * 100) / 100;
    // 如果是整數，不顯示小數點
    if (Number.isInteger(rounded)) {
      return rounded.toLocaleString('zh-TW');
    }
    return rounded.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  // 安全的數學表達式計算
  const safeCalculate = (expr: string): number => {
    // 處理百分比：將 X% 轉換為 (X/100)
    let processed = expr.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');
    // 處理乘法優先級：數字後直接接百分比結果要相乘
    // 例如 12345 * 5% => 12345 * (5/100)
    processed = processed.replace(/\s+/g, '');

    // 僅允許數字、運算符、小數點、括號
    const sanitized = processed.replace(/[^0-9+\-*/.()]/g, '');
    if (!sanitized) throw new Error('Invalid expression');

    const calculate = new Function(`return (${sanitized})`);
    return calculate();
  };

  // 處理數字輸入
  const handleNumber = useCallback((num: string) => {
    setCurrentInput(prev => {
      // 如果上一次有結果且開始新輸入，清除結果狀態
      if (lastResult !== null && expression === '') {
        setLastResult(null);
        return num;
      }
      if (prev === '0' || prev === 'Error') return num;
      if (prev.length >= 15) return prev;
      return prev + num;
    });
  }, [lastResult, expression]);

  // 處理運算符
  const handleOperator = useCallback((op: string) => {
    // 如果有上次結果，從結果繼續運算
    if (lastResult !== null && expression === '') {
      setExpression(formatNumber(lastResult) + ' ' + op + ' ');
      setCurrentInput('0');
      setLastResult(null);
      return;
    }

    setExpression(prev => prev + currentInput + ' ' + op + ' ');
    setCurrentInput('0');
  }, [currentInput, lastResult, expression]);

  // 處理百分比按鈕 - 將當前數字轉為百分比
  const handlePercent = useCallback(() => {
    setCurrentInput(prev => {
      if (prev === '0' || prev === 'Error') return prev;
      return prev + '%';
    });
  }, []);

  const handleDecimal = useCallback(() => {
    setCurrentInput(prev => {
      if (prev.includes('.')) return prev;
      return prev + '.';
    });
  }, []);

  const handleClear = useCallback(() => {
    setCurrentInput('0');
    setExpression('');
    setLastResult(null);
  }, []);

  const handleBackspace = useCallback(() => {
    // 如果 currentInput 有內容（不是 0），刪除 currentInput 的最後一個字元
    if (currentInput !== '0' && currentInput !== 'Error') {
      setCurrentInput(prev => {
        if (prev.length === 1) return '0';
        return prev.slice(0, -1);
      });
      return;
    }

    // 如果 currentInput 是 0，嘗試刪除 expression 中的最後一個運算符
    if (expression.trim()) {
      // expression 格式例如: "31,250 * 0 / 0 / "
      // 移除尾部空格，然後取得最後一個「數字 運算符」或「運算符」
      const trimmed = expression.trimEnd();
      // 找到最後一個空格位置
      const lastSpaceIndex = trimmed.lastIndexOf(' ');

      if (lastSpaceIndex === -1) {
        // 沒有空格，整個 expression 就是一個數字，把它放回 currentInput
        setCurrentInput(trimmed.replace(/,/g, '') || '0');
        setExpression('');
      } else {
        // 取得最後一個 token（可能是運算符或數字）
        const lastToken = trimmed.slice(lastSpaceIndex + 1);
        const remaining = trimmed.slice(0, lastSpaceIndex);

        // 如果最後是運算符 (+ - * /)，直接移除
        if (['+', '-', '*', '/'].includes(lastToken)) {
          // remaining 可能是 "31,250 * 0 / 0"，再找最後一個數字放回 currentInput
          const lastNumSpaceIndex = remaining.lastIndexOf(' ');
          if (lastNumSpaceIndex === -1) {
            // remaining 就是數字
            setCurrentInput(remaining.replace(/,/g, '') || '0');
            setExpression('');
          } else {
            const lastNum = remaining.slice(lastNumSpaceIndex + 1);
            setCurrentInput(lastNum.replace(/,/g, '') || '0');
            setExpression(remaining.slice(0, lastNumSpaceIndex + 1) + ' ');
          }
        } else {
          // 最後是數字，把它放回 currentInput
          setCurrentInput(lastToken.replace(/,/g, '') || '0');
          setExpression(remaining + ' ');
        }
      }
    }
  }, [currentInput, expression]);

  // 計算結果
  const handleEquals = useCallback(() => {
    try {
      const fullExpr = expression + currentInput;
      const result = safeCalculate(fullExpr);
      const formattedResult = formatNumber(result);

      // 添加到歷史
      const record: CalculationRecord = {
        id: Date.now().toString(),
        expression: fullExpr.replace(/\*/g, '×').replace(/\//g, '÷'),
        result: formattedResult,
        rawResult: result,
        timestamp: new Date(),
        type: 'basic',
      };
      setHistory(prev => [record, ...prev].slice(0, 50));

      // 設置結果，允許繼續運算
      setLastResult(result);
      setCurrentInput(formattedResult);
      setExpression('');
    } catch {
      setCurrentInput('Error');
      setExpression('');
      setLastResult(null);
    }
  }, [expression, currentInput]);

  // 百分比計算
  const calculatePercent = useCallback(() => {
    const base = parseFloat(percentBase.replace(/,/g, ''));
    const rate = parseFloat(percentRate);
    if (isNaN(base) || isNaN(rate)) return;

    const result = base * (rate / 100);
    const formattedResult = formatNumber(result);

    const record: CalculationRecord = {
      id: Date.now().toString(),
      expression: `${formatNumber(base)} × ${rate}%`,
      result: formattedResult,
      rawResult: result,
      timestamp: new Date(),
      type: 'percent',
    };
    setHistory(prev => [record, ...prev].slice(0, 50));
    setLastResult(result);
    setCurrentInput(formattedResult);
  }, [percentBase, percentRate]);

  // 分帳計算
  const calculateSplit = useCallback(() => {
    const amount = parseFloat(splitAmount.replace(/,/g, ''));
    const people = parseInt(splitPeople);
    if (isNaN(amount) || isNaN(people) || people <= 0) return;

    const perPerson = amount / people;
    const formattedResult = formatNumber(perPerson);

    const record: CalculationRecord = {
      id: Date.now().toString(),
      expression: `${formatNumber(amount)} ÷ ${people}人`,
      result: formattedResult,
      rawResult: perPerson,
      timestamp: new Date(),
      type: 'split',
    };
    setHistory(prev => [record, ...prev].slice(0, 50));
    setLastResult(perPerson);
    setCurrentInput(formattedResult);
  }, [splitAmount, splitPeople]);

  // 簡易利息計算
  const calculateInterest = useCallback(() => {
    const principal = parseFloat(interestPrincipal.replace(/,/g, ''));
    const rate = parseFloat(interestRate);
    const years = parseFloat(interestYears);
    if (isNaN(principal) || isNaN(rate) || isNaN(years)) return;

    const finalAmount = principal * Math.pow(1 + rate / 100, years);
    const interest = finalAmount - principal;

    const record: CalculationRecord = {
      id: Date.now().toString(),
      expression: `${formatNumber(principal)} × ${rate}% × ${years}年`,
      result: `本利和: ${formatNumber(finalAmount)} (利息: ${formatNumber(interest)})`,
      rawResult: finalAmount,
      timestamp: new Date(),
      type: 'interest',
    };
    setHistory(prev => [record, ...prev].slice(0, 50));
    setLastResult(finalAmount);
    setCurrentInput(formatNumber(finalAmount));
  }, [interestPrincipal, interestRate, interestYears]);

  // 複製結果
  const copyResult = useCallback(() => {
    navigator.clipboard.writeText(currentInput.replace(/,/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentInput]);

  // Undo 功能：儲存歷史快照
  const [historySnapshots, setHistorySnapshots] = useState<CalculationRecord[][]>([]);
  const maxSnapshots = 20; // 最多保留 20 個快照

  // 儲存快照（在每次歷史變更前呼叫）
  const saveSnapshot = useCallback(() => {
    setHistorySnapshots(prev => {
      const newSnapshots = [...prev, history];
      // 限制快照數量
      if (newSnapshots.length > maxSnapshots) {
        return newSnapshots.slice(-maxSnapshots);
      }
      return newSnapshots;
    });
  }, [history]);

  // 復原上一步
  const undo = useCallback(() => {
    if (historySnapshots.length === 0) return;
    const lastSnapshot = historySnapshots[historySnapshots.length - 1];
    setHistory(lastSnapshot);
    setHistorySnapshots(prev => prev.slice(0, -1));
  }, [historySnapshots]);

  // 清除歷史（先儲存快照再清除）
  const clearHistory = useCallback(() => {
    if (history.length === 0) return;
    saveSnapshot();
    setHistory([]);
  }, [history, saveSnapshot]);

  // 匯出功能狀態
  const [exportCopied, setExportCopied] = useState(false);

  // 產生匯出文字
  const generateExportText = useCallback((includeFooter = false) => {
    if (history.length === 0) return '';

    // 從最舊到最新排序（反轉陣列）
    const sortedHistory = [...history].reverse();

    const content = sortedHistory.map(record => {
      const note = record.note || '';
      // 清理表達式中的空格
      const expr = record.expression.replace(/\s+/g, '');
      // 清理結果中的逗號
      const result = record.result.replace(/,/g, '');
      return `${note}|${expr}=${result}`;
    }).join('\n');

    // 加上來源標註
    if (includeFooter) {
      return content + '\n\n— 來自 Ultra Advisor 智能計算機 https://ultra-advisor.tw/calculator';
    }
    return content;
  }, [history]);

  // 複製匯出內容（含來源標註）
  const copyExport = useCallback(() => {
    const text = generateExportText(true);
    if (!text) return;

    navigator.clipboard.writeText(text);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  }, [generateExportText]);

  // 下載為 TXT 檔案（含來源標註）
  const downloadExport = useCallback(() => {
    const text = generateExportText(true);
    if (!text) return;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `計算紀錄_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateExportText]);

  // 備註編輯狀態
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const noteInputRef = useRef<HTMLInputElement>(null);

  // 開始編輯備註
  const startEditNote = useCallback((record: CalculationRecord) => {
    setEditingNoteId(record.id);
    setNoteInput(record.note || '');
  }, []);

  // 儲存備註
  const saveNote = useCallback(() => {
    if (!editingNoteId) return;
    setHistory(prev => prev.map(r =>
      r.id === editingNoteId ? { ...r, note: noteInput.trim() || undefined } : r
    ));
    setEditingNoteId(null);
    setNoteInput('');
  }, [editingNoteId, noteInput]);

  // 取消編輯備註
  const cancelEditNote = useCallback(() => {
    setEditingNoteId(null);
    setNoteInput('');
  }, []);

  // 自動聚焦備註輸入框
  useEffect(() => {
    if (editingNoteId && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [editingNoteId]);

  // 從歷史恢復算式
  const restoreFromHistory = useCallback((record: CalculationRecord) => {
    setExpression(record.expression + ' ');
    setCurrentInput('0');
    setLastResult(null);
  }, []);

  // 從歷史使用結果繼續運算
  const useResultFromHistory = useCallback((record: CalculationRecord) => {
    setLastResult(record.rawResult);
    setCurrentInput(record.result.split(':')[0].trim().split(' ')[0] || formatNumber(record.rawResult));
    setExpression('');
  }, []);

  // 刪除單一記錄（先儲存快照）
  const deleteRecord = useCallback((recordId: string) => {
    saveSnapshot();
    setHistory(prev => prev.filter(r => r.id !== recordId));
  }, [saveSnapshot]);

  // 🆕 鍵盤輸入支援（僅在基本計算機模式）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在編輯備註，不攔截鍵盤事件
      if (editingNoteId) return;
      // 如果不是基本計算機模式，不攔截
      if (activeTab !== 'basic') return;
      // 如果焦點在 input 元素上，不攔截
      if (document.activeElement?.tagName === 'INPUT') return;

      const key = e.key;

      // 數字鍵 0-9
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleNumber(key);
        return;
      }

      // 運算符
      switch (key) {
        case '+':
          e.preventDefault();
          handleOperator('+');
          break;
        case '-':
          e.preventDefault();
          handleOperator('-');
          break;
        case '*':
        case 'x':
        case 'X':
          e.preventDefault();
          handleOperator('*');
          break;
        case '/':
          e.preventDefault();
          handleOperator('/');
          break;
        case '%':
          e.preventDefault();
          handlePercent();
          break;
        case '.':
        case ',':
          e.preventDefault();
          handleDecimal();
          break;
        case 'Enter':
        case '=':
          e.preventDefault();
          handleEquals();
          break;
        case 'Backspace':
          e.preventDefault();
          handleBackspace();
          break;
        case 'Escape':
        case 'c':
        case 'C':
          // Escape 或 C 鍵清除
          if (key === 'Escape' || (key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey)) {
            e.preventDefault();
            handleClear();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, editingNoteId, handleNumber, handleOperator, handlePercent, handleDecimal, handleEquals, handleBackspace, handleClear]);

  // 計算機按鈕元件
  const CalcButton = ({
    children,
    onClick,
    variant = 'number',
    className = ''
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'number' | 'operator' | 'action' | 'equals';
    className?: string;
  }) => {
    const baseClass = 'w-full aspect-square rounded-xl text-lg font-bold transition-all active:scale-95';
    const variants = {
      number: 'bg-slate-700 hover:bg-slate-600 text-white',
      operator: 'bg-blue-600 hover:bg-blue-500 text-white',
      action: 'bg-slate-600 hover:bg-slate-500 text-slate-200',
      equals: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    };
    return (
      <button className={`${baseClass} ${variants[variant]} ${className}`} onClick={onClick}>
        {children}
      </button>
    );
  };

  // 自定義滾動條樣式
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4">
      <style>{scrollbarStyles}</style>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center py-3">
          <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Calculator className="text-emerald-400" size={24} />
            智能計算機
          </h1>
          <p className="text-slate-400 text-xs mt-1">計算歷史自動保存 · 支援連續運算</p>
        </div>

        {/* 功能標籤 */}
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl mb-4">
          {[
            { id: 'basic', icon: Calculator, label: '基本' },
            { id: 'percent', icon: Percent, label: '百分比' },
            { id: 'split', icon: Users, label: '分帳' },
            { id: 'interest', icon: PiggyBank, label: '利息' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 主要內容區：左右兩欄 */}
        <div className="flex gap-4">
          {/* 左側：歷史記錄 */}
          <div className="hidden md:flex md:flex-col w-64 bg-slate-800/50 rounded-2xl p-3 h-[480px] overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <History size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-white">歷史紀錄</span>
                <span className="text-xs text-slate-500">({history.length})</span>
              </div>
              <div className="flex items-center gap-1">
                {/* 復原按鈕 */}
                {historySnapshots.length > 0 && (
                  <button
                    onClick={undo}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-amber-400"
                    title={`復原 (${historySnapshots.length})`}
                  >
                    <Undo2 size={14} />
                  </button>
                )}
                {/* 清除按鈕 */}
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-red-400"
                    title="清除全部"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 匯出按鈕列 */}
            {history.length > 0 && (
              <div className="flex gap-1 mb-3">
                <button
                  onClick={copyExport}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    exportCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                  title="複製全部紀錄"
                >
                  {exportCopied ? <Check size={12} /> : <Copy size={12} />}
                  {exportCopied ? '已複製' : '複製'}
                </button>
                <button
                  onClick={downloadExport}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
                  title="下載為 TXT 檔案"
                >
                  <Download size={12} />
                  下載
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <History size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">尚無計算記錄</p>
                </div>
              ) : (
                history.map(record => (
                  <div
                    key={record.id}
                    className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-2 transition-all group"
                  >
                    {/* 第一行：類型標籤 + 備註按鈕 + 時間 */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          record.type === 'basic' ? 'bg-slate-600 text-slate-300' :
                          record.type === 'percent' ? 'bg-blue-900 text-blue-300' :
                          record.type === 'split' ? 'bg-purple-900 text-purple-300' :
                          'bg-emerald-900 text-emerald-300'
                        }`}>
                          {record.type === 'basic' ? '基本' :
                           record.type === 'percent' ? '百分比' :
                           record.type === 'split' ? '分帳' : '利息'}
                        </span>
                        {/* 備註按鈕 - 一直顯示 */}
                        <button
                          onClick={() => startEditNote(record)}
                          className={`p-0.5 rounded transition-all ${
                            record.note
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title={record.note || '新增備註'}
                        >
                          <StickyNote size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">
                          {record.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {/* 刪除單一記錄按鈕 */}
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="p-0.5 rounded text-slate-500 hover:text-red-400 hover:bg-slate-600 transition-all"
                          title="刪除此記錄"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    {/* 備註編輯模式 */}
                    {editingNoteId === record.id ? (
                      <div className="mb-2">
                        <div className="flex gap-1">
                          <input
                            ref={noteInputRef}
                            type="text"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveNote();
                              if (e.key === 'Escape') cancelEditNote();
                            }}
                            placeholder="輸入備註..."
                            className="flex-1 bg-slate-600 text-white text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            maxLength={30}
                          />
                          <button
                            onClick={saveNote}
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                            title="儲存"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={cancelEditNote}
                            className="p-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded"
                            title="取消"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 顯示備註 */
                      record.note && (
                        <p
                          className="text-[10px] text-amber-400/80 mb-1 truncate cursor-pointer hover:text-amber-300"
                          onClick={() => startEditNote(record)}
                          title="點擊編輯備註"
                        >
                          📝 {record.note}
                        </p>
                      )
                    )}

                    <p className="text-xs text-slate-400 truncate">{record.expression}</p>
                    <p className="text-sm font-bold text-white truncate">= {record.result}</p>

                    {/* 操作按鈕 - 一直顯示 */}
                    <div className="flex gap-1 mt-1.5">
                      <button
                        onClick={() => restoreFromHistory(record)}
                        className="flex-1 text-[10px] bg-slate-600 hover:bg-slate-500 text-slate-300 py-1 rounded flex items-center justify-center gap-1"
                        title="恢復算式"
                      >
                        <RotateCcw size={10} /> 算式
                      </button>
                      <button
                        onClick={() => useResultFromHistory(record)}
                        className="flex-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white py-1 rounded"
                        title="使用結果"
                      >
                        用結果
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 右側：計算機 */}
          <div className="flex-1">
            {/* 顯示區域 - 兩行式 */}
            <div className="bg-slate-800 rounded-2xl p-4 mb-4">
              {/* 第一行：算式 */}
              <div className="min-h-[24px] text-slate-400 text-sm text-right mb-1 truncate">
                {expression || (lastResult !== null ? '繼續輸入運算符...' : '')}
              </div>

              {/* 第二行：當前輸入/結果 */}
              <div className="flex items-center justify-between">
                <div className="text-3xl md:text-4xl font-bold text-white text-right flex-1 truncate px-2 font-mono">
                  {currentInput}
                </div>
                <button
                  onClick={copyResult}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                </button>
              </div>

              {/* 連續運算提示 */}
              {lastResult !== null && expression === '' && (
                <div className="text-xs text-emerald-400 text-right mt-1">
                  ✓ 可繼續輸入運算符進行連續計算
                </div>
              )}
            </div>

            {/* 基本計算機 */}
            {activeTab === 'basic' && (
              <div className="bg-slate-800/50 rounded-2xl p-3">
                <div className="grid grid-cols-4 gap-2">
                  <CalcButton onClick={handleClear} variant="action">C</CalcButton>
                  <CalcButton onClick={handleBackspace} variant="action">⌫</CalcButton>
                  <CalcButton onClick={handlePercent} variant="operator">%</CalcButton>
                  <CalcButton onClick={() => handleOperator('/')} variant="operator">÷</CalcButton>

                  <CalcButton onClick={() => handleNumber('7')}>7</CalcButton>
                  <CalcButton onClick={() => handleNumber('8')}>8</CalcButton>
                  <CalcButton onClick={() => handleNumber('9')}>9</CalcButton>
                  <CalcButton onClick={() => handleOperator('*')} variant="operator">×</CalcButton>

                  <CalcButton onClick={() => handleNumber('4')}>4</CalcButton>
                  <CalcButton onClick={() => handleNumber('5')}>5</CalcButton>
                  <CalcButton onClick={() => handleNumber('6')}>6</CalcButton>
                  <CalcButton onClick={() => handleOperator('-')} variant="operator">−</CalcButton>

                  <CalcButton onClick={() => handleNumber('1')}>1</CalcButton>
                  <CalcButton onClick={() => handleNumber('2')}>2</CalcButton>
                  <CalcButton onClick={() => handleNumber('3')}>3</CalcButton>
                  <CalcButton onClick={() => handleOperator('+')} variant="operator">+</CalcButton>

                  <CalcButton onClick={() => handleNumber('00')}>00</CalcButton>
                  <CalcButton onClick={() => handleNumber('0')}>0</CalcButton>
                  <CalcButton onClick={handleDecimal}>.</CalcButton>
                  <CalcButton onClick={handleEquals} variant="equals">=</CalcButton>
                </div>
              </div>
            )}

            {/* 百分比計算 */}
            {activeTab === 'percent' && (
              <div className="bg-slate-800/50 rounded-2xl p-4 space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">金額</label>
                  <input
                    type="text"
                    value={percentBase}
                    onChange={(e) => setPercentBase(e.target.value)}
                    placeholder="輸入金額"
                    className="w-full bg-slate-700 text-white text-xl p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">百分比</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={percentRate}
                      onChange={(e) => setPercentRate(e.target.value)}
                      placeholder="輸入百分比"
                      className="flex-1 bg-slate-700 text-white text-xl p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="flex items-center text-2xl text-slate-400">%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(p => (
                    <button
                      key={p}
                      onClick={() => setPercentRate(p.toString())}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        percentRate === p.toString() ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <button
                  onClick={calculatePercent}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  計算 <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* 分帳計算 */}
            {activeTab === 'split' && (
              <div className="bg-slate-800/50 rounded-2xl p-4 space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">總金額</label>
                  <input
                    type="text"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    placeholder="輸入總金額"
                    className="w-full bg-slate-700 text-white text-xl p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">人數</label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map(n => (
                      <button
                        key={n}
                        onClick={() => setSplitPeople(n.toString())}
                        className={`flex-1 py-3 rounded-lg text-lg font-medium transition-all ${
                          splitPeople === n.toString() ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={calculateSplit}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  計算每人金額 <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* 利息計算 */}
            {activeTab === 'interest' && (
              <div className="bg-slate-800/50 rounded-2xl p-4 space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">本金</label>
                  <input
                    type="text"
                    value={interestPrincipal}
                    onChange={(e) => setInterestPrincipal(e.target.value)}
                    placeholder="輸入本金"
                    className="w-full bg-slate-700 text-white text-xl p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">年利率 (%)</label>
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="例: 2.5"
                      step="0.1"
                      className="w-full bg-slate-700 text-white text-lg p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">年數</label>
                    <input
                      type="number"
                      value={interestYears}
                      onChange={(e) => setInterestYears(e.target.value)}
                      placeholder="例: 5"
                      min="1"
                      className="w-full bg-slate-700 text-white text-lg p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1, 3, 5, 10, 20].map(y => (
                    <button
                      key={y}
                      onClick={() => setInterestYears(y.toString())}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        interestYears === y.toString() ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {y}年
                    </button>
                  ))}
                </div>
                <button
                  onClick={calculateInterest}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  計算複利 <ChevronRight size={20} />
                </button>
                <p className="text-xs text-slate-500 text-center">* 使用複利公式計算</p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-600 py-4 mt-4 mb-16 md:mb-0">
          © 2026 Ultra Advisor | 計算結果僅供參考
        </div>
      </div>

      {/* 手機版歷史記錄 - 固定底部彈出式面板 */}
      <MobileHistoryPanel
        history={history}
        historySnapshots={historySnapshots}
        exportCopied={exportCopied}
        editingNoteId={editingNoteId}
        noteInput={noteInput}
        setNoteInput={setNoteInput}
        undo={undo}
        copyExport={copyExport}
        clearHistory={clearHistory}
        saveNote={saveNote}
        cancelEditNote={cancelEditNote}
        startEditNote={startEditNote}
        useResultFromHistory={useResultFromHistory}
        deleteRecord={deleteRecord}
      />
    </div>
  );
}

// 手機版歷史記錄彈出面板元件
function MobileHistoryPanel({
  history,
  historySnapshots,
  exportCopied,
  editingNoteId,
  noteInput,
  setNoteInput,
  undo,
  copyExport,
  clearHistory,
  saveNote,
  cancelEditNote,
  startEditNote,
  useResultFromHistory,
  deleteRecord,
}: {
  history: CalculationRecord[];
  historySnapshots: CalculationRecord[][];
  exportCopied: boolean;
  editingNoteId: string | null;
  noteInput: string;
  setNoteInput: (v: string) => void;
  undo: () => void;
  copyExport: () => void;
  clearHistory: () => void;
  saveNote: () => void;
  cancelEditNote: () => void;
  startEditNote: (record: CalculationRecord) => void;
  useResultFromHistory: (record: CalculationRecord) => void;
  deleteRecord: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* 展開的歷史面板 */}
      <div
        className={`bg-slate-900 border-t border-slate-700 transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[60vh]' : 'max-h-0'
        } overflow-hidden`}
      >
        <div className="p-3 max-h-[calc(60vh-48px)] overflow-y-auto custom-scrollbar">
          {/* 操作按鈕列 */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">
              歷史紀錄 ({history.length})
            </span>
            <div className="flex items-center gap-2">
              {historySnapshots.length > 0 && (
                <button
                  onClick={undo}
                  className="text-amber-400 text-xs flex items-center gap-1"
                >
                  <Undo2 size={12} /> 復原
                </button>
              )}
              {history.length > 0 && (
                <>
                  <button
                    onClick={copyExport}
                    className={`text-xs px-2 py-1 rounded ${
                      exportCopied ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {exportCopied ? '✓' : '複製'}
                  </button>
                  <button onClick={clearHistory} className="text-red-400 text-xs">
                    清除
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 歷史列表 */}
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">尚無計算記錄</p>
          ) : (
            <div className="space-y-2">
              {history.map(record => (
                <div
                  key={record.id}
                  className="bg-slate-800 rounded-lg p-2.5 text-xs"
                >
                  {/* 備註編輯模式 */}
                  {editingNoteId === record.id ? (
                    <div className="mb-2">
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveNote();
                            if (e.key === 'Escape') cancelEditNote();
                          }}
                          placeholder="輸入備註..."
                          className="flex-1 bg-slate-700 text-white text-xs px-2 py-1.5 rounded focus:outline-none"
                          maxLength={30}
                          autoFocus
                        />
                        <button onClick={saveNote} className="p-1.5 bg-emerald-600 text-white rounded">
                          <Check size={12} />
                        </button>
                        <button onClick={cancelEditNote} className="p-1.5 bg-slate-700 text-slate-300 rounded">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    record.note && (
                      <p
                        className="text-[11px] text-amber-400 mb-1.5 truncate"
                        onClick={() => startEditNote(record)}
                      >
                        📝 {record.note}
                      </p>
                    )
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0" onClick={() => useResultFromHistory(record)}>
                      <span className="text-slate-400 truncate block">{record.expression}</span>
                      <span className="text-white font-bold text-sm">= {record.result}</span>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => startEditNote(record)}
                        className={`p-1.5 rounded ${record.note ? 'text-amber-400' : 'text-slate-500'}`}
                      >
                        <StickyNote size={14} />
                      </button>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部觸發按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 border-t border-slate-700 py-3 px-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <History size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-white">歷史紀錄</span>
          {history.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {history.length}
            </span>
          )}
        </div>
        <ChevronRight
          size={18}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-[-90deg]' : 'rotate-90'}`}
        />
      </button>
    </div>
  );
}
